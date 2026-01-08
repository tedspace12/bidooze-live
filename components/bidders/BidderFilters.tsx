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
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="relative flex-1 lg:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-background border-input"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Filters:</span>
          </div>

          {/* Reputation Filter */}
          <Select
            value={reputationFilter}
            onValueChange={(value) => onReputationChange(value as ReputationStatus | 'all')}
          >
            <SelectTrigger className="w-[140px] bg-background border-input">
              <SelectValue placeholder="Reputation" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border z-50">
              <SelectItem value="all">All Reputations</SelectItem>
              {Object.entries(REPUTATION_CONFIG).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Country Filter */}
          <Select value={countryFilter} onValueChange={onCountryChange}>
            <SelectTrigger className="w-40 bg-background border-input">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border z-50">
              <SelectItem value="all">All Countries</SelectItem>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Blocked Only Toggle */}
          <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2">
            <Switch
              id="blocked-only"
              checked={showBlockedOnly}
              onCheckedChange={onShowBlockedChange}
            />
            <Label htmlFor="blocked-only" className="text-sm cursor-pointer text-foreground">
              Blocked only
            </Label>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="mr-1 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
