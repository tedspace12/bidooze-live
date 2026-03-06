"use client";

import Image from "next/image";
import Link from "next/link";
import { AuctionStatusBadge } from "./auction-status-badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { IconFolderCode } from "@tabler/icons-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Auction } from "@/features/auction/types";

interface AuctionTableProps {
  loading: boolean;
  auctions: Auction[];
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

export const AuctionTable: React.FC<AuctionTableProps> = ({
  loading,
  auctions,
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
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconFolderCode />
          </EmptyMedia>
          <EmptyTitle>No Auctions Found</EmptyTitle>
          <EmptyDescription>Try adjusting your filters.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <Button onClick={() => (window.location.href = "/create-auction")}>Create Auction</Button>
          </div>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="bg-white rounded-xl p-3 sm:p-6 shadow-sm border">
      <div className="md:hidden space-y-3">
        {auctions.map((item) => {
          const itemId = String(item.id);
          const isSelected = selectedIds.includes(itemId);

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
                  </div>
                </div>
                <AuctionStatusBadge status={item.status} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md bg-slate-50 p-2">
                  <p className="text-slate-500">Total Bid</p>
                  <p className="font-semibold text-slate-700">
                    {item.currency} {item.total_bid_amount || 0}
                  </p>
                </div>
                <div className="rounded-md bg-slate-50 p-2">
                  <p className="text-slate-500">Lots</p>
                  <p className="font-semibold text-slate-700">{item.lots?.length || 0}</p>
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
                      </div>
                    </div>
                  </td>

                  <td>
                    <AuctionStatusBadge status={item.status} />
                  </td>

                  <td className="font-semibold text-slate-700 whitespace-nowrap">
                    {item.currency} {item.total_bid_amount || 0}
                  </td>

                  <td>{item.lots?.length || 0}</td>

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
