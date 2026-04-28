"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuction } from "@/features/auction/hooks/useAuction";
import type { Auction } from "@/features/auction/types";
import { Search, Filter } from "lucide-react";
import { auctionService } from "@/features/auction/services/auctionService";

export type AuctionPickerOption = {
  value: number | string;
  label: string;
};

const getAuctionStatusForPicker = (auction: Auction, nowMs: number): "Live" | "Upcoming" | "Ended" => {
  const startMs = new Date(auction.auction_start_at).getTime();
  const endMs = new Date(auction.auction_end_at).getTime();
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return "Ended";
  if (nowMs < startMs) return "Upcoming";
  if (nowMs > endMs) return "Ended";
  return "Live";
};

const toTitle = (auction: Auction) => auction.name ?? `Auction ${auction.id}`;

export function AuctionPicker({
  auctioneerOptions,
  selectedAuctionId,
  onSelectAuction,
  disabled,
}: {
  auctioneerOptions: AuctionPickerOption[];
  selectedAuctionId?: number | string;
  onSelectAuction: (auction: Auction) => void;
  disabled?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [auctioneerFilter, setAuctioneerFilter] = useState<number | string | "all">("all");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const { useAuctions } = useAuction();
  const auctionQueryParams = {
    status: undefined,
    search: search.trim() ? search.trim() : undefined,
    page,
    per_page: perPage,
    // Some backends allow server-side filtering by auctioneer; we keep it as an "optional" param.
    auctioneer_id: auctioneerFilter === "all" ? undefined : auctioneerFilter,
  } as unknown as Parameters<typeof auctionService.getAuctions>[0];

  const { data: auctions = [], isLoading } = useAuctions(auctionQueryParams);

  const nowMs = Date.now();

  const processed = useMemo(() => {
    return (auctions || []).map((a) => {
      const status = getAuctionStatusForPicker(a, nowMs);
      return { auction: a, status, isExpired: status === "Ended" };
    });
  }, [auctions, nowMs]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search auctions by title..."
            className="pl-10"
            value={search}
            disabled={disabled}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1 bg-background/60">
            <Filter className="h-3.5 w-3.5" />
            Auctioneer
          </Badge>
          <select
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            disabled={disabled}
            value={auctioneerFilter}
            onChange={(e) => {
              setAuctioneerFilter(e.target.value === "all" ? "all" : e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All auctioneers</option>
            {auctioneerOptions.map((o) => (
              <option key={String(o.value)} value={String(o.value)}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : processed.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">No auctions found.</div>
        ) : (
          <div className="space-y-2">
            {processed.map(({ auction, status, isExpired }) => {
              const active = selectedAuctionId != null && String(selectedAuctionId) === String(auction.id);
              return (
                <div
                  key={String(auction.id)}
                  className={[
                    "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                    active ? "border-primary bg-primary/5" : "hover:bg-background/60",
                    isExpired ? "opacity-60" : "",
                  ].join(" ")}
                >
                  {auction.feature_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={auction.feature_image_url}
                      alt={toTitle(auction)}
                      className="h-12 w-12 rounded-lg border bg-slate-50 object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg border bg-slate-50" />
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-900">{toTitle(auction)}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {new Date(auction.auction_start_at).toLocaleDateString(undefined, { month: "short", day: "2-digit" })}{" "}
                          -{" "}
                          {new Date(auction.auction_end_at).toLocaleDateString(undefined, { month: "short", day: "2-digit" })}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          status === "Live"
                            ? "border-green-200 bg-green-50 text-green-700"
                            : status === "Upcoming"
                              ? "border-orange-200 bg-orange-50 text-orange-700"
                              : "border-red-200 bg-red-50 text-red-700"
                        }
                      >
                        {status}
                      </Badge>
                    </div>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    disabled={disabled || isExpired}
                    variant={active ? "default" : "outline"}
                    className={isExpired ? "cursor-not-allowed" : undefined}
                    onClick={() => {
                      if (!isExpired) onSelectAuction(auction);
                    }}
                  >
                    {active ? "Selected" : isExpired ? "Ended" : "Select"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">Page {page}</div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" disabled={disabled || page <= 1} onClick={() => setPage((p) => p - 1)}>
              Prev
            </Button>
            <Button type="button" variant="outline" size="sm" disabled={disabled || processed.length < perPage} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

