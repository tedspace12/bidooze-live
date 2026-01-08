import { Eye, ExternalLink, Smartphone, Monitor, Tablet, MapPin, Calendar, Package, Info, CheckCircle2 } from "lucide-react";
import { PremiumButton } from "../PremiumButton";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

type DeviceType = "desktop" | "tablet" | "mobile";

export function PreviewTab() {
  const [device, setDevice] = useState<DeviceType>("desktop");

  const deviceWidths = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  };

  // Mock auction data - in real app, this would come from the form state
  const mockAuction = {
    title: "Fine Art & Collectibles Auction",
    description: "Rare paintings, sculptures, and exclusive contemporary art pieces from renowned artists.",
    startDate: "15th December 2025",
    endDate: "18th December 2025",
    location: "New York, NY",
    lotsCount: 3,
    buyerPremium: "15%",
    shipping: "Shipping Available",
    banner: "/images/auctions/fine-art.jpg",
    isRegistered: true,
    lots: [
      { id: 1, lotNumber: 1, title: "Vintage Abstract Painting", startingBid: 5000, image: "/images/lots/placeholder.jpg" },
      { id: 2, lotNumber: 2, title: "Modern Sculpture", startingBid: 3500, image: "/images/lots/placeholder.jpg" },
      { id: 3, lotNumber: 3, title: "Contemporary Art Piece", startingBid: 2800, image: "/images/lots/placeholder.jpg" },
    ],
  };

  const hasLots = mockAuction.lots && mockAuction.lots.length > 0;

  return (
    <div className="space-y-6">
      {/* Preview Controls */}
      <div className="premium-card flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-green-700" />
          <span className="font-medium text-foreground">Auction Preview</span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Device Toggle */}
          <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg">
            <button
              onClick={() => setDevice("desktop")}
              className={cn(
                "p-2 rounded-md transition-colors",
                device === "desktop" ? "bg-card shadow-sm" : "hover:bg-accent"
              )}
            >
              <Monitor className={cn(
                "h-4 w-4",
                device === "desktop" ? "text-green-700" : "text-muted-foreground"
              )} />
            </button>
            <button
              onClick={() => setDevice("tablet")}
              className={cn(
                "p-2 rounded-md transition-colors",
                device === "tablet" ? "bg-card shadow-sm" : "hover:bg-accent"
              )}
            >
              <Tablet className={cn(
                "h-4 w-4",
                device === "tablet" ? "text-green-700" : "text-muted-foreground"
              )} />
            </button>
            <button
              onClick={() => setDevice("mobile")}
              className={cn(
                "p-2 rounded-md transition-colors",
                device === "mobile" ? "bg-card shadow-sm" : "hover:bg-accent"
              )}
            >
              <Smartphone className={cn(
                "h-4 w-4",
                device === "mobile" ? "text-green-700" : "text-muted-foreground"
              )} />
            </button>
          </div>
          
        </div>
      </div>

      {/* Preview Frame */}
      <div className="premium-card-accent p-0 overflow-hidden">
        <div 
          className="mx-auto transition-all duration-300 bg-gray-50 p-6"
          style={{ maxWidth: deviceWidths[device] }}
        >
          {/* Auction Listing Card Only */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden max-w-4xl mx-auto">
            {/* Auction Banner Image */}
            <div className="relative w-full h-64 bg-gray-200">
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <Package className="h-16 w-16" />
              </div>
            </div>

            {/* Auction Details */}
            <div className="p-6">
              {/* Dates and Location */}
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 flex-wrap">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{mockAuction.startDate} - {mockAuction.endDate}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  <span>{mockAuction.lotsCount} Lots</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{mockAuction.location}</span>
                </div>
                <span>•</span>
                <span>{mockAuction.shipping}</span>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {mockAuction.title}
              </h2>
              <p className="text-gray-600 mb-4">{mockAuction.description}</p>

              {/* Buyer's Premium */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                <Info className="h-4 w-4" />
                <span>{mockAuction.buyerPremium} Buyer's Premium</span>
              </div>

              {/* Lots Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Lots</h3>
                
                {hasLots ? (
                  <div className="space-y-4">
                    {mockAuction.lots.map((lot) => (
                      <div key={lot.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                        <div className="w-20 h-20 rounded-lg bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-500 mb-1">Lot #{lot.lotNumber}</p>
                          <p className="font-medium text-gray-900 mb-1 truncate">{lot.title}</p>
                          <p className="text-sm text-gray-600">Starting Bid: ${lot.startingBid.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium mb-1">No lots available yet</p>
                    <p className="text-sm text-gray-500">Lots will appear here once they are added to the auction.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
