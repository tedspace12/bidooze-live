"use client";

import { AlertTriangle, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuctionReportExceptions } from "@/features/auction/hooks/useAuctionReports";

import {
  ReportSectionError,
  getErrorMessage,
  toNumber,
} from "./report-utils";

interface AuctionReportExceptionsSectionProps {
  auctionId: string | number;
}

export default function AuctionReportExceptionsSection({
  auctionId,
}: AuctionReportExceptionsSectionProps) {
  const exceptions = useAuctionReportExceptions(auctionId);

  if (exceptions.isLoading) {
    return (
      <Card>
        <CardContent className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={`exception-loading-${index}`} className="space-y-2 rounded-xl border p-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-36" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (exceptions.isError || !exceptions.data) {
    return (
      <ReportSectionError
        title="Operational issues unavailable"
        message={getErrorMessage(exceptions.error, "Unable to load report exceptions.")}
        onRetry={() => exceptions.refetch()}
      />
    );
  }

  const issues = exceptions.data.issues || {};
  const cards = [
    { label: "Unpaid invoices", value: toNumber(issues.unpaid_invoices_count) },
    { label: "Pending settlement", value: toNumber(issues.pending_settlement_count) },
    { label: "Held payouts", value: toNumber(issues.held_payouts_count) },
    { label: "Reserve failures", value: toNumber(issues.reserve_failures_count) },
    { label: "Withdrawn lots", value: toNumber(issues.withdrawn_lots_count) },
    { label: "Disputed lots", value: toNumber(issues.disputed_lots_count) },
    { label: "Failed invoice dispatch", value: toNumber(issues.failed_invoice_dispatch_count) },
  ];

  const hasRisk = cards.some((card) => card.value > 0);

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-xl font-semibold tracking-tight">Exceptions &amp; Operational Issues</h3>
        <p className="text-sm text-muted-foreground">
          Follow-up items that need finance, settlements, or auction operations attention.
        </p>
      </div>

      <Card className={hasRisk ? "border-amber-300/60 bg-amber-50/30" : undefined}>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              Risk monitor
            </CardTitle>
          </div>
          <Badge variant="outline" className={hasRisk ? "border-amber-300 bg-amber-100 text-amber-800" : undefined}>
            {hasRisk ? "Follow-up required" : "No active issues"}
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.label}
              className={`rounded-xl border p-4 ${card.value > 0 ? "border-amber-300/60 bg-amber-50/60" : "border-border/70 bg-muted/20"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{card.label}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight">{card.value}</p>
                </div>
                {card.value > 0 ? <AlertTriangle className="h-5 w-5 text-amber-600" /> : null}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {issues.notes?.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {issues.notes.map((note) => (
              <div key={note} className="rounded-xl border border-border/70 bg-muted/20 p-3">
                <p className="text-sm text-muted-foreground">{note}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}

