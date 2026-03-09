import { useState } from "react";
import { AuctionOverviewResponse } from "@/features/auction/types";
import { useAuctionLive } from "@/features/auction/hooks/useAuctionLive";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Radio,
  Pause,
  Play,
  SkipForward,
  Volume2,
  Users,
  Gavel,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface LiveConsoleTabProps {
  auction: AuctionOverviewResponse;
}

type LiveOverview = {
  data?: {
    auction?: {
      id: number;
      status: "draft" | "scheduled" | "live" | "paused" | "closed" | "completed";
      bidding_type: "timed" | "live" | "hybrid";
      start_at: string | null;
      end_at: string | null;
    };
    session?: {
      status: "live" | "paused" | "ended";
      current_lot_id: number | null;
      started_at: string | null;
      last_event_at: string | null;
    };
    current_lot?: {
      id: number;
      lot_number: string;
      sale_order: number;
      title: string;
      status: "pending" | "active" | "sold" | "passed" | "cancelled";
      starts_at: string | null;
      ends_at: string | null;
      current_highest_bid: string | null;
      current_highest_bid_id: number | null;
      current_highest_registration_id: number | null;
    } | null;
    next_lot?: {
      id: number;
      lot_number: string;
      sale_order: number;
      title: string;
      status: "pending" | "active" | "sold" | "passed" | "cancelled";
      starts_at: string | null;
      ends_at: string | null;
      current_highest_bid: string | null;
      current_highest_bid_id: number | null;
      current_highest_registration_id: number | null;
    } | null;
  };
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
};

export default function LiveConsoleTab({ auction }: LiveConsoleTabProps) {
  const { overview, startSession, pauseSession, resumeSession, endSession, startLot, sellLot, passLot, floorBid } =
    useAuctionLive(auction.auction.id);
  const [isFloorBidOpen, setIsFloorBidOpen] = useState(false);
  const [floorBidForm, setFloorBidForm] = useState({
    amount: "",
    auctionRegistrationId: "",
  });

  const liveData = (overview.data || {}) as LiveOverview;
  const liveOverview = liveData.data;
  const currentLot = liveOverview?.current_lot || null;
  const nextLot = liveOverview?.next_lot || null;
  const sessionStatus = liveOverview?.session?.status || "ended";

  const isLive = auction.auction.status === "live" || auction.auction.status === "paused";
  const acceptedBidders = auction.stats.bidders_approved || 0;

  if (!isLive) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <Radio className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-display font-semibold text-foreground mb-2">Auction Not Live</h3>
        <p className="text-muted-foreground font-body text-center max-w-md">
          The live console will be available when the auction is live or paused.
        </p>
      </div>
    );
  }

  const handleFloorBid = async () => {
    const amount = Number(floorBidForm.amount);
    const registrationId = Number(floorBidForm.auctionRegistrationId);

    if (!amount || !registrationId) {
      toast.error("Enter a valid amount and registration ID.");
      return;
    }

    try {
      await floorBid.mutateAsync({ lotId: currentLot?.id || 0, amount, auction_registration_id: registrationId });
      setIsFloorBidOpen(false);
      setFloorBidForm({ amount: "", auctionRegistrationId: "" });
      toast.success("Floor bid placed.");
    } catch (error: unknown) {
      toast.error("Unable to place floor bid", {
        description: getErrorMessage(error, "Please try again."),
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <Badge variant="destructive" className="gap-1.5 font-body animate-pulse">
            <span className="w-2 h-2 rounded-full bg-destructive-foreground" />
            LIVE BROADCAST
          </Badge>
          <span className="text-sm text-muted-foreground font-body">
            Broadcasting to {acceptedBidders} active bidders
          </span>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:justify-end">
          {sessionStatus === "ended" && (
            <Button size="sm" className="w-full gap-2 font-body sm:w-auto" onClick={() => startSession.mutateAsync()}>
              <Play className="w-4 h-4" />
              Start Session
            </Button>
          )}
          {sessionStatus === "live" && (
            <Button variant="outline" size="sm" className="w-full gap-2 font-body sm:w-auto" onClick={() => pauseSession.mutateAsync()}>
              <Pause className="w-4 h-4" />
              Pause Session
            </Button>
          )}
          {sessionStatus === "paused" && (
            <Button variant="outline" size="sm" className="w-full gap-2 font-body sm:w-auto" onClick={() => resumeSession.mutateAsync()}>
              <Play className="w-4 h-4" />
              Resume Session
            </Button>
          )}
          {sessionStatus !== "ended" && (
            <Button variant="outline" size="sm" className="w-full gap-2 font-body sm:w-auto" onClick={() => endSession.mutateAsync()}>
              End Session
            </Button>
          )}
          <Button variant="outline" size="sm" className="w-full gap-2 font-body sm:w-auto">
            <Volume2 className="w-4 h-4" />
            Toggle Audio
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Console: Current Lot and Bidding Controls */}
        <Card className="lg:col-span-2 border border-border shadow-soft">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-lg font-display font-semibold flex items-center gap-2">
              <Gavel className="w-5 h-5 text-accent" />
              Live Bidding Console
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {currentLot ? (
              <div className="space-y-6">
                {/* Current Lot Details */}
                <div>
                  <p className="text-sm text-muted-foreground font-body uppercase tracking-wide">
                    Lot {currentLot.lot_number}
                  </p>
                  <h3 className="text-2xl font-display font-semibold text-foreground mt-1">{currentLot.title}</h3>
                </div>

                {/* Bidding Status and Next Bid */}
                  <div className="p-6 rounded-xl gradient-surface border border-border">
                   <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                     <div>
                       <p className="text-sm text-muted-foreground font-body uppercase tracking-wide">Highest Bid</p>
                       <p className="mt-1 text-3xl font-display font-bold text-accent sm:text-4xl">
                         {currentLot.current_highest_bid
                           ? formatCurrency(Number(currentLot.current_highest_bid), auction.auction.currency)
                           : "No bids"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bidding Controls (Auctioneer Actions) */}
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <Button
                      variant="outline"
                      size="lg"
                      className="gap-2 font-body"
                      onClick={() => pauseSession.mutateAsync()}
                      disabled={sessionStatus !== "live"}
                    >
                      <Pause className="w-5 h-5" />
                      Pause Bidding
                    </Button>
                    <Button
                      className="gap-2 font-body gradient-gold border-0 text-accent-foreground hover:opacity-90"
                      size="lg"
                      onClick={() => sellLot.mutateAsync(currentLot.id)}
                      disabled={sessionStatus !== "live"}
                    >
                      <Gavel className="w-5 h-5" />
                      Sell Lot
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="gap-2 font-body"
                      onClick={() => passLot.mutateAsync(currentLot.id)}
                      disabled={sessionStatus !== "live"}
                    >
                      <SkipForward className="w-5 h-5" />
                      Pass Lot
                    </Button>
                  </div>
                  <div className="flex justify-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="font-body"
                      onClick={() => setIsFloorBidOpen(true)}
                      disabled={sessionStatus !== "live"}
                    >
                      Accept Floor Bid
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground font-body">No active lot. Start the next lot to begin.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Session Stats and Lot Queue */}
        <div className="space-y-6">
          {/* Session Stats */}
          <Card className="border border-border shadow-soft">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-lg font-display font-semibold">Session Stats</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-body text-muted-foreground">Active Bidders</span>
                </div>
                <span className="font-body font-semibold">{acceptedBidders}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gavel className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-body text-muted-foreground">Total Bids</span>
                </div>
                <span className="font-body font-semibold">{auction.stats.total_bids}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-body text-muted-foreground">Accepted Bid Total</span>
                </div>
                <span className="font-body font-semibold text-accent">
                  {formatCurrency(auction.stats.total_bid_amount, auction.auction.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-body text-muted-foreground">Submitted Bid Total</span>
                </div>
                <span className="font-body font-semibold">
                  {formatCurrency(auction.stats.submitted_bid_amount, auction.auction.currency)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Lot Queue */}
          <Card className="border border-border shadow-soft">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-lg font-display font-semibold flex items-center gap-2">
                <SkipForward className="w-5 h-5 text-muted-foreground" />
                Upcoming Lot
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {nextLot ? (
                <div className="divide-y divide-border">
                  <div className="p-4 hover:bg-secondary/50 transition-colors flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground font-body">Lot {nextLot.lot_number}</p>
                      <p className="text-xs text-muted-foreground font-body truncate max-w-48">{nextLot.title}</p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => startLot.mutateAsync(nextLot.id)}>
                      Start
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-muted-foreground">
                  No upcoming lot available.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floor Bid Dialog */}
      <Dialog open={isFloorBidOpen} onOpenChange={setIsFloorBidOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Accept Floor Bid</DialogTitle>
            <DialogDescription>Enter the bidder registration and amount.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="floor-bid-amount">Bid Amount</Label>
              <Input
                id="floor-bid-amount"
                type="number"
                value={floorBidForm.amount}
                onChange={(e) => setFloorBidForm({ ...floorBidForm, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="floor-bid-registration">Registration ID</Label>
              <Input
                id="floor-bid-registration"
                value={floorBidForm.auctionRegistrationId}
                onChange={(e) => setFloorBidForm({ ...floorBidForm, auctionRegistrationId: e.target.value })}
                placeholder="Registration ID"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFloorBidOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleFloorBid}>Place Bid</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
