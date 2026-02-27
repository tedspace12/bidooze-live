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
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const handleClearDateRange = () => {
    setDateRange(undefined);
    setFilters((prev) => ({
      ...prev,
      dateRange: undefined,
    }));
  };

  return (
    <div className="w-full bg-white p-4 rounded-xl shadow-sm border mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Status Filter */}
        <Select onValueChange={(value) =>
          setFilters((prev) => ({ ...prev, status: value === "all" ? undefined : value}))
        }>
          <SelectTrigger>
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

        {/* Category */}
        <Select onValueChange={(value) =>
          setFilters((prev) => ({ ...prev, category: value === "all" ? undefined : value }))
        }>
          <SelectTrigger>
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

        {/* Date Range Filter with Clear Button */}
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
              className="absolute right-0 top-0 h-full w-10 text-gray-500 bg-white hover:text-red-500"
              aria-label="Clear Date Range"
            >
              <XCircle size={16} />
            </Button>
          )}
        </div>


        {/* Search Bar */}
        <Input placeholder="Search auctions..." className="bg-slate-50"
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, search: e.target.value }))
          }
        />

      </div>
    </div>
  );
}
