"use client";
import Image from "next/image";
import Link from "next/link";
import { AuctionStatusBadge } from "./auction-status-badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { IconFolderCode } from "@tabler/icons-react"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Auction } from "@/data";

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
  const someSelected = selectedIds.length > 0 && selectedIds.length < auctions.length;

  const selectAllState: boolean | "indeterminate" =
  allSelected ? true : someSelected ? "indeterminate" : false;


  const handleSelectAll = (checked: boolean | "indeterminate") => {
    if (checked === true) {
      onSelectionChange(auctions.map(a => a.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean | "indeterminate") => {
    if (checked === true) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString();
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <table className="w-full text-sm">
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
          <EmptyDescription>
            Try adjusting your filters.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <Button onClick={() => window.location.href = "/create-auction"}>Create Auction</Button>
          </div>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-slate-500 text-xs border-b">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                />
            </th>
            <th className="py-3 text-left">Item</th>
            <th className="text-left">Status</th>
            <th className="text-left">Total Bid</th>
            <th className="text-left">Lots</th>
            <th className="text-left">Dates</th>
          </tr>
        </thead>

        <tbody>
          {auctions.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <tr
                key={item.id}
                className="border-b hover:bg-slate-50 transition"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => handleSelectRow(item.id, checked)}
                  />
                </td>
                <td className="py-4 flex items-center gap-3">
                  <Image
                    src={item.banner}
                    width={50}
                    height={50}
                    alt={item.title}
                    className="rounded-md object-cover"
                  />
                  <div>
                    <p className="font-medium text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.category}</p>
                  </div>
                </td>

                <td>
                  <AuctionStatusBadge status={item.status} />
                </td>

                <td className="font-semibold text-slate-700">
                  {item.totalBid}
                </td>

                <td>{item.lots.length}</td>

                <td className="text-slate-600 text-xs">
                  {formatDate(item.startDate)} → {formatDate(item.endDate)}
                </td>

                <td className="text-right">
                  <Link href={`/dashboard/auction/${item.id}`}>
                    <Button variant="secondary" size="sm" className="flex items-center gap-1">
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
  );
}
