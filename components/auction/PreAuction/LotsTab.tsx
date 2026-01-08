import { useState } from "react";
import { Plus, Search, Upload, MoreVertical, Image, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { FormSection } from "../FormSection";
import { FormInput } from "../FormInput";
import { FormSelect } from "../FormSelect";
import { FormTextarea } from "../FormTextarea";
import { PremiumButton } from "../PremiumButton";
import { PremiumTable } from "../PremiumTable";
import { StatusBadge } from "../StatusBadge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { CreateAuctionLotInput } from "@/features/auction/types";

interface Lot {
  id: number;
  lotNumber: string;
  saleOrder: number;
  title: string;
  lotStagger: number;
  quantity: number;
  status: "pending" | "live" | "closed" | "completed";
}

const mockLots: Lot[] = [
  { id: 1, lotNumber: "001", saleOrder: 1, title: "Vintage Rolex Submariner", lotStagger: 0, quantity: 1, status: "pending" },
  { id: 2, lotNumber: "002", saleOrder: 2, title: "Louis Vuitton Keepall 55", lotStagger: 30, quantity: 1, status: "pending" },
  { id: 3, lotNumber: "003", saleOrder: 3, title: "Hermes Birkin 30 Togo", lotStagger: 60, quantity: 1, status: "pending" },
  { id: 4, lotNumber: "004", saleOrder: 4, title: "Cartier Love Bracelet 18K", lotStagger: 90, quantity: 2, status: "pending" },
];

interface LotsTabProps {
  onLotsChange?: (lots: CreateAuctionLotInput[]) => void;
  onLotImagesChange?: (lotIndex: number, files: File[]) => void;
}

export function LotsTab({ onLotsChange, onLotImagesChange }: LotsTabProps) {
  const [showNewLot, setShowNewLot] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lots, setLots] = useState<Lot[]>(mockLots);
  const [formState, setFormState] = useState<{
    lotNumber: string;
    sellerId: string;
    quantity: string;
    title: string;
    description: string;
    startingBid: string;
    reservePrice: string;
    estimateLow: string;
    estimateHigh: string;
    lotStaggerSeconds: string;
  }>({
    lotNumber: "",
    sellerId: "",
    quantity: "1",
    title: "",
    description: "",
    startingBid: "",
    reservePrice: "",
    estimateLow: "",
    estimateHigh: "",
    lotStaggerSeconds: "",
  });
  const [currentLotImages, setCurrentLotImages] = useState<File[]>([]);

  const columns = [
    { key: "lotNumber", header: "Lot #", className: "w-20" },
    { key: "saleOrder", header: "Sale Order", className: "w-24" },
    {
      key: "title",
      header: "Title",
      render: (item: Lot) => (
        <span className="font-medium text-foreground">{item.title}</span>
      )
    },
    { key: "lotStagger", header: "Lot Stagger", className: "w-24" },
    { key: "quantity", header: "Qty", className: "w-16 text-center" },
    {
      key: "status",
      header: "Status",
      className: "w-28",
      render: (item: Lot) => <StatusBadge status={item.status} />
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: () => (
        <button className="p-1 hover:bg-accent rounded-md transition-colors">
          <MoreVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* New Lot Form */}
      <Dialog open={showNewLot} onOpenChange={setShowNewLot}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
            <DialogTitle>New Lot</DialogTitle>
            <DialogDescription>
              Add a new lot to this auction.
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable Form Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput
                  label="Lot Number"
                  placeholder="001"
                  value={formState.lotNumber}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      lotNumber: e.target.value,
                    }))
                  }
                />

                <FormSelect
                  label="Seller"
                  options={[
                    { value: "1", label: "John Smith" },
                    { value: "2", label: "Jane Doe" },
                  ]}
                  placeholder="Select seller..."
                  value={formState.sellerId}
                  onValueChange={(value) =>
                    setFormState((prev) => ({
                      ...prev,
                      sellerId: value,
                    }))
                  }
                />

                <FormInput
                  label="Quantity"
                  type="number"
                  placeholder="1"
                  value={formState.quantity}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      quantity: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <FormInput
                  label="Title"
                  placeholder="Enter lot title"
                  value={formState.title}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <FormTextarea
                  label="Description"
                  placeholder="Describe this lot..."
                  rows={4}
                  value={formState.description}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Pricing Section */}
              <div className="space-y-4">
                <p className="micro-label mb-4">Pricing & Estimates</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput 
                    label="Starting Bid" 
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    value={formState.startingBid}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        startingBid: e.target.value,
                      }))
                    }
                  />
                  <FormInput 
                    label="Reserve Price" 
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    value={formState.reservePrice}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        reservePrice: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput 
                    label="Estimate Low" 
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    value={formState.estimateLow}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        estimateLow: e.target.value,
                      }))
                    }
                  />
                  <FormInput 
                    label="Estimate High" 
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    value={formState.estimateHigh}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        estimateHigh: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Lot Settings */}
              <div className="space-y-4">
                <p className="micro-label mb-4">Lot Settings</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput 
                    label="Lot Stagger (seconds)" 
                    type="number" 
                    placeholder="0"
                    value={formState.lotStaggerSeconds}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        lotStaggerSeconds: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Lot Media */}
              <div>
                <p className="micro-label mb-3">Lot Media</p>
                <input
                  type="file"
                  id="lot-images-upload"
                  name="lot_images"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const maxSize = 10 * 1024 * 1024; // 10MB
                    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                    
                    const validFiles = files.filter(file => {
                      if (file.size > maxSize) {
                        toast.error(`${file.name} exceeds 10MB limit`);
                        return false;
                      }
                      if (!allowedTypes.includes(file.type)) {
                        toast.error(`${file.name} is not a valid format. Accepted: JPEG, PNG, WebP, JPG`);
                        return false;
                      }
                      return true;
                    });
                    
                    if (validFiles.length > 0) {
                      setCurrentLotImages(validFiles);
                      toast.success(`${validFiles.length} image(s) selected`);
                    }
                  }}
                />
                <label
                  htmlFor="lot-images-upload"
                  className="border-2 border-dashed border-border-subtle rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer group block"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-primary-muted flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Image className="h-5 w-5 text-green-700" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Upload images</p>
                      <p className="text-xs text-muted-foreground">Drag & drop or click to browse</p>
                      <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WebP, JPG (max 10MB each)</p>
                    </div>
                  </div>
                </label>
              </div>

            </div>
          </div>

          {/* Fixed Footer with Buttons */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t bg-background shrink-0">
            <PremiumButton 
              variant="ghost" 
              onClick={() => setShowNewLot(false)}
              disabled={isLoading}
            >
              Cancel
            </PremiumButton>

            <PremiumButton 
              onClick={async () => {
                    if (!formState.title || !formState.startingBid) {
                      toast.error("Title and starting bid are required");
                      return;
                    }
                setIsLoading(true);
                await new Promise(resolve => setTimeout(resolve, 1000));
                const newLot: Lot = {
                  id: lots.length + 1,
                  lotNumber: String(lots.length + 1).padStart(3, "0"),
                  saleOrder: lots.length + 1,
                      title: formState.title || "New Lot",
                      lotStagger: parseInt(formState.lotStaggerSeconds || "0", 10) || 0,
                      quantity: parseInt(formState.quantity || "1", 10) || 1,
                  status: "pending",
                };
                setLots([...lots, newLot]);

                    const lotPayload: CreateAuctionLotInput = {
                      lot_number: formState.lotNumber || String(lots.length + 1),
                      title: formState.title,
                      description: formState.description,
                      quantity: parseInt(formState.quantity || "1", 10) || 1,
                      starting_bid: parseFloat(formState.startingBid || "0") || 0,
                      reserve_price: formState.reservePrice ? parseFloat(formState.reservePrice) : undefined,
                      estimate_low: formState.estimateLow ? parseFloat(formState.estimateLow) : undefined,
                      estimate_high: formState.estimateHigh ? parseFloat(formState.estimateHigh) : undefined,
                      lot_stagger_seconds: formState.lotStaggerSeconds
                        ? parseInt(formState.lotStaggerSeconds, 10)
                        : undefined,
                      seller_id: formState.sellerId ? parseInt(formState.sellerId, 10) : undefined,
                    };

                    if (onLotsChange) {
                      onLotsChange([
                        lotPayload,
                      ]);
                    }

                    if (onLotImagesChange && currentLotImages.length > 0) {
                      onLotImagesChange(lots.length, currentLotImages);
                    }

                    // reset form
                    setFormState({
                      lotNumber: "",
                      sellerId: "",
                      quantity: "1",
                      title: "",
                      description: "",
                      startingBid: "",
                      reservePrice: "",
                      estimateLow: "",
                      estimateHigh: "",
                      lotStaggerSeconds: "",
                    });
                    setCurrentLotImages([]);
                setIsLoading(false);
                setShowNewLot(false);
                toast.success("Lot added", {
                  description: "The new lot has been added to the auction.",
                });
              }}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Lot"}
            </PremiumButton>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lots Table Header */}
      <div className="premium-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Lots</h3>
            <p className="text-sm text-muted-foreground">{mockLots.length} lots in this auction</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search lots..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="premium-input pl-10 w-64"
              />
            </div>
            <PremiumButton variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </PremiumButton>
            <PremiumButton size="sm" onClick={() => setShowNewLot(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Lot
            </PremiumButton>
          </div>
        </div>

        <PremiumTable
          columns={columns}
          data={lots.filter(lot =>
            lot.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lot.lotNumber.includes(searchQuery)
          )}
        />
      </div>
    </div>
  );
}
