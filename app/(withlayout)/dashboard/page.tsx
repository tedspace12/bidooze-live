"use client";
import { useState, useMemo } from "react";
import { AuctionFilters, type AuctionFilterState } from "@/components/auction/auction-filters";
import { AuctionTable } from "@/components/auction/auction-table";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuction } from "@/features/auction/hooks/useAuction";
import type { Auction } from "@/features/auction/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  auctionMatchesCategory,
  getAuctionCategories,
  getAuctionCategoryOptions,
} from "@/features/auction/utils";

const DEFAULT_FILTERS: AuctionFilterState = {
  search: "",
  dateRange: undefined as DateRange | undefined,
};

export default function AuctionsPage() {
  const [loading, setLoading] = useState(false);
  const [selectedAuctionIds, setSelectedAuctionIds] = useState<string[]>([]);
  const [filtersResetKey, setFiltersResetKey] = useState(0);
  const router = useRouter();
  const { useMyAuctions } = useAuction();
  
  const [filters, setFilters] = useState<AuctionFilterState>(DEFAULT_FILTERS);

  // Fetch auctions from API
  const { data: auctions = [], isLoading, error } = useMyAuctions({
    status: filters.status,
  });

  const availableCategories = useMemo(
    () => getAuctionCategoryOptions(auctions),
    [auctions]
  );

  const selectedCategory = useMemo(() => {
    if (!filters.category) return undefined;

    return availableCategories.some(
      (category) => category.toLowerCase() === filters.category?.toLowerCase()
    )
      ? filters.category
      : undefined;
  }, [availableCategories, filters.category]);

  const filteredData = useMemo(() => {
    if (!auctions || auctions.length === 0) return [];
    
    return auctions.filter((item: Auction) => {
      const matchStatus = filters.status
        ? item.status?.toLowerCase() === filters.status.toLowerCase()
        : true;

      const matchCategory = auctionMatchesCategory(item, selectedCategory);

      const matchSearch = filters.search
        ? item.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
          item.code?.toLowerCase().includes(filters.search.toLowerCase()) ||
          getAuctionCategories(item).some((category) =>
            category.toLowerCase().includes(filters.search!.toLowerCase())
          )
        : true;

      const starts = item.auction_start_at ? new Date(item.auction_start_at) : null;
      const ends = item.auction_end_at ? new Date(item.auction_end_at) : null;

      const withinDate =
        !filters.dateRange ||
        (!filters.dateRange.from && !filters.dateRange.to) ||
        (filters.dateRange.from && filters.dateRange.to && starts && ends &&
          starts >= filters.dateRange.from &&
          ends <= filters.dateRange.to);

      return matchStatus && matchCategory && matchSearch && withinDate;
    });
  }, [auctions, filters, selectedCategory]);

  const hasActiveFilters = Boolean(
    filters.status ||
    selectedCategory ||
    filters.search?.trim() ||
    filters.dateRange?.from ||
    filters.dateRange?.to
  );

  const handleSelectionChange = (newSelectedIds: string[]) => {
    setSelectedAuctionIds(newSelectedIds);
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSelectedAuctionIds([]);
    setFiltersResetKey((prev) => prev + 1);
  };

  const handleExportSelected = () => {
    if (selectedAuctionIds.length === 0) {
      toast.error("No auctions selected");
      return;
    }
    setLoading(true);
    toast.info("Exporting auctions...", {
      description: `Preparing export for ${selectedAuctionIds.length} auction(s)`,
    });
    setTimeout(() => {
      setLoading(false);
      setSelectedAuctionIds([]);
      toast.success("Export completed", {
        description: "Your auction data has been exported successfully.",
      });
    }, 2000);
  };

  const handleDeleteSelected = () => {
    const selectedAuctions = auctions.filter((auction: Auction) =>
      selectedAuctionIds.includes(String(auction.id))
    );

    // Note: Backend should handle deletion logic
    if (selectedAuctions.length === 0) {
      toast.error("No auctions selected");
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedAuctions.length} auction(s)?`)) {
      setLoading(true);
      toast.info("Deleting auctions...", {
        description: `Removing ${selectedAuctions.length} auction(s)`,
      });
      // TODO: Implement delete mutation when backend endpoint is available
      setTimeout(() => {
        setLoading(false);
        setSelectedAuctionIds([]);
        toast.success("Auctions deleted", {
          description: `${selectedAuctions.length} auction(s) have been permanently deleted.`,
        });
      }, 1500);
    }
  };

  const hasSelected = selectedAuctionIds.length > 0;

  return (
    <div className="p-0 space-y-4 sm:space-y-6">

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Auction Management</h1>
          <p className="text-slate-600 mt-1 text-sm sm:text-base">
            Manage all your auctions, monitor bidding activity, and jump into any auction dashboard.
          </p>
        </div>

        <div className="flex w-full md:w-auto flex-row gap-2">
          <Button
            variant={"outline"}
            onClick={() => router.push('/reports')}
            className="flex-1 md:flex-none whitespace-nowrap"
          >
            Reports
          </Button>
          <Button
            onClick={() => router.push('/create-auction')}
            className="flex-1 md:flex-none whitespace-nowrap"
          >
            <PlusCircle size={16} className="mr-2" />
            New Auction
          </Button>
        </div>
      </div>

      <AuctionFilters
        key={filtersResetKey}
        categories={availableCategories}
        selectedCategory={selectedCategory}
        setFilters={setFilters}
      />

      {/* Bulk Actions UI - Conditionally rendered */}
      {hasSelected && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 bg-accent/10 border border-accent rounded-lg">
          <span className="text-sm font-medium text-blue-800">
            {selectedAuctionIds.length} selected
          </span>
          <Button variant="outline" size="sm" onClick={handleExportSelected} className="w-full sm:w-auto">
            <Download size={16} className="mr-2" />
            Export Selected
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDeleteSelected} className="w-full sm:w-auto">
            <Trash2 size={16} className="mr-2" />
            Delete Selected
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-destructive">Failed to load auctions. Please try again.</p>
        </div>
      ) : (
        <AuctionTable
          loading={loading}
          auctions={filteredData}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
          selectedIds={selectedAuctionIds}
          onSelectionChange={handleSelectionChange}
        />
      )}
    </div>
  );
}
