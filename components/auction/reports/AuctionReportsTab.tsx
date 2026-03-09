"use client";

import dynamic from "next/dynamic";
import { CalendarRange, Clock3, MapPin, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AuctionOverviewResponse } from "@/features/auction/types";

import AuctionReportExceptionsSection from "./AuctionReportExceptionsSection";
import AuctionReportExportActions from "./AuctionReportExportActions";
import AuctionReportFinancialBreakdownSection from "./AuctionReportFinancialBreakdownSection";
import AuctionReportSummaryCards from "./AuctionReportSummaryCards";
import { formatDateTime, formatStatusLabel } from "./report-utils";

const AuctionReportLotPerformanceSection = dynamic(
  () => import("./AuctionReportLotPerformanceSection"),
  {
    loading: () => <Skeleton className="h-[520px] w-full rounded-xl" />,
  }
);

const AuctionReportActivitySection = dynamic(
  () => import("./AuctionReportActivitySection"),
  {
    loading: () => <Skeleton className="h-[520px] w-full rounded-xl" />,
  }
);

const AuctionReportBidderInsightsSection = dynamic(
  () => import("./AuctionReportBidderInsightsSection"),
  {
    loading: () => <Skeleton className="h-[520px] w-full rounded-xl" />,
  }
);

const AuctionReportConsignorInsightsSection = dynamic(
  () => import("./AuctionReportConsignorInsightsSection"),
  {
    loading: () => <Skeleton className="h-[520px] w-full rounded-xl" />,
  }
);

interface AuctionReportsTabProps {
  auction: AuctionOverviewResponse;
}

export default function AuctionReportsTab({ auction }: AuctionReportsTabProps) {
  const location = [
    auction.auction.address_line_1,
    auction.auction.city,
    auction.auction.state,
    auction.auction.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6 pb-8">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{formatStatusLabel(auction.auction.status)}</Badge>
              <Badge variant="outline">{auction.auction.currency}</Badge>
              <Badge variant="outline">{auction.auction.timezone}</Badge>
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Auction Reporting Workspace</h2>
              <p className="text-sm text-muted-foreground">
                Multi-source operational reporting for {auction.auction.name}, designed for auctioneer review,
                finance follow-up, and post-sale analysis.
              </p>
            </div>
          </div>
        </div>

        <Card className="border-border/70">
          <CardContent className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl border border-border/70 bg-muted/20 p-2.5">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Auction</p>
                <p className="mt-1 text-sm font-medium text-foreground">{auction.auction.name}</p>
                <p className="text-xs text-muted-foreground">{auction.auction.code}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-xl border border-border/70 bg-muted/20 p-2.5">
                <CalendarRange className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Scheduled window</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {formatDateTime(auction.auction.start_at, auction.auction.timezone)}
                </p>
                <p className="text-xs text-muted-foreground">
                  to {formatDateTime(auction.auction.end_at, auction.auction.timezone)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-xl border border-border/70 bg-muted/20 p-2.5">
                <Clock3 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Actual session</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {formatDateTime(auction.auction.actual_start_at || undefined, auction.auction.timezone)}
                </p>
                <p className="text-xs text-muted-foreground">
                  to {formatDateTime(auction.auction.actual_end_at || undefined, auction.auction.timezone)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-xl border border-border/70 bg-muted/20 p-2.5">
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Location</p>
                <p className="mt-1 text-sm font-medium text-foreground">{location || "No location provided"}</p>
                <p className="text-xs text-muted-foreground">{auction.auction.bidding_type} auction</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AuctionReportSummaryCards auctionId={auction.auction.id} />
      <AuctionReportFinancialBreakdownSection auctionId={auction.auction.id} />
      <AuctionReportExceptionsSection auctionId={auction.auction.id} />
      <AuctionReportLotPerformanceSection auctionId={auction.auction.id} />
      <AuctionReportActivitySection auctionId={auction.auction.id} />
      <AuctionReportBidderInsightsSection auctionId={auction.auction.id} />
      <AuctionReportConsignorInsightsSection auctionId={auction.auction.id} />
      <AuctionReportExportActions auctionId={auction.auction.id} />
    </div>
  );
}

