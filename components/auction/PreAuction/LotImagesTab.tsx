import { Upload, Image, Grid3X3, List, Check, X } from "lucide-react";
import { PremiumButton } from "../PremiumButton";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface LotImage {
  id: number;
  lotNumber: string;
  title: string;
  imageCount: number;
  thumbnail?: string;
}

const mockLotImages: LotImage[] = [
  { id: 1, lotNumber: "001", title: "Vintage Rolex Submariner", imageCount: 4 },
  { id: 2, lotNumber: "002", title: "Louis Vuitton Keepall 55", imageCount: 3 },
  { id: 3, lotNumber: "003", title: "Hermes Birkin 30 Togo", imageCount: 6 },
  { id: 4, lotNumber: "004", title: "Cartier Love Bracelet 18K", imageCount: 2 },
  { id: 5, lotNumber: "005", title: "Chanel Classic Flap Medium", imageCount: 0 },
  { id: 6, lotNumber: "006", title: "Patek Philippe Nautilus", imageCount: 5 },
];

export function LotImagesTab() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedLots, setSelectedLots] = useState<number[]>([]);

  const toggleSelect = (id: number) => {
    setSelectedLots(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedLots.length === mockLotImages.length) {
      setSelectedLots([]);
    } else {
      setSelectedLots(mockLotImages.map(l => l.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="premium-card-accent">
        <input
          type="file"
          id="bulk-lot-images-upload"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            const maxSize = 10 * 1024 * 1024; // 10MB
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            
            const validFiles: File[] = [];
            const invalidFiles: string[] = [];
            
            files.forEach(file => {
              if (file.size > maxSize) {
                invalidFiles.push(`${file.name} (exceeds 10MB)`);
              } else if (!allowedTypes.includes(file.type)) {
                invalidFiles.push(`${file.name} (invalid format)`);
              } else {
                validFiles.push(file);
              }
            });
            
            if (invalidFiles.length > 0) {
              toast.error(`${invalidFiles.length} file(s) rejected. Accepted: JPEG, PNG, WebP, JPG (max 10MB each)`);
            }
            
            if (validFiles.length > 0) {
              toast.success(`${validFiles.length} image(s) selected for upload`);
            }
          }}
        />
        <label
          htmlFor="bulk-lot-images-upload"
          className="border-2 border-dashed border-border-subtle rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer group block"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="h-14 w-14 rounded-xl bg-primary-muted flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Upload className="h-7 w-7 text-green-700" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-base font-medium text-foreground">Bulk Upload Lot Images</p>
              <p className="text-sm text-muted-foreground mt-1">
                Drag & drop images here. Name files with lot numbers for auto-matching.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Example: 001_1.jpg, 001_2.jpg, 002_1.jpg
              </p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                Accepted: JPEG, PNG, WebP, JPG (max 10MB each)
              </p>
            </div>
            <PremiumButton 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('bulk-lot-images-upload')?.click();
              }}
            >
              Browse Files
            </PremiumButton>
          </div>
        </label>
      </div>

      {/* Toolbar */}
      <div className="premium-card flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={selectAll}
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-colors",
              selectedLots.length > 0 ? "text-green-700" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className={cn(
              "h-5 w-5 rounded border-2 flex items-center justify-center transition-all",
              selectedLots.length === mockLotImages.length 
                ? "bg-primary border-primary" 
                : selectedLots.length > 0 
                  ? "border-primary bg-primary/20" 
                  : "border-border"
            )}>
              {selectedLots.length === mockLotImages.length && (
                <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />
              )}
            </div>
            {selectedLots.length > 0 
              ? `${selectedLots.length} selected` 
              : "Select all"}
          </button>
          
          {selectedLots.length > 0 && (
            <>
              <span className="text-border">|</span>
              <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Download Selected
              </button>
              <button className="text-sm text-destructive hover:text-destructive/80 transition-colors">
                Delete Selected
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 p-1 bg-secondary rounded-lg">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === "grid" ? "bg-card shadow-sm" : "hover:bg-accent"
            )}
          >
            <Grid3X3 className={cn(
              "h-4 w-4",
              viewMode === "grid" ? "text-green-700" : "text-muted-foreground"
            )} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === "list" ? "bg-card shadow-sm" : "hover:bg-accent"
            )}
          >
            <List className={cn(
              "h-4 w-4",
              viewMode === "list" ? "text-green-700" : "text-muted-foreground"
            )} />
          </button>
        </div>
      </div>

      {/* Lot Images Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mockLotImages.map((lot) => (
            <div 
              key={lot.id}
              onClick={() => toggleSelect(lot.id)}
              className={cn(
                "premium-card cursor-pointer group relative",
                selectedLots.includes(lot.id) && "ring-2 ring-primary bg-primary-muted"
              )}
            >
              {/* Selection indicator */}
              <div className={cn(
                "absolute top-3 left-3 h-5 w-5 rounded border-2 flex items-center justify-center transition-all z-10",
                selectedLots.includes(lot.id) 
                  ? "bg-primary border-primary" 
                  : "border-border bg-card opacity-0 group-hover:opacity-100"
              )}>
                {selectedLots.includes(lot.id) && (
                  <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />
                )}
              </div>

              {/* Image placeholder */}
              <div className="aspect-square rounded-lg bg-secondary flex items-center justify-center mb-3">
                {lot.imageCount > 0 ? (
                  <div className="text-center">
                    <Image className="h-8 w-8 text-muted-foreground mx-auto" strokeWidth={1.5} />
                    <span className="text-xs text-muted-foreground mt-1">{lot.imageCount} images</span>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-muted-foreground/50 mx-auto" strokeWidth={1.5} />
                    <span className="text-xs text-muted-foreground/50 mt-1">No images</span>
                  </div>
                )}
              </div>

              <p className="text-sm font-medium text-green-700">Lot #{lot.lotNumber}</p>
              <p className="text-sm text-foreground truncate">{lot.title}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="premium-card divide-y divide-border">
          {mockLotImages.map((lot) => (
            <div 
              key={lot.id}
              onClick={() => toggleSelect(lot.id)}
              className={cn(
                "flex items-center gap-4 p-4 cursor-pointer transition-colors",
                selectedLots.includes(lot.id) ? "bg-primary-muted" : "hover:bg-accent/50"
              )}
            >
              <div className={cn(
                "h-5 w-5 rounded border-2 flex items-center justify-center shrink-0",
                selectedLots.includes(lot.id) 
                  ? "bg-primary border-primary" 
                  : "border-border"
              )}>
                {selectedLots.includes(lot.id) && (
                  <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />
                )}
              </div>

              <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <Image className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-700">Lot #{lot.lotNumber}</p>
                <p className="text-sm text-foreground truncate">{lot.title}</p>
              </div>

              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{lot.imageCount}</p>
                <p className="text-xs text-muted-foreground">images</p>
              </div>

              <PremiumButton variant="ghost" size="sm">
                <Upload className="h-4 w-4" />
              </PremiumButton>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
