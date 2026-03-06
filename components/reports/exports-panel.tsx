"use client";

import { ArrowRight, Download, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { exportStatusBadge, formatBadge } from "./report-helpers";
import type { ExportRow } from "./report-types";

interface ExportsPanelProps {
  exports: ExportRow[];
  onSchedule: () => void;
  onDownload: (item: ExportRow) => void;
  isLoading?: boolean;
}

export function ExportsPanel({
  exports,
  onSchedule,
  onDownload,
  isLoading = false,
}: ExportsPanelProps) {
  return (
    <div className="space-y-6">
      <Card className="border-primary/25 bg-primary/10 backdrop-blur-md">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold [font-family:var(--font-display)]">
                Schedule automated exports
              </p>
              <p className="text-xs text-muted-foreground">
                Set weekly or monthly deliveries to your inbox without logging in.
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={onSchedule}>
            Set up schedule
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-background/55 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="[font-family:var(--font-display)]">Exports</CardTitle>
          <CardDescription>
            Every export includes its filters, timestamp, and requestor identity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`export-skeleton-${index}`}
                  className="rounded-xl border border-border/70 bg-background/60 p-3"
                >
                  <div className="h-4 w-8/12 animate-pulse rounded bg-muted/50" />
                  <div className="mt-2 h-3 w-5/12 animate-pulse rounded bg-muted/40" />
                  <div className="mt-2 h-3 w-6/12 animate-pulse rounded bg-muted/40" />
                </div>
              ))}
            </div>
          ) : exports.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <p className="text-sm font-medium text-muted-foreground">No exports yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Queue an export from a completed report run to see history here.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {exports.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-border/70 bg-background/60 p-3"
                  >
                    <div className="mb-2 flex min-w-0 items-center justify-between gap-3">
                      <p className="truncate text-sm font-medium">{item.reportName}</p>
                      <div className="shrink-0">{formatBadge(item.format)}</div>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      {exportStatusBadge(item.status)}
                      <p className="text-xs text-muted-foreground">{item.generatedAt}</p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{item.filters}</p>
                    {item.status === "done" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-2 h-7 px-2 text-xs"
                        onClick={() => onDownload(item)}
                      >
                        <Download className="mr-1.5 h-3 w-3" />
                        Download
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="hidden overflow-x-auto rounded-xl border border-border/70 md:block">
                <Table className="min-w-[920px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report</TableHead>
                      <TableHead>Format</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Generated</TableHead>
                      <TableHead>By</TableHead>
                      <TableHead>Filters</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exports.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.reportName}</TableCell>
                        <TableCell>{formatBadge(item.format)}</TableCell>
                        <TableCell>{exportStatusBadge(item.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.generatedAt}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.generatedBy}
                        </TableCell>
                        <TableCell className="max-w-[260px] truncate text-xs text-muted-foreground">
                          {item.filters}
                        </TableCell>
                        <TableCell>
                          {item.status === "done" && (
                            <Button size="sm" variant="ghost" onClick={() => onDownload(item)}>
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
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
    </div>
  );
}
