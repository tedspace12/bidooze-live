import React, { useEffect, useState, useMemo } from "react";
import { Auction } from "@/data";
import { getAuctionStatus, formatCurrency } from "@/lib/utils";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Calendar, 
  MapPin, 
  Edit3, 
  Play, 
  Square, 
  Trash2,
  Clock,
  Users,
  Gavel,
  Radio
} from "lucide-react";

interface AuctionHeaderProps {
  auction: Auction;
}

function getStatusConfig(status: Auction["status"]) {
  switch (status) {
    case "Draft":
      return { label: "Draft", variant: "secondary" as const, dot: "bg-muted-foreground" };
    case "Scheduled":
      return { label: "Scheduled", variant: "outline" as const, dot: "bg-warning" };
    case "Live":
      return { label: "Live Now", variant: "default" as const, dot: "bg-success" };
    case "Closed":
      return { label: "Closed", variant: "destructive" as const, dot: "bg-destructive" };
    case "Completed":
      return { label: "Completed", variant: "secondary" as const, dot: "bg-muted-foreground" };
    default:
      return { label: status, variant: "default" as const, dot: "bg-muted-foreground" };
  }
}



export default function AuctionHeader({ auction }: AuctionHeaderProps) {
  const [countdown, setCountdown] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isGoLiveOpen, setIsGoLiveOpen] = useState(false);
  const [isEndAuctionOpen, setIsEndAuctionOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    title: auction.title,
    description: auction.description,
    location: auction.location,
  });
  
  // Calculate real-time status
  const currentStatus = useMemo(() => getAuctionStatus(auction), [auction]);
  
  const isLive = currentStatus === "Live";
  const isScheduled = currentStatus === "Scheduled";
  const isDraft = currentStatus === "Draft";
  const isClosed = currentStatus === "Closed";
  
  const statusConfig = getStatusConfig(currentStatus);

  const handleEditAuction = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setIsEditOpen(false);
    toast.success("Auction updated successfully", {
      description: "Your changes have been saved.",
    });
  };

  const handleGoLive = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsGoLiveOpen(false);
    toast.success("Auction is now live!", {
      description: "Bidders can now place bids on your auction.",
    });
  };

  const handleEndAuction = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsEndAuctionOpen(false);
    toast.success("Auction ended", {
      description: "The auction has been closed. No new bids will be accepted.",
    });
  };

  const handleDeleteAuction = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setIsDeleteOpen(false);
    toast.success("Auction deleted", {
      description: "The auction has been permanently deleted.",
    });
  };

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const targetDate = isLive ? new Date(auction.endDate) : new Date(auction.startDate);
      const diff = Math.max(0, targetDate.getTime() - now);
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setCountdown(`${days}d ${hours}h ${minutes}m`);
      } else {
        setCountdown(`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [auction.endDate, auction.startDate, isLive]);

  return (
    <header className="animate-in fade-in duration-300">
      <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
        {/* Top accent bar for live auctions */}
        {isLive && (
          <div className="h-1 gradient-gold" />
        )}
        
        <div className="p-6 lg:p-8">
          {/* Top row: Status, type and category */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge variant={statusConfig.variant} className="gap-1.5 font-body text-xs font-medium uppercase tracking-wide">
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} ${isLive ? 'animate-pulse' : ''}`} />
              {statusConfig.label}
            </Badge>
            <Badge variant="outline" className="font-body text-xs gap-1.5">
              <Radio className="w-3 h-3" />
              {auction.type}
            </Badge>
            <span className="text-sm text-muted-foreground font-body">{auction.category}</span>
          </div>

          {/* Title and description */}
          <div className="mb-6">
            <h1 className="text-3xl lg:text-4xl font-display font-semibold text-foreground tracking-tight mb-2">
              {auction.title}
            </h1>
            <p className="text-muted-foreground font-body text-base max-w-2xl">
              {auction.description}
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <MapPin className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-body uppercase tracking-wide">Location</p>
                <p className="text-sm font-medium text-foreground font-body">{auction.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Calendar className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-body uppercase tracking-wide">
                  {isLive ? "Ends" : "Starts"}
                </p>
                <p className="text-sm font-medium text-foreground font-body">
                  {new Date(isLive ? auction.endDate : auction.startDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Gavel className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-body uppercase tracking-wide">Total Lots</p>
                <p className="text-sm font-medium text-foreground font-body">{auction.lots.length}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Users className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-body uppercase tracking-wide">Bidders</p>
                <p className="text-sm font-medium text-foreground font-body">{auction.bidders.length}</p>
              </div>
            </div>
          </div>

          {/* Bottom row: Countdown and actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-6 border-t border-border">
            {/* Countdown */}
            {(isLive || isScheduled) && (
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isLive ? 'gradient-gold' : 'bg-secondary'}`}>
                  <Clock className={`w-4 h-4 ${isLive ? 'text-accent-foreground' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-body uppercase tracking-wide">
                    {isLive ? "Time Remaining" : "Starts In"}
                  </p>
                  <p className={`text-lg font-semibold font-body tabular-nums ${isLive ? 'text-primary-foreground' : 'text-foreground'}`}>
                    {countdown}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 font-body"
                onClick={() => setIsEditOpen(true)}
                disabled={isLoading}
              >
                <Edit3 className="w-4 h-4" />
                Edit Auction
              </Button>
              
              {(isScheduled || isDraft) && !isLive && !isClosed && (
                <Button 
                  size="sm" 
                  className="gap-2 font-body gradient-gold border-0 text-accent-foreground hover:opacity-90"
                  onClick={() => setIsGoLiveOpen(true)}
                  disabled={isLoading}
                >
                  <Play className="w-4 h-4" />
                  Go Live
                </Button>
              )}
              
              {isLive && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="gap-2 font-body"
                  onClick={() => setIsEndAuctionOpen(true)}
                  disabled={isLoading}
                >
                  <Square className="w-4 h-4" />
                  End Auction
                </Button>
              )}
              
              {auction.bidCount === 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2 font-body text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setIsDeleteOpen(true)}
                  disabled={isLoading}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Auction Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Auction</DialogTitle>
            <DialogDescription>
              Update auction details. Changes will be saved immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Auction Title</Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Enter auction title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Enter auction description"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                placeholder="Enter location"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleEditAuction} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Go Live Confirmation */}
      <AlertDialog open={isGoLiveOpen} onOpenChange={setIsGoLiveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Go Live with Auction?</AlertDialogTitle>
            <AlertDialogDescription>
              Once you go live, bidders will be able to place bids. Make sure all lots and settings are configured correctly.
              This action cannot be undone easily.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleGoLive} disabled={isLoading}>
              {isLoading ? "Going Live..." : "Go Live"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* End Auction Confirmation */}
      <AlertDialog open={isEndAuctionOpen} onOpenChange={setIsEndAuctionOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Auction?</AlertDialogTitle>
            <AlertDialogDescription>
              Ending the auction will close bidding immediately. All pending bids will be finalized. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEndAuction} disabled={isLoading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isLoading ? "Ending..." : "End Auction"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Auction Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Auction?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the auction and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAuction} disabled={isLoading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
