"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DateRange } from "react-day-picker";
import {
  BarChart3,
  Bell,
  Calendar,
  Download,
  FileText,
  Gavel,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { DateRangeFilter } from "@/components/auction/date-range-filter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CATEGORY_META,
  KPI_CARDS,
  REPORT_PACKS,
  REPORTS,
} from "@/components/reports/report-data";
import { ExportsPanel } from "@/components/reports/exports-panel";
import { formatRange } from "@/components/reports/report-helpers";
import { InsightsPanel } from "@/components/reports/insights-panel";
import { KpiGrid } from "@/components/reports/kpi-grid";
import { PresetsPanel } from "@/components/reports/presets-panel";
import { QuickAccessPanel } from "@/components/reports/quick-access-panel";
import { ReportActionBar } from "@/components/reports/report-action-bar";
import { ReportLibraryPanel } from "@/components/reports/report-library-panel";
import { RunReportPanel } from "@/components/reports/run-report-panel";
import type {
  ExportFormat,
  ExportRow,
  Insight,
  KpiCard,
  ReportCategory,
  ReportPack,
  ReportTemplate,
  RunState,
  SavedPreset,
  TabValue,
} from "@/components/reports/report-types";
import {
  reportService,
  type ReportExportResource,
  type ReportFiltersInput,
  type ReportPresetResource,
  type ReportsOverviewKpis,
} from "@/features/reports/services/reportService";
import { auctionService } from "@/features/auction/services/auctionService";

const BACKEND_TO_UI_REPORT_ID: Record<string, string> = {
  "revenue-summary": "rev-summary",
  "settlement-summary": "payouts-summary",
  "payout-summary": "payouts-summary",
  "lot-performance": "lots-performance",
  "bidder-activity": "bid-activity",
  "consignor-summary": "seller-activity",
  "bidder-insights": "buyer-activity",
  "monthly-performance": "rev-summary",
  "risk-review": "disputes-refunds",
};

interface ReportAuctionOption {
  id: string;
  label: string;
}

const DEFAULT_AUCTION_OPTION: ReportAuctionOption = {
  id: "all",
  label: "All Auctions",
};

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

const toApiDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toDisplayDateTime = (value?: string | null): string => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("en-GB");
};

const toDisplayDateOnly = (value?: string | null): string => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value.slice(0, 10);
  return parsed.toISOString().slice(0, 10);
};

const toSafeNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const formatCompact = (value: number) =>
  new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 }).format(value);

const formatCurrency = (value: number) => {
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${formatCompact(value)}`;
};

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (!error || typeof error !== "object") return fallback;
  const message = (error as { message?: unknown }).message;
  if (typeof message === "string" && message.trim()) return message;

  const nested = (error as { error?: unknown }).error;
  if (typeof nested === "string" && nested.trim()) return nested;

  return fallback;
};

const resolveUiReportId = (reportId?: string | null): string => {
  if (!reportId) return "rev-summary";
  const normalized = BACKEND_TO_UI_REPORT_ID[reportId] ?? reportId;
  const exists = REPORTS.some((report) => report.id === normalized);
  return exists ? normalized : "rev-summary";
};

const resolvePresetReportId = (preset: ReportPresetResource): string => {
  if (preset.report_id) return resolveUiReportId(preset.report_id);
  if (preset.pack_id) {
    const pack = REPORT_PACKS.find((item) => item.id === preset.pack_id);
    if (pack?.reportIds?.[0]) return pack.reportIds[0];
  }
  return "rev-summary";
};

const toPresetRangeLabel = (filters?: { date_from?: string; date_to?: string }) => {
  const from = filters?.date_from;
  const to = filters?.date_to;
  if (from && to) return `${from} - ${to}`;
  if (from) return `${from} - Present`;
  if (to) return `Up to ${to}`;
  return "All time";
};

const normalizeAuctionId = (value: unknown): string | undefined => {
  if (value === null || value === undefined) return undefined;
  const normalized = String(value).trim();
  return normalized || undefined;
};

const inferInsightSeverity = (message: string): Insight["severity"] => {
  const normalized = message.toLowerCase();
  if (
    normalized.includes("failed") ||
    normalized.includes("dispute") ||
    normalized.includes("risk") ||
    normalized.includes("overdue") ||
    normalized.includes("unpaid") ||
    normalized.includes("held")
  ) {
    return "error";
  }
  if (
    normalized.includes("down") ||
    normalized.includes("drop") ||
    normalized.includes("unsold") ||
    normalized.includes("warning")
  ) {
    return "warning";
  }
  return "info";
};

const inferInsightReportId = (message: string): string => {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("unpaid") ||
    normalized.includes("settlement") ||
    normalized.includes("payout") ||
    normalized.includes("invoice")
  ) {
    return "payouts-summary";
  }
  if (
    normalized.includes("bidder") ||
    normalized.includes("buyer") ||
    normalized.includes("returning")
  ) {
    return "buyer-activity";
  }
  if (normalized.includes("consignor") || normalized.includes("seller")) {
    return "seller-activity";
  }
  if (normalized.includes("unsold")) {
    return "unsold-lots";
  }
  if (
    normalized.includes("sell-through") ||
    normalized.includes("auction") ||
    normalized.includes("lot")
  ) {
    return "auction-performance";
  }

  return "rev-summary";
};

const mapExportToUi = (
  item: ReportExportResource,
  fallback?: { reportName?: string; filters?: string; generatedBy?: string }
): ExportRow => ({
  id: item.export_id,
  reportName:
    item.report_name ??
    item.pack_name ??
    fallback?.reportName ??
    item.report_id ??
    "Report Export",
  format: item.format,
  status: item.status,
  generatedAt: toDisplayDateTime(item.completed_at ?? item.queued_at),
  generatedBy: item.generated_by ?? fallback?.generatedBy ?? "System",
  filters: item.filters_summary ?? fallback?.filters ?? "-",
  runId: item.run_id,
  fileName: item.file_name ?? undefined,
  downloadUrl: item.download_url ?? undefined,
});

const mapOverviewKpis = (kpis?: ReportsOverviewKpis): KpiCard[] => {
  const source = kpis ?? {};
  const auctionsCount = toSafeNumber(source.auctions_count);
  const liveAuctionsCount = toSafeNumber(source.live_auctions_count);
  const lotsCount = toSafeNumber(source.lots_count);
  const soldLotsCount = toSafeNumber(source.sold_lots_count);
  const totalRevenue = toSafeNumber(source.total_revenue);
  const totalBids = toSafeNumber(source.total_bids);
  const uniqueBidders = toSafeNumber(source.unique_bidders);
  const sellThroughRate = toSafeNumber(source.sell_through_rate);

  return KPI_CARDS.map((card) => {
    if (card.title === "Revenue") {
      return {
        ...card,
        value: formatCurrency(totalRevenue),
        delta: null,
        trend: null,
      };
    }
    if (card.title === "Lots Sold / Total") {
      return {
        ...card,
        value: `${formatCompact(soldLotsCount)} / ${formatCompact(lotsCount)}`,
        delta: null,
        trend: null,
      };
    }
    if (card.title === "Sell-Through Rate") {
      return {
        ...card,
        value: `${sellThroughRate.toFixed(1)}%`,
        delta: null,
        trend: null,
      };
    }
    if (card.title === "Unique Bidders") {
      return {
        ...card,
        value: formatCompact(uniqueBidders),
        delta: null,
        trend: null,
      };
    }
    if (card.title === "Total Bids") {
      return {
        ...card,
        value: formatCompact(totalBids),
        delta: null,
        trend: null,
      };
    }
    if (card.title === "Auctions / Live") {
      return {
        ...card,
        value: `${formatCompact(auctionsCount)} / ${formatCompact(liveAuctionsCount)}`,
        delta: null,
        trend: null,
      };
    }
    return card;
  });
};

const mapOverviewInsights = (insights: unknown): Insight[] => {
  if (!Array.isArray(insights) || insights.length === 0) {
    return [];
  }

  const mapped = insights
    .map((entry, index) => {
      if (typeof entry === "string" && entry.trim()) {
        const message = entry.trim();
        return {
          id: `insight-${index}`,
          message,
          severity: inferInsightSeverity(message),
          reportId: resolveUiReportId(inferInsightReportId(message)),
        } as Insight;
      }

      if (!entry || typeof entry !== "object") return null;
      const item = entry as Record<string, unknown>;
      const message =
        typeof item.message === "string"
          ? item.message
          : typeof item.title === "string"
            ? item.title
            : null;
      if (!message) return null;

      const severity =
        item.severity === "error" || item.severity === "warning" || item.severity === "info"
          ? item.severity
          : inferInsightSeverity(message);

      const reportId = resolveUiReportId(
        typeof item.report_id === "string"
          ? item.report_id
          : typeof item.reportId === "string"
            ? item.reportId
            : inferInsightReportId(message)
      );

      return {
        id: typeof item.id === "string" ? item.id : `insight-${index}`,
        message,
        severity,
        reportId,
        delta: typeof item.delta === "string" ? item.delta : undefined,
        trend: item.trend === "up" || item.trend === "down" ? item.trend : undefined,
      } as Insight;
    })
    .filter((item): item is Insight => Boolean(item));

  return mapped;
};

export default function ReportsPage() {
  const [tab, setTab] = useState<TabValue>("overview");
  const [range, setRange] = useState<DateRange | undefined>();
  const [auctionScope, setAuctionScope] = useState("all");
  const [auctionOptions, setAuctionOptions] = useState<ReportAuctionOption[]>([
    DEFAULT_AUCTION_OPTION,
  ]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ReportCategory | "all">(
    "all"
  );
  const [selectedReport, setSelectedReport] = useState<ReportTemplate | null>(
    null
  );
  const [runState, setRunState] = useState<RunState>("idle");
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [previewRows, setPreviewRows] = useState<Array<Record<string, unknown>>>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [presets, setPresets] = useState<SavedPreset[]>([]);
  const [exports, setExports] = useState<ExportRow[]>([]);
  const [kpiCards, setKpiCards] = useState<KpiCard[]>(() => mapOverviewKpis());
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isOverviewLoading, setIsOverviewLoading] = useState(true);
  const [isPresetsLoading, setIsPresetsLoading] = useState(true);
  const [isExportsLoading, setIsExportsLoading] = useState(true);
  const runPanelRef = useRef<HTMLDivElement | null>(null);
  const runPollTokenRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      runPollTokenRef.current += 1;
    };
  }, []);

  const resolveAuctionLabel = useCallback(
    (auctionId?: string) => {
      if (!auctionId || auctionId === DEFAULT_AUCTION_OPTION.id) {
        return DEFAULT_AUCTION_OPTION.label;
      }

      const known = auctionOptions.find((auction) => auction.id === auctionId);
      return known?.label ?? auctionId;
    },
    [auctionOptions]
  );

  const mapPresetToUi = useCallback(
    (preset: ReportPresetResource): SavedPreset => {
      const auctionId = normalizeAuctionId(preset.filters?.auction_id);

      return {
        id: preset.preset_id,
        name: preset.name,
        reportId: resolvePresetReportId(preset),
        dateRange: toPresetRangeLabel(preset.filters),
        auctionScope: resolveAuctionLabel(auctionId),
        auctionId,
        lastRun: toDisplayDateOnly(preset.updated_at || preset.created_at),
        mode: preset.mode,
        packId: preset.pack_id,
      };
    },
    [resolveAuctionLabel]
  );

  const refreshAuctionOptions = useCallback(async () => {
    try {
      const auctions = await auctionService.getMyAuctions();
      if (!mountedRef.current) return;

      const seen = new Set<string>();
      const nextOptions = [
        DEFAULT_AUCTION_OPTION,
        ...auctions.flatMap((auction) => {
          const id = normalizeAuctionId(auction.id);
          if (!id || seen.has(id)) return [];
          seen.add(id);
          const label = auction.code
            ? `${auction.name} (${auction.code})`
            : auction.name || `Auction ${id}`;
          return [{ id, label }];
        }),
      ];

      setAuctionOptions(nextOptions);
    } catch {
      if (!mountedRef.current) return;
      setAuctionOptions([DEFAULT_AUCTION_OPTION]);
    }
  }, []);

  const buildFilters = useCallback((): ReportFiltersInput => {
    const filters: ReportFiltersInput = {};
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone) filters.timezone = timezone;
    if (auctionScope) filters.auction_id = auctionScope;

    if (range?.from) {
      filters.date_from = toApiDate(range.from);
      filters.date_to = range.to ? toApiDate(range.to) : "Present";
    }

    return filters;
  }, [auctionScope, range]);

  const extractPreviewRows = useCallback((preview: unknown): Array<Record<string, unknown>> => {
    const visited = new Set<unknown>();
    const queue: unknown[] = [preview];

    const isRowArray = (value: unknown): value is Array<Record<string, unknown>> => {
      return (
        Array.isArray(value) &&
        value.length > 0 &&
        value.every((item) => item && typeof item === "object" && !Array.isArray(item))
      );
    };

    while (queue.length > 0) {
      const node = queue.shift();
      if (!node || typeof node !== "object") continue;
      if (visited.has(node)) continue;
      visited.add(node);

      if (Array.isArray(node)) {
        if (isRowArray(node)) return node;
        for (const child of node) queue.push(child);
        continue;
      }

      const record = node as Record<string, unknown>;
      for (const preferredKey of [
        "rows",
        "data",
        "items",
        "results",
        "entries",
        "records",
      ]) {
        const candidate = record[preferredKey];
        if (isRowArray(candidate)) return candidate;
      }

      for (const value of Object.values(record)) {
        queue.push(value);
      }
    }

    return [];
  }, []);

  const refreshPresets = useCallback(
    async (showErrorToast = false, showLoader = true) => {
      if (showLoader && mountedRef.current) {
        setIsPresetsLoading(true);
      }

      try {
        const response = await reportService.listPresets({ per_page: 100 });
        if (!mountedRef.current) return;
        setPresets(response.data.map(mapPresetToUi));
      } catch (error: unknown) {
        if (showErrorToast) {
          toast.error(extractErrorMessage(error, "Failed to load presets."));
        }
      } finally {
        if (showLoader && mountedRef.current) {
          setIsPresetsLoading(false);
        }
      }
    },
    [mapPresetToUi]
  );

  const refreshExports = useCallback(
    async (showErrorToast = false, showLoader = true) => {
      if (showLoader && mountedRef.current) {
        setIsExportsLoading(true);
      }

      try {
        const response = await reportService.listExports({ per_page: 100 });
        if (!mountedRef.current) return;
        setExports(response.data.map((item) => mapExportToUi(item)));
      } catch (error: unknown) {
        if (showErrorToast) {
          toast.error(extractErrorMessage(error, "Failed to load exports."));
        }
      } finally {
        if (showLoader && mountedRef.current) {
          setIsExportsLoading(false);
        }
      }
    },
    []
  );

  const refreshOverview = useCallback(async () => {
    if (mountedRef.current) {
      setIsOverviewLoading(true);
    }

    try {
      const response = await reportService.getOverview(buildFilters());
      if (!mountedRef.current) return;
      setKpiCards(mapOverviewKpis(response.data.kpis));
      setInsights(mapOverviewInsights(response.data.insights));
    } catch {
      if (!mountedRef.current) return;
      setKpiCards(mapOverviewKpis());
      setInsights([]);
    } finally {
      if (mountedRef.current) {
        setIsOverviewLoading(false);
      }
    }
  }, [buildFilters]);

  useEffect(() => {
    void refreshAuctionOptions();
  }, [refreshAuctionOptions]);

  useEffect(() => {
    void refreshPresets();
    void refreshExports();
  }, [refreshExports, refreshPresets]);

  useEffect(() => {
    void refreshOverview();
  }, [refreshOverview]);

  useEffect(() => {
    if (tab === "exports") {
      void refreshExports();
    }
    if (tab === "presets") {
      void refreshPresets();
    }
  }, [tab, refreshExports, refreshPresets]);

  const rangeLabel = formatRange(range);
  const auctionLabel = resolveAuctionLabel(auctionScope);

  const filteredReports = useMemo(() => {
    return REPORTS.filter((report) => {
      const byCategory =
        categoryFilter === "all" || report.category === categoryFilter;
      const bySearch = report.name
        .toLowerCase()
        .includes(search.toLowerCase().trim());
      return byCategory && bySearch;
    });
  }, [categoryFilter, search]);

  const groupedReports = useMemo(() => {
    return (Object.keys(CATEGORY_META) as ReportCategory[]).map((key) => ({
      key,
      meta: CATEGORY_META[key],
      reports: filteredReports.filter((report) => report.category === key),
    }));
  }, [filteredReports]);

  const recentReports = useMemo(
    () =>
      recentIds
        .map((id) => REPORTS.find((report) => report.id === id))
        .filter((report): report is ReportTemplate => Boolean(report))
        .slice(0, 4),
    [recentIds]
  );

  const focusRunPanel = () => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        runPanelRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    });
  };

  const openReport = (report: ReportTemplate, shouldFocusPanel = true) => {
    setSelectedReport(report);
    setRunState("idle");
    setPreviewRows([]);
    setTab("reports");
    if (shouldFocusPanel) focusRunPanel();
  };

  const pollRunUntilTerminal = useCallback(
    async (runId: string, recentReportId?: string, successLabel?: string) => {
      const token = ++runPollTokenRef.current;
      const maxAttempts = 40;

      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        try {
          const response = await reportService.getRun(runId);
          if (!mountedRef.current || runPollTokenRef.current !== token) return;

          const run = response.data;
          if (run.status === "done") {
            setRunState("ready");
            setActiveRunId(run.run_id);
            setPreviewRows(extractPreviewRows(run.preview));
            if (recentReportId) {
              setRecentIds((prev) =>
                [recentReportId, ...prev.filter((id) => id !== recentReportId)].slice(
                  0,
                  6
                )
              );
            }
            toast.success("Report ready", {
              description: `${successLabel ?? "Report"} is ready to view or export.`,
            });
            return;
          }

          if (run.status === "failed") {
            setRunState("idle");
            setPreviewRows([]);
            toast.error(run.error || "Report generation failed.");
            return;
          }

          setRunState("generating");
        } catch (error: unknown) {
          if (!mountedRef.current || runPollTokenRef.current !== token) return;
          setRunState("idle");
          setPreviewRows([]);
          toast.error(extractErrorMessage(error, "Unable to check run status."));
          return;
        }

        await sleep(1500);
      }

      if (!mountedRef.current || runPollTokenRef.current !== token) return;
      setRunState("idle");
      setPreviewRows([]);
      toast.error("Report generation timed out.");
    },
    [extractPreviewRows]
  );

  const pollExportUntilTerminal = useCallback(
    async (exportId: string) => {
      const maxAttempts = 30;

      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        try {
          const response = await reportService.listExports({ per_page: 100 });
          if (!mountedRef.current) return;
          const latest = response.data.find((item) => item.export_id === exportId);
          if (latest) {
            const mapped = mapExportToUi(latest);
            setExports((prev) => [mapped, ...prev.filter((row) => row.id !== mapped.id)]);

            if (latest.status === "done") {
              toast.success("Export ready", {
                description: mapped.reportName,
              });
              return;
            }

            if (latest.status === "failed") {
              toast.error(latest.error || "Export failed.");
              return;
            }
          }
        } catch {
          return;
        }

        await sleep(1500);
      }
    },
    []
  );

  const generateReport = async (
    report: ReportTemplate,
    shouldFocusPanel = true
  ) => {
    setSelectedReport(report);
    setTab("reports");
    if (shouldFocusPanel) focusRunPanel();

    setRunState("generating");
    setActiveRunId(null);
    setPreviewRows([]);

    try {
      const response = await reportService.queueRun({
        mode: "single",
        report_id: report.id,
        filters: buildFilters(),
      });
      setActiveRunId(response.data.run_id);
      toast.info("Report run queued", { description: report.name });
      await pollRunUntilTerminal(response.data.run_id, report.id, report.name);
    } catch (error: unknown) {
      setRunState("idle");
      setPreviewRows([]);
      toast.error(extractErrorMessage(error, "Failed to queue report run."));
    }
  };

  const generatePack = async (pack: ReportPack) => {
    const first = REPORTS.find((report) => report.id === pack.reportIds[0]);
    if (first) setSelectedReport(first);
    setTab("reports");
    focusRunPanel();
    setRunState("generating");
    setActiveRunId(null);
    setPreviewRows([]);

    try {
      const response = await reportService.queueRun({
        mode: "pack",
        pack_id: pack.id,
        filters: buildFilters(),
      });
      setActiveRunId(response.data.run_id);
      toast.info("Report pack queued", {
        description: `${pack.name} (${pack.reportIds.length} reports)`,
      });
      await pollRunUntilTerminal(response.data.run_id, first?.id, pack.name);
    } catch (error: unknown) {
      setRunState("idle");
      setPreviewRows([]);
      toast.error(extractErrorMessage(error, "Failed to queue report pack."));
    }
  };

  const savePreset = async () => {
    if (!selectedReport) {
      toast.error("Select a report first");
      return;
    }

    try {
      const response = await reportService.createPreset({
        name: `${selectedReport.name} - ${rangeLabel}`,
        report_id: selectedReport.id,
        filters: buildFilters(),
      });

      const mapped = mapPresetToUi(response.data);
      setPresets((prev) => [mapped, ...prev.filter((item) => item.id !== mapped.id)]);
      toast.success("Preset saved", { description: mapped.name });
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, "Failed to save preset."));
    }
  };

  const exportReport = async (format: ExportFormat) => {
    if (!selectedReport || runState !== "ready" || !activeRunId) {
      toast.error("Generate a report first before exporting.");
      return;
    }

    try {
      const response = await reportService.queueExport(activeRunId, format);
      const mapped = mapExportToUi(response.data, {
        reportName: selectedReport.name,
        filters: `${auctionLabel} - ${rangeLabel}`,
        generatedBy: "You",
      });
      setExports((prev) => [mapped, ...prev.filter((item) => item.id !== mapped.id)]);

      toast.success(`Export ${format.toUpperCase()} queued`, {
        description: selectedReport.name,
      });

      void pollExportUntilTerminal(mapped.id);
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, "Failed to queue export."));
    }
  };

  const runPreset = async (preset: SavedPreset) => {
    const report = REPORTS.find((item) => item.id === preset.reportId);
    if (report) setSelectedReport(report);
    setTab("reports");
    focusRunPanel();
    setRunState("generating");
    setActiveRunId(null);
    setPreviewRows([]);

    try {
      const response = await reportService.runPreset(preset.id, {
        filters: buildFilters(),
      });
      setActiveRunId(response.data.run_id);
      toast.info("Preset run queued", { description: preset.name });
      await pollRunUntilTerminal(response.data.run_id, report?.id, preset.name);
    } catch (error: unknown) {
      setRunState("idle");
      setPreviewRows([]);
      toast.error(extractErrorMessage(error, "Failed to run preset."));
    }
  };

  const deletePreset = async (id: string) => {
    try {
      await reportService.deletePreset(id);
      setPresets((prev) => prev.filter((preset) => preset.id !== id));
      toast.success("Preset removed");
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, "Failed to delete preset."));
    }
  };

  const downloadExport = async (item: ExportRow) => {
    if (item.status !== "done") {
      toast.info("Export is not ready yet.");
      return;
    }

    try {
      const blob = await reportService.downloadExport(item.id);
      const extension = item.format === "excel" ? "xlsx" : item.format;
      const fallbackName = `${item.reportName || "report-export"}`
        .trim()
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase();
      const fileName =
        item.fileName || `${fallbackName || "report-export"}.${extension}`;

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast.success("Download started");
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, "Failed to download export."));
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <Card className="relative overflow-hidden border-border/70 bg-[linear-gradient(135deg,hsl(var(--primary)/0.35)_0%,hsl(var(--background))_52%,hsl(var(--muted)/0.7)_100%)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,hsl(var(--foreground)/0.08)_1px,transparent_0)] bg-size-[14px_14px]" />
        <div className="pointer-events-none absolute -right-16 -top-24 h-60 w-60 rounded-full bg-[hsl(var(--chart-4)/0.24)] blur-3xl" />
        <CardContent className="relative space-y-4 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl [font-family:var(--font-display)]">
                My Reports
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Auction reporting -{" "}
                <span className="font-medium text-foreground">{rangeLabel}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Date range</span>
            </div>
            <DateRangeFilter value={range} onChange={setRange} />
            <Select value={auctionScope} onValueChange={setAuctionScope}>
              <SelectTrigger className="w-full sm:w-60">
                <Gavel className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {auctionOptions.map((auction) => (
                  <SelectItem key={auction.id} value={auction.id}>
                    {auction.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {range && (
              <Button variant="ghost" size="sm" onClick={() => setRange(undefined)}>
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={(value) => setTab(value as TabValue)}>
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-4">
          <TabsTrigger value="overview">
            <BarChart3 className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="mr-2 h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="presets">
            <Save className="mr-2 h-4 w-4" />
            My Presets
          </TabsTrigger>
          <TabsTrigger value="exports">
            <Download className="mr-2 h-4 w-4" />
            Exports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <Card className="border-border/70 bg-background/55 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="[font-family:var(--font-display)]">
                Performance Snapshot
              </CardTitle>
            <CardDescription>
                {rangeLabel} - {auctionLabel}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isOverviewLoading ? (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={`kpi-skeleton-${index}`}
                      className="rounded-xl border border-border/70 bg-background/60 p-3"
                    >
                      <div className="h-3 w-7/12 animate-pulse rounded bg-muted/50" />
                      <div className="mt-2 h-6 w-5/12 animate-pulse rounded bg-muted/40" />
                      <div className="mt-2 h-3 w-8/12 animate-pulse rounded bg-muted/40" />
                    </div>
                  ))}
                </div>
              ) : (
                <KpiGrid cards={kpiCards} />
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-background/55 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 [font-family:var(--font-display)]">
                <Bell className="h-4 w-4" />
                Insights & Alerts
              </CardTitle>
              <CardDescription>
                Computed from your current period data. Open any alert to jump
                into its report.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InsightsPanel
                insights={insights}
                getReportName={(reportId) =>
                  REPORTS.find((report) => report.id === reportId)?.name
                }
                isLoading={isOverviewLoading}
                onOpen={(reportId) => {
                  const report = REPORTS.find((item) => item.id === reportId);
                  if (report) openReport(report);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-6 space-y-6">
          {selectedReport && (
            <ReportActionBar
              selectedReport={selectedReport}
              auctionLabel={auctionLabel}
              rangeLabel={rangeLabel}
              runState={runState}
              onGenerate={() => {
                void generateReport(selectedReport, false);
              }}
              onSavePreset={() => {
                void savePreset();
              }}
              onExport={(format) => {
                void exportReport(format);
              }}
            />
          )}

          <Card className="border-border/70 bg-background/55 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="[font-family:var(--font-display)]">
                Quick Access
              </CardTitle>
              <CardDescription>
                Recently run templates and workflow packs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QuickAccessPanel
                recentReports={recentReports}
                packs={REPORT_PACKS}
                onOpenReport={(report) => openReport(report)}
                onGeneratePack={(pack) => {
                  void generatePack(pack);
                }}
              />
            </CardContent>
          </Card>

          <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            <ReportLibraryPanel
              groupedReports={groupedReports}
              search={search}
              setSearch={setSearch}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              selectedReportId={selectedReport?.id}
              onOpenReport={(report) => openReport(report, false)}
            />
            <div ref={runPanelRef}>
              <RunReportPanel
                selectedReport={selectedReport}
                rangeLabel={rangeLabel}
                auctionLabel={auctionLabel}
                runState={runState}
                previewRows={previewRows}
                onExport={(format) => {
                  void exportReport(format);
                }}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="presets" className="mt-6">
          <PresetsPanel
            presets={presets}
            isLoading={isPresetsLoading}
            getReportById={(reportId) =>
              REPORTS.find((report) => report.id === reportId)
            }
            onRunPreset={(preset) => {
              void runPreset(preset);
            }}
            onDeletePreset={(id) => {
              void deletePreset(id);
            }}
          />
        </TabsContent>

        <TabsContent value="exports" className="mt-6">
          <ExportsPanel
            exports={exports}
            isLoading={isExportsLoading}
            onSchedule={() => toast.info("Scheduled exports - coming soon")}
            onDownload={(item) => {
              void downloadExport(item);
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
