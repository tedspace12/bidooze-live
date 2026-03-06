import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ReputationStatus, REPUTATION_CONFIG, COUNTRIES } from '@/types/bidder';

interface BidderFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  reputationFilter: ReputationStatus | 'all';
  onReputationChange: (value: ReputationStatus | 'all') => void;
  countryFilter: string;
  onCountryChange: (value: string) => void;
  showBlockedOnly: boolean;
  onShowBlockedChange: (value: boolean) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function BidderFilters({
  searchQuery,
  onSearchChange,
  reputationFilter,
  onReputationChange,
  countryFilter,
  onCountryChange,
  showBlockedOnly,
  onShowBlockedChange,
  onClearFilters,
  hasActiveFilters,
}: BidderFiltersProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-sm sm:p-4">
      <div className="flex flex-col gap-3">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10 border-input bg-background pl-10 text-base md:text-sm"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Filters</span>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:flex lg:flex-wrap lg:items-center">
            <Select
              value={reputationFilter}
              onValueChange={(value) => onReputationChange(value as ReputationStatus | 'all')}
            >
              <SelectTrigger className="h-10 w-full border-input bg-background lg:w-[180px]">
                <SelectValue placeholder="Reputation" />
              </SelectTrigger>
              <SelectContent className="z-50 border-border bg-popover">
                <SelectItem value="all">All Reputations</SelectItem>
                {Object.entries(REPUTATION_CONFIG).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={countryFilter} onValueChange={onCountryChange}>
              <SelectTrigger className="h-10 w-full border-input bg-background lg:w-[180px]">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent className="z-50 border-border bg-popover">
                <SelectItem value="all">All Countries</SelectItem>
                {COUNTRIES.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="col-span-2 flex h-10 items-center gap-2 rounded-md border border-input bg-background px-3 lg:col-auto">
              <Switch
                id="blocked-only"
                checked={showBlockedOnly}
                onCheckedChange={onShowBlockedChange}
              />
              <Label htmlFor="blocked-only" className="cursor-pointer text-sm text-foreground">
                Blocked only
              </Label>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="col-span-2 h-10 w-full text-muted-foreground hover:text-foreground lg:w-auto"
              >
                <X className="mr-1 h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
