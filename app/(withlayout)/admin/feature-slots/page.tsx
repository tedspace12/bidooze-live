"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search, Globe, MapPin, LayoutGrid, Plus, Trash2, ExternalLink,
  Gavel, Settings, CalendarClock, Loader2, XCircle,
} from "lucide-react";
import { useNavigation } from "@/context/nav-context";
import { useFeatureSlots } from "@/features/feature-slots/hooks/useFeatureSlots";
import type { FeatureSlot, AdminSlotRound } from "@/features/feature-slots/types";
import type { AvailableAuction } from "@/features/feature-slots/services/featureSlotService";
import { FeatureSlotCard } from "@/components/feature-slots/FeatureSlotCard";
import { format } from "date-fns";

const fmtDate = (v?: string | null) => {
  if (!v) return "—";
  try { return format(new Date(v), "MMM d, yyyy HH:mm"); } catch { return v; }
};

const roundStatusColor: Record<string, string> = {
  open: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  settled: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
};

// ─── Assign Dialog ─────────────────────────────────────────────────────────────

function AssignDialog({
  slot, open, onClose, auctions, auctionsLoading, onAssign, isPending,
}: {
  slot: FeatureSlot | null;
  open: boolean;
  onClose: () => void;
  auctions: AvailableAuction[];
  auctionsLoading: boolean;
  onAssign: (slotId: number | string, auctionId: number | string, startsAt: string, endsAt?: string) => void;
  isPending: boolean;
}) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | string | null>(null);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return auctions.filter((a) =>
      a.title.toLowerCase().includes(q) || a.status.toLowerCase().includes(q)
    );
  }, [auctions, search]);

  useEffect(() => {
    if (!open) { setSearch(""); setSelectedId(null); setStartsAt(""); setEndsAt(""); }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gavel className="h-4 w-4" /> Assign Auction — Slot #{slot?.position}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Start Date *</Label>
              <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">End Date (optional)</Label>
              <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search auctions..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {auctionsLoading ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">No available auctions found.</div>
          ) : (
            <div className="space-y-2">
              {filtered.map((auction, i) => {
                const isSelected = selectedId === auction.auction_id;
                return (
                  <button
                    key={`${auction.auction_id}-${i}`}
                    type="button"
                    onClick={() => setSelectedId(auction.auction_id)}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${isSelected ? "border-primary bg-primary/5" : "hover:border-slate-300 hover:bg-slate-50"}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-14 rounded bg-slate-100 flex items-center justify-center shrink-0">
                        <Gavel className="h-4 w-4 text-slate-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800 truncate">{auction.title}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="text-xs">{auction.status}</Badge>
                          {auction.state && <span className="text-xs text-muted-foreground">{auction.state}</span>}
                          {auction.lots_count != null && (
                            <span className="text-xs text-muted-foreground">{auction.active_lots_count ?? auction.lots_count} lots</span>
                          )}
                        </div>
                        {auction.top_lot && (
                          <p className="mt-1 text-xs text-muted-foreground truncate">
                            Top: {auction.top_lot.title}
                            {auction.top_lot.highest_bid != null && ` · $${auction.top_lot.highest_bid}`}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">Cancel</Button>
          <Button onClick={() => { if (slot && selectedId && startsAt) onAssign(slot.slot_id, selectedId, startsAt, endsAt || undefined); }} className="w-full sm:w-auto" disabled={!selectedId || !startsAt || isPending}>
            {isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Assigning…</> : "Assign Auction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Slot Edit Dialog ──────────────────────────────────────────────────────────

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function SlotEditDialog({
  slot, open, onClose, isPending, onSave,
}: {
  slot: FeatureSlot | null;
  open: boolean;
  onClose: () => void;
  isPending: boolean;
  onSave: (slotId: number | string, payload: {
    minimum_bid?: number;
    bid_day_of_week?: number;
    bid_opens_time?: string;
    bid_closes_time?: string;
    slot_duration_days?: number;
    auto_schedule?: boolean;
    is_active?: boolean;
  }) => void;
}) {
  const [minimumBid, setMinimumBid] = useState("");
  const [bidDay, setBidDay] = useState("1");
  const [opensTime, setOpensTime] = useState("08:00");
  const [closesTime, setClosesTime] = useState("12:00");
  const [durationDays, setDurationDays] = useState("7");
  const [autoSchedule, setAutoSchedule] = useState(true);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!open) return;
    setMinimumBid("");
    setBidDay("1");
    setOpensTime("08:00");
    setClosesTime("12:00");
    setDurationDays("7");
    setAutoSchedule(true);
    setIsActive(true);
  }, [open]);

  const handleSave = () => {
    if (!slot) return;
    const payload: Parameters<typeof onSave>[1] = {};
    if (minimumBid) payload.minimum_bid = Number(minimumBid);
    if (bidDay) payload.bid_day_of_week = Number(bidDay);
    if (opensTime) payload.bid_opens_time = opensTime;
    if (closesTime) payload.bid_closes_time = closesTime;
    if (durationDays) payload.slot_duration_days = Number(durationDays);
    payload.auto_schedule = autoSchedule;
    payload.is_active = isActive;
    onSave(slot.slot_id, payload);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-4 w-4" /> Edit Slot #{slot?.position} Settings
          </DialogTitle>
          <DialogDescription>Leave fields blank to keep existing values.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label className="text-xs">Minimum Bid (USD)</Label>
            <Input type="number" min={0} step="0.01" placeholder="e.g. 10.00" value={minimumBid} onChange={(e) => setMinimumBid(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Bid Day of Week</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={bidDay}
                onChange={(e) => setBidDay(e.target.value)}
              >
                {DAY_NAMES.map((name, i) => <option key={i} value={i}>{name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Duration (days)</Label>
              <Input type="number" min={1} value={durationDays} onChange={(e) => setDurationDays(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Bid Opens (time)</Label>
              <Input type="time" value={opensTime} onChange={(e) => setOpensTime(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Bid Closes (time)</Label>
              <Input type="time" value={closesTime} onChange={(e) => setClosesTime(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Auto Schedule</p>
              <p className="text-xs text-muted-foreground">Automatically create next round after settlement</p>
            </div>
            <Switch checked={autoSchedule} onCheckedChange={setAutoSchedule} />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-xs text-muted-foreground">Allow bidding on this slot</p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</> : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Rounds Dialog ─────────────────────────────────────────────────────────────

function RoundsDialog({
  slot, open, onClose,
}: {
  slot: FeatureSlot | null;
  open: boolean;
  onClose: () => void;
}) {
  const { useSlotRounds, createSlotRound, cancelSlotRound } = useFeatureSlots();
  const [showCreate, setShowCreate] = useState(false);
  const [opensAt, setOpensAt] = useState("");
  const [closesAt, setClosesAt] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [cancelTarget, setCancelTarget] = useState<AdminSlotRound | null>(null);

  const { data: roundsData, isLoading } = useSlotRounds(open ? slot?.slot_id : undefined);
  const rounds = roundsData?.data ?? [];

  useEffect(() => {
    if (!open) { setShowCreate(false); setOpensAt(""); setClosesAt(""); setDurationDays(""); }
  }, [open]);

  const handleCreateRound = async () => {
    if (!slot || !opensAt || !closesAt) return;
    await createSlotRound.mutateAsync({
      slotId: slot.slot_id,
      payload: {
        bid_opens_at: new Date(opensAt).toISOString(),
        bid_closes_at: new Date(closesAt).toISOString(),
        ...(durationDays ? { slot_duration_days: Number(durationDays) } : {}),
      },
    });
    setShowCreate(false);
    setOpensAt(""); setClosesAt(""); setDurationDays("");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="sm:max-w-2xl flex flex-col max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4" /> Bidding Rounds — Slot #{slot?.position}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4">
            {showCreate ? (
              <div className="rounded-lg border p-4 space-y-3 bg-slate-50">
                <p className="text-sm font-medium">Create New Round</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Bid Opens *</Label>
                    <Input type="datetime-local" value={opensAt} onChange={(e) => setOpensAt(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Bid Closes *</Label>
                    <Input type="datetime-local" value={closesAt} onChange={(e) => setClosesAt(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Slot Duration (days, optional)</Label>
                    <Input type="number" min={1} placeholder="Uses slot default" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleCreateRound} disabled={!opensAt || !closesAt || createSlotRound.isPending}>
                    {createSlotRound.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Round"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <Button size="sm" variant="outline" className="gap-2" onClick={() => setShowCreate(true)}>
                <Plus className="h-4 w-4" /> New Round
              </Button>
            )}

            {isLoading ? (
              <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : rounds.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">No rounds yet.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Bid Window</TableHead>
                    <TableHead>Slot Window</TableHead>
                    <TableHead className="text-right">Bids</TableHead>
                    <TableHead className="text-right">Highest</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rounds.map((round) => (
                    <TableRow key={round.id}>
                      <TableCell>
                        <span className={`text-xs rounded-full px-2 py-0.5 font-medium capitalize ${roundStatusColor[round.status] ?? "bg-slate-100 text-slate-600"}`}>
                          {round.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div>{fmtDate(round.bid_opens_at)}</div>
                        <div className="text-muted-foreground">→ {fmtDate(round.bid_closes_at)}</div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div>{fmtDate(round.slot_starts_at)}</div>
                        <div className="text-muted-foreground">→ {fmtDate(round.slot_ends_at)}</div>
                      </TableCell>
                      <TableCell className="text-right text-sm">{round.bids_count}</TableCell>
                      <TableCell className="text-right text-sm">
                        {round.current_highest_bid != null ? `$${round.current_highest_bid}` : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {(round.status === "pending" || round.status === "open") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            disabled={cancelSlotRound.isPending}
                            onClick={() => setCancelTarget(round)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!cancelTarget} onOpenChange={(v) => !v && setCancelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this round?</AlertDialogTitle>
            <AlertDialogDescription>Round #{cancelTarget?.id} will be cancelled. If auto_schedule is on, a replacement will be created.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              disabled={cancelSlotRound.isPending}
              onClick={async () => {
                if (!cancelTarget) return;
                await cancelSlotRound.mutateAsync(cancelTarget.id);
                setCancelTarget(null);
              }}
            >
              {cancelSlotRound.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cancel Round"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Slot Card with actions ────────────────────────────────────────────────────

function SlotWithActions({
  slot,
  onAssign,
  onRemove,
  onEdit,
  onRounds,
}: {
  slot: FeatureSlot;
  onAssign: (slot: FeatureSlot) => void;
  onRemove: (slot: FeatureSlot) => void;
  onEdit: (slot: FeatureSlot) => void;
  onRounds: (slot: FeatureSlot) => void;
}) {
  const hasAssignment = !!(slot.active_assignment?.assignment_id || slot.active_win?.win_id);

  const actions = (
    <div className="flex flex-wrap gap-1.5">
      <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs" onClick={(e) => { e.stopPropagation(); onAssign(slot); }}>
        <Plus className="h-3.5 w-3.5" /> Assign
      </Button>
      {hasAssignment && (
        <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); onRemove(slot); }}>
          <Trash2 className="h-3.5 w-3.5" /> Remove
        </Button>
      )}
      <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={(e) => { e.stopPropagation(); onRounds(slot); }}>
        <CalendarClock className="h-3.5 w-3.5" /> Rounds
      </Button>
      <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={(e) => { e.stopPropagation(); onEdit(slot); }}>
        <Settings className="h-3.5 w-3.5" /> Edit
      </Button>
    </div>
  );

  return <FeatureSlotCard slot={slot} actions={actions} />;
}

// ─── Page ──────────────────────────────────────────────────────────────────────

const CA_PROVINCES = [
  { code: "AB", name: "Alberta" }, { code: "BC", name: "British Columbia" },
  { code: "MB", name: "Manitoba" }, { code: "NB", name: "New Brunswick" },
  { code: "NL", name: "Newfoundland and Labrador" }, { code: "NS", name: "Nova Scotia" },
  { code: "NT", name: "Northwest Territories" }, { code: "NU", name: "Nunavut" },
  { code: "ON", name: "Ontario" }, { code: "PE", name: "Prince Edward Island" },
  { code: "QC", name: "Quebec" }, { code: "SK", name: "Saskatchewan" },
  { code: "YT", name: "Yukon" },
];

const US_STATES = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" }, { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" }, { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" }, { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" }, { code: "HI", name: "Hawaii" }, { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" }, { code: "IN", name: "Indiana" }, { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" }, { code: "KY", name: "Kentucky" }, { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" }, { code: "MD", name: "Maryland" }, { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" }, { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" }, { code: "MT", name: "Montana" }, { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" }, { code: "NH", name: "New Hampshire" }, { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" }, { code: "NY", name: "New York" }, { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" }, { code: "OH", name: "Ohio" }, { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" }, { code: "PA", name: "Pennsylvania" }, { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" }, { code: "SD", name: "South Dakota" }, { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" }, { code: "UT", name: "Utah" }, { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" }, { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" }, { code: "WY", name: "Wyoming" },
];

export default function FeatureSlotsPage() {
  const router = useRouter();
  const { setTitle } = useNavigation();
  useEffect(() => { setTitle("Feature Slots"); }, [setTitle]);

  const [scopeType, setScopeType] = useState<"global" | "state">("global");
  const [country, setCountry] = useState<"US" | "CA">("US");
  const [stateCode, setStateCode] = useState("");
  const [search, setSearch] = useState("");
  const [assignSlot, setAssignSlot] = useState<FeatureSlot | null>(null);
  const [removeSlot, setRemoveSlot] = useState<FeatureSlot | null>(null);
  const [editSlot, setEditSlot] = useState<FeatureSlot | null>(null);
  const [roundsSlot, setRoundsSlot] = useState<FeatureSlot | null>(null);

  const slotsParams = useMemo(() => ({
    scope_type: scopeType,
    ...(scopeType === "state" && stateCode ? { state_code: stateCode } : {}),
  }), [scopeType, stateCode]);

  const {
    useFeatureSlotsList, useAvailableAuctions, useStatesSummary,
    assignAuctionToSlot, removeSlotAssignment, updateAdminSlot,
  } = useFeatureSlots();

  const slotsEnabled = scopeType === "global" || (scopeType === "state" && !!stateCode);
  const { data, isLoading, error } = useFeatureSlotsList(slotsParams, { enabled: slotsEnabled });
  const { data: statesSummary, isLoading: statesSummaryLoading } = useStatesSummary(
    country as "US" | "CA",
    { enabled: scopeType === "state" && country === "US" }
  );
  const { data: availableAuctions, isLoading: auctionsLoading } = useAvailableAuctions(
    slotsParams, { enabled: !!assignSlot }
  );

  const slots = useMemo(() => (data ?? []) as FeatureSlot[], [data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return slots;
    return slots.filter((s) => {
      const resolvedTitle = (s.resolved?.auction?.title ?? "").toLowerCase();
      return String(s.position).includes(q) || (s.scope_type ?? "").toLowerCase().includes(q) || resolvedTitle.includes(q);
    });
  }, [slots, search]);

  const groups = useMemo(() => {
    const map = new Map<string, FeatureSlot[]>();
    for (const s of filtered) {
      const key = s.placement ?? s.scope_type ?? "slots";
      map.set(key, [...(map.get(key) ?? []), s]);
    }
    return Array.from(map.entries())
      .map(([placement, items]) => ({ placement, items: items.sort((a, b) => a.position - b.position) }))
      .sort((a, b) => a.items[0]?.position - b.items[0]?.position);
  }, [filtered]);

  const handleAssign = (slotId: number | string, auctionId: number | string, startsAt: string, endsAt?: string) => {
    assignAuctionToSlot.mutate(
      { feature_slot_id: slotId, auction_id: auctionId, starts_at: startsAt, ends_at: endsAt ?? null },
      { onSuccess: () => setAssignSlot(null) }
    );
  };

  const handleRemove = () => {
    if (!removeSlot) return;
    const assignmentId = removeSlot.active_assignment?.assignment_id ?? removeSlot.active_win?.win_id;
    if (!assignmentId) return;
    removeSlotAssignment.mutate(assignmentId, { onSuccess: () => setRemoveSlot(null) });
  };

  const handleEditSave: Parameters<typeof SlotEditDialog>[0]["onSave"] = (slotId, payload) => {
    updateAdminSlot.mutate({ slotId, payload }, { onSuccess: () => setEditSlot(null) });
  };

  const assignedCount = slots.filter((s) => s.active_assignment?.assignment_id || s.active_win?.win_id).length;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-slate-800">Feature Slot Management</h1>
        <p className="text-slate-600">Control homepage placements via Win › Assignment › Fallback priority.</p>
      </div>

      {/* Scope toggle */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Scope</Label>
            <Tabs value={scopeType} onValueChange={(v) => setScopeType(v as "global" | "state")}>
              <TabsList>
                <TabsTrigger value="global" className="gap-2"><Globe className="h-4 w-4" /> Global</TabsTrigger>
                <TabsTrigger value="state" className="gap-2"><MapPin className="h-4 w-4" /> State</TabsTrigger>
              </TabsList>
            </Tabs>

            {scopeType === "state" && (
              <div className="flex flex-wrap gap-2">
                <select
                  className="flex h-9 w-36 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={country}
                  onChange={(e) => { setCountry(e.target.value as "US" | "CA"); setStateCode(""); }}
                >
                  <option value="US">🇺🇸 United States</option>
                  <option value="CA">🇨🇦 Canada</option>
                </select>
                <select
                  className="flex h-9 w-56 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                  value={stateCode}
                  onChange={(e) => setStateCode(e.target.value)}
                  disabled={country === "US" && statesSummaryLoading}
                >
                  <option value="">
                    {country === "US" && statesSummaryLoading ? "Loading..." : `Select ${country === "CA" ? "province" : "state"}...`}
                  </option>
                  {country === "CA"
                    ? CA_PROVINCES.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)
                    : (statesSummary ?? US_STATES).map((s) => (
                        <option key={s.code} value={s.code} disabled={"auction_count" in s && s.auction_count === 0}>
                          {s.name}{"auction_count" in s ? ` (${s.auction_count})` : ""}
                        </option>
                      ))}
                </select>
              </div>
            )}
          </div>

          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by position, scope, auction..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </Card>

      {/* Stats */}
      {!isLoading && !error && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Slots</CardTitle>
              <LayoutGrid className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{slots.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assigned</CardTitle>
              <Gavel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-600">{assignedCount}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Empty</CardTitle>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-orange-600">{slots.length - assignedCount}</div></CardContent>
          </Card>
        </div>
      )}

      {/* Slots grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-36 w-full rounded-xl" />)}
        </div>
      ) : error ? (
        <div className="rounded-xl border bg-card p-8 text-center text-sm text-destructive">
          <p className="font-medium">Failed to load feature slots</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => router.refresh()}>Retry</Button>
        </div>
      ) : scopeType === "state" && !stateCode ? (
        <div className="rounded-xl border bg-card p-10 text-center">
          <MapPin className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="font-medium text-slate-700">Select a state to view slots</p>
          <p className="mt-1 text-sm text-muted-foreground">Use the state dropdown above to filter by location.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-10 text-center">
          <LayoutGrid className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="font-medium text-slate-700">No slots found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {search ? "No slots match your search." : "No slots configured for this scope."}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map((g) => (
            <section key={g.placement} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-slate-900 capitalize">{g.placement}</span>
                </div>
                <Badge variant="outline" className="bg-background/60">
                  {g.items.length} slot{g.items.length === 1 ? "" : "s"}
                </Badge>
              </div>
              <div className={`grid gap-4 sm:grid-cols-2 ${scopeType === "state" ? "lg:grid-cols-3 xl:grid-cols-4" : "xl:grid-cols-3"}`}>
                {g.items.map((slot) => (
                  <SlotWithActions
                    key={String(slot.slot_id)}
                    slot={slot}
                    onAssign={setAssignSlot}
                    onRemove={setRemoveSlot}
                    onEdit={setEditSlot}
                    onRounds={setRoundsSlot}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Assign dialog */}
      <AssignDialog
        slot={assignSlot}
        open={!!assignSlot}
        onClose={() => setAssignSlot(null)}
        auctions={availableAuctions ?? []}
        auctionsLoading={auctionsLoading}
        onAssign={handleAssign}
        isPending={assignAuctionToSlot.isPending}
      />

      {/* Edit dialog */}
      <SlotEditDialog
        slot={editSlot}
        open={!!editSlot}
        onClose={() => setEditSlot(null)}
        isPending={updateAdminSlot.isPending}
        onSave={handleEditSave}
      />

      {/* Rounds dialog */}
      <RoundsDialog
        slot={roundsSlot}
        open={!!roundsSlot}
        onClose={() => setRoundsSlot(null)}
      />

      {/* Remove confirmation */}
      <AlertDialog open={!!removeSlot} onOpenChange={(open) => !open && setRemoveSlot(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Remove the current assignment from Slot #{removeSlot?.position}? The slot will fall back to its fallback content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={removeSlotAssignment.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeSlotAssignment.isPending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
