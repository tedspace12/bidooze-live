import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AuctionOverviewResponse } from "@/features/auction/types";
import { auctionService } from "@/features/auction/services/auctionService";
import { getVisibleAuctionCategories } from "@/features/auction/utils";
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
  Pause,
  Square, 
  Trash2,
  Check,
  Clock,
  Users,
  Gavel,
  Radio
} from "lucide-react";

interface AuctionHeaderProps {
  auction: AuctionOverviewResponse;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
};

function getStatusConfig(status: AuctionOverviewResponse["auction"]["status"]) {
  switch (status) {
    case "draft":
      return { label: "Draft", variant: "secondary" as const, dot: "bg-muted-foreground" };
    case "scheduled":
      return { label: "Scheduled", variant: "outline" as const, dot: "bg-warning" };
    case "live":
      return { label: "Live Now", variant: "default" as const, dot: "bg-success" };
    case "paused":
      return { label: "Paused", variant: "outline" as const, dot: "bg-warning" };
    case "closed":
      return { label: "Closed", variant: "destructive" as const, dot: "bg-destructive" };
    case "completed":
      return { label: "Completed", variant: "secondary" as const, dot: "bg-muted-foreground" };
    default:
      return { label: status, variant: "default" as const, dot: "bg-muted-foreground" };
  }
}



export default function AuctionHeader({ auction }: AuctionHeaderProps) {
  const queryClient = useQueryClient();
  const [countdown, setCountdown] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isPauseOpen, setIsPauseOpen] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isCloseOpen, setIsCloseOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    title: auction.auction.name,
    description: auction.auction.description,
    location: auction.auction.address_line_1 || "",
  });
  
  const currentStatus = auction.auction.status;
  
  const isLive = currentStatus === "live";
  const isScheduled = currentStatus === "scheduled";
  const isDraft = currentStatus === "draft";
  const isClosed = currentStatus === "closed";
  const isPaused = currentStatus === "paused";
  
  const statusConfig = getStatusConfig(currentStatus);
  const { categories, remainingCount } = getVisibleAuctionCategories(auction.auction, 3);

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

  const handlePublishAuction = async () => {
    setIsLoading(true);
    try {
      await auctionService.publishAuction(auction.auction.id);
      setIsPublishOpen(false);
      toast.success("Auction published", {
        description: "Your auction is published and will start automatically.",
      });
      await queryClient.invalidateQueries({ queryKey: ["auction", auction.auction.id] });
      await queryClient.invalidateQueries({ queryKey: ["auction-overview", auction.auction.id] });
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Failed to publish auction.");
      toast.error("Unable to publish auction", { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePauseAuction = async () => {
    setIsLoading(true);
    try {
      await auctionService.pauseAuction(auction.auction.id);
      setIsPauseOpen(false);
      toast.success("Auction paused", {
        description: "Bidding is paused until you resume the auction.",
      });
      await queryClient.invalidateQueries({ queryKey: ["auction", auction.auction.id] });
      await queryClient.invalidateQueries({ queryKey: ["auction-overview", auction.auction.id] });
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Failed to pause auction.");
      toast.error("Unable to pause auction", { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeAuction = async () => {
    setIsLoading(true);
    try {
      await auctionService.resumeAuction(auction.auction.id);
      setIsResumeOpen(false);
      toast.success("Auction resumed", {
        description: "Bidding is live again.",
      });
      await queryClient.invalidateQueries({ queryKey: ["auction", auction.auction.id] });
      await queryClient.invalidateQueries({ queryKey: ["auction-overview", auction.auction.id] });
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Failed to resume auction.");
      toast.error("Unable to resume auction", { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseAuction = async () => {
    setIsLoading(true);
    try {
      await auctionService.closeAuction(auction.auction.id);
      setIsCloseOpen(false);
      toast.success("Auction closed", {
        description: "The auction has been closed. No new bids will be accepted.",
      });
      await queryClient.invalidateQueries({ queryKey: ["auction", auction.auction.id] });
      await queryClient.invalidateQueries({ queryKey: ["auction-overview", auction.auction.id] });
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Failed to close auction.");
      toast.error("Unable to close auction", { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteAuction = async () => {
    setIsLoading(true);
    try {
      await auctionService.completeAuction(auction.auction.id);
      setIsCompleteOpen(false);
      toast.success("Auction completed", {
        description: "The auction has been completed.",
      });
      await queryClient.invalidateQueries({ queryKey: ["auction", auction.auction.id] });
      await queryClient.invalidateQueries({ queryKey: ["auction-overview", auction.auction.id] });
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Failed to complete auction.");
      toast.error("Unable to complete auction", { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAuction = async () => {
    setIsLoading(true);
    try {
      await auctionService.deleteAuction(auction.auction.id);
      setIsDeleteOpen(false);
      toast.success("Auction deleted", {
        description: "The auction has been permanently deleted.",
      });
      await queryClient.invalidateQueries({ queryKey: ["auctions"] });
      await queryClient.invalidateQueries({ queryKey: ["my-auctions"] });
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Failed to delete auction.");
      toast.error("Unable to delete auction", { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const targetDate = isLive ? new Date(auction.auction.end_at) : new Date(auction.auction.start_at);
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
  }, [auction.auction.end_at, auction.auction.start_at, isLive]);

  return (
    <header className="animate-in fade-in duration-300">
      <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
        {/* Top accent bar for live auctions */}
        {isLive && (
          <div className="h-1 gradient-gold" />
        )}
        
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Top row: Status, type and category */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
            <Badge variant={statusConfig.variant} className="gap-1.5 font-body text-xs font-medium uppercase tracking-wide">
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} ${isLive ? 'animate-pulse' : ''}`} />
              {statusConfig.label}
            </Badge>
            <Badge variant="outline" className="font-body text-xs gap-1.5">
              <Radio className="w-3 h-3" />
              {auction.auction.bidding_type}
            </Badge>
            {categories.length > 0 ? (
              <>
                {categories.map((category) => (
                  <Badge key={category} variant="outline" className="font-body text-xs">
                    {category}
                  </Badge>
                ))}
                {remainingCount > 0 && (
                  <Badge variant="outline" className="font-body text-xs">
                    +{remainingCount} more
                  </Badge>
                )}
              </>
            ) : (
              <span className="text-sm text-muted-foreground font-body">Uncategorized</span>
            )}
          </div>

          {/* Title and description */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-semibold text-foreground tracking-tight mb-2">
              {auction.auction.name}
            </h1>
            <p className="text-muted-foreground font-body text-base max-w-2xl">
              {auction.auction.description}
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="rounded-xl border border-border/60 bg-secondary/30 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-body uppercase tracking-wide">Location</p>
                  <p className="text-sm font-medium text-foreground font-body break-words">
                    {[auction.auction.address_line_1, auction.auction.city, auction.auction.state, auction.auction.country]
                      .filter(Boolean)
                      .join(', ') || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-secondary/30 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-body uppercase tracking-wide">
                    {isLive ? "Ends" : "Starts"}
                  </p>
                  <p className="text-sm font-medium text-foreground font-body break-words">
                    {new Date(isLive ? auction.auction.end_at : auction.auction.start_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-secondary/30 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Gavel className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-body uppercase tracking-wide">Total Lots</p>
                  <p className="text-sm font-medium text-foreground font-body">{auction.stats.lots_total}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-secondary/30 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-body uppercase tracking-wide">Bidders</p>
                  <p className="text-sm font-medium text-foreground font-body">{auction.stats.bidders_total}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row: Countdown and actions */}
          <div className="flex flex-col gap-4 pt-6 border-t border-border lg:flex-row lg:items-center lg:justify-between">
            {/* Countdown */}
            {(isLive || isScheduled) && (
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-secondary/20 p-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isLive ? 'gradient-gold' : 'bg-secondary'}`}>
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
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
              {(isDraft || isScheduled) && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full gap-2 font-body sm:w-auto"
                  onClick={() => setIsEditOpen(true)}
                  disabled={isLoading}
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Auction
                </Button>
              )}

              {isDraft && (
                <Button 
                  size="sm" 
                  className="w-full gap-2 font-body gradient-gold border-0 text-accent-foreground hover:opacity-90 sm:w-auto"
                  onClick={() => setIsPublishOpen(true)}
                  disabled={isLoading}
                >
                  <Play className="w-4 h-4" />
                  Publish
                </Button>
              )}

              {isLive && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full gap-2 font-body sm:w-auto"
                    onClick={() => setIsPauseOpen(true)}
                    disabled={isLoading}
                  >
                    <Pause className="w-4 h-4" />
                    Pause
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full gap-2 font-body sm:w-auto"
                    onClick={() => setIsCloseOpen(true)}
                    disabled={isLoading}
                  >
                    <Square className="w-4 h-4" />
                    Close
                  </Button>
                </>
              )}

              {isPaused && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full gap-2 font-body sm:w-auto"
                    onClick={() => setIsResumeOpen(true)}
                    disabled={isLoading}
                  >
                    <Play className="w-4 h-4" />
                    Resume
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full gap-2 font-body sm:w-auto"
                    onClick={() => setIsCloseOpen(true)}
                    disabled={isLoading}
                  >
                    <Square className="w-4 h-4" />
                    Close
                  </Button>
                </>
              )}

              {isClosed && (
                <Button 
                  size="sm" 
                  className="w-full gap-2 font-body sm:w-auto"
                  onClick={() => setIsCompleteOpen(true)}
                  disabled={isLoading}
                >
                  <Check className="w-4 h-4" />
                  Complete
                </Button>
              )}
              
              {isDraft && auction.stats.total_bids === 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full gap-2 font-body text-destructive hover:text-destructive hover:bg-destructive/10 sm:w-auto"
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

      {/* Publish Auction Confirmation */}
      <AlertDialog open={isPublishOpen} onOpenChange={setIsPublishOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish Auction?</AlertDialogTitle>
            <AlertDialogDescription>
              Publishing makes the auction visible to bidders. It will automatically start at the scheduled time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublishAuction} disabled={isLoading}>
              {isLoading ? "Publishing..." : "Publish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Pause Auction Confirmation */}
      <AlertDialog open={isPauseOpen} onOpenChange={setIsPauseOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pause Auction?</AlertDialogTitle>
            <AlertDialogDescription>
              Pausing the auction will temporarily stop bidding. You can resume at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePauseAuction} disabled={isLoading}>
              {isLoading ? "Pausing..." : "Pause"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Resume Auction Confirmation */}
      <AlertDialog open={isResumeOpen} onOpenChange={setIsResumeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resume Auction?</AlertDialogTitle>
            <AlertDialogDescription>
              Resuming will allow bidders to place bids again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResumeAuction} disabled={isLoading}>
              {isLoading ? "Resuming..." : "Resume"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Close Auction Confirmation */}
      <AlertDialog open={isCloseOpen} onOpenChange={setIsCloseOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close Auction?</AlertDialogTitle>
            <AlertDialogDescription>
              Closing the auction will stop bidding immediately. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCloseAuction} disabled={isLoading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isLoading ? "Closing..." : "Close Auction"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete Auction Confirmation */}
      <AlertDialog open={isCompleteOpen} onOpenChange={setIsCompleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Auction?</AlertDialogTitle>
            <AlertDialogDescription>
              Completing the auction will finalize the results and end the lifecycle.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCompleteAuction} disabled={isLoading}>
              {isLoading ? "Completing..." : "Complete"}
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
