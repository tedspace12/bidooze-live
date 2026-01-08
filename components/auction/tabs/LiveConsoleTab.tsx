	import { Auction, mockActivityFeed, Lot } from "@/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Radio, Pause, SkipForward, Volume2, Users, Gavel, DollarSign, AlertCircle } from "lucide-react";

interface LiveConsoleTabProps {
  auction: Auction;
}

import { formatCurrency } from "@/lib/utils";

export default function LiveConsoleTab({ auction }: LiveConsoleTabProps) {
  const isLive = auction.status === "Live";
  const currentLot = auction.lots.find(l => l.status === "Active");

  if (!isLive) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <Radio className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-display font-semibold text-foreground mb-2">Auction Not Live</h3>
        <p className="text-muted-foreground font-body text-center max-w-md">
          The live console will be available when the auction is live.
        </p>
      </div>
    );
  }

	  const acceptedBidders = auction.bidders.filter(b => b.status === "Accepted").length;
	  const lotQueue: Lot[] = auction.lots.filter(l => l.status === "Pending");
	
	  return (
	    <div className="space-y-6">
	      <div className="flex items-center justify-between">
	        <div className="flex items-center gap-3">
	          <Badge variant="destructive" className="gap-1.5 font-body animate-pulse">
	            <span className="w-2 h-2 rounded-full bg-destructive-foreground" />
	            LIVE BROADCAST
	          </Badge>
	          <span className="text-sm text-muted-foreground font-body">
	            Broadcasting to {acceptedBidders} active bidders
	          </span>
	        </div>
	        <Button variant="outline" size="sm" className="gap-2 font-body">
	          <Volume2 className="w-4 h-4" />
	          Toggle Audio
	        </Button>
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
	                  <p className="text-sm text-muted-foreground font-body uppercase tracking-wide">Lot {currentLot.lotNumber}</p>
	                  <h3 className="text-2xl font-display font-semibold text-foreground mt-1">{currentLot.title}</h3>
	                  <p className="text-muted-foreground font-body mt-2">{currentLot.description}</p>
	                </div>
	                
	                {/* Bidding Status and Next Bid */}
	                <div className="p-6 rounded-xl gradient-surface border border-border">
	                  <div className="flex items-center justify-between">
	                    <div>
	                      <p className="text-sm text-muted-foreground font-body uppercase tracking-wide">Highest Bid</p>
	                      <p className="text-4xl font-display font-bold text-accent mt-1">
	                        {currentLot.highestBid > 0 ? formatCurrency(currentLot.highestBid, auction.currency) : "No bids"}
	                      </p>
	                    </div>
	                    <div className="text-right">
	                      <p className="text-sm text-muted-foreground font-body">Starting: {formatCurrency(currentLot.startingBid, auction.currency)}</p>
	                      <p className="text-lg font-semibold text-foreground font-body mt-1">Next Bid: {formatCurrency(currentLot.highestBid + 50000, auction.currency)}</p>
	                    </div>
	                  </div>
	                </div>
	                
	                {/* Bidding Controls (Auctioneer Actions) */}
	                <div className="flex flex-col gap-3">
	                  <div className="flex items-center justify-center gap-3">
	                    <Button variant="outline" size="lg" className="gap-2 font-body"><Pause className="w-5 h-5" />Pause Bidding</Button>
	                    <Button className="gap-2 font-body gradient-gold border-0 text-accent-foreground hover:opacity-90" size="lg"><Gavel className="w-5 h-5" />Sell Lot</Button>
	                    <Button variant="outline" size="lg" className="gap-2 font-body"><SkipForward className="w-5 h-5" />Pass Lot</Button>
	                  </div>
	                  <div className="flex items-center justify-center gap-3">
	                    <Button variant="secondary" size="sm" className="font-body">Accept Floor Bid</Button>
	                    <Button variant="secondary" size="sm" className="font-body">Adjust Bid Increment</Button>
	                  </div>
	                </div>
	              </div>
	            ) : (
	              <div className="text-center py-12">
	                <AlertCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
	                <p className="text-muted-foreground font-body">No active lot. Start the first lot from the queue.</p>
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
	                <div className="flex items-center gap-2"><Users className="w-4 h-4 text-muted-foreground" /><span className="text-sm font-body text-muted-foreground">Active Bidders</span></div>
	                <span className="font-body font-semibold">{acceptedBidders}</span>
	              </div>
	              <div className="flex items-center justify-between">
	                <div className="flex items-center gap-2"><Gavel className="w-4 h-4 text-muted-foreground" /><span className="text-sm font-body text-muted-foreground">Total Bids</span></div>
	                <span className="font-body font-semibold">{auction.bidCount}</span>
	              </div>
	              <div className="flex items-center justify-between">
	                <div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-muted-foreground" /><span className="text-sm font-body text-muted-foreground">Total Sales</span></div>
	                <span className="font-body font-semibold text-accent">{formatCurrency(auction.totalBid, auction.currency)}</span>
	              </div>
	            </CardContent>
	          </Card>
	
	          {/* Lot Queue */}
	          <Card className="border border-border shadow-soft">
	            <CardHeader className="border-b border-border">
	              <CardTitle className="text-lg font-display font-semibold flex items-center gap-2">
	                <SkipForward className="w-5 h-5 text-muted-foreground" />
	                Upcoming Lots ({lotQueue.length})
	              </CardTitle>
	            </CardHeader>
	            <CardContent className="p-0">
	              {lotQueue.length > 0 ? (
	                <div className="divide-y divide-border max-h-96 overflow-y-auto">
	                  {lotQueue.slice(0, 5).map((lot) => (
	                    <div key={lot.id} className="p-4 hover:bg-secondary/50 transition-colors flex items-center justify-between">
	                      <div>
	                        <p className="text-sm font-medium text-foreground font-body">Lot {lot.lotNumber}</p>
	                        <p className="text-xs text-muted-foreground font-body truncate max-w-48">{lot.title}</p>
	                      </div>
	                      <Button variant="secondary" size="sm">Start</Button>
	                    </div>
	                  ))}
	                  {lotQueue.length > 5 && (
	                    <div className="p-4 text-center text-sm text-muted-foreground">
	                      + {lotQueue.length - 5} more lots in queue
	                    </div>
	                  )}
	                </div>
	              ) : (
	                <div className="p-6 text-center text-muted-foreground">
	                  All lots have been processed.
	                </div>
	              )}
	            </CardContent>
	          </Card>
	        </div>
	      </div>
	    </div>
	  );
	}
