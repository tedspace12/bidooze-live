"use client";

import Image from "next/image";
import Link from "next/link";
import { AuctionStatusBadge } from "./auction-status-badge";
import { Button } from "@/components/ui/button";
import { Eye, Gavel, Calendar, PlusCircle, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Auction } from "@/features/auction/types";
import {
  getAuctionBidderCount,
  getAuctionLotCount,
  getVisibleAuctionCategories,
} from "@/features/auction/utils";

interface AuctionTableProps {
  loading: boolean;
  auctions: Auction[];
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

function AuctionEmptyState({
  hasActiveFilters,
  onClearFilters,
}: {
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}) {
  const headline = hasActiveFilters
    ? "No auctions match this dashboard view"
    : "Your auction dashboard is ready for its first event";
  const description = hasActiveFilters
    ? "The filters currently applied are hiding every auction. Broaden the status, category, search, or date range to bring items back into view."
    : "Create an auction to start tracking lots, bidders, schedules, and bidding activity from one place.";
  const highlights = hasActiveFilters
    ? [
        { label: "Review status", icon: SlidersHorizontal },
        { label: "Expand search", icon: Search },
        { label: "Widen dates", icon: Calendar },
      ]
    : [
        { label: "Catalog lots", icon: Gavel },
        { label: "Monitor activity", icon: Sparkles },
        { label: "Plan schedules", icon: Calendar },
      ];

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.06),transparent_34%),linear-gradient(135deg,#ffffff_0%,#f8fafc_48%,#eef6ff_100%)] p-6 shadow-sm sm:p-8">
      <div className="pointer-events-none absolute -right-8 top-0 h-40 w-40 rounded-full bg-amber-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -left-8 bottom-0 h-40 w-40 rounded-full bg-sky-200/30 blur-3xl" />

      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,360px)] lg:items-center">
        <div>
          <h3 className="max-w-xl text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {headline}
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            {description}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {highlights.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-2 text-xs font-medium text-slate-700 shadow-sm backdrop-blur"
              >
                <Icon className="h-3.5 w-3.5 text-slate-500" />
                {label}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {hasActiveFilters && onClearFilters && (
              <Button
                variant="outline"
                className="border-slate-300 bg-white/80 text-slate-700 hover:bg-white"
                onClick={onClearFilters}
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
            )}
            <Link href="/create-auction" className="block">
              <Button className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Auction
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm">
          <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-slate-300/80" />

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/90 bg-white/80 p-4 shadow-sm backdrop-blur">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Gavel className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-slate-900">Auction activity</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Bids, lots, and auction performance appear here once events are active.
              </p>
            </div>

            <div className="rounded-2xl border border-white/90 bg-white/80 p-4 shadow-sm backdrop-blur sm:mt-8">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                <Calendar className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-slate-900">Scheduling</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Track auction windows, preview dates, and live timing from one place.
              </p>
            </div>

            <div className="rounded-2xl border border-white/90 bg-white/80 p-4 shadow-sm backdrop-blur sm:col-span-2">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                {hasActiveFilters ? (
                  <SlidersHorizontal className="h-5 w-5" />
                ) : (
                  <Sparkles className="h-5 w-5" />
                )}
              </div>
              <p className="text-sm font-semibold text-slate-900">
                {hasActiveFilters ? "Nothing matches the current filters" : "Start with a stronger first listing"}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {hasActiveFilters
                  ? "Reset the dashboard filters to reveal auctions again, then refine from a wider result set."
                  : "A complete auction setup gives this dashboard meaningful data across bidders, lots, and financial views."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const AuctionTable: React.FC<AuctionTableProps> = ({
  loading,
  auctions,
  hasActiveFilters,
  onClearFilters,
  selectedIds,
  onSelectionChange,
}) => {
  const allSelected = auctions.length > 0 && selectedIds.length === auctions.length;

  const handleSelectAll = (checked: boolean | "indeterminate") => {
    if (checked === true) {
      onSelectionChange(auctions.map((a) => String(a.id)));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean | "indeterminate") => {
    if (checked === true) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  function formatDate(iso?: string) {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString();
  }

  function formatMoney(amount: number | undefined, currency?: string) {
    const numericAmount = Number(amount || 0);

    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "USD",
        maximumFractionDigits: 0,
      }).format(numericAmount);
    } catch {
      return `${currency || "USD"} ${numericAmount.toLocaleString()}`;
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
        <div className="space-y-3 md:hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg border p-3 space-y-3">
              <Skeleton className="h-4 w-24" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-md" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="text-slate-500 text-xs border-b">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Skeleton className="h-4 w-4" />
                </th>
                <th className="py-3 text-left">Item</th>
                <th className="text-left">Status</th>
                <th className="text-left">Total Bid</th>
                <th className="text-left">Lots</th>
                <th className="text-left">Dates</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-4 w-4" />
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-md" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </td>
                  <td>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </td>
                  <td>
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td>
                    <Skeleton className="h-4 w-8" />
                  </td>
                  <td>
                    <Skeleton className="h-3 w-40" />
                  </td>
                  <td className="text-right">
                    <Skeleton className="h-8 w-32 ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (auctions.length === 0) {
    return (
      <AuctionEmptyState
        hasActiveFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
      />
    );
  }

  return (
    <div className="bg-white rounded-xl p-3 sm:p-6 shadow-sm border">
      <div className="md:hidden space-y-3">
        {auctions.map((item) => {
          const itemId = String(item.id);
          const isSelected = selectedIds.includes(itemId);
          const lotCount = getAuctionLotCount(item);
          const bidderCount = getAuctionBidderCount(item);
          const { categories, remainingCount } = getVisibleAuctionCategories(item);

          return (
            <div key={item.id} className="rounded-lg border border-slate-200 p-3 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => handleSelectRow(itemId, checked)}
                  />
                  {item.feature_image_url ? (
                    <Image
                      src={item.feature_image_url}
                      width={44}
                      height={44}
                      alt={item.name}
                      className="rounded-md object-cover h-11 w-11 shrink-0"
                    />
                  ) : (
                    <div className="h-11 w-11 bg-slate-200 rounded-md flex items-center justify-center shrink-0">
                      <span className="text-[10px] text-slate-400">No Image</span>
                    </div>
                  )}
                   <div className="min-w-0">
                     <p className="font-medium text-slate-800 text-sm truncate">{item.name}</p>
                     <p className="text-xs text-slate-500 truncate">{item.code}</p>
                     <div className="mt-2 flex flex-wrap gap-1">
                       {categories.length > 0 ? (
                         <>
                           {categories.map((category) => (
                             <Badge key={category} variant="outline" className="text-[10px]">
                               {category}
                             </Badge>
                           ))}
                           {remainingCount > 0 && (
                             <Badge variant="outline" className="text-[10px]">
                               +{remainingCount} more
                             </Badge>
                           )}
                         </>
                       ) : (
                         <Badge variant="outline" className="text-[10px]">
                           Uncategorized
                         </Badge>
                       )}
                     </div>
                     <p className="mt-2 text-[11px] uppercase tracking-wide text-slate-500">
                       {item.bidding_type?.replace(/_/g, " ") || "auction"}
                     </p>
                   </div>
                 </div>
                 <AuctionStatusBadge status={item.status} />
               </div>

               <div className="grid grid-cols-2 gap-2 text-xs">
                 <div className="rounded-md bg-slate-50 p-2">
                   <p className="text-slate-500">Total Bid</p>
                   <p className="font-semibold text-slate-700">
                     {formatMoney(item.total_bid_amount, item.currency)}
                   </p>
                 </div>
                 <div className="rounded-md bg-slate-50 p-2">
                   <p className="text-slate-500">Lots</p>
                   <p className="font-semibold text-slate-700">{lotCount}</p>
                 </div>
                 <div className="rounded-md bg-slate-50 p-2">
                   <p className="text-slate-500">Bidders</p>
                   <p className="font-semibold text-slate-700">{bidderCount}</p>
                 </div>
                 <div className="col-span-2 rounded-md bg-slate-50 p-2">
                   <p className="text-slate-500">Dates</p>
                  <p className="text-slate-700 leading-snug">
                    {formatDate(item.auction_start_at)} - {formatDate(item.auction_end_at)}
                  </p>
                </div>
              </div>

              <Link href={`/dashboard/auction/${item.id}`} className="block">
                <Button variant="secondary" size="sm" className="w-full">
                  <Eye className="w-4 h-4 mr-2" />
                  View Dashboard
                </Button>
              </Link>
            </div>
          );
        })}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="text-slate-500 text-xs border-b">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} />
              </th>
              <th className="py-3 text-left">Item</th>
              <th className="text-left">Status</th>
              <th className="text-left">Total Bid</th>
              <th className="text-left">Lots</th>
              <th className="text-left">Dates</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {auctions.map((item) => {
              const itemId = String(item.id);
              const isSelected = selectedIds.includes(itemId);
              const lotCount = getAuctionLotCount(item);
              const bidderCount = getAuctionBidderCount(item);
              const { categories, remainingCount } = getVisibleAuctionCategories(item);

              return (
                <tr key={item.id} className="border-b hover:bg-slate-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleSelectRow(itemId, checked)}
                    />
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-3 min-w-[240px]">
                      {item.feature_image_url ? (
                        <Image
                          src={item.feature_image_url}
                          width={50}
                          height={50}
                          alt={item.name}
                          className="rounded-md object-cover h-[50px] w-[50px] shrink-0"
                        />
                      ) : (
                        <div className="w-[50px] h-[50px] bg-slate-200 rounded-md flex items-center justify-center shrink-0">
                          <span className="text-xs text-slate-400">No Image</span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 truncate">{item.name}</p>
                        <p className="text-xs text-slate-500 truncate">{item.code}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {categories.length > 0 ? (
                            <>
                              {categories.map((category) => (
                                <Badge key={category} variant="outline" className="text-[10px]">
                                  {category}
                                </Badge>
                              ))}
                              {remainingCount > 0 && (
                                <Badge variant="outline" className="text-[10px]">
                                  +{remainingCount} more
                                </Badge>
                              )}
                            </>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">
                              Uncategorized
                            </Badge>
                          )}
                        </div>
                        <p className="mt-2 text-[11px] uppercase tracking-wide text-slate-500">
                          {item.bidding_type?.replace(/_/g, " ") || "auction"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td>
                    <AuctionStatusBadge status={item.status} />
                  </td>

                  <td className="font-semibold text-slate-700 whitespace-nowrap">
                    {formatMoney(item.total_bid_amount, item.currency)}
                  </td>

                  <td>
                    <div className="space-y-1">
                      <p>{lotCount}</p>
                      <p className="text-xs text-slate-500">{bidderCount} bidders</p>
                    </div>
                  </td>

                  <td className="text-slate-600 text-xs whitespace-nowrap">
                    {formatDate(item.auction_start_at)} - {formatDate(item.auction_end_at)}
                  </td>

                  <td className="text-right">
                    <Link href={`/dashboard/auction/${item.id}`}>
                      <Button variant="secondary" size="sm" className="inline-flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        View Dashboard
                      </Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
