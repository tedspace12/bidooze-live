import { useMemo, useState } from "react";
import { DollarSign, Receipt, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { AuctionOverviewResponse } from "@/features/auction/types";
import { useAuctionFinancials } from "@/features/auction/hooks/useAuctionFinancials";
import { Badge } from "@/components/ui/badge";
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
  status?: string | null;
  is_sold?: boolean | null;
  reserve_met?: boolean | null;
  bid_count?: number | string | null;
  hammer_price?: number | string | null;
  final_price?: number | string | null;
  commission?: number | string | null;
  commission_rate?: number | string | null;
  buyer_premium?: number | string | null;
  buyer_premium_rate?: number | string | null;
  buyer_tax_rate?: number | string | null;
  seller_tax_rate?: number | string | null;
  buyer_tax?: number | string | null;
  seller_tax?: number | string | null;
  lot_fees?: number | string | null;
  buyer_adjustments?: number | string | null;
  seller_adjustments?: number | string | null;
  total_deductions?: number | string | null;
  buyer_total?: number | string | null;
  buyer_name?: string | null;
  invoice_id?: number | string | null;
  invoice_number?: string | null;
  invoice_status?: string | null;
  payout_id?: number | string | null;
  payout_reference?: string | null;
  payout_status?: string | null;
  consignor_payout?: number | string | null;
  consignor_name?: string | null;
}

interface FinancialSummary {
  total_revenue: number;
  currency: string;
  auction_status: string;
  commission_rate: number;
  buyer_premium_rate: number;
  buyer_tax_rate: number;
  seller_tax_rate: number;
  total_commission: number;
  total_buyer_premium: number;
  total_buyer_tax: number;
  total_lot_fees: number;
  total_handling: number;
  total_payouts: number;
  paid_invoices_total: number;
  outstanding_invoices_total: number;
  pending_invoices_count: number;
  ready_payouts_count: number;
  held_payouts_count: number;
  sold_lots_count: number;
  passed_lots_count: number;
  has_commission_overrides: boolean;
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

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const toText = (value: unknown, fallback = ""): string => {
  if (typeof value === "string") return value.trim() || fallback;
  if (typeof value === "number") return String(value);
  return fallback;
};

const formatLabel = (value: string) =>
  value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

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
      currency: toText(raw["currency"], auction.auction.currency),
      auction_status: toText(raw["auction_status"], auction.auction.status),
      commission_rate: toNumber(raw["commission_rate"]),
      buyer_premium_rate: toNumber(raw["buyer_premium_rate"]),
      buyer_tax_rate: toNumber(raw["buyer_tax_rate"]),
      seller_tax_rate: toNumber(raw["seller_tax_rate"]),
      total_commission: toNumber(raw["total_commission"]),
      total_buyer_premium: toNumber(raw["total_buyer_premium"]),
      total_buyer_tax: toNumber(raw["total_buyer_tax"]),
      total_lot_fees: toNumber(raw["total_lot_fees"]),
      total_handling: toNumber(raw["total_handling"]),
      total_payouts: toNumber(raw["total_payouts"]),
      paid_invoices_total: toNumber(raw["paid_invoices_total"]),
      outstanding_invoices_total: toNumber(raw["outstanding_invoices_total"]),
      pending_invoices_count: toNumber(raw["pending_invoices_count"]),
      ready_payouts_count: toNumber(raw["ready_payouts_count"]),
      held_payouts_count: toNumber(raw["held_payouts_count"]),
      sold_lots_count: toNumber(raw["sold_lots_count"]),
      passed_lots_count: toNumber(raw["passed_lots_count"]),
      has_commission_overrides: !!raw["has_commission_overrides"],
    };
  }, [auction.auction.currency, auction.auction.status, summary.data]);

  const lotRows = useMemo<LotFinancialRow[]>(() => {
    const raw = extractNestedObject(lots.data);
    const rows = raw["lots"];
    return Array.isArray(rows) ? (rows as LotFinancialRow[]) : [];
  }, [lots.data]);

  const displayCurrency = summaryData.currency || auction.auction.currency;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold tracking-tight">Financial Management</h2>
      <p className="text-muted-foreground">
        Track auction revenue, commissions, and per-lot financials.
      </p>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summaryData.total_revenue || 0, displayCurrency)}
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
              {formatCurrency(summaryData.total_commission || 0, displayCurrency)}
            </div>
            <p className="text-xs text-muted-foreground">Seller-side commission deductions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buyer Premium</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summaryData.total_buyer_premium || 0, displayCurrency)}
            </div>
            <p className="text-xs text-muted-foreground">Buyer-side premium collected</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Invoices</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summaryData.outstanding_invoices_total || 0, displayCurrency)}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending {summaryData.pending_invoices_count} invoice{summaryData.pending_invoices_count === 1 ? "" : "s"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summaryData.total_payouts || 0, displayCurrency)}
            </div>
            <p className="text-xs text-muted-foreground">Consignor payouts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready Payouts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.ready_payouts_count}</div>
            <p className="text-xs text-muted-foreground">
              Held {summaryData.held_payouts_count} payout{summaryData.held_payouts_count === 1 ? "" : "s"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Settlement Snapshot</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border bg-secondary/20 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Auction status</p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline">{formatLabel(summaryData.auction_status)}</Badge>
              {summaryData.has_commission_overrides ? <Badge variant="secondary">Overrides</Badge> : null}
            </div>
          </div>
          <div className="rounded-lg border bg-secondary/20 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Rates</p>
            <p className="mt-2 text-sm font-medium">
              Commission {summaryData.commission_rate}% | Buyer premium {summaryData.buyer_premium_rate}%
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Buyer tax {summaryData.buyer_tax_rate}% | Seller tax {summaryData.seller_tax_rate}%
            </p>
          </div>
          <div className="rounded-lg border bg-secondary/20 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Invoice cash flow</p>
            <p className="mt-2 text-sm font-medium">
              Paid {formatCurrency(summaryData.paid_invoices_total, displayCurrency)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Outstanding {formatCurrency(summaryData.outstanding_invoices_total, displayCurrency)}
            </p>
          </div>
          <div className="rounded-lg border bg-secondary/20 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Lot outcomes</p>
            <p className="mt-2 text-sm font-medium">
              Sold {summaryData.sold_lots_count} | Passed {summaryData.passed_lots_count}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Buyer tax {formatCurrency(summaryData.total_buyer_tax, displayCurrency)} | Fees {formatCurrency(summaryData.total_lot_fees + summaryData.total_handling, displayCurrency)}
            </p>
          </div>
        </CardContent>
      </Card>

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
          {lotRows.length > 0 ? (
            <>
              <div className="space-y-3 md:hidden">
                {lotRows.map((lot) => (
                  <div key={lot.lot_id} className="rounded-xl border border-border/70 bg-background p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">Lot {lot.lot_number}</p>
                        <p className="text-xs text-muted-foreground">{lot.title}</p>
                      </div>
                      <Badge variant="outline">
                        {formatLabel(toText(lot.status, lot.is_sold ? "sold" : "pending"))}
                      </Badge>
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Buyer side</p>
                        <p className="text-sm text-foreground">
                          Hammer {formatCurrency(toNumber(lot.hammer_price ?? lot.final_price), displayCurrency)}
                        </p>
                        <p className="text-sm text-foreground">
                          Buyer total {formatCurrency(toNumber(lot.buyer_total ?? lot.final_price), displayCurrency)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Premium {formatCurrency(toNumber(lot.buyer_premium), displayCurrency)} | Tax {formatCurrency(toNumber(lot.buyer_tax), displayCurrency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Seller side</p>
                        <p className="text-sm text-foreground">
                          Deductions {formatCurrency(toNumber(lot.total_deductions), displayCurrency)}
                        </p>
                        <p className="text-sm text-foreground">
                          Payout {formatCurrency(toNumber(lot.consignor_payout), displayCurrency)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {toText(lot.consignor_name, "-")} · {toNumber(lot.bid_count)} bids
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Buyer</p>
                        <p className="text-sm font-medium text-foreground">{toText(lot.buyer_name, "-")}</p>
                        <p className="text-xs text-muted-foreground">Buyer tax rate {toNumber(lot.buyer_tax_rate)}%</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Settlement refs</p>
                        <p className="text-sm text-foreground">{toText(lot.invoice_number, "No invoice")}</p>
                        <p className="text-xs text-muted-foreground">{toText(lot.payout_reference, "No payout")}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden md:block overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                      <TableHead>Lot #</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Hammer</TableHead>
                      <TableHead>Buyer Total</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead>Seller Payout</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Payout</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lotRows.map((lot) => (
                      <TableRow key={lot.lot_id}>
                        <TableCell className="align-top whitespace-normal">
                          <p className="font-medium">Lot {lot.lot_number}</p>
                          <p className="text-xs text-muted-foreground">{lot.title}</p>
                        </TableCell>
                        <TableCell className="align-top whitespace-normal">
                          <Badge variant="outline">
                            {formatLabel(toText(lot.status, lot.is_sold ? "sold" : "pending"))}
                          </Badge>
                          <p className="mt-2 text-xs text-muted-foreground">
                            {toNumber(lot.bid_count)} bid{toNumber(lot.bid_count) === 1 ? "" : "s"} | {lot.reserve_met ? "Reserve met" : "Reserve not met"}
                          </p>
                        </TableCell>
                        <TableCell className="align-top whitespace-normal">
                          <p className="font-medium">
                            {formatCurrency(toNumber(lot.hammer_price ?? lot.final_price), displayCurrency)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Final {formatCurrency(toNumber(lot.final_price ?? lot.hammer_price), displayCurrency)}
                          </p>
                        </TableCell>
                        <TableCell className="align-top whitespace-normal">
                          <p className="font-medium">
                            {formatCurrency(toNumber(lot.buyer_total ?? lot.final_price), displayCurrency)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Premium {formatCurrency(toNumber(lot.buyer_premium), displayCurrency)} | Tax {formatCurrency(toNumber(lot.buyer_tax), displayCurrency)}
                          </p>
                        </TableCell>
                        <TableCell className="align-top whitespace-normal">
                          <p className="font-medium">
                            {formatCurrency(toNumber(lot.total_deductions), displayCurrency)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Commission {formatCurrency(toNumber(lot.commission), displayCurrency)} | Fees {formatCurrency(toNumber(lot.lot_fees), displayCurrency)}
                          </p>
                        </TableCell>
                        <TableCell className="align-top whitespace-normal">
                          <p className="font-medium">
                            {formatCurrency(toNumber(lot.consignor_payout), displayCurrency)}
                          </p>
                          <p className="text-xs text-muted-foreground">{toText(lot.consignor_name, "-")}</p>
                        </TableCell>
                        <TableCell className="align-top whitespace-normal">
                          <p className="font-medium">{toText(lot.buyer_name, "-")}</p>
                          <p className="text-xs text-muted-foreground">
                            Buyer tax rate {toNumber(lot.buyer_tax_rate)}%
                          </p>
                        </TableCell>
                        <TableCell className="align-top whitespace-normal">
                          <p className="font-medium">{toText(lot.invoice_number, "-")}</p>
                          <p className="text-xs text-muted-foreground">
                            {toText(lot.invoice_status, "No invoice")}
                          </p>
                        </TableCell>
                        <TableCell className="align-top whitespace-normal">
                          <p className="font-medium">{toText(lot.payout_reference, "-")}</p>
                          <p className="text-xs text-muted-foreground">
                            {toText(lot.payout_status, "No payout")}
                          </p>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <div className="rounded-lg border py-8 text-center text-muted-foreground">
              No financials available yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
