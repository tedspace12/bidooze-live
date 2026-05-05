"use client";

import { useState, useMemo } from "react";
import {
  LayoutGrid, Trophy, DollarSign, Calendar, MapPin, Globe,
  ChevronDown, CreditCard, Gavel, Loader2, AlertCircle, Clock,
} from "lucide-react";
import { toast } from "sonner";
import { format, formatDistanceToNowStrict, isFuture } from "date-fns";
import { useFeatureSlots } from "@/features/feature-slots/hooks/useFeatureSlots";
import { useAuction } from "@/features/auction/hooks/useAuction";
import type { OpenFeatureSlot, FeatureSlotWin } from "@/features/feature-slots/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Static region data (hardcoded — no API wait) ────────────────────────────

const US_STATES = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" }, { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DC", name: "District of Columbia" },
  { code: "DE", name: "Delaware" }, { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" }, { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" }, { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" }, { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" }, { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" }, { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" }, { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" }, { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" }, { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" }, { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" }, { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" }, { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" }, { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" }, { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" }, { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" }, { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" }, { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" }, { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" }, { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

const CA_PROVINCES = [
  { code: "AB", name: "Alberta" }, { code: "BC", name: "British Columbia" },
  { code: "MB", name: "Manitoba" }, { code: "NB", name: "New Brunswick" },
  { code: "NL", name: "Newfoundland and Labrador" }, { code: "NS", name: "Nova Scotia" },
  { code: "NT", name: "Northwest Territories" }, { code: "NU", name: "Nunavut" },
  { code: "ON", name: "Ontario" }, { code: "PE", name: "Prince Edward Island" },
  { code: "QC", name: "Quebec" }, { code: "SK", name: "Saskatchewan" },
  { code: "YT", name: "Yukon" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDate = (val?: string | null) => {
  if (!val) return "—";
  try { return format(new Date(val), "MMM d, yyyy"); }
  catch { return val; }
};

const formatCurrency = (val?: number | null) => {
  if (val == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);
};

const getClosingLabel = (dateStr?: string | null): { label: string; urgent: boolean } | null => {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    if (!isFuture(date)) return { label: "Closed", urgent: false };
    const hoursLeft = (date.getTime() - Date.now()) / 3_600_000;
    return {
      label: `Closes ${formatDistanceToNowStrict(date, { addSuffix: true })}`,
      urgent: hoursLeft < 24,
    };
  } catch {
    return null;
  }
};

const scopeLabel = (slot: OpenFeatureSlot) => {
  if (slot.scope_type === "state" && slot.scope_value) return slot.scope_value;
  if (slot.scope_type === "global") return "Global";
  return slot.placement ?? slot.scope_type ?? "—";
};

// ─── Skeleton Cards ──────────────────────────────────────────────────────────

function SlotCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="h-1.5 bg-muted animate-pulse" />
      <CardHeader className="pb-3 pt-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-3 w-16 mt-1.5" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-12 rounded-lg" />
          <Skeleton className="h-12 rounded-lg" />
        </div>
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-9 w-full" />
      </CardContent>
    </Card>
  );
}

function WinCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-36 w-full rounded-none" />
      <CardHeader className="pb-2 pt-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20 mt-1.5" />
      </CardHeader>
      <CardContent className="space-y-3 pt-1">
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-12 rounded-lg" />
          <Skeleton className="h-12 rounded-lg" />
        </div>
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-9 w-full" />
      </CardContent>
    </Card>
  );
}

// ─── Error State ─────────────────────────────────────────────────────────────

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-xl border border-destructive/20 bg-destructive/5 py-14 text-center">
      <AlertCircle className="w-10 h-10 mx-auto mb-3 text-destructive/50" />
      <p className="font-body font-medium text-foreground text-sm">Failed to load data</p>
      <p className="font-body text-xs text-muted-foreground mt-1 mb-4">Check your connection and try again.</p>
      <Button variant="outline" size="sm" onClick={onRetry} className="font-body">
        Retry
      </Button>
    </div>
  );
}

// ─── Open Slot Card ──────────────────────────────────────────────────────────

function OpenSlotCard({ slot, onBid }: { slot: OpenFeatureSlot; onBid: (slot: OpenFeatureSlot) => void }) {
  const isGlobal = slot.scope_type === "global";
  const roundStatus = slot.round?.status;
  const isPending = roundStatus === "pending";
  const isOpen = roundStatus === "open";
  const closing = getClosingLabel(slot.round?.bid_closes_at);

  const statusBadge = isPending
    ? { label: "Bidding soon", cls: "bg-amber-50 text-amber-700" }
    : closing?.urgent
      ? { label: "Closing soon", cls: "bg-red-100 text-red-700" }
      : isOpen
        ? { label: "Open", cls: "bg-emerald-50 text-emerald-700" }
        : null;

  return (
    <Card className="overflow-hidden flex flex-col border border-border hover:border-primary/30 hover:shadow-md transition-all shadow-sm">
      <CardHeader className="pb-3 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base font-display font-semibold">Slot #{slot.position}</CardTitle>
            <p className="text-xs text-muted-foreground font-body mt-0.5 flex items-center gap-1">
              {isGlobal
                ? <><Globe className="w-3 h-3" /> Global</>
                : <><MapPin className="w-3 h-3" /> {scopeLabel(slot)}</>
              }
            </p>
          </div>
          {statusBadge && (
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${statusBadge.cls}`}>
              <Clock className="w-3 h-3" />
              {statusBadge.label}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3 pb-4">
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-lg bg-secondary/60 p-2.5">
            <p className="text-xs text-muted-foreground font-body">Current Bid</p>
            <p className="font-semibold font-body text-sm mt-0.5">
              {slot.round?.current_highest_bid != null
                ? formatCurrency(slot.round.current_highest_bid)
                : "No bids"}
            </p>
          </div>
          <div className="rounded-lg bg-secondary/60 p-2.5">
            <p className="text-xs text-muted-foreground font-body">Min Bid</p>
            <p className="font-semibold font-body text-sm mt-0.5">
              {formatCurrency(slot.round?.minimum_next_bid ?? slot.minimum_bid)}
            </p>
          </div>
        </div>

        <div className="space-y-1.5 text-xs text-muted-foreground font-body">
          {isPending && slot.round?.bid_opens_at && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 shrink-0" />
              <span>Bidding opens {formatDate(slot.round.bid_opens_at)}</span>
            </div>
          )}
          {slot.round?.bid_closes_at && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 shrink-0" />
              <span>Bidding closes {formatDate(slot.round.bid_closes_at)}</span>
              {!isPending && slot.round.bids_count > 0 && (
                <span className="ml-auto font-medium text-foreground">
                  {slot.round.bids_count} bid{slot.round.bids_count !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          )}
          {slot.round?.slot_starts_at && slot.round?.slot_ends_at && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 shrink-0 opacity-60" />
              <span>
                Slot {formatDate(slot.round.slot_starts_at)} – {formatDate(slot.round.slot_ends_at)}
              </span>
            </div>
          )}
        </div>

        <Button
          size="sm"
          disabled={!isOpen}
          className="mt-auto w-full gradient-gold border-0 text-accent-foreground hover:opacity-90 font-body gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onBid(slot)}
        >
          <DollarSign className="w-3.5 h-3.5" />
          {isPending ? "Not open yet" : "Place Bid"}
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Win Card ───────────────────────────────────────────────────────────────

function WinCard({
  win,
  onPay,
  onAssign,
}: {
  win: FeatureSlotWin;
  onPay: (win: FeatureSlotWin) => void;
  onAssign: (win: FeatureSlotWin) => void;
}) {
  const auctionName = win.auction?.name ?? win.auction?.title ?? "Unnamed Auction";
  const imageUrl = win.auction?.feature_image_url ?? win.auction?.image_url;
  const scopeType = win.slot?.scope_type;
  const scopeVal = win.slot?.scope_value;
  const position = win.slot?.position;
  const isActive = win.status === "active";

  const paymentConfig: Record<string, { cls: string; label: string }> = {
    unpaid:   { cls: "bg-red-50 text-red-700 border-red-200",       label: "Unpaid" },
    invoiced: { cls: "bg-amber-50 text-amber-700 border-amber-200", label: "Invoiced" },
    paid:     { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Paid" },
  };
  const payment = paymentConfig[win.payment_status] ?? {
    cls: "bg-secondary text-muted-foreground border-border",
    label: win.payment_status,
  };

  const needsPayment = win.payment_status === "unpaid" || win.payment_status === "invoiced";

  return (
    <Card className={`overflow-hidden flex flex-col border shadow-sm transition-all ${
      isActive
        ? "border-border hover:border-primary/30 hover:shadow-md"
        : "border-border/50 opacity-70"
    }`}>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={auctionName} className="w-full h-36 object-cover" />
      ) : (
        <div className={`w-full h-12 ${isActive ? "gradient-gold opacity-60" : "bg-muted/30"}`} />
      )}

      <CardHeader className="pb-2 pt-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-sm font-display font-semibold truncate leading-snug">
              {auctionName}
            </CardTitle>
            <p className="text-xs text-muted-foreground font-body mt-0.5 flex items-center gap-1">
              {scopeType === "global"
                ? <><Globe className="w-3 h-3" /> Global</>
                : <><MapPin className="w-3 h-3" /> {scopeVal ?? scopeType ?? "—"}</>
              }
              {position != null && (
                <span className="text-muted-foreground/60">· #{position}</span>
              )}
            </p>
          </div>
          <Badge
            variant={isActive ? "default" : "secondary"}
            className="shrink-0 capitalize text-xs"
          >
            {win.status ?? "active"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-3 pb-4 pt-1">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-secondary/60 p-2.5">
            <p className="text-xs text-muted-foreground font-body">Won for</p>
            <p className="font-bold font-body text-primary text-sm mt-0.5">
              {formatCurrency(win.price)}
            </p>
          </div>
          <div className="rounded-lg bg-secondary/60 p-2.5">
            <p className="text-xs text-muted-foreground font-body">Slot period</p>
            <p className="font-medium font-body text-xs mt-0.5 leading-snug">
              {formatDate(win.win_starts_at)}
              <br />
              <span className="text-muted-foreground">to {formatDate(win.win_ends_at)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs rounded-md border px-2 py-0.5 font-medium capitalize ${payment.cls}`}>
            {payment.label}
          </span>
          {win.auction_assigned && (
            <span className="text-xs rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 px-2 py-0.5 font-medium">
              Auction set
            </span>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-2">
          {needsPayment && (
            <Button
              size="sm"
              className="w-full gap-1.5 gradient-gold border-0 text-accent-foreground hover:opacity-90 font-body"
              onClick={() => onPay(win)}
            >
              <CreditCard className="w-3.5 h-3.5" /> Pay Now
            </Button>
          )}
          {!win.auction_assigned && (
            <Button
              size="sm"
              variant="outline"
              className="w-full gap-1.5 font-body"
              onClick={() => onAssign(win)}
            >
              <Gavel className="w-3.5 h-3.5" /> Assign Auction
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Scope Filter ────────────────────────────────────────────────────────────

type ScopeFilter = "global" | "state";
type Country = "US" | "CA";

function ScopeFilterBar({
  scope, setScope,
  country, setCountry,
  stateCode, setStateCode,
}: {
  scope: ScopeFilter;
  setScope: (v: ScopeFilter) => void;
  country: Country;
  setCountry: (v: Country) => void;
  stateCode: string;
  setStateCode: (v: string) => void;
}) {
  const regions = country === "US" ? US_STATES : CA_PROVINCES;

  return (
    <div className="space-y-3">
      {/* Scope toggle */}
      <div className="inline-flex gap-1 rounded-xl border border-border bg-muted/40 p-1">
        <button
          type="button"
          onClick={() => { setScope("global"); setStateCode(""); }}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-body font-medium transition-all ${
            scope === "global"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          Global
        </button>
        <button
          type="button"
          onClick={() => setScope("state")}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-body font-medium transition-all ${
            scope === "state"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          By State / Province
        </button>
      </div>

      {/* State picker panel */}
      {scope === "state" && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-sm">
          {/* Country selector */}
          <div>
            <p className="text-xs font-medium text-muted-foreground font-body mb-2">Country</p>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2 sm:w-fit">
              <button
                type="button"
                onClick={() => { setCountry("US"); setStateCode(""); }}
                className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-body font-medium transition-all ${
                  country === "US"
                    ? "border-primary bg-primary/5 text-primary shadow-sm"
                    : "border-border text-muted-foreground hover:border-slate-300 hover:text-foreground"
                }`}
              >
                🇺🇸 United States
              </button>
              <button
                type="button"
                onClick={() => { setCountry("CA"); setStateCode(""); }}
                className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-body font-medium transition-all ${
                  country === "CA"
                    ? "border-primary bg-primary/5 text-primary shadow-sm"
                    : "border-border text-muted-foreground hover:border-slate-300 hover:text-foreground"
                }`}
              >
                🇨🇦 Canada
              </button>
            </div>
          </div>

          {/* State / Province selector */}
          <div>
            <p className="text-xs font-medium text-muted-foreground font-body mb-2">
              {country === "US" ? "State" : "Province"}
            </p>
            <div className="flex items-center gap-2">
              <Select value={stateCode} onValueChange={setStateCode}>
                <SelectTrigger className="w-full sm:w-72 font-body h-9">
                  <SelectValue placeholder={country === "US" ? "Select a state…" : "Select a province…"} />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {regions.map((s) => (
                    <SelectItem key={s.code} value={s.code} className="font-body">
                      {s.name} ({s.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {stateCode && (
                <button
                  type="button"
                  onClick={() => setStateCode("")}
                  className="text-xs text-muted-foreground font-body hover:text-foreground whitespace-nowrap underline underline-offset-2 shrink-0"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function FeatureSlotsPage() {
  const {
    useOpenSlots, useMySlotWins,
    bidOnSlot, initiateSlotPayment, auctioneerAssignSlot,
  } = useFeatureSlots();
  const { useMyAuctions } = useAuction();

  const [scope, setScope] = useState<ScopeFilter>("global");
  const [country, setCountry] = useState<Country>("US");
  const [stateCode, setStateCode] = useState("");

  const openSlotsParams = useMemo(() => {
    if (scope === "global") return { scope_type: "global" as const };
    if (scope === "state" && stateCode) return { scope_type: "state" as const, state_code: stateCode };
    return { scope_type: "state" as const };
  }, [scope, stateCode]);

  const openSlots = useOpenSlots(openSlotsParams);
  const myWins = useMySlotWins();

  // Bid dialog
  const [bidTarget, setBidTarget] = useState<OpenFeatureSlot | null>(null);
  const [bidAmount, setBidAmount] = useState("");

  // Pay dialog
  const [payTarget, setPayTarget] = useState<FeatureSlotWin | null>(null);
  const [payingId, setPayingId] = useState<number | null>(null);

  // Assign auction dialog
  const [assignTarget, setAssignTarget] = useState<FeatureSlotWin | null>(null);
  const [assignAuctionId, setAssignAuctionId] = useState<string>("");

  const myAuctions = useMyAuctions({ status: "active" });
  const activeAuctions = useMemo(() => myAuctions.data ?? [], [myAuctions.data]);

  const openSlotsData = openSlots.data ?? [];
  const activeWins = useMemo(() => myWins.data?.active ?? [], [myWins.data?.active]);
  const allWins = useMemo(() => myWins.data?.data ?? [], [myWins.data?.data]);
  const pastWins = useMemo(
    () => allWins.filter((w) => !activeWins.some((a) => a.id === w.id)),
    [allWins, activeWins]
  );

  const slotsEnabled = scope !== "state" || !!stateCode;

  const handleBidSubmit = async () => {
    if (!bidTarget) return;
    const amount = Number(bidAmount);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid bid amount");
      return;
    }
    const minNextBid = bidTarget.round?.minimum_next_bid ?? bidTarget.minimum_bid ?? 0;
    if (amount < minNextBid) {
      toast.error(`Bid must be at least ${formatCurrency(minNextBid)}`);
      return;
    }
    await bidOnSlot.mutateAsync({ slotId: bidTarget.id, payload: { amount } });
    setBidTarget(null);
    setBidAmount("");
  };

  const handlePay = async (win: FeatureSlotWin) => {
    setPayingId(win.id);
    try {
      const res = await initiateSlotPayment.mutateAsync({
        roundId: win.round_id,
        payload: { return_url: `${window.location.origin}/feature-slots` },
      });
      if (res.payment_url) {
        window.location.href = res.payment_url;
      } else {
        toast.info("A pending payment already exists. Check your email for the payment link.");
        setPayTarget(null);
      }
    } finally {
      setPayingId(null);
    }
  };

  const handleAssignSubmit = async () => {
    if (!assignTarget || !assignAuctionId) return;
    await auctioneerAssignSlot.mutateAsync({
      slotId: assignTarget.slot.id,
      payload: { auction_id: Number(assignAuctionId) },
    });
    setAssignTarget(null);
    setAssignAuctionId("");
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Hero Header */}
      <Card className="relative overflow-hidden border-border/70 bg-[linear-gradient(135deg,hsl(var(--primary)/0.25)_0%,hsl(var(--background))_55%,hsl(var(--muted)/0.45)_100%)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,hsl(var(--foreground)/0.06)_1px,transparent_0)] [background-size:14px_14px]" />
        <CardContent className="relative p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold tracking-tight sm:text-3xl">
                Feature Slots
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Bid on premium placement slots to promote your auctions to more buyers.
              </p>
            </div>
            {!myWins.isLoading && activeWins.length > 0 && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm shrink-0">
                <Trophy className="h-4 w-4 text-emerald-600" />
                <span className="font-medium text-emerald-700">
                  {activeWins.length} active win{activeWins.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="available">
        <div className="mb-6">
          <TabsList>
            <TabsTrigger value="available" className="gap-1.5 font-body">
              <LayoutGrid className="w-4 h-4" />
              Available Slots
              {openSlotsData.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">{openSlotsData.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="wins" className="gap-1.5 font-body">
              <Trophy className="w-4 h-4" />
              My Wins
              {activeWins.length > 0 && (
                <Badge className="ml-1 text-xs bg-emerald-500 text-white hover:bg-emerald-500">
                  {activeWins.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ─── Available Slots ──────────────────────────────────────────── */}
        <TabsContent value="available" className="space-y-5">
          <ScopeFilterBar
            scope={scope}
            setScope={setScope}
            country={country}
            setCountry={setCountry}
            stateCode={stateCode}
            setStateCode={setStateCode}
          />

          {scope === "state" && !stateCode ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
              <ChevronDown className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="font-body text-sm">
                Select a {country === "CA" ? "province" : "state"} above to see available slots.
              </p>
            </div>
          ) : openSlots.isError ? (
            <ErrorState onRetry={() => openSlots.refetch()} />
          ) : openSlots.isLoading && slotsEnabled ? (
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${scope === "state" ? "lg:grid-cols-3 xl:grid-cols-4" : "lg:grid-cols-3"}`}>
              {[1, 2, 3, 4].map((i) => <SlotCardSkeleton key={i} />)}
            </div>
          ) : openSlotsData.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
              <LayoutGrid className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-body text-sm font-medium">No open feature slots</p>
              <p className="font-body text-xs mt-1">
                {scope === "state" && stateCode
                  ? `No slots open for ${stateCode} right now. Try another state or check Global slots.`
                  : "New slots open each week — check back soon."}
              </p>
            </div>
          ) : (
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${scope === "state" ? "lg:grid-cols-3 xl:grid-cols-4" : "lg:grid-cols-3"}`}>
              {openSlotsData.map((slot, i) => (
                <OpenSlotCard key={slot.id ?? i} slot={slot} onBid={setBidTarget} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── My Wins ──────────────────────────────────────────────────── */}
        <TabsContent value="wins">
          {myWins.isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3].map((i) => <WinCardSkeleton key={i} />)}
            </div>
          ) : myWins.isError ? (
            <ErrorState onRetry={() => myWins.refetch()} />
          ) : allWins.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
              <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-body text-sm font-medium">No wins yet</p>
              <p className="font-body text-xs mt-1">
                Bid on available slots to get your auctions featured prominently.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {activeWins.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <h2 className="text-sm font-semibold text-foreground font-body">Active Wins</h2>
                    <Badge variant="secondary" className="text-xs">{activeWins.length}</Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {activeWins.map((win) => (
                      <WinCard key={win.id} win={win} onPay={setPayTarget} onAssign={setAssignTarget} />
                    ))}
                  </div>
                </section>
              )}

              {pastWins.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                    <h2 className="text-sm font-semibold text-muted-foreground font-body">Past Wins</h2>
                    <Badge variant="outline" className="text-xs">{pastWins.length}</Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {pastWins.map((win) => (
                      <WinCard key={win.id} win={win} onPay={setPayTarget} onAssign={setAssignTarget} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ─── Bid Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={!!bidTarget} onOpenChange={(open) => { if (!open) { setBidTarget(null); setBidAmount(""); } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Place a Bid</DialogTitle>
            <DialogDescription className="font-body">
              Slot #{bidTarget?.position}
              {bidTarget?.scope_type === "state" && bidTarget.scope_value ? ` · ${bidTarget.scope_value}` : ""}
              {bidTarget?.scope_type === "global" ? " · Global" : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {bidTarget && (
              <div className="grid grid-cols-2 gap-3 text-sm bg-secondary/50 rounded-lg p-3">
                <div>
                  <p className="text-xs text-muted-foreground font-body">Current Bid</p>
                  <p className="font-semibold font-body">
                    {bidTarget.round?.current_highest_bid != null
                      ? formatCurrency(bidTarget.round.current_highest_bid)
                      : "No bids yet"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-body">Min Next Bid</p>
                  <p className="font-semibold font-body">
                    {formatCurrency(bidTarget.round?.minimum_next_bid ?? bidTarget.minimum_bid)}
                  </p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label className="font-body font-medium">Your Bid (USD)</Label>
              <Input
                type="number"
                min={0}
                placeholder="Enter amount"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="font-body"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="font-body"
              onClick={() => { setBidTarget(null); setBidAmount(""); }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBidSubmit}
              disabled={bidOnSlot.isPending || !bidAmount}
              className="gradient-gold border-0 text-accent-foreground hover:opacity-90 font-body gap-1.5"
            >
              {bidOnSlot.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Placing…</>
                : <><DollarSign className="w-4 h-4" /> Confirm Bid</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Pay Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={!!payTarget} onOpenChange={(open) => { if (!open) setPayTarget(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Complete Payment</DialogTitle>
            <DialogDescription className="font-body">
              You&apos;ll be redirected to complete payment and activate your feature slot.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-secondary/50 p-4 space-y-2 text-sm font-body">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount due</span>
              <span className="font-bold text-primary">{formatCurrency(payTarget?.price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Slot</span>
              <span className="font-semibold">
                {payTarget?.slot.scope_type === "global" ? "Global" : payTarget?.slot.scope_value ?? "—"} · #{payTarget?.slot.position}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Period</span>
              <span className="font-semibold text-right">
                {formatDate(payTarget?.win_starts_at)} – {formatDate(payTarget?.win_ends_at)}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="font-body" onClick={() => setPayTarget(null)}>
              Cancel
            </Button>
            <Button
              className="gradient-gold border-0 text-accent-foreground hover:opacity-90 font-body gap-1.5"
              disabled={payingId === payTarget?.id}
              onClick={() => payTarget && handlePay(payTarget)}
            >
              {payingId === payTarget?.id
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting…</>
                : <><CreditCard className="w-4 h-4" /> Pay Now</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Assign Auction Dialog ───────────────────────────────────────── */}
      <Dialog
        open={!!assignTarget}
        onOpenChange={(open) => { if (!open) { setAssignTarget(null); setAssignAuctionId(""); } }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Assign Auction to Slot</DialogTitle>
            <DialogDescription className="font-body">
              Choose one of your active auctions to feature in this slot.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {myAuctions.isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
              </div>
            ) : activeAuctions.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border py-8 text-center">
                <p className="text-sm text-muted-foreground font-body">No active auctions available.</p>
                <p className="text-xs text-muted-foreground font-body mt-1">Start an auction first to assign it here.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {activeAuctions.map((a) => (
                  <button
                    key={String(a.id)}
                    type="button"
                    onClick={() => setAssignAuctionId(String(a.id))}
                    className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${
                      assignAuctionId === String(a.id)
                        ? "border-primary bg-primary/5"
                        : "hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <p className="font-medium truncate font-body">{a.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 font-body capitalize">{a.status}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="font-body"
              onClick={() => { setAssignTarget(null); setAssignAuctionId(""); }}
            >
              Cancel
            </Button>
            <Button
              className="font-body gap-1.5"
              disabled={!assignAuctionId || auctioneerAssignSlot.isPending}
              onClick={handleAssignSubmit}
            >
              {auctioneerAssignSlot.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Assigning…</>
                : <><Gavel className="w-4 h-4" /> Assign</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
