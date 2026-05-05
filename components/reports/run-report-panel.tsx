"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Download, FileSpreadsheet, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ExportFormat, ReportTemplate, RunState } from "./report-types";

interface RunReportPanelProps {
  selectedReport: ReportTemplate | null;
  rangeLabel: string;
  auctionLabel: string;
  runState: RunState;
  onExport: (format: ExportFormat) => void;
  previewRows?: Array<Record<string, unknown>>;
}

function EmptyStateIllustration() {
  return (
    <svg
      viewBox="0 0 180 120"
      className="mb-3 h-24 w-40 text-muted-foreground/40"
      aria-hidden="true"
    >
      <rect x="16" y="18" width="148" height="86" rx="12" fill="currentColor" opacity="0.16" />
      <rect x="30" y="34" width="84" height="8" rx="4" fill="currentColor" opacity="0.28" />
      <rect x="30" y="52" width="120" height="6" rx="3" fill="currentColor" opacity="0.2" />
      <rect x="30" y="66" width="110" height="6" rx="3" fill="currentColor" opacity="0.2" />
      <circle cx="136" cy="36" r="10" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

export function RunReportPanel({
  selectedReport,
  rangeLabel,
  auctionLabel,
  runState,
  onExport,
  previewRows = [],
}: RunReportPanelProps) {
  const previewColumns =
    previewRows.length > 0 ? Object.keys(previewRows[0] ?? {}).slice(0, 6) : [];

  const formatCell = (value: unknown) => {
    if (value === null || value === undefined || value === "") return "-";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  };

  return (
    <Card className="min-w-0 border-border/70 bg-background/55 backdrop-blur-md xl:sticky xl:top-36 xl:self-start">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-3">
          {selectedReport ? (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <selectedReport.icon className="h-5 w-5 text-primary" />
            </span>
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/60">
              <Layers className="h-5 w-5 text-muted-foreground" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base [font-family:var(--font-display)]">
              {selectedReport ? selectedReport.name : "Run Report"}
            </CardTitle>
            <CardDescription className="mt-0.5 line-clamp-2">
              {selectedReport
                ? selectedReport.description
                : "Select a template on the left to configure and generate."}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {selectedReport ? (
          <>
            {/* Scope summary — compact single row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
              <span className="text-xs text-muted-foreground">
                Range:{" "}
                <span className="font-medium text-foreground">{rangeLabel}</span>
              </span>
              <span className="hidden text-border sm:block">/</span>
              <span className="text-xs text-muted-foreground">
                Auction:{" "}
                <span className="font-medium text-foreground">{auctionLabel}</span>
              </span>
            </div>

            {runState === "generating" && (
              <div className="overflow-hidden rounded-xl border border-border/70 bg-background/65 p-4">
                <div className="space-y-3">
                  <div className="h-4 w-40 rounded bg-muted/40" />
                  <div className="h-3 w-full rounded bg-muted/30" />
                  <div className="h-3 w-5/6 rounded bg-muted/30" />
                </div>
                <motion.div
                  className="pointer-events-none mt-3 h-1.5 rounded-full bg-[linear-gradient(90deg,transparent,hsl(var(--primary)/0.65),transparent)]"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.4, ease: "linear" }}
                />
              </div>
            )}

            {runState === "ready" && (
              <div className="space-y-3">
                <div className="rounded-xl border border-primary/30 bg-primary/10 p-3">
                  <p className="flex items-center gap-2 text-sm font-medium text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                    Report ready &mdash; {rangeLabel}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Results shown below. Export in your preferred format.
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Export
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedReport.exports.includes("csv") && (
                      <Button variant="outline" size="sm" onClick={() => onExport("csv")}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        CSV
                      </Button>
                    )}
                    {selectedReport.exports.includes("excel") && (
                      <Button variant="outline" size="sm" onClick={() => onExport("excel")}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Excel
                      </Button>
                    )}
                    {selectedReport.exports.includes("pdf") && (
                      <Button variant="outline" size="sm" onClick={() => onExport("pdf")}>
                        <Download className="mr-2 h-4 w-4" />
                        PDF
                      </Button>
                    )}
                  </div>
                </div>

                <div className="w-full overflow-x-auto rounded-xl border border-border/70">
                  {previewRows.length === 0 ? (
                    <div className="p-4 text-center">
                      <p className="text-sm font-medium text-muted-foreground">
                        No preview rows returned
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        The run completed successfully but did not return tabular preview data.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2 p-3 md:hidden">
                        {previewRows.slice(0, 12).map((row, rowIndex) => (
                          <div
                            key={`preview-card-${rowIndex}`}
                            className="rounded-lg border border-border/70 bg-background/60 p-3"
                          >
                            {previewColumns.map((column) => (
                              <div
                                key={`${rowIndex}-${column}`}
                                className="flex items-start justify-between gap-3 py-1"
                              >
                                <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                  {column.replace(/_/g, " ")}
                                </span>
                                <span className="max-w-[64%] break-words text-right text-xs">
                                  {formatCell(row[column])}
                                </span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>

                      <div className="hidden md:block">
                        <Table className="table-fixed">
                          <TableHeader>
                            <TableRow>
                              {previewColumns.map((column) => (
                                <TableHead key={column} className="capitalize">
                                  {column.replace(/_/g, " ")}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {previewRows.slice(0, 30).map((row, rowIndex) => (
                              <TableRow key={`preview-row-${rowIndex}`}>
                                {previewColumns.map((column) => (
                                  <TableCell
                                    key={`${rowIndex}-${column}`}
                                    className="max-w-[240px] break-words text-sm"
                                  >
                                    {column.toLowerCase().includes("status") ? (
                                      <Badge variant="outline">{formatCell(row[column])}</Badge>
                                    ) : (
                                      formatCell(row[column])
                                    )}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
            <EmptyStateIllustration />
            <p className="text-sm font-medium text-muted-foreground">No template selected</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Choose a report from the library on the left to configure and run it.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
