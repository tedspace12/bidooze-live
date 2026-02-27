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
  status: "pending" | "active" | "sold" | "passed" | "cancelled";
  images?: LotImage[];
};

function getStatusBadge(status: LotRecord["status"]) {
  const config = {
    pending: { label: "Pending", variant: "secondary" as const },
    active: { label: "Active", variant: "default" as const },
    sold: { label: "Sold", variant: "outline" as const },
    passed: { label: "Passed", variant: "secondary" as const },
    cancelled: { label: "Cancelled", variant: "destructive" as const },
  };
  return config[status] || config.pending;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
};

const extractLotRecords = (payload: unknown): LotRecord[] => {
  if (Array.isArray(payload)) {
    return payload as LotRecord[];
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    const nested = (payload as { data?: unknown }).data;

    if (Array.isArray(nested)) {
      return nested as LotRecord[];
    }

    if (nested && typeof nested === "object" && "data" in nested) {
      const doubleNested = (nested as { data?: unknown }).data;
      if (Array.isArray(doubleNested)) {
        return doubleNested as LotRecord[];
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
      quantity: String(lot.quantity ?? 1),
      starting_bid: String(lot.starting_bid ?? ""),
      reserve_price: String(lot.reserve_price ?? ""),
      estimate_low: String(lot.estimate_low ?? ""),
      estimate_high: String(lot.estimate_high ?? ""),
      commission_percentage: String(lot.commission_percentage ?? ""),
      buyer_premium_percentage: String(lot.buyer_premium_percentage ?? ""),
      buyer_tax_percentage: String(lot.buyer_tax_percentage ?? ""),
      seller_tax_percentage: String(lot.seller_tax_percentage ?? ""),
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
          quantity: Number(lotForm.quantity) || 1,
          starting_bid: lotForm.starting_bid ? Number(lotForm.starting_bid) : undefined,
          reserve_price: lotForm.reserve_price ? Number(lotForm.reserve_price) : null,
          estimate_low: lotForm.estimate_low ? Number(lotForm.estimate_low) : null,
          estimate_high: lotForm.estimate_high ? Number(lotForm.estimate_high) : null,
          commission_percentage: lotForm.commission_percentage ? Number(lotForm.commission_percentage) : null,
          buyer_premium_percentage: lotForm.buyer_premium_percentage ? Number(lotForm.buyer_premium_percentage) : null,
          buyer_tax_percentage: lotForm.buyer_tax_percentage ? Number(lotForm.buyer_tax_percentage) : null,
          seller_tax_percentage: lotForm.seller_tax_percentage ? Number(lotForm.seller_tax_percentage) : null,
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

  const getPrimaryImage = (lot: LotRecord) => lot.images?.[0]?.image_url || "";

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

              return (
                <Card key={lot.id} className="group border border-border shadow-soft hover:shadow-medium transition-all overflow-hidden pt-0 pb-0">
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
                    <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="sm" variant="secondary" className="font-body gap-1" onClick={() => { setSelectedLot(lot); setIsViewLotOpen(true); }}>
                        <Eye className="w-3 h-3" />
                        View
                      </Button>
                      <Button size="sm" variant="secondary" className="font-body gap-1" onClick={() => handleEditLot(lot)}>
                        <Edit3 className="w-3 h-3" />
                        Edit
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-body font-semibold text-foreground line-clamp-1 mb-1">{lot.title}</h3>
                    <p className="text-xs text-muted-foreground font-body line-clamp-1 mb-3">{lot.description}</p>
                    <div className="mb-3">
                      <p className="text-xs text-muted-foreground font-body uppercase tracking-wide">Starting Bid</p>
                      <p className="text-sm font-body text-foreground">
                        {formatCurrency(Number(lot.starting_bid || 0), auction.auction.currency)}
                      </p>
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
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                <TableHead className="font-body font-semibold text-foreground">Lot #</TableHead>
                <TableHead className="font-body font-semibold text-foreground">Item</TableHead>
                <TableHead className="font-body font-semibold text-foreground">Starting Bid</TableHead>
                <TableHead className="font-body font-semibold text-foreground">Status</TableHead>
                <TableHead className="font-body font-semibold text-foreground w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLots.length > 0 ? (
                filteredLots.map((lot) => {
                  const statusConfig = getStatusBadge(lot.status);
                  const primaryImage = getPrimaryImage(lot);

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
                            <p className="text-xs text-muted-foreground font-body truncate">
                              {(lot.description || "").slice(0, 60)}
                              {(lot.description || "").length > 60 ? "..." : ""}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-body">
                        {formatCurrency(Number(lot.starting_bid || 0), auction.auction.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig.variant} className="font-body text-xs">
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="font-body">
                            <DropdownMenuItem className="gap-2" onClick={() => { setSelectedLot(lot); setIsViewLotOpen(true); }}>
                              <Eye className="w-4 h-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2" onClick={() => handleEditLot(lot)}>
                              <Edit3 className="w-4 h-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-destructive" onClick={() => { setSelectedLot(lot); setIsDeleteLotOpen(true); }}>
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <Package className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-muted-foreground font-body">No lots found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={isAddLotOpen} onOpenChange={setIsAddLotOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add New Lot</DialogTitle>
            <DialogDescription>Add a new lot to this auction.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Lot Number</Label>
                <Input value={lotForm.lot_number} onChange={(e) => setLotForm({ ...lotForm, lot_number: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input value={lotForm.quantity} onChange={(e) => setLotForm({ ...lotForm, quantity: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Starting Bid</Label>
                <Input value={lotForm.starting_bid} onChange={(e) => setLotForm({ ...lotForm, starting_bid: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={lotForm.title} onChange={(e) => setLotForm({ ...lotForm, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={lotForm.description} onChange={(e) => setLotForm({ ...lotForm, description: e.target.value })} rows={4} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Reserve Price</Label>
                <Input value={lotForm.reserve_price} onChange={(e) => setLotForm({ ...lotForm, reserve_price: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Estimate Low</Label>
                <Input value={lotForm.estimate_low} onChange={(e) => setLotForm({ ...lotForm, estimate_low: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Estimate High</Label>
                <Input value={lotForm.estimate_high} onChange={(e) => setLotForm({ ...lotForm, estimate_high: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Commission %</Label>
                <Input value={lotForm.commission_percentage} onChange={(e) => setLotForm({ ...lotForm, commission_percentage: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Buyer Premium %</Label>
                <Input value={lotForm.buyer_premium_percentage} onChange={(e) => setLotForm({ ...lotForm, buyer_premium_percentage: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Buyer Tax %</Label>
                <Input value={lotForm.buyer_tax_percentage} onChange={(e) => setLotForm({ ...lotForm, buyer_tax_percentage: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Seller Tax %</Label>
                <Input value={lotForm.seller_tax_percentage} onChange={(e) => setLotForm({ ...lotForm, seller_tax_percentage: e.target.value })} />
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-3">Lot Images</p>
              <input
                id="lot-image-upload"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageChange}
              />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {lotForm.imagePreviews.map((src, index) => (
                  <div key={src} className="relative border border-border rounded-lg overflow-hidden">
                    <Image
                      src={src}
                      alt="Preview"
                      width={240}
                      height={96}
                      unoptimized
                      className="w-full h-24 object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-7 w-7"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <button
                  type="button"
                  className="border-2 border-dashed border-border rounded-lg h-24 flex flex-col items-center justify-center text-muted-foreground"
                  onClick={() => document.getElementById("lot-image-upload")?.click()}
                >
                  <ImageIcon className="h-5 w-5 mb-1" />
                  <span className="text-xs">Upload</span>
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddLotOpen(false)}>Cancel</Button>
            <Button onClick={handleAddLot} disabled={createLot.isPending}>
              {createLot.isPending ? "Adding..." : "Add Lot"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditLotOpen} onOpenChange={setIsEditLotOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Lot</DialogTitle>
            <DialogDescription>Update lot details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Lot Number</Label>
                <Input value={lotForm.lot_number} onChange={(e) => setLotForm({ ...lotForm, lot_number: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input value={lotForm.quantity} onChange={(e) => setLotForm({ ...lotForm, quantity: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Starting Bid</Label>
                <Input value={lotForm.starting_bid} onChange={(e) => setLotForm({ ...lotForm, starting_bid: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={lotForm.title} onChange={(e) => setLotForm({ ...lotForm, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={lotForm.description} onChange={(e) => setLotForm({ ...lotForm, description: e.target.value })} rows={4} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Reserve Price</Label>
                <Input value={lotForm.reserve_price} onChange={(e) => setLotForm({ ...lotForm, reserve_price: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Estimate Low</Label>
                <Input value={lotForm.estimate_low} onChange={(e) => setLotForm({ ...lotForm, estimate_low: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Estimate High</Label>
                <Input value={lotForm.estimate_high} onChange={(e) => setLotForm({ ...lotForm, estimate_high: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Commission %</Label>
                <Input value={lotForm.commission_percentage} onChange={(e) => setLotForm({ ...lotForm, commission_percentage: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Buyer Premium %</Label>
                <Input value={lotForm.buyer_premium_percentage} onChange={(e) => setLotForm({ ...lotForm, buyer_premium_percentage: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Buyer Tax %</Label>
                <Input value={lotForm.buyer_tax_percentage} onChange={(e) => setLotForm({ ...lotForm, buyer_tax_percentage: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Seller Tax %</Label>
                <Input value={lotForm.seller_tax_percentage} onChange={(e) => setLotForm({ ...lotForm, seller_tax_percentage: e.target.value })} />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-3">Add Images</p>
              <input
                id="lot-image-upload-edit"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageChange}
              />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {lotForm.imagePreviews.map((src, index) => (
                  <div key={src} className="relative border border-border rounded-lg overflow-hidden">
                    <Image
                      src={src}
                      alt="Preview"
                      width={240}
                      height={96}
                      unoptimized
                      className="w-full h-24 object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-7 w-7"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <button
                  type="button"
                  className="border-2 border-dashed border-border rounded-lg h-24 flex flex-col items-center justify-center text-muted-foreground"
                  onClick={() => document.getElementById("lot-image-upload-edit")?.click()}
                >
                  <ImageIcon className="h-5 w-5 mb-1" />
                  <span className="text-xs">Upload</span>
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditLotOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateLot} disabled={updateLot.isPending}>
              {updateLot.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewLotOpen} onOpenChange={setIsViewLotOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lot Details</DialogTitle>
            <DialogDescription>View complete information for this lot</DialogDescription>
          </DialogHeader>
          {selectedLot && (
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
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
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
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewLotOpen(false)}>
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
