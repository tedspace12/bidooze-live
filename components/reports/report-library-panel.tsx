"use client";

import { Filter, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    <Card className="min-w-0 border-border/70 bg-background/55 backdrop-blur-md">
      <CardHeader className="space-y-3 pb-3">
        <CardTitle className="[font-family:var(--font-display)]">Report Templates</CardTitle>
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
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
          <Select
            value={categoryFilter}
            onValueChange={(value) => setCategoryFilter(value as ReportCategory | "all")}
          >
            <SelectTrigger>
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {groupedReports.map(({ key, meta }) => (
                <SelectItem key={key} value={key}>
                  {meta.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="max-h-[min(72vh,780px)] space-y-5 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:hsl(var(--primary)/0.45)_transparent] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/45 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-2">
        {groupedReports.map(({ key, meta, reports }, index) => {
          if (!reports.length) return null;
          return (
            <div key={key} className="space-y-2">
              {index > 0 && (
                <div className="h-px w-full bg-[radial-gradient(circle_at_2px_1px,hsl(var(--muted-foreground)/0.28)_1px,transparent_0)] [background-size:14px_4px]" />
              )}
              <p
                className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${meta.color}`}
              >
                <meta.icon className="h-3.5 w-3.5" />
                {meta.label}
              </p>
              {reports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => onOpenReport(report)}
                  className={`w-full rounded-xl border p-3 text-left transition-all duration-200 hover:scale-[1.01] hover:shadow-md ${
                    selectedReportId === report.id
                      ? "border-primary/45 bg-primary/10"
                      : "border-border/70 bg-background/60 hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-snug">{report.name}</p>
                    {report.priority === "high" && (
                      <Badge
                        variant="outline"
                        className="shrink-0 border-[hsl(var(--chart-4)/0.45)] bg-[hsl(var(--chart-4)/0.14)] text-[hsl(var(--chart-4))]"
                      >
                        High
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {report.description}
                  </p>
                </button>
              ))}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
