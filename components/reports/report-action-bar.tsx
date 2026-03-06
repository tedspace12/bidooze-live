"use client";

import { Download, FileText, RefreshCw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExportFormat, ReportTemplate, RunState } from "./report-types";

interface ReportActionBarProps {
  selectedReport: ReportTemplate;
  auctionLabel: string;
  rangeLabel: string;
  runState: RunState;
  onGenerate: () => void;
  onSavePreset: () => void;
  onExport: (format: ExportFormat) => void;
}

export function ReportActionBar({
  selectedReport,
  auctionLabel,
  rangeLabel,
  runState,
  onGenerate,
  onSavePreset,
  onExport,
}: ReportActionBarProps) {
  return (
    <div className="sticky top-16 z-20 lg:static lg:top-auto">
      <div className="rounded-2xl border border-border/60 bg-background/65 p-3 shadow-[0_18px_50px_-35px_hsl(var(--foreground)/0.55)] backdrop-blur-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold [font-family:var(--font-display)]">
              {selectedReport.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {auctionLabel} - {rangeLabel}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={onGenerate} disabled={runState === "generating"}>
              {runState === "generating" ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              {runState === "generating" ? "Generating..." : "Generate"}
            </Button>
            <Button size="sm" variant="outline" onClick={onSavePreset}>
              <Save className="mr-2 h-4 w-4" />
              Save Preset
            </Button>
            {runState === "ready" &&
              selectedReport.exports.map((fmt) => (
                <Button key={fmt} size="sm" variant="outline" onClick={() => onExport(fmt)}>
                  <Download className="mr-2 h-4 w-4" />
                  {fmt.toUpperCase()}
                </Button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
