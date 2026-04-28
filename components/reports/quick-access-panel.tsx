"use client";

import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReportPack, ReportTemplate } from "./report-types";

interface QuickAccessPanelProps {
  recentReports: ReportTemplate[];
  packs: ReportPack[];
  onOpenReport: (report: ReportTemplate) => void;
  onGeneratePack: (pack: ReportPack) => void;
}

const PACK_COLORS = [
  "bg-[hsl(var(--chart-1)/0.15)] text-[hsl(var(--chart-1))]",
  "bg-[hsl(var(--chart-2)/0.15)] text-[hsl(var(--chart-2))]",
  "bg-[hsl(var(--chart-4)/0.15)] text-[hsl(var(--chart-4))]",
  "bg-[hsl(var(--chart-3)/0.15)] text-[hsl(var(--chart-3))]",
];

export function QuickAccessPanel({
  recentReports,
  packs,
  onOpenReport,
  onGeneratePack,
}: QuickAccessPanelProps) {
  return (
    <div className="space-y-5">
      {recentReports.length > 0 && (
        <div>
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Recently run
          </p>
          <div className="flex flex-wrap gap-2">
            {recentReports.map((report) => (
              <Button
                key={report.id}
                size="sm"
                variant="outline"
                className="border-border/70 bg-background/60 hover:bg-primary/5 hover:border-primary/30 transition-colors"
                onClick={() => onOpenReport(report)}
              >
                <report.icon className="mr-2 h-3.5 w-3.5" />
                {report.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Report packs &mdash; one click, multiple reports
        </p>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {packs.map((pack, i) => (
            <button
              key={pack.id}
              onClick={() => onGeneratePack(pack)}
              className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card/70 p-3.5 text-left backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:bg-card hover:shadow-md"
            >
              <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", PACK_COLORS[i % PACK_COLORS.length])}>
                <pack.icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold [font-family:var(--font-display)]">
                  {pack.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {pack.useCase} &middot; {pack.reportIds.length} reports
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
