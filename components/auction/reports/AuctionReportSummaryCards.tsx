"use client";

import {
  DollarSign,
  Gavel,
  Package,
  Target,
  Trophy,
  Users,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuctionReportSummary } from "@/features/auction/hooks/useAuctionReports";

import {
  ReportSectionError,
  formatCurrency,
  formatPercent,
  getErrorMessage,
  toNumber,
} from "./report-utils";

interface AuctionReportSummaryCardsProps {
  auctionId: string | number;
}

export default function AuctionReportSummaryCards({
  auctionId,
}: AuctionReportSummaryCardsProps) {
  const summary = useAuctionReportSummary(auctionId);

  if (summary.isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, index) => (
          <Card key={`summary-card-${index}`}>
            <CardContent className="space-y-3 p-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-36" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (summary.isError || !summary.data) {
    return (
      <ReportSectionError
        title="Executive summary unavailable"
        message={getErrorMessage(summary.error, "Unable to load auction report summary.")}
        onRetry={() => summary.refetch()}
      />
    );
  }

  const metrics = summary.data.metrics || {};
  const currency = summary.data.context?.currency || "USD";
  const items = [
    {
      title: "Total lots",
      value: toNumber(metrics.lots_total).toLocaleString(),
      sub: `${toNumber(metrics.lots_unsold)} unsold`,
      icon: Package,
    },
    {
      title: "Sold lots",
      value: toNumber(metrics.lots_sold).toLocaleString(),
      sub: "Backend-computed lot outcomes",
      icon: Target,
    },
    {
      title: "Unsold lots",
      value: toNumber(metrics.lots_unsold).toLocaleString(),
      sub: "Lots not converted into sales",
      icon: Package,
    },
    {
      title: "Sell-through rate",
      value: formatPercent(toNumber(metrics.sell_through_rate)),
      sub: "Sold lots divided by catalog size",
      icon: Target,
    },
    {
      title: "Total bids",
      value: toNumber(metrics.total_bids).toLocaleString(),
      sub: "Accepted and tracked bid events",
      icon: Gavel,
    },
    {
      title: "Unique bidders",
      value: toNumber(metrics.unique_bidders_count).toLocaleString(),
      sub: "Distinct bidders participating",
      icon: Users,
    },
    {
      title: "Total revenue",
      value: formatCurrency(toNumber(metrics.total_revenue), currency),
      sub: "Auction revenue from sold lots",
      icon: DollarSign,
    },
    {
      title: "Average lot price",
      value: formatCurrency(toNumber(metrics.average_lot_price), currency),
      sub: "Average across sold lots",
      icon: DollarSign,
    },
    {
      title: "Highest sale",
      value: formatCurrency(toNumber(metrics.highest_sale_price), currency),
      sub: "Top achieved sale price",
      icon: Trophy,
    },
    {
      title: "Lowest sale",
      value: formatCurrency(toNumber(metrics.lowest_sale_price), currency),
      sub: "Lowest sold lot price",
      icon: Trophy,
    },
  ];

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-xl font-semibold tracking-tight">Executive Summary</h3>
        <p className="text-sm text-muted-foreground">
          Backend-computed auction headline metrics for operations, sales, and leadership reporting.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="border-border/70">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-2xl font-semibold tracking-tight">{item.value}</div>
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

