import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: {
    status: string[];
    kycStatus: string[];
    highValue: boolean;
    dateFrom?: string;
    dateTo?: string;
  };
  onFilterChange: (filters: any) => void;
}

export function FilterSheet({
  open,
  onOpenChange,
  filters,
  onFilterChange,
}: FilterSheetProps) {
  const handleStatusChange = (status: string, checked: boolean) => {
    const newStatus = checked
      ? [...filters.status, status]
      : filters.status.filter((s) => s !== status);
    onFilterChange({ ...filters, status: newStatus });
  };

  const handleKycStatusChange = (status: string, checked: boolean) => {
    const newKycStatus = checked
      ? [...filters.kycStatus, status]
      : filters.kycStatus.filter((s) => s !== status);
    onFilterChange({ ...filters, kycStatus: newKycStatus });
  };

  const handleReset = () => {
    onFilterChange({
      status: [],
      kycStatus: [],
      highValue: false,
      dateFrom: undefined,
      dateTo: undefined,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-80 p-4">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 py-4">
          {/* Status Filter */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Status</h3>
            <div className="space-y-2">
              {["verified", "pending", "suspended"].map((status) => (
                <div key={status} className="flex items-center gap-2">
                  <Checkbox
                    id={`status-${status}`}
                    checked={filters.status.includes(status)}
                    onCheckedChange={(checked) =>
                      handleStatusChange(status, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`status-${status}`}
                    className="capitalize cursor-pointer"
                  >
                    {status}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* KYC Status Filter */}
          <div className="space-y-3 border-t border-border pt-6">
            <h3 className="font-semibold text-foreground">Verification State</h3>
            <div className="space-y-2">
              {["complete", "incomplete", "pending"].map((status) => (
                <div key={status} className="flex items-center gap-2">
                  <Checkbox
                    id={`kyc-${status}`}
                    checked={filters.kycStatus.includes(status)}
                    onCheckedChange={(checked) =>
                      handleKycStatusChange(status, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`kyc-${status}`}
                    className="capitalize cursor-pointer"
                  >
                    {status}
                  </Label>
                </div>
              ))}
            </div>
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

          {/* High Value Filter */}
          <div className="space-y-3 border-t border-border pt-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="high-value"
                checked={filters.highValue}
                onCheckedChange={(checked) =>
                  onFilterChange({ ...filters, highValue: checked as boolean })
                }
              />
              <Label htmlFor="high-value" className="cursor-pointer">
                High-Value Consignors Only
              </Label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 border-t border-border pt-6">
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
