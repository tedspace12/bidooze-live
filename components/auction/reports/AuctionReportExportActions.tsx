"use client";

import { useState } from "react";
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
  label: string;
  format: AuctionReportExportFormat;
  status: ExportStatus;
  createdAt: string;
  message: string;
  downloadPath?: string;
}

export default function AuctionReportExportActions({
  auctionId,
}: AuctionReportExportActionsProps) {
  const [format, setFormat] = useState<AuctionReportExportFormat>("csv");
  const [history, setHistory] = useState<ExportRunRow[]>([]);
  const summaryExport = useAuctionReportSummaryExport(auctionId);
  const lotsExport = useAuctionReportLotsExport(auctionId);
  const biddersExport = useAuctionReportBiddersExport(auctionId);
  const settlementExport = useAuctionReportSettlementExport(auctionId);
  const fullExport = useAuctionReportFullExport(auctionId);

  const pushHistory = (row: ExportRunRow) => {
    setHistory((current) => [row, ...current].slice(0, 8));
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
      label,
      format: extension,
      status: (result.data.status as ExportStatus) || "queued",
      createdAt: result.data.queued_at || new Date().toISOString(),
      message: result.message,
      downloadPath: result.data.download_path || undefined,
    });
    toast.success(`${label} export queued.`, {
      description: result.data.download_path || "Large export is being prepared by the backend.",
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
                    {item.downloadPath ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 w-full"
                        onClick={() => window.open(item.downloadPath, "_blank", "noopener,noreferrer")}
                      >
                        Open export
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
                          {item.downloadPath ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(item.downloadPath, "_blank", "noopener,noreferrer")}
                            >
                              Open
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
