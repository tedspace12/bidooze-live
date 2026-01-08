import { Auction, mockActivityFeed, mockRecentBids } from "@/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  Gavel, 
  Users, 
  TrendingUp, 
  Package,
  Activity,
  Eye,
  CheckCircle,
  XCircle,
  Settings,
  Image,
  Circle,
  ArrowRight,
  Clock,
  X
} from "lucide-react";

interface OverviewTabProps {
  auction: Auction;
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

function formatCurrency(amount: number, currency: Auction["currency"]) {
  const symbol = currency === "NGN" ? "₦" : "$";
  return `${symbol}${amount.toLocaleString()}`;
}

export default function OverviewTab({ auction }: OverviewTabProps) {
  const isDraft = auction.status === "Draft";

  // Checklist Logic
  const checklist = [
    { 
      id: 1, 
      title: "Define Auction Settings", 
      description: "Set commission, buyer premium, and terms in the Settings tab.",
      isComplete: true, // Assuming default settings are applied on creation
      icon: Settings,
      link: "#settings"
    },
    { 
      id: 2, 
      title: "Add Lots to Auction", 
      description: "An auction needs at least one lot to go live.",
      isComplete: auction.lots.length > 0,
      icon: Package,
      link: "#lots"
    },
    { 
      id: 3, 
      title: "Upload Lot Images", 
      description: "Ensure all lots have high-quality images for the catalog.",
      isComplete: auction.lots.every(lot => lot.image), // Check if all lots have an image path
      icon: Image,
      link: "#lots"
    },
    { 
      id: 4, 
      title: "Review Auction Preview", 
      description: "Check the public-facing page before scheduling or going live.",
      isComplete: false, // Cannot check if user has reviewed, so keep as manual step
      icon: Eye,
      link: "#settings" // Link to a preview button in settings or overview
    },
  ];

  const completedSteps = checklist.filter(item => item.isComplete).length;
  const totalSteps = checklist.length;
  const progress = Math.round((completedSteps / totalSteps) * 100);
  const totalLots = auction.lots.length;
  const lotsWithBids = auction.lots.filter((lot) => lot.highestBid > 0).length;
  const soldLots = auction.lots.filter((lot) => lot.status === "Sold").length;
  const totalBids = auction.bidCount;
  const revenue = auction.totalBid;
  const registeredBidders = auction.bidders.length;
  const acceptedBidders = auction.bidders.filter(b => b.status === "Accepted").length;
  const totalWatchers = auction.lots.reduce((acc, lot) => acc + lot.watchers, 0);

  const stats = [
    { 
      title: "Total Revenue", 
      value: formatCurrency(revenue, auction.currency),
      icon: DollarSign,
      accent: true
    },
    { 
      title: "Total Bids", 
      value: totalBids,
      icon: Gavel,
      accent: false
    },
    { 
      title: "Active Bidders", 
      value: `${acceptedBidders}/${registeredBidders}`,
      icon: Users,
      accent: false
    },
    { 
      title: "Lots Sold", 
      value: `${soldLots}/${totalLots}`,
      icon: Package,
      accent: false
    },
    { 
      title: "Lots with Bids", 
      value: lotsWithBids,
      icon: TrendingUp,
      accent: false
    },
    { 
      title: "Total Watchers", 
      value: totalWatchers,
      icon: Eye,
      accent: false
    },
  ];

  return (
    <div className="space-y-6">
      {/* Onboarding Checklist (Visible in Draft/Scheduled) */}
      {(isDraft || auction.status === "Scheduled") && (
        <Card className="border border-border shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-display font-semibold">Pre-Launch Checklist</CardTitle>
            <div className="text-sm font-body text-muted-foreground">{completedSteps}/{totalSteps} Completed ({progress}%)</div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {checklist.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${item.isComplete ? 'bg-success/10' : 'bg-warning/10'}`}>
                    {item.isComplete ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <XCircle className="w-4 h-4 text-warning" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium font-body ${item.isComplete ? 'text-foreground' : 'text-warning'}`}>{item.title}</p>
                    <p className="text-sm text-muted-foreground font-body">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map(({ title, value, icon: Icon, accent }, index) => (
          <Card 
            key={title} 
            className={`border border-border shadow-soft transition-all hover:shadow-medium ${accent ? 'gradient-surface' : ''}`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent ? 'gradient-gold' : 'bg-secondary'}`}>
                  <Icon className={`w-4 h-4 ${accent ? 'text-accent-foreground' : 'text-muted-foreground'}`} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground font-body uppercase tracking-wide mb-1">{title}</p>
              <p className={`text-xl font-semibold font-body tabular-nums ${accent ? 'text-primary-foreground' : 'text-foreground'}`}>
                {value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity and Recent Bids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <Card className="lg:col-span-2 border border-border shadow-sm rounded-2xl">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-muted-foreground" />
                Activity Feed
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7"
              >
                View more
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {mockActivityFeed.map((activity, index) => {
                // Determine status indicator color and icon
                let statusColor = "bg-emerald-500";
                let statusIcon = Gavel;
                let statusLabel = "Bid placed";
                
                if (activity.type === "bid") {
                  statusColor = "bg-emerald-500";
                  statusIcon = Gavel;
                  statusLabel = "Bid placed";
                } else if (activity.type === "registration") {
                  statusColor = "bg-blue-500";
                  statusIcon = Users;
                  statusLabel = "Registration";
                } else if (activity.type === "lot_sold") {
                  statusColor = "bg-red-500";
                  statusIcon = DollarSign;
                  statusLabel = "Lot Sold";
                }

                return (
                  <div
                    key={activity.id}
                    className="p-4 hover:bg-muted/30 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      {/* Status Indicator */}
                      <div className="relative shrink-0 mt-0.5 flex flex-col items-center">
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-background shadow-sm flex items-center justify-center"
                          style={{ 
                            backgroundColor: activity.type === "bid" ? "#10b981" : activity.type === "registration" ? "#3b82f6" : "#ef4444"
                          }}
                        >
                          {activity.type === "bid" && (
                            <Gavel className="w-3 h-3 text-white" />
                          )}
                          {activity.type === "registration" && (
                            <Users className="w-3 h-3 text-white" />
                          )}
                          {activity.type === "lot_sold" && (
                            <DollarSign className="w-3 h-3 text-white" />
                          )}
                        </div>
                        {index < mockActivityFeed.length - 1 && (
                          <div className="w-px h-full min-h-12 bg-border/40 mt-1.5" />
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground">
                              {statusLabel}
                            </p>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {activity.type === "bid" && (
                                <>on <span className="font-medium text-foreground">{activity.lot}</span> by <span className="font-medium text-foreground">{activity.bidder}</span></>
                              )}
                              {activity.type === "registration" && (
                                <><span className="font-medium text-foreground">{activity.bidder}</span> registered for the auction</>
                              )}
                              {activity.type === "lot_sold" && (
                                <><span className="font-medium text-foreground">{activity.lot}</span> was sold</>
                              )}
                            </p>
                            {(activity.type === "bid" || activity.type === "lot_sold") && activity.amount && (
                              <p className="text-sm font-semibold text-green-800 mt-1">
                                {activity.amount}
                              </p>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                            {formatTime(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Bids */}
        <Card className="border border-border shadow-sm rounded-2xl">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Gavel className="w-5 h-5 text-muted-foreground" />
              Recent Bids
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {mockRecentBids.map((bid, index) => {
                // Determine bid status (mock logic - in real app this would come from data)
                const bidStatus = index === 0 ? "Leading" : index === 1 ? "Accepted" : "Outbid";
                const statusVariant = bidStatus === "Leading" ? "default" : bidStatus === "Accepted" ? "secondary" : "outline";
                
                // Get bidder initials
                const initials = bid.bidder
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <div
                    key={bid.id}
                    className="p-4 hover:bg-muted/30 transition-colors cursor-pointer group relative"
                  >
                    <div className="flex items-start gap-3">
                      {/* Bidder Avatar */}
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-border">
                        <span className="text-xs font-semibold text-green-700">
                          {initials}
                        </span>
                      </div>
                      
                      {/* Bid Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate">
                              {bid.bidder}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {bid.title}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-green-700 shrink-0 whitespace-nowrap">
                            {bid.currentBid}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between gap-2 mt-2">
                          <Badge 
                            variant={statusVariant}
                            className="text-xs h-5"
                          >
                            {bidStatus}
                          </Badge>
                          <p className="text-xs text-muted-foreground shrink-0">
                            {bid.timestamp}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Hover Action */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* View All Button */}
            <div className="p-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  // Dispatch custom event to switch to bidders tab
                  window.dispatchEvent(new CustomEvent('switchAuctionTab', { detail: { tab: 'bidders' } }));
                }}
              >
                View all bids
                <ArrowRight className="w-3 h-3 ml-1.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
