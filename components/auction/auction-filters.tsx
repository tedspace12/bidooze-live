"use client";
import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { DateRange } from "react-day-picker";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangeFilter } from "./date-range-filter";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export type AuctionFilterState = {
  status?: string;
  category?: string;
  dateRange?: DateRange;
  search?: string;
};

interface AuctionFiltersProps {
  setFilters: Dispatch<SetStateAction<AuctionFilterState>>;
}

export function AuctionFilters({ setFilters }: AuctionFiltersProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const handleClearDateRange = () => {
    setDateRange(undefined);
    setFilters((prev) => ({
      ...prev,
      dateRange: undefined,
    }));
  };

  return (
    <div className="w-full bg-white p-3 sm:p-4 rounded-xl shadow-sm border mb-4 sm:mb-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Search Bar */}
          <div className="order-1 col-span-2 sm:col-span-4 lg:order-4 lg:col-span-1 space-y-1.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Search
            </p>
            <Input
              placeholder="Search auctions..."
              className="bg-slate-50 text-base md:text-sm"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setFilters((prev) => ({ ...prev, search: e.target.value }));
              }}
            />
          </div>

        {/* Status Filter */}
        <div className="order-2 lg:order-1 col-span-1 lg:col-span-1 space-y-1.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Status
          </p>
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value);
              setFilters((prev) => ({ ...prev, status: value === "all" ? undefined : value }));
            }}
          >
            <SelectTrigger className="text-base md:text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {/* Added "All" option with an empty string value to clear the filter */}
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        <div className="order-3 lg:order-2 col-span-1 lg:col-span-1 space-y-1.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Category
          </p>
          <Select
            value={category}
            onValueChange={(value) => {
              setCategory(value);
              setFilters((prev) => ({ ...prev, category: value === "all" ? undefined : value }));
            }}
          >
            <SelectTrigger className="text-base md:text-sm">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {/* Added "All" option with an empty string value to clear the filter */}
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="watches">Watches</SelectItem>
              <SelectItem value="cars">Cars</SelectItem>
              <SelectItem value="art">Art</SelectItem>
              <SelectItem value="fashion">Fashion</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter with Clear Button */}
        <div className="order-4 lg:order-3 col-span-2 sm:col-span-4 lg:col-span-1 space-y-1.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Date range
          </p>
          <div className="relative">
            <DateRangeFilter
              value={dateRange}
              onChange={(range) => {
                setDateRange(range);
                setFilters((prev) => ({
                  ...prev,
                  dateRange: range,
                }));
              }}
            />
            {dateRange && (dateRange.from || dateRange.to) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearDateRange}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-500 bg-white hover:text-red-500"
                aria-label="Clear Date Range"
              >
                <XCircle size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
