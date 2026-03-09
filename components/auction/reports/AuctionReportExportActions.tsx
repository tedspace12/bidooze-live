"use client";

import { useEffect, useRef, useState } from "react";
import { Download, FileSpreadsheet, Files, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { formatBadge, exportStatusBadge } from "@/components/reports/report-helpers";
import type { ExportStatus } from "@/components/reports/report-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAuctionReportBiddersExport,
  useAuctionReportFullExport,
  useAuctionReportLotsExport,
  useAuctionReportSettlementExport,
  useAuctionReportSummaryExport,
} from "@/features/auction/hooks/useAuctionReports";
import { reportService } from "@/features/reports/services/reportService";
import type {
  AuctionReportExportFormat,
  AuctionReportExportResult,
} from "@/features/auction/report-types";

import { downloadBlob, formatDateTime, getErrorMessage } from "./report-utils";

interface AuctionReportExportActionsProps {
  auctionId: string | number;
}

interface ExportRunRow {
  id: string;
  exportId?: string;
  runId?: string;
  label: string;
  format: AuctionReportExportFormat;
  status: ExportStatus;
  createdAt: string;
  message: string;
}

export default function AuctionReportExportActions({
  auctionId,
}: AuctionReportExportActionsProps) {
  const [format, setFormat] = useState<AuctionReportExportFormat>("csv");
  const [history, setHistory] = useState<ExportRunRow[]>([]);
  const [downloadingExportId, setDownloadingExportId] = useState<string | null>(null);
  const historyRef = useRef<ExportRunRow[]>([]);
  const isPollingRef = useRef(false);
  const summaryExport = useAuctionReportSummaryExport(auctionId);
  const lotsExport = useAuctionReportLotsExport(auctionId);
  const biddersExport = useAuctionReportBiddersExport(auctionId);
  const settlementExport = useAuctionReportSettlementExport(auctionId);
  const fullExport = useAuctionReportFullExport(auctionId);

  const pushHistory = (row: ExportRunRow) => {
    setHistory((current) => {
      const next = [row, ...current].slice(0, 8);
      historyRef.current = next;
      return next;
    });
  };

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  const pendingExportIds = history
    .filter((item) => item.status === "queued" || item.status === "processing")
    .map((item) => item.id)
    .join("|");

  useEffect(() => {
    if (!pendingExportIds) return;

    let isCancelled = false;

    const pollExportStatuses = async () => {
      if (isPollingRef.current) return;
      isPollingRef.current = true;

      try {
        const response = await reportService.listExports({ per_page: 100 });
        if (isCancelled) return;

        const exportsById = new Map(response.data.map((item) => [item.export_id, item]));
        const previousHistory = historyRef.current;
        const nextHistory = previousHistory.map((item) => {
          if (item.status !== "queued" && item.status !== "processing") {
            return item;
          }

          const latest = exportsById.get(item.exportId ?? item.id);
          if (!latest) return item;

          const nextStatus = latest.status || item.status;
          const nextMessage =
            nextStatus === "done"
              ? "Export ready for download."
              : nextStatus === "failed"
                ? latest.error || "Export failed."
                : nextStatus === "processing"
                  ? "Export is being prepared by the backend."
                  : item.message;

            return {
              ...item,
              exportId: latest.export_id || item.exportId,
              runId: latest.run_id || item.runId,
              status: nextStatus,
              createdAt: latest.completed_at || latest.queued_at || item.createdAt,
              message: nextMessage,
            };
        });

        historyRef.current = nextHistory;
        setHistory(nextHistory);

        nextHistory.forEach((item, index) => {
          const previous = previousHistory[index];
          if (!previous || previous.id !== item.id || previous.status === item.status) return;

          if (item.status === "done") {
            toast.success(`${item.label} export is ready.`, {
              description: "You can download it from the export activity list now.",
            });
          }

          if (item.status === "failed") {
            toast.error(`${item.label} export failed.`, {
              description: item.message,
            });
          }
        });
      } catch {
        // Keep the latest known export state if background polling fails.
      } finally {
        isPollingRef.current = false;
      }
    };

    void pollExportStatuses();
    const intervalId = window.setInterval(() => {
      void pollExportStatuses();
    }, 5000);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, [pendingExportIds]);

  const handleDownloadExport = async (item: ExportRunRow) => {
    if (item.status !== "done" || !item.exportId) {
      toast.info("This export is not downloadable yet.");
      return;
    }

    try {
      setDownloadingExportId(item.id);
      const blob = await reportService.downloadExport(item.exportId);
      downloadBlob(
        blob,
        `${item.label.toLowerCase().replace(/\s+/g, "-")}.${item.format === "excel" ? "xls" : "csv"}`
      );
      toast.success(`${item.label} export downloaded.`);
    } catch (error: unknown) {
      toast.error(`Failed to download ${item.label.toLowerCase()}.`, {
        description: getErrorMessage(error, "Please try again."),
      });
    } finally {
      setDownloadingExportId(null);
    }
  };

  const handleResult = (
    label: string,
    result: AuctionReportExportResult,
    extension: AuctionReportExportFormat
  ) => {
    if (result.kind === "file") {
      downloadBlob(result.blob, result.filename || `${label.toLowerCase().replace(/\s+/g, "-")}.${extension === "excel" ? "xls" : "csv"}`);
      pushHistory({
        id: `${label}-${Date.now()}`,
        label,
        format: extension,
        status: "done",
        createdAt: new Date().toISOString(),
        message: "Export downloaded successfully.",
      });
      toast.success(`${label} export downloaded.`);
      return;
    }

    pushHistory({
      id: result.data.export_id || `${label}-${Date.now()}`,
      exportId: result.data.export_id || undefined,
      runId: typeof result.data.run_id === "string" ? result.data.run_id : undefined,
      label,
      format: extension,
      status: (result.data.status as ExportStatus) || "queued",
      createdAt: result.data.queued_at || new Date().toISOString(),
      message: result.message,
    });
    toast.success(`${label} export queued.`, {
      description: "Large export is being prepared by the backend and will only be downloadable after it completes.",
    });
  };

  const runExport = async (
    label: string,
    runner: () => Promise<AuctionReportExportResult>
  ) => {
    try {
      const result = await runner();
      handleResult(label, result, format);
    } catch (error: unknown) {
      pushHistory({
        id: `${label}-${Date.now()}`,
        label,
        format,
        status: "failed",
        createdAt: new Date().toISOString(),
        message: getErrorMessage(error, "Export request failed."),
      });
      toast.error(`Failed to export ${label.toLowerCase()}.`, {
        description: getErrorMessage(error, "Please try again."),
      });
    }
  };

  const actions = [
    {
      label: "Export summary",
      description: "Executive KPI snapshot for this auction.",
      isPending: summaryExport.isPending,
      onClick: () => runExport("Summary", () => summaryExport.mutateAsync({ format })),
    },
    {
      label: "Export lots",
      description: "Lot-level performance and sale outcomes.",
      isPending: lotsExport.isPending,
      onClick: () => runExport("Lots", () => lotsExport.mutateAsync({ format })),
    },
    {
      label: "Export bidders",
      description: "Bidder participation and spend leaderboard.",
      isPending: biddersExport.isPending,
      onClick: () => runExport("Bidders", () => biddersExport.mutateAsync({ format })),
    },
    {
      label: "Export settlement",
      description: "Settlement summary, invoices, and payouts.",
      isPending: settlementExport.isPending,
      onClick: () => runExport("Settlement", () => settlementExport.mutateAsync({ format })),
    },
    {
      label: "Full report export",
      description: "Queue the full report pack for offline review.",
      isPending: fullExport.isPending,
      onClick: () => runExport("Full report", () => fullExport.mutateAsync({ format })),
    },
  ];

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-xl font-semibold tracking-tight">Export Actions</h3>
        <p className="text-sm text-muted-foreground">
          Generate direct downloads for smaller exports and queued jobs for heavier report packs.
        </p>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">Report exports</CardTitle>
            <div className="flex items-center gap-2">
              <Select
                value={format}
                onValueChange={(value) => setFormat(value as AuctionReportExportFormat)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {actions.map((action) => (
            <div key={action.label} className="rounded-xl border border-border/70 bg-muted/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{action.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>
                </div>
                <div className="rounded-lg border border-border/70 bg-background p-2">
                  {action.label === "Full report export" ? (
                    <Files className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="mt-4 w-full"
                onClick={action.onClick}
                disabled={action.isPending}
              >
                {action.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Run export
                  </>
                )}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent export activity</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <p className="text-sm font-medium text-foreground">No export actions yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Run a report export to track download or queue status here.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {history.map((item) => (
                  <div key={item.id} className="rounded-xl border border-border/70 bg-background p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{item.label}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{item.message}</p>
                      </div>
                      <div className="shrink-0">{exportStatusBadge(item.status)}</div>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Format</p>
                        <div className="mt-1">{formatBadge(item.format)}</div>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Created</p>
                        <p className="mt-1 text-sm font-medium">{formatDateTime(item.createdAt)}</p>
                      </div>
                    </div>
                    {item.status === "done" && item.exportId ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 w-full"
                        onClick={() => {
                          void handleDownloadExport(item);
                        }}
                        disabled={downloadingExportId === item.id}
                      >
                        {downloadingExportId === item.id ? "Downloading..." : "Download export"}
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="hidden overflow-x-auto rounded-xl border border-border/70 md:block">
                <Table className="min-w-[760px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Export</TableHead>
                      <TableHead>Format</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.label}</TableCell>
                        <TableCell>{formatBadge(item.format)}</TableCell>
                        <TableCell>{exportStatusBadge(item.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(item.createdAt)}
                        </TableCell>
                        <TableCell className="max-w-[320px] text-sm text-muted-foreground">
                          {item.message}
                        </TableCell>
                        <TableCell>
                          {item.status === "done" && item.exportId ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                void handleDownloadExport(item);
                              }}
                              disabled={downloadingExportId === item.id}
                            >
                              {downloadingExportId === item.id ? "Downloading..." : "Download"}
                            </Button>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
