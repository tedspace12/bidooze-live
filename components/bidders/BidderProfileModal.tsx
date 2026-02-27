import { format } from 'date-fns';
import { Calendar, Mail, Phone, MapPin, TrendingUp, Award, Clock, Ban, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { BidderType } from '@/types/bidder';
import { BidderAvatar } from './BidderAvatar';
import { ReputationBadge } from './ReputationBadge';
import { StatusBadge } from './StatusBadge';
import { cn } from '@/lib/utils';

interface BidderProfileModalProps {
  bidder: BidderType | null;
  isOpen: boolean;
  onClose: () => void;
  onBlock: (bidder: BidderType) => void;
  onUnblock: (bidder: BidderType) => void;
}

export function BidderProfileModal({
  bidder,
  isOpen,
  onClose,
  onBlock,
  onUnblock,
}: BidderProfileModalProps) {
  if (!bidder) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-card border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="sr-only">Bidder Profile</DialogTitle>
        </DialogHeader>

        {/* Header */}
        <div className="flex items-start gap-4">
          <BidderAvatar
            firstName={bidder.firstName}
            lastName={bidder.lastName}
            avatar={bidder.avatar}
            size="lg"
          />
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-foreground">
                {bidder.firstName} {bidder.lastName}
              </h2>
              <ReputationBadge reputation={bidder.reputation} />
              <StatusBadge isBlocked={bidder.isBlocked} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Member since {format(new Date(bidder.joinedAt), 'MMMM yyyy')}
            </p>
          </div>
        </div>

        <Separator className="bg-border" />

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-muted/50 p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{bidder.totalBids}</p>
            <p className="text-xs text-muted-foreground">Total Bids</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{bidder.wonAuctions}</p>
            <p className="text-xs text-muted-foreground">Auctions Won</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{bidder.winRate}%</p>
            <p className="text-xs text-muted-foreground">Win Rate</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="mt-2">
          <TabsList className="w-full justify-start bg-muted">
            <TabsTrigger value="profile">Profile Info</TabsTrigger>
            <TabsTrigger value="reputation">Reputation History</TabsTrigger>
            <TabsTrigger value="bidding">Bidding History</TabsTrigger>
            <TabsTrigger value="controls">Block Controls</TabsTrigger>
          </TabsList>

          {/* Profile Info Tab */}
          <TabsContent value="profile" className="mt-4 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{bidder.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{bidder.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{bidder.country}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">Joined {format(new Date(bidder.joinedAt), 'PP')}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">Last active {format(new Date(bidder.lastActive), 'PP')}</span>
              </div>
            </div>
          </TabsContent>

          {/* Reputation History Tab */}
          <TabsContent value="reputation" className="mt-4">
            {bidder.reputationHistory.length === 0 ? (
              <div className="py-8 text-center">
                <Award className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No reputation changes recorded</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bidder.reputationHistory.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-border bg-muted/30 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ReputationBadge reputation={item.previousStatus} size="sm" showTooltip={false} />
                        <span className="text-muted-foreground">→</span>
                        <ReputationBadge reputation={item.newStatus} size="sm" showTooltip={false} />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(item.date), 'PP')}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{item.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Bidding History Tab */}
          <TabsContent value="bidding" className="mt-4">
            {bidder.biddingHistory.length === 0 ? (
              <div className="py-8 text-center">
                <TrendingUp className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No bidding history available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bidder.biddingHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.auctionTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        ${item.bidAmount.toLocaleString()} • {format(new Date(item.date), 'PP')}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn(
                        item.status === 'won' && 'bg-reputation-excellent-bg text-reputation-excellent',
                        item.status === 'lost' && 'bg-muted text-muted-foreground',
                        item.status === 'active' && 'bg-reputation-good-bg text-reputation-good'
                      )}
                    >
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Block Controls Tab */}
          <TabsContent value="controls" className="mt-4">
            <div className="rounded-lg border border-border bg-muted/30 p-6">
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    'rounded-full p-3',
                    bidder.isBlocked ? 'bg-status-blocked-bg' : 'bg-status-active-bg'
                  )}
                >
                  {bidder.isBlocked ? (
                    <Ban className="h-6 w-6 text-status-blocked" />
                  ) : (
                    <CheckCircle className="h-6 w-6 text-status-active" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">
                    {bidder.isBlocked
                      ? 'This bidder is blocked from your auctions'
                      : 'This bidder can participate in your auctions'}
                  </h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {bidder.isBlocked
                      ? 'They will not be able to place bids on any of your listings. This does not affect their platform-wide status.'
                      : 'They can view and bid on all your active auctions. Blocking them will prevent future bids.'}
                  </p>
                  <div className="mt-4">
                    {bidder.isBlocked ? (
                      <Button onClick={() => onUnblock(bidder)} className="gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Unblock Bidder
                      </Button>
                    ) : (
                      <Button
                        variant="destructive"
                        onClick={() => onBlock(bidder)}
                        className="gap-2"
                      >
                        <Ban className="h-4 w-4" />
                        Block Bidder
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-border bg-reputation-warning-bg/30 p-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Note:</strong> Blocking a bidder only affects your auctions. 
                Platform-wide reputation and bans are managed by the system administrators.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
