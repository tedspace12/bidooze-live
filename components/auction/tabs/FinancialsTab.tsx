import { useMemo, useState } from "react";
import { DollarSign, Receipt, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { AuctionOverviewResponse } from "@/features/auction/types";
import { useAuctionFinancials } from "@/features/auction/hooks/useAuctionFinancials";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FinancialsTabProps {
  auction: AuctionOverviewResponse;
}

interface FinancialSettingsForm {
  commission_percentage: number;
  buyer_premium_percentage: number;
  buyer_tax_percentage: number;
  seller_tax_percentage: number;
  buyer_lot_charge_1: number;
  buyer_lot_charge_2: number;
  minimum_bid_amount: number;
  tax_exempt_all: boolean;
}

const DEFAULT_FINANCIAL_FORM_DATA: FinancialSettingsForm = {
  commission_percentage: 0,
  buyer_premium_percentage: 0,
  buyer_tax_percentage: 0,
  seller_tax_percentage: 0,
  buyer_lot_charge_1: 0,
  buyer_lot_charge_2: 0,
  minimum_bid_amount: 0,
  tax_exempt_all: false,
};

interface LotFinancialRow {
  lot_id: number | string;
  lot_number: string | number;
  title: string;
  final_price?: number | string | null;
  commission?: number | string | null;
  buyer_premium?: number | string | null;
  seller_payout?: number | string | null;
  seller_name?: string | null;
}

interface FinancialSummary {
  total_revenue: number;
  total_commission: number;
  total_payouts: number;
}

const extractNestedObject = (payload: unknown): Record<string, unknown> => {
  if (!payload || typeof payload !== "object") return {};
  const raw = payload as Record<string, unknown>;
  const nested = raw["data"];
  if (nested && typeof nested === "object") {
    return nested as Record<string, unknown>;
  }
  return raw;
};

const toNumber = (value: unknown, fallback = 0): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

function formatCurrency(amount: number, currency: AuctionOverviewResponse["auction"]["currency"]) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function FinancialsTab({ auction }: FinancialsTabProps) {
  const { summary, lots, settings, updateSettings } = useAuctionFinancials(auction.auction.id);
  const [draft, setDraft] = useState<Partial<FinancialSettingsForm>>({});

  const remoteFormData = useMemo<FinancialSettingsForm>(() => {
    const data = extractNestedObject(settings.data) as Partial<FinancialSettingsForm>;
    return {
      ...DEFAULT_FINANCIAL_FORM_DATA,
      ...data,
      tax_exempt_all: !!data.tax_exempt_all,
    };
  }, [settings.data]);

  const formData = useMemo<FinancialSettingsForm>(
    () => ({ ...remoteFormData, ...draft }),
    [remoteFormData, draft]
  );

  const handleChange = <K extends keyof FinancialSettingsForm>(field: K, value: FinancialSettingsForm[K]) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync(formData);
      setDraft({});
      toast.success("Financial settings updated.");
    } catch (error: unknown) {
      toast.error("Failed to update financial settings", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  const summaryData = useMemo<FinancialSummary>(() => {
    const raw = extractNestedObject(summary.data);
    return {
      total_revenue: toNumber(raw["total_revenue"]),
      total_commission: toNumber(raw["total_commission"]),
      total_payouts: toNumber(raw["total_payouts"]),
    };
  }, [summary.data]);

  const lotRows = useMemo<LotFinancialRow[]>(() => {
    const raw = extractNestedObject(lots.data);
    const rows = raw["lots"];
    return Array.isArray(rows) ? (rows as LotFinancialRow[]) : [];
  }, [lots.data]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold tracking-tight">Financial Management</h2>
      <p className="text-muted-foreground">
        Track auction revenue, commissions, and per-lot financials.
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summaryData.total_revenue || 0, auction.auction.currency)}
            </div>
            <p className="text-xs text-muted-foreground">From sold lots</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summaryData.total_commission || 0, auction.auction.currency)}
            </div>
            <p className="text-xs text-muted-foreground">Auctioneer earnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summaryData.total_payouts || 0, auction.auction.currency)}
            </div>
            <p className="text-xs text-muted-foreground">Consignor payouts</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Financial Settings</CardTitle>
          <Button size="sm" onClick={handleSave} disabled={updateSettings.isPending}>
            {updateSettings.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Commission (%)</Label>
            <Input
              type="number"
              value={formData.commission_percentage}
              onChange={(e) => handleChange("commission_percentage", Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Buyer Premium (%)</Label>
            <Input
              type="number"
              value={formData.buyer_premium_percentage}
              onChange={(e) => handleChange("buyer_premium_percentage", Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Buyer Tax (%)</Label>
            <Input
              type="number"
              value={formData.buyer_tax_percentage}
              onChange={(e) => handleChange("buyer_tax_percentage", Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Seller Tax (%)</Label>
            <Input
              type="number"
              value={formData.seller_tax_percentage}
              onChange={(e) => handleChange("seller_tax_percentage", Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Buyer Lot Charge 1</Label>
            <Input
              type="number"
              value={formData.buyer_lot_charge_1}
              onChange={(e) => handleChange("buyer_lot_charge_1", Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Buyer Lot Charge 2</Label>
            <Input
              type="number"
              value={formData.buyer_lot_charge_2}
              onChange={(e) => handleChange("buyer_lot_charge_2", Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Minimum Bid Amount</Label>
            <Input
              type="number"
              value={formData.minimum_bid_amount}
              onChange={(e) => handleChange("minimum_bid_amount", Number(e.target.value))}
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg md:col-span-2">
            <div>
              <Label className="font-body font-medium">Tax Exempt All</Label>
              <p className="text-xs text-muted-foreground">Apply tax exemption to all lots</p>
            </div>
            <Switch
              checked={formData.tax_exempt_all}
              onCheckedChange={(value) => handleChange("tax_exempt_all", value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lot Financials</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                  <TableHead>Lot #</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Final Price</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Buyer Premium</TableHead>
                  <TableHead>Seller Payout</TableHead>
                  <TableHead>Seller</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lotRows.length > 0 ? (
                  lotRows.map((lot) => (
                    <TableRow key={lot.lot_id}>
                      <TableCell>{lot.lot_number}</TableCell>
                      <TableCell>{lot.title}</TableCell>
                      <TableCell>{formatCurrency(Number(lot.final_price || 0), auction.auction.currency)}</TableCell>
                      <TableCell>{formatCurrency(Number(lot.commission || 0), auction.auction.currency)}</TableCell>
                      <TableCell>{formatCurrency(Number(lot.buyer_premium || 0), auction.auction.currency)}</TableCell>
                      <TableCell>{formatCurrency(Number(lot.seller_payout || 0), auction.auction.currency)}</TableCell>
                      <TableCell>{lot.seller_name || "-"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No financials available yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
