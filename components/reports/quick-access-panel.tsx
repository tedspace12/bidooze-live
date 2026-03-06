"use client";

import { Button } from "@/components/ui/button";
import type { ReportPack, ReportTemplate } from "./report-types";

interface QuickAccessPanelProps {
  recentReports: ReportTemplate[];
  packs: ReportPack[];
  onOpenReport: (report: ReportTemplate) => void;
  onGeneratePack: (pack: ReportPack) => void;
}

export function QuickAccessPanel({
  recentReports,
  packs,
  onOpenReport,
  onGeneratePack,
}: QuickAccessPanelProps) {
  return (
    <div className="space-y-4">
      {recentReports.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Recently run
          </p>
          <div className="flex flex-wrap gap-2">
            {recentReports.map((report) => (
              <Button
                key={report.id}
                size="sm"
                variant="outline"
                className="border-border/70 bg-background/60 hover:bg-background"
                onClick={() => onOpenReport(report)}
              >
                <report.icon className="mr-2 h-4 w-4" />
                {report.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Report packs - one click, multiple reports
        </p>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {packs.map((pack) => (
            <button
              key={pack.id}
              onClick={() => onGeneratePack(pack)}
              className="group flex items-start gap-3 rounded-xl border border-border/70 bg-background/60 p-3 text-left backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <pack.icon className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--chart-4))]" />
              <div>
                <p className="text-sm font-semibold [font-family:var(--font-display)]">
                  {pack.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {pack.useCase} - {pack.reportIds.length} reports
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
