import type { LucideIcon } from "lucide-react";

export type TabValue = "overview" | "reports" | "presets" | "exports";
export type ReportCategory =
  | "financial"
  | "auctionsLots"
  | "consignors"
  | "buyersBidders"
  | "riskCompliance";
export type ExportFormat = "csv" | "excel" | "pdf";
export type ExportStatus = "queued" | "processing" | "done" | "failed";
export type RunState = "idle" | "generating" | "ready";

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: ReportCategory;
  icon: LucideIcon;
  featured?: boolean;
  priority: "high" | "medium" | "low";
  exports: ExportFormat[];
}

export interface ReportPack {
  id: string;
  name: string;
  description: string;
  useCase: string;
  reportIds: string[];
  icon: LucideIcon;
}

export interface SavedPreset {
  id: string;
  name: string;
  reportId: string;
  dateRange: string;
  auctionScope: string;
  lastRun: string;
  mode?: "single" | "pack";
  packId?: string | null;
}

export interface ExportRow {
  id: string;
  reportName: string;
  format: ExportFormat;
  status: ExportStatus;
  generatedAt: string;
  generatedBy: string;
  filters: string;
  runId?: string;
  fileName?: string;
  downloadUrl?: string;
}

export interface Insight {
  id: string;
  message: string;
  severity: "warning" | "error" | "info";
  reportId: string;
  delta?: string;
  trend?: "up" | "down";
}

export interface KpiCard {
  title: string;
  value: string;
  sub: string;
  tooltip?: string;
  trend: "up" | "down" | null;
  delta: string | null;
  icon: LucideIcon;
  accent: boolean;
  alert?: boolean;
}

export interface CategoryMeta {
  label: string;
  icon: LucideIcon;
  color: string;
}
