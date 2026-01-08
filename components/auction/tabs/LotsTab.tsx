import { useState } from "react";
import { Auction, Lot } from "@/data";
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
  ArrowUpDown,
  LayoutGrid,
  List,
  Eye as EyeIcon,
  Image as ImageIcon
} from "lucide-react";
import Image from "next/image";
import { FormInput } from "../FormInput";
import { FormSelect } from "../FormSelect";
import { FormTextarea } from "../FormTextarea";

interface LotsTabProps {
  auction: Auction;
}

function getStatusBadge(status: Lot["status"]) {
  const config = {
    Pending: { label: "Pending", variant: "secondary" as const },
    Active: { label: "Active", variant: "default" as const },
    Sold: { label: "Sold", variant: "outline" as const },
    Unsold: { label: "Unsold", variant: "destructive" as const },
  };
  return config[status || "Pending"] || config.Pending;
}

function formatCurrency(amount: number, currency: Auction["currency"]) {
  const symbol = currency === "NGN" ? "₦" : "$";
  return `${symbol}${amount.toLocaleString()}`;
}

export default function LotsTab({ auction }: LotsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [sortField, setSortField] = useState<keyof Lot>("lotNumber");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isAddLotOpen, setIsAddLotOpen] = useState(false);
  const [isEditLotOpen, setIsEditLotOpen] = useState(false);
  const [isDeleteLotOpen, setIsDeleteLotOpen] = useState(false);
  const [isViewLotOpen, setIsViewLotOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lots, setLots] = useState<Lot[]>(auction.lots);
  // Initialize metadata for existing lots (empty seller/quantity for existing lots)
  const [lotMetadata, setLotMetadata] = useState<Record<string, { seller: string; quantity: string }>>(() => {
    const initial: Record<string, { seller: string; quantity: string }> = {};
    auction.lots.forEach(lot => {
      initial[lot.id] = { seller: "", quantity: "1" };
    });
    return initial;
  });
  const [lotForm, setLotForm] = useState({
    title: "",
    description: "",
    startingBid: "",
    lotNumber: "",
    seller: "",
    quantity: "1",
    image: null as File | null,
    imagePreview: "" as string | null,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setLotForm({
          ...lotForm,
          image: file,
          imagePreview: URL.createObjectURL(file),
        });
      } else {
        toast.error("Please select a valid image file");
      }
    }
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setLotForm({
        ...lotForm,
        image: file,
        imagePreview: URL.createObjectURL(file),
      });
    } else {
      toast.error("Please drop a valid image file");
    }
  };

  const handleImageRemove = () => {
    if (lotForm.imagePreview && lotForm.imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(lotForm.imagePreview);
    }
    setLotForm({
      ...lotForm,
      image: null,
      imagePreview: null,
    });
  };

  const handleAddLot = async () => {
    if (!lotForm.title || !lotForm.startingBid || !lotForm.seller) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a mock image URL from the uploaded file
    const imageUrl = lotForm.imagePreview || "/images/lots/placeholder.jpg";
    
    const newLot: Lot = {
      id: `lot-${Date.now()}`,
      lotNumber: parseInt(lotForm.lotNumber) || lots.length + 1,
      title: lotForm.title,
      description: lotForm.description,
      startingBid: parseFloat(lotForm.startingBid),
      highestBid: 0,
      status: "Pending",
      watchers: 0,
      image: imageUrl,
    };
    setLots([...lots, newLot]);
    setLotMetadata({
      ...lotMetadata,
      [newLot.id]: {
        seller: lotForm.seller,
        quantity: lotForm.quantity,
      },
    });
    setLotForm({ title: "", description: "", startingBid: "", lotNumber: "", seller: "", quantity: "1", image: null, imagePreview: null });
    setIsAddLotOpen(false);
    setIsLoading(false);
    toast.success("Lot added successfully", {
      description: `${newLot.title} has been added to the auction.`,
    });
  };

  const handleEditLot = (lot: Lot) => {
    setSelectedLot(lot);
    const metadata = lotMetadata[lot.id] || { seller: "", quantity: "1" };
    setLotForm({
      title: lot.title,
      description: lot.description,
      startingBid: lot.startingBid.toString(),
      lotNumber: lot.lotNumber.toString(),
      seller: metadata.seller,
      quantity: metadata.quantity,
      image: null,
      imagePreview: lot.image || null,
    });
    setIsEditLotOpen(true);
  };

  const handleUpdateLot = async () => {
    if (!selectedLot || !lotForm.title || !lotForm.startingBid || !lotForm.seller) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const imageUrl = lotForm.imagePreview || selectedLot.image || "";
    
    setLots(lots.map(lot => 
      lot.id === selectedLot.id 
        ? { ...lot, title: lotForm.title, description: lotForm.description, startingBid: parseFloat(lotForm.startingBid), image: imageUrl }
        : lot
    ));
    setLotMetadata({
      ...lotMetadata,
      [selectedLot.id]: {
        seller: lotForm.seller,
        quantity: lotForm.quantity,
      },
    });
    setIsEditLotOpen(false);
    setSelectedLot(null);
    // Clean up image preview URL if it's a blob URL
    if (lotForm.imagePreview && lotForm.imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(lotForm.imagePreview);
    }
    setIsLoading(false);
    toast.success("Lot updated successfully", {
      description: "The lot has been updated.",
    });
  };

  const handleDeleteLot = async () => {
    if (!selectedLot) return;
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLots(lots.filter(lot => lot.id !== selectedLot.id));
    setIsDeleteLotOpen(false);
    setSelectedLot(null);
    setIsLoading(false);
    toast.success("Lot deleted", {
      description: "The lot has been removed from the auction.",
    });
  };

  const filteredLots = lots
    .filter((lot) =>
      lot.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lot.lotNumber.toString().includes(searchQuery)
    )
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortOrder === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

  const handleSort = (field: keyof Lot) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-foreground">Lots</h2>
          <p className="text-sm text-muted-foreground font-body mt-1">
            Manage auction lots and inventory
          </p>
        </div>
        <Button 
          className="gap-2 font-body gradient-gold border-0 text-accent-foreground hover:opacity-90"
          onClick={() => {
            setLotForm({ title: "", description: "", startingBid: "", lotNumber: "", seller: "", quantity: "1", image: null, imagePreview: null });
            setIsAddLotOpen(true);
          }}
          disabled={isLoading}
        >
          <Plus className="w-4 h-4" />
          Add Lot
        </Button>
      </div>

      {/* Search and view toggle */}
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

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredLots.length > 0 ? (
            filteredLots.map((lot, index) => {
              const statusConfig = getStatusBadge(lot.status);
              
              return (
                <Card 
                  key={lot.id} 
                  className="group border border-border shadow-soft hover:shadow-medium transition-all overflow-hidden animate-in fade-in duration-300 pt-0 pb-0"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Image placeholder */}
                  <div className="aspect-4/3 bg-secondary relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                        {lot.image ? (
                            <Image src={lot.image} alt={lot.title} className="object-cover w-full h-full" fill />
                        ) : (
                      <Package className="w-12 h-12 text-muted-foreground/30" />
                        )}
                    </div>
                    {/* Lot number badge */}
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="font-body text-xs bg-background/90 backdrop-blur-sm">
                        Lot {lot.lotNumber}
                      </Badge>
                    </div>
                    {/* Status badge */}
                    <div className="absolute top-3 right-3">
                      <Badge variant={statusConfig.variant} className="font-body text-xs">
                        {statusConfig.label}
                      </Badge>
                    </div>
                    {/* Quick actions on hover */}
                    <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="font-body gap-1"
                        onClick={() => {
                          setSelectedLot(lot);
                          setIsViewLotOpen(true);
                        }}
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="font-body gap-1"
                        onClick={() => handleEditLot(lot)}
                        disabled={isLoading}
                      >
                        <Edit3 className="w-3 h-3" />
                        Edit
                      </Button>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    {/* Title */}
                    <h3 className="font-body font-semibold text-foreground line-clamp-1 mb-1">
                      {lot.title}
                    </h3>
                    <p className="text-xs text-muted-foreground font-body line-clamp-1 mb-3">
                      {lot.description}
                    </p>
                    
                    {/* Starting bid */}
                    <div className="mb-3">
                      <p className="text-xs text-muted-foreground font-body uppercase tracking-wide">Starting Bid</p>
                      <p className="text-sm font-body text-foreground">
                        {formatCurrency(lot.startingBid, auction.currency)}
                      </p>
                    </div>
                    
                    {/* Current bid */}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground font-body uppercase tracking-wide">Highest Bid</p>
                        {lot.highestBid > 0 ? (
                          <p className="text-lg font-semibold text-accent font-body tabular-nums">
                            {formatCurrency(lot.highestBid, auction.currency)}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground font-body">No bids yet</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <EyeIcon className="w-3 h-3" />
                          <span className="text-sm font-body">{lot.watchers}</span>
                        </div>
                      </div>
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

      {/* Table View */}
      {viewMode === "table" && (
        <Card className="border border-border shadow-soft overflow-hidden pt-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                <TableHead 
                  className="font-body font-semibold text-foreground cursor-pointer"
                  onClick={() => handleSort("lotNumber")}
                >
                  <div className="flex items-center gap-1">
                    Lot #
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </TableHead>
                <TableHead className="font-body font-semibold text-foreground">Item</TableHead>
                <TableHead className="font-body font-semibold text-foreground">Starting Bid</TableHead>
                <TableHead 
                  className="font-body font-semibold text-foreground cursor-pointer"
                  onClick={() => handleSort("highestBid")}
                >
                  <div className="flex items-center gap-1">
                    Highest Bid
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </TableHead>
                <TableHead 
                  className="font-body font-semibold text-foreground cursor-pointer"
                  onClick={() => handleSort("watchers")}
                >
                  <div className="flex items-center gap-1">
                    Watchers
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </TableHead>
                <TableHead className="font-body font-semibold text-foreground">Status</TableHead>
                <TableHead className="font-body font-semibold text-foreground w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLots.length > 0 ? (
                filteredLots.map((lot) => {
                  const statusConfig = getStatusBadge(lot.status);
                  return (
                    <TableRow key={lot.id} className="group hover:bg-secondary/30">
                      <TableCell className="font-body font-medium text-foreground">
                        {lot.lotNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                            {lot.image ? (
                              <Image 
                                src={lot.image} 
                                alt={lot.title}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-body font-medium text-foreground truncate">
                              {lot.title}
                            </p>
                            <p className="font-body text-xs text-muted-foreground truncate">
                              {lot.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-body tabular-nums text-muted-foreground">
                        {formatCurrency(lot.startingBid, auction.currency)}
                      </TableCell>
                      <TableCell className="font-body tabular-nums">
                        {lot.highestBid > 0 ? (
                          <span className="font-semibold text-accent">
                            {formatCurrency(lot.highestBid, auction.currency)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">No bids</span>
                        )}
                      </TableCell>
                      <TableCell className="font-body tabular-nums">
                        {lot.watchers}
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
                            <DropdownMenuItem 
                              className="gap-2"
                              onClick={() => {
                                setSelectedLot(lot);
                                setIsViewLotOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2"
                              onClick={() => handleEditLot(lot)}
                              disabled={isLoading}
                            >
                              <Edit3 className="w-4 h-4" />
                              Edit Lot
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2 text-destructive"
                              onClick={() => {
                                setSelectedLot(lot);
                                setIsDeleteLotOpen(true);
                              }}
                              disabled={isLoading}
                            >
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
                  <TableCell colSpan={7} className="text-center py-12">
                    <Package className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-muted-foreground font-body">No lots found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Add Lot Dialog */}
      <Dialog open={isAddLotOpen} onOpenChange={setIsAddLotOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add New Lot</DialogTitle>
            <DialogDescription>
              Add a new lot to this auction. Fill in the required information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormInput 
                label="Lot Number" 
                placeholder="001"
                value={lotForm.lotNumber}
                onChange={(e) => setLotForm({ ...lotForm, lotNumber: e.target.value })}
              />
              <FormSelect
                label="Seller"
                options={[
                  { value: "seller1", label: "John Smith" },
                  { value: "seller2", label: "Jane Doe" },
                  { value: "seller3", label: "Robert Johnson" },
                ]}
                placeholder="Select seller..."
                value={lotForm.seller}
                onValueChange={(value) => setLotForm({ ...lotForm, seller: value })}
              />
              <FormInput 
                label="Quantity" 
                type="number" 
                placeholder="1" 
                value={lotForm.quantity}
                onChange={(e) => setLotForm({ ...lotForm, quantity: e.target.value })}
              />
            </div>

            <div>
              <FormInput 
                label="Title" 
                placeholder="Enter lot title"
                value={lotForm.title}
                onChange={(e) => setLotForm({ ...lotForm, title: e.target.value })}
              />
            </div>

            <div>
              <FormTextarea 
                label="Description" 
                placeholder="Describe this lot..." 
                rows={4}
                value={lotForm.description}
                onChange={(e) => setLotForm({ ...lotForm, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <FormInput 
                label="Starting Bid" 
                type="number" 
                placeholder="0.00"
                value={lotForm.startingBid}
                onChange={(e) => setLotForm({ ...lotForm, startingBid: e.target.value })}
              />
            </div>

            {/* Lot Media */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-3">Lot Media</p>
              {lotForm.imagePreview ? (
                <div className="relative border border-border rounded-xl overflow-hidden">
                  <div className="relative w-full h-40 bg-muted overflow-hidden">
                    {lotForm.imagePreview.startsWith('blob:') ? (
                      <img
                        src={lotForm.imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image
                        src={lotForm.imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 z-10"
                    onClick={handleImageRemove}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-border-subtle rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer group"
                  onDrop={handleImageDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => document.getElementById('lot-image-upload')?.click()}
                >
                  <input
                    id="lot-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-primary-muted flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <ImageIcon className="h-5 w-5 text-green-700" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Upload images</p>
                      <p className="text-xs text-muted-foreground">Drag & drop or click to browse</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddLotOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleAddLot} disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Lot"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Lot Dialog */}
      <Dialog open={isEditLotOpen} onOpenChange={setIsEditLotOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Lot</DialogTitle>
            <DialogDescription>
              Update lot information. Changes will be saved immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormInput 
                label="Lot Number" 
                placeholder="001"
                value={lotForm.lotNumber}
                onChange={(e) => setLotForm({ ...lotForm, lotNumber: e.target.value })}
              />
              <FormSelect
                label="Seller"
                options={[
                  { value: "seller1", label: "John Smith" },
                  { value: "seller2", label: "Jane Doe" },
                  { value: "seller3", label: "Robert Johnson" },
                ]}
                placeholder="Select seller..."
                value={lotForm.seller}
                onValueChange={(value) => setLotForm({ ...lotForm, seller: value })}
              />
              <FormInput 
                label="Quantity" 
                type="number" 
                placeholder="1" 
                value={lotForm.quantity}
                onChange={(e) => setLotForm({ ...lotForm, quantity: e.target.value })}
              />
            </div>

            <div>
              <FormInput 
                label="Title" 
                placeholder="Enter lot title"
                value={lotForm.title}
                onChange={(e) => setLotForm({ ...lotForm, title: e.target.value })}
              />
            </div>

            <div>
              <FormTextarea 
                label="Description" 
                placeholder="Describe this lot..." 
                rows={4}
                value={lotForm.description}
                onChange={(e) => setLotForm({ ...lotForm, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <FormInput 
                label="Starting Bid" 
                type="number" 
                placeholder="0.00"
                value={lotForm.startingBid}
                onChange={(e) => setLotForm({ ...lotForm, startingBid: e.target.value })}
              />
            </div>

            {/* Lot Media */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-3">Lot Media</p>
              {lotForm.imagePreview ? (
                <div className="relative border border-border rounded-xl overflow-hidden">
                  <div className="relative w-full h-40 bg-muted overflow-hidden">
                    {lotForm.imagePreview.startsWith('blob:') ? (
                      <img
                        src={lotForm.imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image
                        src={lotForm.imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 z-10"
                    onClick={handleImageRemove}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-border-subtle rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer group"
                  onDrop={handleImageDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => document.getElementById('edit-lot-image-upload')?.click()}
                >
                  <input
                    id="edit-lot-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-primary-muted flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <ImageIcon className="h-5 w-5 text-green-700" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Upload images</p>
                      <p className="text-xs text-muted-foreground">Drag & drop or click to browse</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditLotOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleUpdateLot} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Lot Details Dialog */}
      <Dialog open={isViewLotOpen} onOpenChange={setIsViewLotOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lot Details</DialogTitle>
            <DialogDescription>
              View complete information for this lot
            </DialogDescription>
          </DialogHeader>
          {selectedLot && (
            <div className="space-y-6 py-4">
              {/* Lot Image */}
              <div className="relative w-full h-64 rounded-lg overflow-hidden bg-secondary">
                {selectedLot.image ? (
                  <Image
                    src={selectedLot.image}
                    alt={selectedLot.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="w-16 h-16 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="font-body text-sm bg-background/90 backdrop-blur-sm">
                    Lot {selectedLot.lotNumber}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge variant={getStatusBadge(selectedLot.status).variant} className="font-body text-sm">
                    {getStatusBadge(selectedLot.status).label}
                  </Badge>
                </div>
              </div>

              {/* Lot Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Title</p>
                      <p className="text-base font-semibold text-foreground">{selectedLot.title}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Lot Number</p>
                      <p className="text-sm text-foreground">{selectedLot.lotNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Seller</p>
                      <p className="text-sm text-foreground">
                        {lotMetadata[selectedLot.id]?.seller 
                          ? (() => {
                              const sellerOptions = [
                                { value: "seller1", label: "John Smith" },
                                { value: "seller2", label: "Jane Doe" },
                                { value: "seller3", label: "Robert Johnson" },
                              ];
                              return sellerOptions.find(s => s.value === lotMetadata[selectedLot.id].seller)?.label || lotMetadata[selectedLot.id].seller;
                            })()
                          : "Not assigned"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Quantity</p>
                      <p className="text-sm text-foreground">{lotMetadata[selectedLot.id]?.quantity || "1"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Starting Bid</p>
                      <p className="text-lg font-semibold text-foreground tabular-nums">
                        {formatCurrency(selectedLot.startingBid, auction.currency)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Highest Bid</p>
                      {selectedLot.highestBid > 0 ? (
                        <p className="text-lg font-semibold text-accent tabular-nums">
                          {formatCurrency(selectedLot.highestBid, auction.currency)}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">No bids yet</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Watchers</p>
                      <div className="flex items-center gap-2">
                        <EyeIcon className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm text-foreground">{selectedLot.watchers}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Status</p>
                      <Badge variant={getStatusBadge(selectedLot.status).variant} className="font-body">
                        {getStatusBadge(selectedLot.status).label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Description */}
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

              {/* Quick Actions */}
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

      {/* Delete Lot Confirmation */}
      <AlertDialog open={isDeleteLotOpen} onOpenChange={setIsDeleteLotOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lot?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{selectedLot?.title}" from the auction. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteLot} 
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
