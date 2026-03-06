"use client";

import { ChevronRight } from "lucide-react";
import { insightIcon } from "./report-helpers";
import type { Insight } from "./report-types";

interface InsightsPanelProps {
  insights: Insight[];
  getReportName: (reportId: string) => string | undefined;
  onOpen: (reportId: string) => void;
  isLoading?: boolean;
}

export function InsightsPanel({
  insights,
  getReportName,
  onOpen,
  isLoading = false,
}: InsightsPanelProps) {
  if (isLoading) {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`insight-skeleton-${index}`}
            className="rounded-xl border border-border/70 bg-background/60 p-4"
          >
            <div className="h-4 w-10/12 animate-pulse rounded bg-muted/50" />
            <div className="mt-2 h-3 w-7/12 animate-pulse rounded bg-muted/40" />
          </div>
        ))}
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-center">
        <p className="text-sm font-medium text-muted-foreground">No insights yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          No alerts were generated for this filter range.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {insights.map((insight) => {
        const reportName = getReportName(insight.reportId);
        return (
          <button
            key={insight.id}
            onClick={() => onOpen(insight.reportId)}
            className={`relative flex items-start gap-3 rounded-xl border p-4 text-left backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
              insight.severity === "error"
                ? "border-destructive/40 bg-destructive/10 ring-1 ring-destructive/20 shadow-[0_0_28px_-18px_hsl(var(--destructive)/0.75)]"
                : "border-border/70 bg-background/60"
            }`}
          >
            {insightIcon(insight.severity)}
            <div className="flex-1">
              <p className="text-sm font-medium">{insight.message}</p>
              {reportName && (
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  View {reportName}
                  <ChevronRight className="h-3 w-3" />
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
