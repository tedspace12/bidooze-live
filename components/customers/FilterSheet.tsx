import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type CustomerFilters = {
  status?: "active" | "inactive" | "suspended";
  dateFrom?: string;
  dateTo?: string;
};

interface FilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: CustomerFilters;
  onFilterChange: (filters: CustomerFilters) => void;
}

export function FilterSheet({
  open,
  onOpenChange,
  filters,
  onFilterChange,
}: FilterSheetProps) {
  const handleReset = () => {
    onFilterChange({
      status: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-sm p-4 sm:w-96">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 py-4">
          {/* Status Filter */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Status</h3>
            <Select
              value={filters.status ?? "all"}
              onValueChange={(value) =>
                onFilterChange({
                  ...filters,
                  status:
                    value === "all" ? undefined : (value as "active" | "inactive" | "suspended"),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-3 border-t border-border pt-6">
            <h3 className="font-semibold text-foreground">Join Date Range</h3>
            <div className="space-y-2">
              <div>
                <Label htmlFor="date-from" className="text-xs text-muted-foreground">
                  From
                </Label>
                <Input
                  id="date-from"
                  type="date"
                  value={filters.dateFrom || ""}
                  onChange={(e) =>
                    onFilterChange({ ...filters, dateFrom: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="date-to" className="text-xs text-muted-foreground">
                  To
                </Label>
                <Input
                  id="date-to"
                  type="date"
                  value={filters.dateTo || ""}
                  onChange={(e) =>
                    onFilterChange({ ...filters, dateTo: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 border-t border-border pt-6 sm:flex-row">
            <Button variant="outline" onClick={handleReset} className="flex-1">
              Reset
            </Button>
            <Button onClick={() => onOpenChange(false)} className="flex-1">
              Apply
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
