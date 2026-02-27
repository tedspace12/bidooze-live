import { useMemo, useState } from "react";
import { Download, Edit2, Plus, Search, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { FormSection } from "../FormSection";
import { FormInput } from "../FormInput";
import { FormSelect } from "../FormSelect";
import { FormTextarea } from "../FormTextarea";
import { PremiumButton } from "../PremiumButton";
import { PremiumTable } from "../PremiumTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuctionForm } from "@/context/auction-form-context";
import { useAuction } from "@/features/auction/hooks/useAuction";
import type { AuctionSeller, CreateAuctionLotInput, CreateSellerPayload } from "@/features/auction/types";

interface LotFormState {
  lot_number: string;
  title: string;
  description: string;
  quantity: string;
  starting_bid: string;
  reserve_price: string;
  estimate_low: string;
  estimate_high: string;
  lot_stagger_seconds: string;
  seller_id: string;
}

interface NewSellerFormState {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  status: "active" | "inactive" | "pending" | "suspended";
}

const emptyLotForm: LotFormState = {
  lot_number: "",
  title: "",
  description: "",
  quantity: "1",
  starting_bid: "",
  reserve_price: "",
  estimate_low: "",
  estimate_high: "",
  lot_stagger_seconds: "",
  seller_id: "",
};

const emptySellerForm: NewSellerFormState = {
  name: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
  status: "active",
};

const importHeaders = [
  "lot_number",
  "title",
  "description",
  "quantity",
  "starting_bid",
  "reserve_price",
  "estimate_low",
  "estimate_high",
  "lot_stagger_seconds",
  "seller_id",
];

const importTemplateRows = [
  [
    "L-001",
    "Vintage Watch",
    "1960s Swiss watch",
    "1",
    "500",
    "1000",
    "1200",
    "2000",
    "30",
    "12",
  ],
  [
    "L-002",
    "Oil Painting",
    "Original canvas artwork",
    "1",
    "300",
    "",
    "500",
    "900",
    "30",
    "",
  ],
];

type ImportReport = {
  added: number;
  updated: number;
  skipped: number;
  overwrittenInFile: number;
  issues: string[];
};

const parseOptionalNumber = (value: string): number | undefined => {
  const normalized = value.trim();
  if (!normalized) return undefined;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseOptionalInteger = (value: string): number | undefined => {
  const normalized = value.trim();
  if (!normalized) return undefined;
  const parsed = Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const toCsv = (rows: string[][]): string => {
  const escapeCell = (value: string) => {
    if (value.includes('"') || value.includes(",") || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };
  return rows.map((row) => row.map((cell) => escapeCell(cell)).join(",")).join("\n");
};

const parseCsv = (input: string): string[][] => {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const next = input[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        currentCell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = "";
      continue;
    }

    currentCell += char;
  }

  currentRow.push(currentCell);
  rows.push(currentRow);

  return rows.filter((row) => row.some((cell) => cell.trim() !== ""));
};

export function LotsTab() {
  const { formState, updateFormState, clearLotImages } = useAuctionForm();
  const { useAuctioneerSellers, createAuctioneerSeller } = useAuction();
  const { data: sellers = [], isLoading: sellersLoading } = useAuctioneerSellers();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSellerDialogOpen, setIsSellerDialogOpen] = useState(false);
  const [editingLotKey, setEditingLotKey] = useState<string | null>(null);
  const [lotForm, setLotForm] = useState<LotFormState>(emptyLotForm);
  const [newSellerForm, setNewSellerForm] = useState<NewSellerFormState>(emptySellerForm);
  const [importReport, setImportReport] = useState<ImportReport | null>(null);

  const lots = formState.lots || [];
  type LotRow = CreateAuctionLotInput & { id: string };
  const rows: LotRow[] = lots.map((lot, index) => ({
    ...lot,
    id: lot.lot_number || String(index),
  }));

  const filteredLots = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((lot) =>
      lot.title.toLowerCase().includes(query) ||
      lot.lot_number.toLowerCase().includes(query)
    );
  }, [rows, searchQuery]);

  const sellerOptions = useMemo(() => {
    return sellers.map((seller: AuctionSeller) => ({
      value: String(seller.id),
      label: seller.name ? `${seller.name}${seller.email ? ` (${seller.email})` : ""}` : String(seller.id),
    }));
  }, [sellers]);

  const columns = [
    { key: "lot_number", header: "Lot #", className: "w-24" },
    {
      key: "title",
      header: "Title",
      render: (item: LotRow) => (
        <span className="font-medium text-foreground">{item.title}</span>
      ),
    },
    { key: "quantity", header: "Qty", className: "w-16 text-center" },
    {
      key: "starting_bid",
      header: "Starting Bid",
      render: (item: LotRow) => (
        <span className="text-muted-foreground">
          {item.starting_bid ? item.starting_bid : "-"}
        </span>
      ),
    },
    {
      key: "lot_stagger_seconds",
      header: "Stagger (s)",
      className: "w-24",
      render: (item: LotRow) => (
        <span className="text-muted-foreground">
          {item.lot_stagger_seconds ?? "-"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-24",
      render: (item: LotRow) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => openEdit(item)}
            className="p-1 rounded-md hover:bg-accent transition-colors"
            aria-label="Edit lot"
          >
            <Edit2 className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(item.lot_number)}
            className="p-1 rounded-md hover:bg-accent transition-colors"
            aria-label="Delete lot"
          >
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      ),
    },
  ];

  const openAdd = () => {
    setEditingLotKey(null);
    setLotForm(emptyLotForm);
    setIsDialogOpen(true);
  };

  const openEdit = (lot: CreateAuctionLotInput) => {
    setEditingLotKey(lot.lot_number);
    setLotForm({
      lot_number: lot.lot_number,
      title: lot.title,
      description: lot.description || "",
      quantity: String(lot.quantity || 1),
      starting_bid: lot.starting_bid ? String(lot.starting_bid) : "",
      reserve_price: lot.reserve_price ? String(lot.reserve_price) : "",
      estimate_low: lot.estimate_low ? String(lot.estimate_low) : "",
      estimate_high: lot.estimate_high ? String(lot.estimate_high) : "",
      lot_stagger_seconds: lot.lot_stagger_seconds ? String(lot.lot_stagger_seconds) : "",
      seller_id: lot.seller_id ? String(lot.seller_id) : "",
    });
    setIsDialogOpen(true);
  };

  const openNewSellerDialog = () => {
    setNewSellerForm(emptySellerForm);
    setIsSellerDialogOpen(true);
  };

  const handleCreateSeller = async () => {
    if (!newSellerForm.name.trim()) {
      toast.error("Seller name is required.");
      return;
    }
    if (!newSellerForm.email.trim()) {
      toast.error("Seller email is required.");
      return;
    }
    if (!newSellerForm.phone.trim()) {
      toast.error("Seller phone is required.");
      return;
    }

    const payload: CreateSellerPayload = {
      name: newSellerForm.name.trim(),
      email: newSellerForm.email.trim(),
      phone: newSellerForm.phone.trim(),
      address: newSellerForm.address.trim() || undefined,
      notes: newSellerForm.notes.trim() || undefined,
      status: newSellerForm.status,
    };

    try {
      const seller = await createAuctioneerSeller.mutateAsync(payload);
      setLotForm((prev) => ({ ...prev, seller_id: String(seller.id) }));
      setIsSellerDialogOpen(false);
      toast.success("Seller added.");
    } catch (error: unknown) {
      let message = "Failed to add seller.";
      if (error && typeof error === "object" && "message" in error) {
        const maybeMessage = (error as { message?: unknown }).message;
        if (typeof maybeMessage === "string" && maybeMessage.trim()) {
          message = maybeMessage;
        }
      }
      toast.error(message);
    }
  };

  const handleSave = () => {
    if (!lotForm.lot_number.trim() || !lotForm.title.trim()) {
      toast.error("Lot number and title are required.");
      return;
    }

    const normalizedLot = lotForm.lot_number.trim();
    const exists = lots.some(
      (lot) =>
        lot.lot_number.toLowerCase() === normalizedLot.toLowerCase() &&
        lot.lot_number !== editingLotKey
    );
    if (exists) {
      toast.error("Lot number must be unique.");
      return;
    }

    const payload: CreateAuctionLotInput = {
      lot_number: normalizedLot,
      title: lotForm.title.trim(),
      description: lotForm.description.trim() || "",
      quantity: Math.max(parseInt(lotForm.quantity) || 1, 1),
      starting_bid: parseFloat(lotForm.starting_bid) || 0,
      reserve_price: lotForm.reserve_price ? parseFloat(lotForm.reserve_price) : undefined,
      estimate_low: lotForm.estimate_low ? parseFloat(lotForm.estimate_low) : undefined,
      estimate_high: lotForm.estimate_high ? parseFloat(lotForm.estimate_high) : undefined,
      lot_stagger_seconds: lotForm.lot_stagger_seconds
        ? parseInt(lotForm.lot_stagger_seconds)
        : undefined,
      seller_id: lotForm.seller_id ? parseInt(lotForm.seller_id) : undefined,
    };

    let nextLots: CreateAuctionLotInput[];
    if (editingLotKey) {
      nextLots = lots.map((lot) =>
        lot.lot_number === editingLotKey ? payload : lot
      );
    } else {
      nextLots = [...lots, payload];
    }

    updateFormState({ lots: nextLots });
    setIsDialogOpen(false);
    toast.success(editingLotKey ? "Lot updated." : "Lot added.");
  };

  const handleDelete = (lotKey: string) => {
    const nextLots = lots.filter((lot) => lot.lot_number !== lotKey);
    updateFormState({ lots: nextLots });
    clearLotImages(lotKey);
    toast.success("Lot removed.");
  };

  const downloadTemplate = () => {
    const csv = toCsv([importHeaders, ...importTemplateRows]);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lots-import-template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleBulkImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const raw = await file.text();
    const rows = parseCsv(raw);
    if (rows.length < 2) {
      toast.error("Import file must include headers and at least one data row.");
      return;
    }

    const headerRow = rows[0].map((cell) => cell.trim().toLowerCase());
    const headerIndex: Record<string, number> = {};
    headerRow.forEach((header, index) => {
      headerIndex[header] = index;
    });

    const requiredHeaders = ["lot_number", "title", "quantity"];
    const missingHeaders = requiredHeaders.filter((header) => headerIndex[header] === undefined);
    if (missingHeaders.length) {
      toast.error(`Missing required column(s): ${missingHeaders.join(", ")}`);
      return;
    }

    const getValue = (row: string[], header: string): string => {
      const idx = headerIndex[header];
      if (idx === undefined) return "";
      return (row[idx] || "").trim();
    };

    const importedMap = new Map<string, CreateAuctionLotInput>();
    const issues: string[] = [];
    let skipped = 0;
    let overwrittenInFile = 0;

    rows.slice(1).forEach((row, rowOffset) => {
      const rowNumber = rowOffset + 2;
      const lotNumber = getValue(row, "lot_number");
      const title = getValue(row, "title");
      const quantityValue = getValue(row, "quantity");
      const quantity = Number.parseInt(quantityValue, 10);

      if (!lotNumber) {
        skipped += 1;
        issues.push(`Row ${rowNumber}: lot_number is required.`);
        return;
      }

      if (!title) {
        skipped += 1;
        issues.push(`Row ${rowNumber}: title is required.`);
        return;
      }

      if (!Number.isFinite(quantity) || quantity < 1) {
        skipped += 1;
        issues.push(`Row ${rowNumber}: quantity must be a whole number >= 1.`);
        return;
      }

      const lot: CreateAuctionLotInput = {
        lot_number: lotNumber,
        title,
        description: getValue(row, "description") || undefined,
        quantity,
        starting_bid: parseOptionalNumber(getValue(row, "starting_bid")),
        reserve_price: parseOptionalNumber(getValue(row, "reserve_price")),
        estimate_low: parseOptionalNumber(getValue(row, "estimate_low")),
        estimate_high: parseOptionalNumber(getValue(row, "estimate_high")),
        lot_stagger_seconds: parseOptionalInteger(getValue(row, "lot_stagger_seconds")),
        seller_id: parseOptionalInteger(getValue(row, "seller_id")),
      };

      const key = lotNumber.toLowerCase();
      if (importedMap.has(key)) overwrittenInFile += 1;
      importedMap.set(key, lot);
    });

    if (!importedMap.size) {
      setImportReport({
        added: 0,
        updated: 0,
        skipped,
        overwrittenInFile,
        issues,
      });
      toast.error("No valid rows to import.");
      return;
    }

    const nextLots = [...lots];
    let added = 0;
    let updated = 0;

    importedMap.forEach((lot, lotKey) => {
      const existingIndex = nextLots.findIndex((item) => item.lot_number.toLowerCase() === lotKey);
      if (existingIndex >= 0) {
        nextLots[existingIndex] = lot;
        updated += 1;
      } else {
        nextLots.push(lot);
        added += 1;
      }
    });

    updateFormState({ lots: nextLots });

    setImportReport({
      added,
      updated,
      skipped,
      overwrittenInFile,
      issues,
    });

    toast.success(`Imported lots: ${added} added, ${updated} updated, ${skipped} skipped.`);
  };

  return (
    <div className="space-y-6">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
            <DialogTitle>{editingLotKey ? "Edit Lot" : "Add Lot"}</DialogTitle>
            <DialogDescription>
              {editingLotKey ? "Update details for this lot." : "Add a new lot to this auction."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput
                  label="Lot Number"
                  placeholder="LOT-001"
                  value={lotForm.lot_number}
                  onChange={(e) => setLotForm((prev) => ({ ...prev, lot_number: e.target.value }))}
                />
                <FormInput
                  label="Quantity"
                  type="number"
                  placeholder="1"
                  value={lotForm.quantity}
                  onChange={(e) => setLotForm((prev) => ({ ...prev, quantity: e.target.value }))}
                />
                <div className="space-y-2">
                  <FormSelect
                    label="Seller (optional)"
                    options={sellerOptions}
                    placeholder={sellersLoading ? "Loading sellers..." : "Select seller..."}
                    value={lotForm.seller_id}
                    onValueChange={(value) => setLotForm((prev) => ({ ...prev, seller_id: value }))}
                    disabled={sellersLoading}
                  />
                  <PremiumButton type="button" variant="ghost" size="sm" onClick={openNewSellerDialog}>
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add New Seller
                  </PremiumButton>
                </div>
              </div>

              <FormInput
                label="Title"
                placeholder="Enter lot title"
                value={lotForm.title}
                onChange={(e) => setLotForm((prev) => ({ ...prev, title: e.target.value }))}
              />

              <FormTextarea
                label="Description"
                placeholder="Describe this lot..."
                rows={4}
                value={lotForm.description}
                onChange={(e) => setLotForm((prev) => ({ ...prev, description: e.target.value }))}
              />

              <div className="space-y-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Pricing & Estimates</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Starting Bid"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={lotForm.starting_bid}
                    onChange={(e) => setLotForm((prev) => ({ ...prev, starting_bid: e.target.value }))}
                  />
                  <FormInput
                    label="Reserve Price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={lotForm.reserve_price}
                    onChange={(e) => setLotForm((prev) => ({ ...prev, reserve_price: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Estimate Low"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={lotForm.estimate_low}
                    onChange={(e) => setLotForm((prev) => ({ ...prev, estimate_low: e.target.value }))}
                  />
                  <FormInput
                    label="Estimate High"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={lotForm.estimate_high}
                    onChange={(e) => setLotForm((prev) => ({ ...prev, estimate_high: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Lot Rules</p>
                <FormInput
                  label="Lot Stagger (seconds)"
                  type="number"
                  placeholder="0"
                  value={lotForm.lot_stagger_seconds}
                  onChange={(e) => setLotForm((prev) => ({ ...prev, lot_stagger_seconds: e.target.value }))}
                />
              </div>

              <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                Add images in the &quot;Lot Images&quot; tab after saving this lot.
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t flex justify-end gap-3 shrink-0">
            <PremiumButton type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </PremiumButton>
            <PremiumButton type="button" onClick={handleSave}>
              {editingLotKey ? "Save Changes" : "Add Lot"}
            </PremiumButton>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isSellerDialogOpen} onOpenChange={setIsSellerDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
            <DialogTitle>Add New Seller</DialogTitle>
            <DialogDescription>Create a seller and assign it to this lot.</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Name *"
                  placeholder="Estate Seller LLC"
                  value={newSellerForm.name}
                  onChange={(e) => setNewSellerForm((prev) => ({ ...prev, name: e.target.value }))}
                />
                <FormInput
                  label="Email *"
                  type="email"
                  placeholder="seller@example.com"
                  value={newSellerForm.email}
                  onChange={(e) => setNewSellerForm((prev) => ({ ...prev, email: e.target.value }))}
                />
                <FormInput
                  label="Phone *"
                  placeholder="+12025550111"
                  value={newSellerForm.phone}
                  onChange={(e) => setNewSellerForm((prev) => ({ ...prev, phone: e.target.value }))}
                />
                <FormSelect
                  label="Status"
                  options={[
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                    { value: "pending", label: "Pending" },
                    { value: "suspended", label: "Suspended" },
                  ]}
                  value={newSellerForm.status}
                  onValueChange={(value) =>
                    setNewSellerForm((prev) => ({ ...prev, status: value as NewSellerFormState["status"] }))
                  }
                />
              </div>
              <FormInput
                label="Address"
                placeholder="123 Main St, Austin, TX"
                value={newSellerForm.address}
                onChange={(e) => setNewSellerForm((prev) => ({ ...prev, address: e.target.value }))}
              />
              <FormTextarea
                label="Notes"
                placeholder="Preferred consignor"
                rows={4}
                value={newSellerForm.notes}
                onChange={(e) => setNewSellerForm((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>

          <div className="px-6 py-4 border-t flex justify-end gap-3 shrink-0">
            <PremiumButton type="button" variant="outline" onClick={() => setIsSellerDialogOpen(false)}>
              Cancel
            </PremiumButton>
            <PremiumButton
              type="button"
              onClick={handleCreateSeller}
              isLoading={createAuctioneerSeller.isPending}
              disabled={createAuctioneerSeller.isPending}
            >
              Create Seller
            </PremiumButton>
          </div>
        </DialogContent>
      </Dialog>

      <FormSection title="Lots Overview" description="Search and manage lots." className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search lots..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Total lots: <span className="font-medium text-foreground">{lots.length}</span>
            </span>
            <input
              type="file"
              id="lots-bulk-import"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleBulkImport}
            />
            <PremiumButton type="button" variant="outline" onClick={() => document.getElementById("lots-bulk-import")?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Bulk Import
            </PremiumButton>
            <PremiumButton type="button" variant="ghost" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </PremiumButton>
            <PremiumButton type="button" onClick={openAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Lot
            </PremiumButton>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs">
          <p className="font-medium text-foreground">Template Example (CSV)</p>
          <p className="mt-1 text-muted-foreground">
            Required columns: <code>lot_number</code>, <code>title</code>, <code>quantity</code>. Other columns are optional.
          </p>
          <pre className="mt-2 overflow-x-auto rounded-md bg-background p-2 text-[11px] leading-4 text-muted-foreground">
{`lot_number,title,description,quantity,starting_bid,reserve_price,estimate_low,estimate_high,lot_stagger_seconds,seller_id
L-001,Vintage Watch,1960s Swiss watch,1,500,1000,1200,2000,30,12
L-002,Oil Painting,Original canvas artwork,1,300,,500,900,30,`}
          </pre>
        </div>
        {importReport && (
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            <p>
              Import result: {importReport.added} added, {importReport.updated} updated, {importReport.skipped} skipped
              {importReport.overwrittenInFile > 0 ? `, ${importReport.overwrittenInFile} duplicate row(s) in file (last one kept)` : ""}.
            </p>
            {importReport.issues.length > 0 && (
              <div className="mt-2 space-y-1">
                {importReport.issues.slice(0, 5).map((issue) => (
                  <p key={issue}>{issue}</p>
                ))}
                {importReport.issues.length > 5 && (
                  <p>...and {importReport.issues.length - 5} more issue(s).</p>
                )}
              </div>
            )}
          </div>
        )}
      </FormSection>

      <FormSection title="Lots Table" description="View and update your lots.">
        {filteredLots.length > 0 ? (
          <PremiumTable<LotRow> columns={columns} data={filteredLots} />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No lots added yet. Create your first lot to get started.</p>
          </div>
        )}
      </FormSection>
    </div>
  );
}
