"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { AuctionOverviewResponse, AuctionBid } from "@/features/auction/types";
import { useAuctionBids } from "@/features/auction/hooks/useAuctionBids";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle,
  XCircle,
  Gavel,
  Clock,
  AlertCircle,
  Search,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface BidsTabProps {
  auction: AuctionOverviewResponse;
}

const formatDate = (val?: string | null) => {
  if (!val) return "—";
  try { return format(new Date(val), "MMM d, yyyy · h:mm a"); }
  catch { return val; }
};

type BidStatusFilter = "all" | "pending_approval" | "approved" | "rejected";

const FILTERS: { value: BidStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending_approval", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending_approval: { label: "Pending", variant: "secondary" },
  approved: { label: "Approved", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === "object" && "message" in error) {
    const m = (error as { message?: unknown }).message;
    if (typeof m === "string" && m.trim()) return m;
  }
  return fallback;
};

export default function BidsTab({ auction }: BidsTabProps) {
  const { useBidsList, approveBid, rejectBid } = useAuctionBids(auction.auction.id);
  const [filter, setFilter] = useState<BidStatusFilter>("all");
  const [search, setSearch] = useState("");
  const [rejectTarget, setRejectTarget] = useState<AuctionBid | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const bidsQuery = useBidsList(filter !== "all" ? { status: filter } : undefined);
  const bids: AuctionBid[] = bidsQuery.data?.data ?? [];

  const filtered = bids.filter((b) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      String(b.bidder_name ?? "").toLowerCase().includes(q) ||
      String(b.lot_title ?? "").toLowerCase().includes(q) ||
      String(b.lot_number ?? "").toLowerCase().includes(q)
    );
  });

  const pendingCount = auction.stats.pending_approval_bids ?? 0;

  const handleApprove = async (bid: AuctionBid) => {
    try {
      await approveBid.mutateAsync(bid.id);
      toast.success("Bid approved.");
    } catch (err) {
      toast.error("Failed to approve bid", { description: getErrorMessage(err, "Please try again.") });
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectTarget) return;
    try {
      await rejectBid.mutateAsync({ bidId: rejectTarget.id, reason: rejectReason || undefined });
      toast.success("Bid rejected.");
      setRejectTarget(null);
      setRejectReason("");
    } catch (err) {
      toast.error("Failed to reject bid", { description: getErrorMessage(err, "Please try again.") });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-semibold text-foreground">Bids</h2>
        <p className="text-sm text-muted-foreground font-body mt-1">
          Review and manage all bids placed in this auction
        </p>
      </div>

      {/* Pending alert */}
      {pendingCount > 0 && filter !== "pending_approval" && (
        <button
          type="button"
          onClick={() => setFilter("pending_approval")}
          className="w-full flex items-center justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 px-4 py-3 text-left transition-colors hover:bg-amber-100 dark:hover:bg-amber-950/50"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
              {pendingCount} bid{pendingCount !== 1 ? "s" : ""} pending approval — click to review
            </span>
          </div>
          <Badge className="bg-amber-500 text-white shrink-0">{pendingCount}</Badge>
        </button>
      )}

      {/* Filter buttons + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1 w-fit">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-body font-medium transition-colors ${
                filter === f.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
              {f.value === "pending_approval" && pendingCount > 0 && (
                <Badge variant="secondary" className="h-4 min-w-4 px-1 text-[10px] leading-none">
                  {pendingCount}
                </Badge>
              )}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search bidder or lot..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 font-body h-9"
          />
        </div>
      </div>

      {/* Bids table */}
      <Card className="border border-border shadow-soft overflow-hidden pt-0 pb-0">
        {/* Mobile list */}
        <div className="divide-y divide-border md:hidden">
          {bidsQuery.isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Gavel className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground font-body">No bids found</p>
            </div>
          ) : (
            filtered.map((bid) => {
              const sc = STATUS_CONFIG[bid.bid_status ?? ""] ?? { label: bid.bid_status ?? "—", variant: "outline" as const };
              return (
                <div key={bid.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-body font-medium text-foreground">{bid.bidder_name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground font-body mt-0.5">
                        Lot {bid.lot_number} · {bid.lot_title}
                      </p>
                    </div>
                    <Badge variant={sc.variant} className="font-body text-xs shrink-0">{sc.label}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-body font-semibold text-foreground">
                        {bid.amount != null ? formatCurrency(Number(bid.amount), auction.auction.currency) : "—"}
                      </p>
                      <p className="text-xs text-muted-foreground font-body">{formatDate(bid.placed_at ?? bid.created_at)}</p>
                    </div>
                    {bid.bid_status === "pending_approval" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 text-xs text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                          disabled={approveBid.isPending}
                          onClick={() => handleApprove(bid)}
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 text-xs text-destructive border-destructive/30 hover:bg-destructive/5"
                          onClick={() => setRejectTarget(bid)}
                        >
                          <XCircle className="h-3.5 w-3.5" /> Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                <TableHead className="font-body font-semibold text-foreground">Bidder</TableHead>
                <TableHead className="font-body font-semibold text-foreground">Lot</TableHead>
                <TableHead className="font-body font-semibold text-foreground">Amount</TableHead>
                <TableHead className="font-body font-semibold text-foreground">Date</TableHead>
                <TableHead className="font-body font-semibold text-foreground">Status</TableHead>
                <TableHead className="w-40" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {bidsQuery.isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16">
                    <Gavel className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground font-body">No bids found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((bid) => {
                  const sc = STATUS_CONFIG[bid.bid_status ?? ""] ?? { label: bid.bid_status ?? "—", variant: "outline" as const };
                  return (
                    <TableRow key={bid.id} className="group hover:bg-secondary/30">
                      <TableCell className="font-body font-medium">{bid.bidder_name ?? "—"}</TableCell>
                      <TableCell>
                        <p className="font-body text-sm">Lot {bid.lot_number}</p>
                        <p className="font-body text-xs text-muted-foreground truncate max-w-[180px]">{bid.lot_title}</p>
                      </TableCell>
                      <TableCell className="font-body font-semibold">
                        {bid.amount != null ? formatCurrency(Number(bid.amount), auction.auction.currency) : "—"}
                      </TableCell>
                      <TableCell className="font-body text-muted-foreground text-sm">
                        {formatDate(bid.placed_at ?? bid.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={sc.variant} className="font-body text-xs gap-1">
                          {sc.label === "Pending" && <Clock className="w-3 h-3" />}
                          {sc.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {bid.bid_status === "pending_approval" && (
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 gap-1 text-xs text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                              disabled={approveBid.isPending}
                              onClick={() => handleApprove(bid)}
                            >
                              <CheckCircle className="h-3 w-3" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 gap-1 text-xs text-destructive border-destructive/30 hover:bg-destructive/5"
                              onClick={() => setRejectTarget(bid)}
                            >
                              <XCircle className="h-3 w-3" /> Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Reject dialog */}
      <Dialog
        open={!!rejectTarget}
        onOpenChange={(open) => { if (!open) { setRejectTarget(null); setRejectReason(""); } }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Reject Bid</DialogTitle>
            <DialogDescription className="font-body">
              {rejectTarget?.bidder_name} —{" "}
              {rejectTarget?.amount != null
                ? formatCurrency(Number(rejectTarget.amount), auction.auction.currency)
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="reject-reason" className="font-body">Reason (optional)</Label>
            <Input
              id="reject-reason"
              placeholder="e.g. Bid violates auction policy"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="font-body"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="font-body"
              onClick={() => { setRejectTarget(null); setRejectReason(""); }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="font-body"
              disabled={rejectBid.isPending}
              onClick={handleRejectConfirm}
            >
              {rejectBid.isPending ? "Rejecting…" : "Confirm Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
