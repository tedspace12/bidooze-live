"use client";

import { Search, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { CategoryMeta, ReportCategory, ReportTemplate } from "./report-types";

interface GroupedReports {
  key: ReportCategory;
  meta: CategoryMeta;
  reports: ReportTemplate[];
}

interface ReportLibraryPanelProps {
  groupedReports: GroupedReports[];
  search: string;
  setSearch: (value: string) => void;
  categoryFilter: ReportCategory | "all";
  setCategoryFilter: (value: ReportCategory | "all") => void;
  selectedReportId?: string;
  onOpenReport: (report: ReportTemplate) => void;
}

export function ReportLibraryPanel({
  groupedReports,
  search,
  setSearch,
  categoryFilter,
  setCategoryFilter,
  selectedReportId,
  onOpenReport,
}: ReportLibraryPanelProps) {
  return (
    <Card className="min-w-0 overflow-hidden border-border/70 bg-background/55 backdrop-blur-md">
      {/* Header: title + search + category pills */}
      <div className="space-y-3 border-b border-border/60 p-4">
        <h2 className="text-base font-semibold tracking-tight [font-family:var(--font-display)]">
          Report Templates
        </h2>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9"
            placeholder="Search templates..."
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setCategoryFilter("all")}
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
              categoryFilter === "all"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            All
          </button>
          {groupedReports.map(({ key, meta }) => (
            <button
              key={key}
              onClick={() => setCategoryFilter(key)}
              className={cn(
                "flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
                categoryFilter === key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <meta.icon className="h-3 w-3" />
              {meta.label}
            </button>
          ))}
        </div>
      </div>

      {/* Template list */}
      <div className="max-h-[min(72vh,780px)] space-y-5 overflow-y-auto p-3 [scrollbar-color:hsl(var(--primary)/0.45)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/45 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-2">
        {groupedReports.map(({ key, meta, reports }) => {
          if (!reports.length) return null;
          return (
            <div key={key}>
              <p className={cn("mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest", meta.color)}>
                <meta.icon className="h-3 w-3" />
                {meta.label}
              </p>
              <div className="space-y-1.5">
                {reports.map((report) => {
                  const isSelected = selectedReportId === report.id;
                  return (
                    <button
                      key={report.id}
                      onClick={() => onOpenReport(report)}
                      className={cn(
                        "group w-full rounded-xl border p-3 text-left transition-all duration-150",
                        isSelected
                          ? "border-primary/40 bg-primary/10"
                          : "border-border/50 bg-background/40 hover:border-border/80 hover:bg-background/70"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                          isSelected ? "bg-primary/15" : "bg-muted/60"
                        )}>
                          <report.icon className={cn(
                            "h-3.5 w-3.5",
                            isSelected ? "text-primary" : "text-muted-foreground"
                          )} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium leading-snug">{report.name}</p>
                          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                            {report.description}
                          </p>
                        </div>
                        {report.priority === "high" && (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--chart-4))]" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
