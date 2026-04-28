"use client";

import { Badge } from "@/components/ui/badge";
import type { FeatureSlot } from "@/features/feature-slots/types";
import {
  CalendarRange,
  Gavel,
  Trophy,
  Star,
  Layers,
  Clock,
} from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDate = (value?: string | null) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const formatCurrency = (amount?: number | null, currency?: string | null) => {
  if (amount == null) return null;
  const symbol = currency === "NGN" ? "₦" : "$";
  return `${symbol}${amount.toLocaleString()}`;
};

const sourceConfig = {
  win: {
    label: "Win",
    icon: Trophy,
    badge: "bg-yellow-100 text-yellow-700 border-yellow-200",
    ring: "ring-yellow-200 border-yellow-200",
    headerBg: "from-yellow-50/80",
  },
  assignment: {
    label: "Assigned",
    icon: Star,
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    ring: "ring-blue-200 border-blue-200",
    headerBg: "from-blue-50/80",
  },
  fallback: {
    label: "Fallback",
    icon: Layers,
    badge: "bg-slate-100 text-slate-600 border-slate-200",
    ring: "ring-slate-200 border-slate-200",
    headerBg: "from-slate-50/80",
  },
};

const auctionStatusConfig: Record<string, { label: string; dot: string }> = {
  live: { label: "Live", dot: "bg-green-500" },
  active: { label: "Active", dot: "bg-green-500" },
  closed: { label: "Closed", dot: "bg-slate-400" },
  scheduled: { label: "Scheduled", dot: "bg-orange-400" },
  ended: { label: "Ended", dot: "bg-red-400" },
};

// ─── Slot Card ───────────────────────────────────────────────────────────────

interface FeatureSlotCardProps {
  slot: FeatureSlot;
  onClick?: () => void;
  actions?: React.ReactNode;
}

export function FeatureSlotCard({ slot, onClick, actions }: FeatureSlotCardProps) {
  const resolved = slot.resolved;
  const source = resolved?.source ?? "fallback";
  const auction = resolved?.auction;
  const config = sourceConfig[source] ?? sourceConfig.fallback;
  const SourceIcon = config.icon;
  const statusCfg = auction?.status ? (auctionStatusConfig[auction.status.toLowerCase()] ?? { label: auction.status, dot: "bg-slate-400" }) : null;

  const isEmpty = !auction;

  return (
    <div
      className={`group flex flex-col rounded-xl border bg-white overflow-hidden shadow-sm transition-all duration-200 ${
        onClick ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5" : ""
      } ${!isEmpty ? config.ring : "border-dashed border-slate-200"}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") onClick(); } : undefined}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
        {auction?.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={auction.image_url}
            alt={auction.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${config.headerBg} to-white`}>
            <Gavel className="h-10 w-10 text-slate-300" />
          </div>
        )}

        {/* Overlay badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Position badge */}
        <div className="absolute left-3 top-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-xs font-bold text-white backdrop-blur-sm">
            {slot.position}
          </span>
        </div>

        {/* Auction status */}
        {statusCfg && (
          <div className="absolute right-3 top-3">
            <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur-sm">
              <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
              {statusCfg.label}
            </span>
          </div>
        )}

        {/* Source badge — bottom left on image */}
        {!isEmpty && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="outline" className={`gap-1 bg-white/90 backdrop-blur-sm text-xs font-medium ${config.badge}`}>
              <SourceIcon className="h-3 w-3" />
              {config.label}
            </Badge>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center py-4 text-center">
            <Gavel className="mb-2 h-8 w-8 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">Slot {slot.position}</p>
            <p className="text-xs text-muted-foreground">No content assigned</p>
          </div>
        ) : (
          <>
            {/* Title */}
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900">
                {auction?.title ?? "Untitled Auction"}
              </p>
            </div>

            {/* Date range */}
            {(auction?.start_datetime || auction?.end_datetime) && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <CalendarRange className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span>
                  {formatDate(auction.start_datetime) ?? "—"} → {formatDate(auction.end_datetime) ?? "ongoing"}
                </span>
              </div>
            )}

            {/* Stats row */}
            {auction?.stats && (
              <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <Gavel className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-medium">{auction.stats.bid_count}</span>
                  <span className="text-slate-400">bids</span>
                </div>
                <div className="h-3 w-px bg-slate-200" />
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-medium">
                    {formatCurrency(auction.stats.highest_bid, auction.currency) ?? "No bids yet"}
                  </span>
                </div>
              </div>
            )}
          </>
        )}

        {/* Actions slot */}
        {actions && <div className="mt-auto pt-1">{actions}</div>}
      </div>
    </div>
  );
}
