"use client";

import {
  ArrowDownCircle,
  ArrowUpCircle,
  Banknote,
  Receipt,
  Scale,
  Wallet,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuctionReportFinancials } from "@/features/auction/hooks/useAuctionReports";

import {
  ReportSectionError,
  formatCurrency,
  getErrorMessage,
  toNumber,
} from "./report-utils";

interface AuctionReportFinancialBreakdownSectionProps {
  auctionId: string | number;
}

export default function AuctionReportFinancialBreakdownSection({
  auctionId,
}: AuctionReportFinancialBreakdownSectionProps) {
  const financials = useAuctionReportFinancials(auctionId);

  if (financials.isLoading) {
    return (
      <Card>
        <CardContent className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={`financial-loading-${index}`} className="space-y-2 rounded-xl border p-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-3 w-44" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (financials.isError || !financials.data) {
    return (
      <ReportSectionError
        title="Financial breakdown unavailable"
        message={getErrorMessage(financials.error, "Unable to load report financials.")}
        onRetry={() => financials.refetch()}
      />
    );
  }

  const totals = financials.data.totals || {};
  const basis = financials.data.basis || {};
  const currency = financials.data.context?.currency || "USD";
  const cards = [
    {
      title: "Hammer total",
      value: formatCurrency(toNumber(totals.hammer_total), currency),
      sub: "Sum of sold lot hammer prices",
      icon: Banknote,
    },
    {
      title: "Buyer premium",
      value: formatCurrency(toNumber(totals.buyer_premium_total), currency),
      sub: "Buyer-side premium generated",
      icon: ArrowUpCircle,
    },
    {
      title: "Tax total",
      value: formatCurrency(toNumber(totals.tax_total), currency),
      sub: "Buyer tax plus seller withholding",
      icon: Receipt,
    },
    {
      title: "Fees total",
      value: formatCurrency(toNumber(totals.fees_total), currency),
      sub: "Fees, handling, and shipping basis",
      icon: Scale,
    },
    {
      title: "Discounts total",
      value: formatCurrency(toNumber(totals.discounts_total), currency),
      sub: "Credits and negative adjustments",
      icon: ArrowDownCircle,
    },
    {
      title: "Refunds total",
      value: formatCurrency(toNumber(totals.refunds_total), currency),
      sub: "Invoice and deposit refunds",
      icon: ArrowDownCircle,
    },
    {
      title: "Net revenue",
      value: formatCurrency(toNumber(totals.net_revenue), currency),
      sub: "Net retained revenue basis",
      icon: Wallet,
    },
    {
      title: "Seller payout total",
      value: formatCurrency(toNumber(totals.seller_payout_total), currency),
      sub: "Estimated or settled consignor payout",
      icon: Wallet,
    },
  ];

  const detailRows = [
    { label: "Average revenue per sold lot", value: formatCurrency(toNumber(totals.average_revenue_per_sold_lot), currency) },
    { label: "Buyer tax total", value: formatCurrency(toNumber(totals.buyer_tax_total), currency) },
    { label: "Seller withholding total", value: formatCurrency(toNumber(totals.seller_withholding_total), currency) },
    { label: "Lot fees total", value: formatCurrency(toNumber(totals.lot_fees_total), currency) },
    { label: "Shipping total", value: formatCurrency(toNumber(totals.shipping_total), currency) },
    { label: "Handling total", value: formatCurrency(toNumber(totals.handling_total), currency) },
    { label: "Deposit credits total", value: formatCurrency(toNumber(totals.deposit_credits_total), currency) },
    { label: "Adjustments total", value: formatCurrency(toNumber(totals.adjustments_total), currency) },
    { label: "Positive adjustments total", value: formatCurrency(toNumber(totals.positive_adjustments_total), currency) },
    { label: "Seller commission total", value: formatCurrency(toNumber(totals.seller_commission_total), currency) },
    { label: "Payment refunds total", value: formatCurrency(toNumber(totals.payment_refunds_total), currency) },
    { label: "Deposit refunds total", value: formatCurrency(toNumber(totals.deposit_refunds_total), currency) },
  ];

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-xl font-semibold tracking-tight">Financial Breakdown</h3>
        <p className="text-sm text-muted-foreground">
          Auction-level revenue composition, deductions, and retained value from the reporting service.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-2xl font-semibold tracking-tight">{card.value}</div>
                <p className="text-xs text-muted-foreground">{card.sub}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detailed totals</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {detailRows.map((row) => (
              <div key={row.label} className="rounded-xl border border-border/70 bg-muted/20 p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{row.label}</p>
                <p className="mt-1 text-sm font-medium text-foreground">{row.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Calculation basis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(basis).map(([key, value]) => (
              <div key={key} className="rounded-xl border border-border/70 bg-muted/20 p-3">
                <p className="text-sm font-medium text-foreground">{key.replace(/_/g, " ")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

