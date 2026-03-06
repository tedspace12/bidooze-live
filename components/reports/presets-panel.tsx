"use client";

import { RefreshCw, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ReportTemplate, SavedPreset } from "./report-types";

interface PresetsPanelProps {
  presets: SavedPreset[];
  getReportById: (reportId: string) => ReportTemplate | undefined;
  onRunPreset: (preset: SavedPreset) => void;
  onDeletePreset: (presetId: string) => void;
  isLoading?: boolean;
}

function PresetEmptyIllustration() {
  return (
    <svg
      viewBox="0 0 188 128"
      className="mb-3 h-24 w-40 text-muted-foreground/40"
      aria-hidden="true"
    >
      <rect
        x="18"
        y="16"
        width="152"
        height="94"
        rx="12"
        fill="currentColor"
        opacity="0.14"
      />
      <rect
        x="36"
        y="34"
        width="76"
        height="9"
        rx="4.5"
        fill="currentColor"
        opacity="0.25"
      />
      <rect
        x="36"
        y="52"
        width="116"
        height="6"
        rx="3"
        fill="currentColor"
        opacity="0.2"
      />
      <rect
        x="36"
        y="66"
        width="102"
        height="6"
        rx="3"
        fill="currentColor"
        opacity="0.2"
      />
      <rect
        x="36"
        y="82"
        width="62"
        height="6"
        rx="3"
        fill="currentColor"
        opacity="0.2"
      />
      <circle cx="146" cy="38" r="12" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

export function PresetsPanel({
  presets,
  getReportById,
  onRunPreset,
  onDeletePreset,
  isLoading = false,
}: PresetsPanelProps) {
  return (
    <Card className="border-border/70 bg-background/55 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="[font-family:var(--font-display)]">My Presets</CardTitle>
        <CardDescription>
          Saved report configurations. Re-run them any time and keep your scope
          intact.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`preset-skeleton-${index}`}
              className="rounded-xl border border-border/70 bg-background/60 p-4"
            >
              <div className="h-4 w-8/12 animate-pulse rounded bg-muted/50" />
              <div className="mt-2 h-3 w-6/12 animate-pulse rounded bg-muted/40" />
              <div className="mt-2 h-3 w-4/12 animate-pulse rounded bg-muted/40" />
            </div>
          ))
        ) : presets.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
            <PresetEmptyIllustration />
            <p className="text-sm font-medium text-muted-foreground">No presets yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Generate a report and save it to build your reusable preset list.
            </p>
          </div>
        ) : (
          presets.map((preset) => {
            const report = getReportById(preset.reportId);
            return (
              <div
                key={preset.id}
                className="flex flex-col gap-3 rounded-xl border border-border/70 bg-background/60 p-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  {report ? (
                    <report.icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <Save className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm font-semibold">{preset.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {preset.auctionScope} - {preset.dateRange}
                    </p>
                    <p className="text-xs text-muted-foreground">Last run {preset.lastRun}</p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border/70 bg-background/60"
                    onClick={() => onRunPreset(preset)}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Re-run
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeletePreset(preset.id)}
                    aria-label={`Delete preset ${preset.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
