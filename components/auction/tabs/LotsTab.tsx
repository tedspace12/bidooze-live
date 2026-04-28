import { useMemo, useState } from "react";
import Image from "next/image";
import { AuctionOverviewResponse } from "@/features/auction/types";
import { useAuctionLots } from "@/features/auction/hooks/useAuctionLots";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit3,
  Trash2,
  Eye,
  Package,
  Truck,
  LayoutGrid,
  List,
  Image as ImageIcon,
} from "lucide-react";

interface LotsTabProps {
  auction: AuctionOverviewResponse;
}

type LotImage = {
  id: number;
  image_url: string;
};

type LotRecord = {
  id: number;
  lot_number: string;
  title: string;
  description: string | null;
  quantity: number | null;
  starting_bid: string | number | null;
  reserve_price: string | number | null;
  estimate_low: string | number | null;
  estimate_high: string | number | null;
  commission_percentage: string | number | null;
  buyer_premium_percentage: string | number | null;
  buyer_tax_percentage: string | number | null;
  seller_tax_percentage: string | number | null;
  current_bid?: string | number | null;
  next_bid?: string | number | null;
  final_price?: string | number | null;
  total_bids_count?: number | null;
  image_url?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  time_remaining_seconds?: number | null;
  shipping_availability?: string | null;
  status: string;
  images?: LotImage[];
};

function getStatusBadge(status?: string) {
  const config = {
    pending: { label: "Pending", variant: "secondary" as const },
    active: { label: "Active", variant: "default" as const },
    live: { label: "Live", variant: "default" as const },
    sold: { label: "Sold", variant: "outline" as const },
    passed: { label: "Passed", variant: "secondary" as const },
    cancelled: { label: "Cancelled", variant: "destructive" as const },
  };
  const key = (status || "pending").toLowerCase() as keyof typeof config;
  return config[key] || config.pending;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
};

const toText = (value: unknown, fallback = ""): string => {
  if (typeof value === "string") return value.trim() || fallback;
  if (typeof value === "number") return String(value);
  return fallback;
};

const toOptionalText = (value: unknown): string | null => {
  const text = toText(value);
  return text || null;
};

const toOptionalNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const hasAmount = (value: string | number | null | undefined) =>
  value !== null &&
  value !== undefined &&
  value !== "" &&
  Number.isFinite(Number(value));

const formatShippingAvailability = (value?: string | null) =>
  value
    ? value
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : null;

const getShippingBadgeConfig = (value?: string | null) => {
  const normalized = (value || "").trim().toLowerCase().replace(/_/g, "-");

  if (!normalized) return null;
  if (normalized === "available") {
    return {
      label: "Shipping Available",
      icon: Truck,
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }
  if (normalized === "pickup-only" || normalized === "pickup only") {
    return {
      label: "Pickup Only",
      icon: Package,
      className: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }
  if (normalized === "not-available" || normalized === "not available") {
    return {
      label: "No Shipping",
      icon: Package,
      className: "border-slate-200 bg-slate-50 text-slate-700",
    };
  }

  return {
    label: formatShippingAvailability(value) || "Shipping",
    icon: Package,
    className: "border-border bg-secondary/60 text-foreground",
  };
};

const formatLotAmount = (
  value: string | number | null | undefined,
  currency: AuctionOverviewResponse["auction"]["currency"]
) => (hasAmount(value) ? formatCurrency(Number(value), currency) : "—");

const getLotAmountInfo = (
  lot: LotRecord,
  currency: AuctionOverviewResponse["auction"]["currency"]
) => {
  if (hasAmount(lot.final_price)) {
    return { label: "Final Price", value: formatLotAmount(lot.final_price, currency) };
  }
  if (hasAmount(lot.current_bid)) {
    return { label: "Current Bid", value: formatLotAmount(lot.current_bid, currency) };
  }
  if (hasAmount(lot.next_bid)) {
    return { label: "Next Bid", value: formatLotAmount(lot.next_bid, currency) };
  }
  if (hasAmount(lot.starting_bid)) {
    return { label: "Starting Bid", value: formatLotAmount(lot.starting_bid, currency) };
  }
  return { label: "Bid", value: "—" };
};

const getLotEstimateText = (
  lot: LotRecord,
  currency: AuctionOverviewResponse["auction"]["currency"]
) => {
  const low = hasAmount(lot.estimate_low) ? formatLotAmount(lot.estimate_low, currency) : null;
  const high = hasAmount(lot.estimate_high) ? formatLotAmount(lot.estimate_high, currency) : null;

  if (low && high) return `${low} - ${high}`;
  if (low) return `From ${low}`;
  if (high) return `Up to ${high}`;
  return null;
};

const formatTimeRemaining = (seconds?: number | null) => {
  if (!seconds || seconds <= 0) return null;

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${Math.max(minutes, 1)}m left`;
};

const formatLotDateTime = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

const normalizeLotRecord = (payload: unknown): LotRecord | null => {
  if (!payload || typeof payload !== "object") return null;

  const lot = payload as Record<string, unknown>;

  return {
    id: toOptionalNumber(lot.id) ?? 0,
    lot_number: toText(lot.lot_number, "—"),
    title: toText(lot.title, "Untitled lot"),
    description: toOptionalText(lot.description),
    quantity: toOptionalNumber(lot.quantity),
    starting_bid: toOptionalNumber(lot.starting_bid) ?? null,
    reserve_price: toOptionalNumber(lot.reserve_price) ?? null,
    estimate_low: toOptionalNumber(lot.estimate_low) ?? null,
    estimate_high: toOptionalNumber(lot.estimate_high) ?? null,
    commission_percentage: toOptionalNumber(lot.commission_percentage) ?? null,
    buyer_premium_percentage: toOptionalNumber(lot.buyer_premium_percentage) ?? null,
    buyer_tax_percentage: toOptionalNumber(lot.buyer_tax_percentage) ?? null,
    seller_tax_percentage: toOptionalNumber(lot.seller_tax_percentage) ?? null,
    current_bid: toOptionalNumber(lot.current_bid) ?? null,
    next_bid: toOptionalNumber(lot.next_bid) ?? null,
    final_price: toOptionalNumber(lot.final_price) ?? null,
    total_bids_count: toOptionalNumber(lot.total_bids_count),
    image_url: toOptionalText(lot.image_url),
    starts_at: toOptionalText(lot.starts_at),
    ends_at: toOptionalText(lot.ends_at),
    time_remaining_seconds: toOptionalNumber(lot.time_remaining_seconds),
    shipping_availability: toOptionalText(lot.shipping_availability),
    status: toText(lot.status, "pending"),
    images: Array.isArray(lot.images)
      ? lot.images
          .map((image) => {
            if (!image || typeof image !== "object") return null;
            const candidate = image as Record<string, unknown>;
            const imageUrl = toText(candidate.image_url);
            if (!imageUrl) return null;
            return {
              id: toOptionalNumber(candidate.id) ?? 0,
              image_url: imageUrl,
            };
          })
          .filter((image): image is LotImage => Boolean(image))
      : undefined,
  };
};

const extractLotRecords = (payload: unknown): LotRecord[] => {
  if (Array.isArray(payload)) {
    return payload
      .map(normalizeLotRecord)
      .filter((lot): lot is LotRecord => Boolean(lot));
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    const nested = (payload as { data?: unknown }).data;

    if (Array.isArray(nested)) {
      return nested
        .map(normalizeLotRecord)
        .filter((lot): lot is LotRecord => Boolean(lot));
    }

    if (nested && typeof nested === "object" && "data" in nested) {
      const doubleNested = (nested as { data?: unknown }).data;
      if (Array.isArray(doubleNested)) {
        return doubleNested
          .map(normalizeLotRecord)
          .filter((lot): lot is LotRecord => Boolean(lot));
      }
    }
  }

  return [];
};

export default function LotsTab({ auction }: LotsTabProps) {
  const { lots, createLot, updateLot, deleteLot } = useAuctionLots(auction.auction.id);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isAddLotOpen, setIsAddLotOpen] = useState(false);
  const [isEditLotOpen, setIsEditLotOpen] = useState(false);
  const [isDeleteLotOpen, setIsDeleteLotOpen] = useState(false);
  const [isViewLotOpen, setIsViewLotOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState<LotRecord | null>(null);
  const [lotForm, setLotForm] = useState({
    lot_number: "",
    title: "",
    description: "",
    quantity: "1",
    starting_bid: "",
    reserve_price: "",
    estimate_low: "",
    estimate_high: "",
    commission_percentage: "",
    buyer_premium_percentage: "",
    buyer_tax_percentage: "",
    seller_tax_percentage: "",
    images: [] as File[],
    imagePreviews: [] as string[],
  });

  const lotList: LotRecord[] = useMemo(() => {
    return extractLotRecords(lots.data);
  }, [lots.data]);

  const filteredLots = lotList.filter((lot) => {
    return (
      lot.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lot.lot_number.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const resetForm = () => {
    setLotForm({
      lot_number: "",
      title: "",
      description: "",
      quantity: "1",
      starting_bid: "",
      reserve_price: "",
      estimate_low: "",
      estimate_high: "",
      commission_percentage: "",
      buyer_premium_percentage: "",
      buyer_tax_percentage: "",
      seller_tax_percentage: "",
      images: [],
      imagePreviews: [],
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (!files.length) return;
    const previews = files.map((file) => URL.createObjectURL(file));
    setLotForm((prev) => ({
      ...prev,
      images: files,
      imagePreviews: previews,
    }));
  };

  const handleRemoveImage = (index: number) => {
    setLotForm((prev) => {
      const nextImages = prev.images.filter((_, i) => i !== index);
      const nextPreviews = prev.imagePreviews.filter((_, i) => i !== index);
      return { ...prev, images: nextImages, imagePreviews: nextPreviews };
    });
  };
  const handleAddLot = async () => {
    if (!lotForm.lot_number || !lotForm.title) {
      toast.error("Lot number and title are required.");
      return;
    }
    try {
      await createLot.mutateAsync({
        lot_number: lotForm.lot_number,
        title: lotForm.title,
        description: lotForm.description || null,
        quantity: Number(lotForm.quantity) || 1,
        starting_bid: Number(lotForm.starting_bid) || 0,
        reserve_price: lotForm.reserve_price ? Number(lotForm.reserve_price) : null,
        estimate_low: lotForm.estimate_low ? Number(lotForm.estimate_low) : null,
        estimate_high: lotForm.estimate_high ? Number(lotForm.estimate_high) : null,
        commission_percentage: lotForm.commission_percentage ? Number(lotForm.commission_percentage) : null,
        buyer_premium_percentage: lotForm.buyer_premium_percentage ? Number(lotForm.buyer_premium_percentage) : null,
        buyer_tax_percentage: lotForm.buyer_tax_percentage ? Number(lotForm.buyer_tax_percentage) : null,
        seller_tax_percentage: lotForm.seller_tax_percentage ? Number(lotForm.seller_tax_percentage) : null,
        images: lotForm.images,
      });
      setIsAddLotOpen(false);
      resetForm();
      toast.success("Lot created successfully.");
    } catch (error: unknown) {
      toast.error("Failed to create lot", { description: getErrorMessage(error, "Please try again.") });
    }
  };

  const handleEditLot = (lot: LotRecord) => {
    setSelectedLot(lot);
    setLotForm({
      lot_number: lot.lot_number,
      title: lot.title,
      description: lot.description || "",
      quantity: lot.quantity !== null && lot.quantity !== undefined ? String(lot.quantity) : "",
      starting_bid: hasAmount(lot.starting_bid) ? String(lot.starting_bid) : "",
      reserve_price: hasAmount(lot.reserve_price) ? String(lot.reserve_price) : "",
      estimate_low: hasAmount(lot.estimate_low) ? String(lot.estimate_low) : "",
      estimate_high: hasAmount(lot.estimate_high) ? String(lot.estimate_high) : "",
      commission_percentage: hasAmount(lot.commission_percentage) ? String(lot.commission_percentage) : "",
      buyer_premium_percentage: hasAmount(lot.buyer_premium_percentage) ? String(lot.buyer_premium_percentage) : "",
      buyer_tax_percentage: hasAmount(lot.buyer_tax_percentage) ? String(lot.buyer_tax_percentage) : "",
      seller_tax_percentage: hasAmount(lot.seller_tax_percentage) ? String(lot.seller_tax_percentage) : "",
      images: [],
      imagePreviews: [],
    });
    setIsEditLotOpen(true);
  };

  const handleUpdateLot = async () => {
    if (!selectedLot) return;
    try {
      await updateLot.mutateAsync({
        lotId: selectedLot.id,
        payload: {
          lot_number: lotForm.lot_number,
          title: lotForm.title,
          description: lotForm.description || undefined,
          quantity: lotForm.quantity.trim() ? Number(lotForm.quantity) : undefined,
          starting_bid: lotForm.starting_bid.trim() ? Number(lotForm.starting_bid) : undefined,
          reserve_price: lotForm.reserve_price.trim() ? Number(lotForm.reserve_price) : undefined,
          estimate_low: lotForm.estimate_low.trim() ? Number(lotForm.estimate_low) : undefined,
          estimate_high: lotForm.estimate_high.trim() ? Number(lotForm.estimate_high) : undefined,
          commission_percentage: lotForm.commission_percentage.trim() ? Number(lotForm.commission_percentage) : undefined,
          buyer_premium_percentage: lotForm.buyer_premium_percentage.trim() ? Number(lotForm.buyer_premium_percentage) : undefined,
          buyer_tax_percentage: lotForm.buyer_tax_percentage.trim() ? Number(lotForm.buyer_tax_percentage) : undefined,
          seller_tax_percentage: lotForm.seller_tax_percentage.trim() ? Number(lotForm.seller_tax_percentage) : undefined,
          images: lotForm.images,
        },
      });
      setIsEditLotOpen(false);
      setSelectedLot(null);
      resetForm();
      toast.success("Lot updated successfully.");
    } catch (error: unknown) {
      toast.error("Failed to update lot", { description: getErrorMessage(error, "Please try again.") });
    }
  };

  const handleDeleteLot = async () => {
    if (!selectedLot) return;
    try {
      await deleteLot.mutateAsync(selectedLot.id);
      setIsDeleteLotOpen(false);
      setSelectedLot(null);
      toast.success("Lot deleted.");
    } catch (error: unknown) {
      toast.error("Failed to delete lot", { description: getErrorMessage(error, "Please try again.") });
    }
  };

  const getPrimaryImage = (lot: LotRecord) =>
    lot.image_url || lot.images?.[0]?.image_url || "";
  const openViewLot = (lot: LotRecord) => {
    setSelectedLot(lot);
    setIsViewLotOpen(true);
  };
  const openDeleteLot = (lot: LotRecord) => {
    setSelectedLot(lot);
    setIsDeleteLotOpen(true);
  };
  const lotDialogContentClassName =
    "flex max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] flex-col gap-0 overflow-hidden p-0 sm:max-h-[90vh] sm:max-w-4xl";

  const renderLotFormFields = (uploadInputId: string, imageLabel: string) => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label>Lot Number</Label>
          <Input value={lotForm.lot_number} onChange={(e) => setLotForm({ ...lotForm, lot_number: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Quantity</Label>
          <Input
            type="number"
            min="1"
            inputMode="numeric"
            value={lotForm.quantity}
            onChange={(e) => setLotForm({ ...lotForm, quantity: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Starting Bid</Label>
          <Input
            type="number"
            min="0"
            inputMode="decimal"
            value={lotForm.starting_bid}
            onChange={(e) => setLotForm({ ...lotForm, starting_bid: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Title</Label>
        <Input value={lotForm.title} onChange={(e) => setLotForm({ ...lotForm, title: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={lotForm.description}
          onChange={(e) => setLotForm({ ...lotForm, description: e.target.value })}
          rows={5}
          className="min-h-28"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label>Reserve Price</Label>
          <Input
            type="number"
            min="0"
            inputMode="decimal"
            value={lotForm.reserve_price}
            onChange={(e) => setLotForm({ ...lotForm, reserve_price: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Estimate Low</Label>
          <Input
            type="number"
            min="0"
            inputMode="decimal"
            value={lotForm.estimate_low}
            onChange={(e) => setLotForm({ ...lotForm, estimate_low: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Estimate High</Label>
          <Input
            type="number"
            min="0"
            inputMode="decimal"
            value={lotForm.estimate_high}
            onChange={(e) => setLotForm({ ...lotForm, estimate_high: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <Label>Commission %</Label>
          <Input
            type="number"
            min="0"
            inputMode="decimal"
            value={lotForm.commission_percentage}
            onChange={(e) => setLotForm({ ...lotForm, commission_percentage: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Buyer Premium %</Label>
          <Input
            type="number"
            min="0"
            inputMode="decimal"
            value={lotForm.buyer_premium_percentage}
            onChange={(e) => setLotForm({ ...lotForm, buyer_premium_percentage: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Buyer Tax %</Label>
          <Input
            type="number"
            min="0"
            inputMode="decimal"
            value={lotForm.buyer_tax_percentage}
            onChange={(e) => setLotForm({ ...lotForm, buyer_tax_percentage: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Seller Tax %</Label>
          <Input
            type="number"
            min="0"
            inputMode="decimal"
            value={lotForm.seller_tax_percentage}
            onChange={(e) => setLotForm({ ...lotForm, seller_tax_percentage: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium text-muted-foreground">{imageLabel}</p>
        <input
          id={uploadInputId}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageChange}
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {lotForm.imagePreviews.map((src, index) => (
            <div key={src} className="relative overflow-hidden rounded-lg border border-border">
              <Image
                src={src}
                alt="Preview"
                width={240}
                height={96}
                unoptimized
                className="h-24 w-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-8 w-8"
                onClick={() => handleRemoveImage(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <button
            type="button"
            className="flex h-24 min-h-24 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border px-3 text-center text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            onClick={() => document.getElementById(uploadInputId)?.click()}
          >
            <ImageIcon className="mb-1 h-5 w-5" />
            <span className="text-xs font-medium">Upload</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-foreground">Lots</h2>
          <p className="text-sm text-muted-foreground font-body mt-1">Manage auction lots and inventory</p>
        </div>
        <Button
          className="gap-2 font-body gradient-gold border-0 text-accent-foreground hover:opacity-90"
          onClick={() => {
            resetForm();
            setIsAddLotOpen(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Add Lot
        </Button>
      </div>

      <Card className="border border-border shadow-soft">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search lots by title or number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 font-body"
              />
            </div>
            <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="gap-2 font-body"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Grid</span>
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="gap-2 font-body"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Table</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredLots.length > 0 ? (
            filteredLots.map((lot) => {
              const statusConfig = getStatusBadge(lot.status);
              const primaryImage = getPrimaryImage(lot);
              const amountInfo = getLotAmountInfo(lot, auction.auction.currency);
              const estimateText = getLotEstimateText(lot, auction.auction.currency);
              const timeRemaining = formatTimeRemaining(lot.time_remaining_seconds);
              const shippingBadge = getShippingBadgeConfig(lot.shipping_availability);
              const bidCountLabel = `${lot.total_bids_count ?? 0} bid${lot.total_bids_count === 1 ? "" : "s"}`;
              const quantityLabel =
                lot.quantity !== null && lot.quantity !== undefined
                  ? `Qty ${lot.quantity}`
                  : null;

              return (
                <Card key={lot.id} className="border border-border shadow-soft hover:shadow-medium transition-all overflow-hidden pt-0 pb-0">
                  <div className="aspect-4/3 bg-secondary relative overflow-hidden">
                    {primaryImage ? (
                      <Image src={primaryImage} alt={lot.title} className="object-cover w-full h-full" fill />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Package className="w-12 h-12 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="font-body text-xs bg-background/90 backdrop-blur-sm">
                        Lot {lot.lot_number}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge variant={statusConfig.variant} className="font-body text-xs">
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="flex flex-col gap-4 p-4">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-body font-semibold text-foreground line-clamp-1">{lot.title}</h3>
                          <div className="flex shrink-0 flex-col items-end gap-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                            <span>{bidCountLabel}</span>
                            {quantityLabel && <span>{quantityLabel}</span>}
                          </div>
                        </div>
                        {lot.description ? (
                          <p className="text-xs text-muted-foreground font-body line-clamp-2">
                            {lot.description}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground font-body">
                            No description added yet.
                          </p>
                        )}
                        {(estimateText || shippingBadge) && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {estimateText && (
                              <Badge variant="outline" className="font-body text-[11px]">
                                Estimate {estimateText}
                              </Badge>
                            )}
                            {shippingBadge && (
                              <Badge variant="outline" className={`gap-1 font-body text-[11px] ${shippingBadge.className}`}>
                                <shippingBadge.icon className="h-3 w-3" />
                                {shippingBadge.label}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-body uppercase tracking-wide">{amountInfo.label}</p>
                        <p className="text-sm font-body text-foreground">{amountInfo.value}</p>
                      </div>
                      {timeRemaining && (
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          {timeRemaining && <span>{timeRemaining}</span>}
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => openViewLot(lot)}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => handleEditLot(lot)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                        onClick={() => openDeleteLot(lot)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full">
              <Card className="border border-border shadow-soft">
                <CardContent className="py-12 text-center">
                  <Package className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground font-body">No lots found</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {viewMode === "table" && (
        <Card className="border border-border shadow-soft overflow-hidden pt-0 pb-0">
          {filteredLots.length > 0 ? (
            <>
              <div className="space-y-3 p-4 md:hidden">
                {filteredLots.map((lot) => {
                  const statusConfig = getStatusBadge(lot.status);
                  const primaryImage = getPrimaryImage(lot);
                  const amountInfo = getLotAmountInfo(lot, auction.auction.currency);
                  const estimateText = getLotEstimateText(lot, auction.auction.currency);
                  const shippingBadge = getShippingBadgeConfig(lot.shipping_availability);
                  const bidCountLabel = `${lot.total_bids_count ?? 0} bid${lot.total_bids_count === 1 ? "" : "s"}`;
                  const quantityLabel =
                    lot.quantity !== null && lot.quantity !== undefined
                      ? `Qty ${lot.quantity}`
                      : null;

                  return (
                    <div key={lot.id} className="rounded-xl border border-border/70 bg-background p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-14 w-14 rounded-lg bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                          {primaryImage ? (
                            <Image src={primaryImage} alt={lot.title} width={56} height={56} className="h-full w-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-body font-medium text-foreground">Lot {lot.lot_number}</p>
                            <Badge variant={statusConfig.variant} className="font-body text-xs">
                              {statusConfig.label}
                            </Badge>
                            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              {bidCountLabel}
                            </span>
                            {quantityLabel && (
                              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                {quantityLabel}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 font-body text-sm text-foreground">{lot.title}</p>
                          {lot.description ? (
                            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                              {lot.description}
                            </p>
                          ) : (
                            <p className="mt-1 text-xs text-muted-foreground">
                              No description added yet.
                            </p>
                          )}
                          {(estimateText || shippingBadge) && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {estimateText && (
                                <Badge variant="outline" className="font-body text-[11px]">
                                  Estimate {estimateText}
                                </Badge>
                              )}
                              {shippingBadge && (
                                <Badge variant="outline" className={`gap-1 font-body text-[11px] ${shippingBadge.className}`}>
                                  <shippingBadge.icon className="h-3 w-3" />
                                  {shippingBadge.label}
                                </Badge>
                              )}
                            </div>
                          )}
                          <div className="mt-2">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              {amountInfo.label}
                            </p>
                            <p className="text-sm font-medium text-foreground">
                              {amountInfo.value}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-2 sm:grid-cols-3">
                        <Button variant="outline" size="sm" onClick={() => openViewLot(lot)}>
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditLot(lot)}>
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive" onClick={() => openDeleteLot(lot)}>
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                      <TableHead className="font-body font-semibold text-foreground">Lot #</TableHead>
                      <TableHead className="font-body font-semibold text-foreground">Item</TableHead>
                      <TableHead className="font-body font-semibold text-foreground">Bid / Price</TableHead>
                      <TableHead className="font-body font-semibold text-foreground">Status</TableHead>
                      <TableHead className="font-body font-semibold text-foreground w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLots.map((lot) => {
                      const statusConfig = getStatusBadge(lot.status);
                      const primaryImage = getPrimaryImage(lot);
                      const amountInfo = getLotAmountInfo(lot, auction.auction.currency);
                      const estimateText = getLotEstimateText(lot, auction.auction.currency);
                      const shippingBadge = getShippingBadgeConfig(lot.shipping_availability);
                      const bidCountLabel = `${lot.total_bids_count ?? 0} bid${lot.total_bids_count === 1 ? "" : "s"}`;
                      const quantityLabel =
                        lot.quantity !== null && lot.quantity !== undefined
                          ? `Qty ${lot.quantity}`
                          : null;

                      return (
                        <TableRow key={lot.id} className="group hover:bg-secondary/30">
                          <TableCell className="font-body font-medium text-foreground">{lot.lot_number}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                                {primaryImage ? (
                                  <Image src={primaryImage} alt={lot.title} width={48} height={48} className="w-full h-full object-cover" />
                                ) : (
                                  <Package className="w-5 h-5 text-muted-foreground" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-body font-medium text-foreground truncate">{lot.title}</p>
                                {lot.description ? (
                                  <p className="text-xs text-muted-foreground font-body truncate">
                                    {lot.description}
                                  </p>
                                ) : (
                                  <p className="text-xs text-muted-foreground font-body">
                                    No description added yet.
                                  </p>
                                )}
                                {(estimateText || shippingBadge) && (
                                  <div className="mt-1 flex flex-wrap gap-1.5">
                                    {estimateText && (
                                      <Badge variant="outline" className="font-body text-[10px]">
                                        Estimate {estimateText}
                                      </Badge>
                                    )}
                                    {shippingBadge && (
                                      <Badge variant="outline" className={`gap-1 font-body text-[10px] ${shippingBadge.className}`}>
                                        <shippingBadge.icon className="h-3 w-3" />
                                        {shippingBadge.label}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-body">
                            <div>
                              <p className="text-sm text-foreground">{amountInfo.value}</p>
                              <p className="text-xs text-muted-foreground">{amountInfo.label}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge variant={statusConfig.variant} className="font-body text-xs">
                                {statusConfig.label}
                              </Badge>
                              <p className="text-xs text-muted-foreground">{bidCountLabel}</p>
                              {quantityLabel && (
                                <p className="text-xs text-muted-foreground">{quantityLabel}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="font-body">
                                <DropdownMenuItem className="gap-2" onClick={() => openViewLot(lot)}>
                                  <Eye className="w-4 h-4" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2" onClick={() => handleEditLot(lot)}>
                                  <Edit3 className="w-4 h-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 text-destructive" onClick={() => openDeleteLot(lot)}>
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <div className="py-12 text-center">
              <Package className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground font-body">No lots found</p>
            </div>
          )}
        </Card>
      )}

      <Dialog open={isAddLotOpen} onOpenChange={setIsAddLotOpen}>
        <DialogContent className={lotDialogContentClassName}>
          <DialogHeader className="shrink-0 border-b px-4 pt-5 pb-4 pr-10 sm:px-6">
            <DialogTitle>Add New Lot</DialogTitle>
            <DialogDescription>Add a new lot to this auction.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
            {renderLotFormFields("lot-image-upload", "Lot Images")}
          </div>
          <DialogFooter className="shrink-0 border-t px-4 py-4 sm:px-6">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setIsAddLotOpen(false)}>
              Cancel
            </Button>
            <Button className="w-full sm:w-auto" onClick={handleAddLot} disabled={createLot.isPending}>
              {createLot.isPending ? "Adding..." : "Add Lot"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditLotOpen} onOpenChange={setIsEditLotOpen}>
        <DialogContent className={lotDialogContentClassName}>
          <DialogHeader className="shrink-0 border-b px-4 pt-5 pb-4 pr-10 sm:px-6">
            <DialogTitle>Edit Lot</DialogTitle>
            <DialogDescription>Update lot details.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
            {renderLotFormFields("lot-image-upload-edit", "Add Images")}
          </div>
          <DialogFooter className="shrink-0 border-t px-4 py-4 sm:px-6">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setIsEditLotOpen(false)}>
              Cancel
            </Button>
            <Button className="w-full sm:w-auto" onClick={handleUpdateLot} disabled={updateLot.isPending}>
              {updateLot.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewLotOpen} onOpenChange={setIsViewLotOpen}>
        <DialogContent className="max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] overflow-y-auto sm:max-h-[90vh] sm:max-w-4xl">
          <DialogHeader className="pr-10">
            <DialogTitle>Lot Details</DialogTitle>
            <DialogDescription>View complete information for this lot</DialogDescription>
          </DialogHeader>
          {selectedLot && (() => {
            const amountInfo = getLotAmountInfo(selectedLot, auction.auction.currency);
            const estimateText = getLotEstimateText(selectedLot, auction.auction.currency);
            const timeRemaining = formatTimeRemaining(selectedLot.time_remaining_seconds);
            const shippingBadge = getShippingBadgeConfig(selectedLot.shipping_availability);
            const startsAt = formatLotDateTime(selectedLot.starts_at);
            const endsAt = formatLotDateTime(selectedLot.ends_at);
            const quantityLabel =
              selectedLot.quantity !== null && selectedLot.quantity !== undefined
                ? String(selectedLot.quantity)
                : null;

            return (
              <div className="space-y-6 py-4">
                <div className="relative w-full h-64 rounded-lg overflow-hidden bg-secondary">
                  {getPrimaryImage(selectedLot) ? (
                    <Image src={getPrimaryImage(selectedLot)} alt={selectedLot.title} fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="w-16 h-16 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="font-body text-sm bg-background/90 backdrop-blur-sm">
                      Lot {selectedLot.lot_number}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge variant={getStatusBadge(selectedLot.status).variant} className="font-body text-sm">
                      {getStatusBadge(selectedLot.status).label}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {amountInfo.label}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-foreground">{amountInfo.value}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Estimate
                      </p>
                      <p className="mt-2 text-sm font-medium text-foreground">{estimateText || "—"}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Total Bids
                      </p>
                      <p className="mt-2 text-lg font-semibold text-foreground">
                        {selectedLot.total_bids_count ?? 0}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Quantity
                      </p>
                      <p className="mt-2 text-sm font-medium text-foreground">{quantityLabel || "—"}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Shipping
                      </p>
                      <div className="mt-2">
                        {shippingBadge ? (
                          <Badge variant="outline" className={`gap-1 font-body ${shippingBadge.className}`}>
                            <shippingBadge.icon className="h-3.5 w-3.5" />
                            {shippingBadge.label}
                          </Badge>
                        ) : (
                          <p className="text-sm font-medium text-foreground">—</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {(startsAt || endsAt || timeRemaining) && (
                  <Card>
                    <CardContent className="grid gap-4 p-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Starts</p>
                        <p className="mt-2 text-sm text-foreground">{startsAt || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Ends</p>
                        <p className="mt-2 text-sm text-foreground">{endsAt || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Time Remaining</p>
                        <p className="mt-2 text-sm text-foreground">{timeRemaining || "—"}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedLot.description && (
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Description</p>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {selectedLot.description}
                      </p>
                    </CardContent>
                  </Card>
                )}
                {selectedLot.images && selectedLot.images.length > 1 && (
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Images</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {selectedLot.images.map((img) => (
                          <div key={img.id} className="relative w-full h-24 rounded-lg overflow-hidden bg-secondary">
                            <Image src={img.image_url} alt="Lot image" fill className="object-cover" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsViewLotOpen(false);
                      handleEditLot(selectedLot);
                    }}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Lot
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setIsViewLotOpen(false);
                      setSelectedLot(selectedLot);
                      setIsDeleteLotOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Lot
                  </Button>
                </div>
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setIsViewLotOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteLotOpen} onOpenChange={setIsDeleteLotOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lot?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the lot. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLot} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteLot.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
