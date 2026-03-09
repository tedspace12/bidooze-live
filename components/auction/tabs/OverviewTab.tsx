import { AuctionOverviewResponse } from "@/features/auction/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  Gavel,
  Users,
  TrendingUp,
  Package,
  Eye,
  CheckCircle,
  XCircle,
  Settings,
  Image,
  ArrowRight,
  Activity,
  Sparkles,
  Share2,
} from "lucide-react";
import { useAuctionOverview } from "@/features/auction/hooks/useAuctionOverview";
import { AuctionActivity, AuctionRecentBid } from "@/features/auction/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface OverviewTabProps {
  auction: AuctionOverviewResponse;
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

function formatCurrency(amount: number, currency: AuctionOverviewResponse["auction"]["currency"]) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function toText(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value.trim() || fallback;
  if (typeof value === "number") return String(value);
  return fallback;
}

function formatStatusLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getBidStatusVariant(status: string) {
  const value = status.toLowerCase();
  if (["won", "winning", "leading"].includes(value)) return "default" as const;
  if (["pending approval", "pending_approval"].includes(value)) return "secondary" as const;
  if (["rejected", "outbid"].includes(value)) return "outline" as const;
  return "secondary" as const;
}

function formatTimestamp(value?: string) {
  if (!value) return "Not available";
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return formatTime(parsed);
  }
  return value;
}

function ActivityFeedEmpty({ auctionStatus }: { auctionStatus: 'draft' | 'scheduled' | 'live' | 'paused' | 'closed' | 'completed' }) {
  const getMessage = () => {
    switch (auctionStatus) {
      case 'draft':
        return {
          title: "No activity yet",
          description: "Activity will appear here once you publish your auction and bidders start engaging.",
          action: "Publish Auction",
          icon: Sparkles
        };
      case 'scheduled':
        return {
          title: "Waiting for auction to start",
          description: "Activity will begin flowing once your auction goes live and bidders start participating.",
          action: null,
          icon: Share2
        };
      case 'live':
        return {
          title: "No activity yet",
          description: "Bids, registrations, and sales will appear here in real-time as they happen.",
          action: null,
          icon: Activity
        };
      default:
        return {
          title: "No activity recorded",
          description: "This auction had no bidder activity or bids during its run.",
          action: null,
          icon: Activity
        };
    }
  };

  const message = getMessage();
  const Icon = message.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4 border-2 border-dashed border-border">
        <Icon className="w-8 h-8 text-muted-foreground/50" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {message.title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {message.description}
      </p>
      {message.action && (
        <Button size="sm" className="gap-2">
          {message.action}
          <ArrowRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

function RecentBidsEmpty({ auctionStatus }: { auctionStatus: 'draft' | 'scheduled' | 'live' | 'paused' | 'closed' | 'completed' }) {
  const getMessage = () => {
    switch (auctionStatus) {
      case 'draft':
        return {
          title: "No bids yet",
          description: "Bids will start appearing once your auction is live and bidders begin placing offers.",
          action: "Publish Auction",
          icon: Gavel
        };
      case 'scheduled':
        return {
          title: "Auction not started",
          description: "Bidders can place bids once your auction goes live. Invite bidders to register now.",
          action: null,
          icon: Users
        };
      case 'live':
        return {
          title: "No bids placed yet",
          description: "Recent bids will appear here as bidders start competing on lots. Be patient!",
          action: null,
          icon: Gavel
        };
      default:
        return {
          title: "No bids received",
          description: "This auction concluded without receiving any bids on the lots.",
          action: null,
          icon: Gavel
        };
    }
  };

  const message = getMessage();
  const Icon = message.icon;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mb-3 border-2 border-dashed border-border">
        <Icon className="w-7 h-7 text-muted-foreground/50" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1.5">
        {message.title}
      </h3>
      <p className="text-xs text-muted-foreground max-w-xs mb-4">
        {message.description}
      </p>
      {message.action && (
        <Button size="sm" variant="outline" className="gap-2 h-8 text-xs">
          {message.action}
          <ArrowRight className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
}


export default function OverviewTab({ auction }: OverviewTabProps) {
  const isDraft = auction.auction.status === "draft";
  const { activity, recentBids } = useAuctionOverview(auction.auction.id);

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
      isComplete: auction.stats.lots_total > 0,
      icon: Package,
      link: "#lots"
    },
    {
      id: 3,
      title: "Upload Lot Images",
      description: "Ensure all lots have high-quality images for the catalog.",
      isComplete: auction.stats.all_lots_have_images,
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
  const totalLots = auction.stats.lots_total;
  const lotsWithBids = auction.stats.lots_with_bids;
  const soldLots = auction.stats.lots_sold;
  const totalBids = auction.stats.total_bids;
  const revenue = auction.stats.total_revenue;
  const acceptedBidTotal = auction.stats.total_bid_amount;
  const submittedBidTotal = auction.stats.submitted_bid_amount;
  const acceptedBids = auction.stats.accepted_bids;
  const pendingApprovalBids = auction.stats.pending_approval_bids;
  const rejectedBids = auction.stats.rejected_bids;
  const registeredBidders = auction.stats.bidders_total;
  const acceptedBidders = auction.stats.bidders_approved;
  const totalWatchers = auction.stats.total_watchers;
  const sessionStatus = formatStatusLabel(
    auction.timeline.session_status || (auction.timeline.is_paused ? "paused" : auction.auction.status)
  );
  const runtimeLabel = auction.timeline.is_paused
    ? "Paused"
    : auction.timeline.is_live
      ? "Running"
      : auction.timeline.has_ended
        ? "Ended"
        : "Idle";

  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(revenue, auction.auction.currency),
      icon: DollarSign,
      accent: true,
      description: "Sold lot final prices"
    },
    {
      title: "Accepted Bid Total",
      value: formatCurrency(acceptedBidTotal, auction.auction.currency),
      icon: Gavel,
      accent: false,
      description: "Accepted bid value only"
    },
    {
      title: "Submitted Bid Total",
      value: formatCurrency(submittedBidTotal, auction.auction.currency),
      icon: TrendingUp,
      accent: false,
      description: "All submitted bids before approval"
    },
    {
      title: "Accepted Bids",
      value: acceptedBids,
      icon: CheckCircle,
      accent: false,
      description: `Pending ${pendingApprovalBids} | Rejected ${rejectedBids}`
    },
    {
      title: "Total Bids",
      value: totalBids,
      icon: Gavel,
      accent: false,
      description: "Count of bid records"
    },
    {
      title: "Active Bidders",
      value: `${acceptedBidders}/${registeredBidders}`,
      icon: Users,
      accent: false,
      description: "Approved vs registered"
    },
    {
      title: "Lots Sold",
      value: `${soldLots}/${totalLots}`,
      icon: Package,
      accent: false,
      description: `${lotsWithBids} lots have bids`
    },
    {
      title: "Total Watchers",
      value: totalWatchers,
      icon: Eye,
      accent: false,
      description: "Watchlist interest"
    },
  ];

  const activityFeed = (activity.data ?? []).map((item: AuctionActivity) => ({
    id: item.id,
    type: item.type,
    lot: item.lot_title,
    bidder: item.bidder_name,
    amount: item.amount
      ? formatCurrency(item.amount, auction.auction.currency)
      : null,
    timestamp: new Date(item.created_at),
  }));

  const recentBidsList = (recentBids.data ?? []).map((bid: AuctionRecentBid) => {
    const rawStatus = toText(bid.status ?? bid.bid_status, "Pending Approval");
    const amount = toNumber(bid.amount ?? bid.currentBid, 0);
    return {
      id: bid.id,
      bidder: toText(bid.bidder ?? bid.bidder_name, "Unknown bidder"),
      title: toText(bid.title ?? bid.lot_title, "Untitled lot"),
      lotNumber: toText(bid.lot_number, ""),
      currentBid: formatCurrency(amount, auction.auction.currency),
      timestamp: formatTimestamp(toText(bid.placed_at ?? bid.timestamp ?? bid.created_at, "")),
      status: formatStatusLabel(rawStatus),
      statusVariant: getBidStatusVariant(rawStatus),
      lotStatus: toText(bid.lot_status, ""),
      isWinning: !!bid.is_winning,
    };
  });



  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="text-xs">
          Session {sessionStatus}
        </Badge>
        <Badge variant={auction.timeline.is_paused ? "secondary" : auction.timeline.is_live ? "default" : "outline"} className="text-xs">
          Runtime {runtimeLabel}
        </Badge>
        {auction.auction.actual_start_at ? (
          <Badge variant="outline" className="text-xs">
            Started {new Date(auction.auction.actual_start_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
          </Badge>
        ) : null}
        {auction.auction.actual_end_at ? (
          <Badge variant="outline" className="text-xs">
            Ended {new Date(auction.auction.actual_end_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
          </Badge>
        ) : null}
      </div>

      {/* Onboarding Checklist (Visible in Draft/Scheduled) */}
        {(isDraft || auction.auction.status === "scheduled") && (
          <Card className="border border-border shadow-soft">
          <CardHeader className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
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
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {stats.map(({ title, value, icon: Icon, accent, description }, index) => (
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
              <p className={`mt-1 text-xs font-body ${accent ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                {description}
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
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {activityFeed.length === 0 ? (
              <ActivityFeedEmpty auctionStatus={auction.auction.status} />
            ) : (
              <div className="divide-y divide-border/50">
                {activityFeed.map((activity, index: number) => {
                  let statusLabel = "Bid placed";

                  if (activity.type === "bid") {
                    statusLabel = "Bid placed";
                  } else if (activity.type === "registration") {
                    statusLabel = "Registration";
                  } else if (activity.type === "lot_sold") {
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
                          {index < activityFeed.length - 1 && (
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
            )}
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
            {recentBidsList.length === 0 ? (
              <RecentBidsEmpty auctionStatus={auction.auction.status} />
            ) : (
              <>
                <div className="divide-y divide-border/50">
                  {recentBidsList.map((bid) => {
                    // Get bidder initials
                    const initials = bid.bidder
                      .split(' ')
                      .map((namePart: string) => namePart[0] || "")
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
                                  {bid.lotNumber ? `Lot ${bid.lotNumber} · ` : ""}{bid.title}
                                </p>
                              </div>
                              <p className="text-sm font-semibold text-green-700 shrink-0 whitespace-nowrap">
                                {bid.currentBid}
                              </p>
                            </div>

                            <div className="flex items-center justify-between gap-2 mt-2">
                              <Badge
                                variant={bid.statusVariant}
                                className="text-xs h-5"
                              >
                                {bid.status}
                              </Badge>
                              <p className="text-xs text-muted-foreground shrink-0">
                                {bid.timestamp}
                              </p>
                            </div>
                            {bid.lotStatus || bid.isWinning ? (
                              <p className="mt-1 text-[11px] text-muted-foreground">
                                {bid.lotStatus ? `Lot ${formatStatusLabel(bid.lotStatus)}` : "Winning bid"}
                              </p>
                            ) : null}
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
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

