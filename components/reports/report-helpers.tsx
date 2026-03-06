import { DateRange } from "react-day-picker";
import { AlertTriangle, Bell, CheckCircle2, Clock, RefreshCw, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ExportFormat, ExportStatus, Insight } from "./report-types";

export function formatRange(range: DateRange | undefined) {
  if (!range?.from) return "All time";
  const from = range.from.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const to = range.to
    ? range.to.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Present";
  return `${from} - ${to}`;
}

export function exportStatusBadge(status: ExportStatus) {
  if (status === "done")
    return (
      <Badge
        variant="outline"
        className="border-primary/35 bg-primary/10 text-primary"
      >
        <CheckCircle2 className="mr-1 h-3 w-3" />
        Done
      </Badge>
    );
  if (status === "processing")
    return (
      <Badge
        variant="outline"
        className="border-accent/45 bg-accent/45 text-accent-foreground"
      >
        <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
        Processing
      </Badge>
    );
  if (status === "queued")
    return (
      <Badge
        variant="outline"
        className="border-secondary/60 bg-secondary text-secondary-foreground"
      >
        <Clock className="mr-1 h-3 w-3" />
        Queued
      </Badge>
    );
  return (
    <Badge
      variant="outline"
      className="border-destructive/45 bg-destructive/10 text-destructive"
    >
      <X className="mr-1 h-3 w-3" />
      Failed
    </Badge>
  );
}

export function formatBadge(format: ExportFormat) {
  return (
    <Badge variant="outline" className="font-mono uppercase">
      {format}
    </Badge>
  );
}

export function insightIcon(severity: Insight["severity"]) {
  if (severity === "error")
    return <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />;
  if (severity === "warning")
    return <AlertTriangle className="h-4 w-4 shrink-0 text-[hsl(var(--chart-4))]" />;
  return <Bell className="h-4 w-4 shrink-0 text-primary" />;
}
