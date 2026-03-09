"use client";

import { useDeferredValue, useState } from "react";
import { BarChart3, Package } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { useAuctionReportLotPerformance } from "@/features/auction/hooks/useAuctionReports";
import type { AuctionReportLotsParams } from "@/features/auction/report-types";

import {
  ReportPagination,
  ReportSectionEmpty,
  ReportSectionError,
  ReportSectionLoading,
  formatCurrency,
  formatDateTime,
  formatStatusLabel,
  getErrorMessage,
  toNumber,
  useLazySection,
} from "./report-utils";

interface AuctionReportLotPerformanceSectionProps {
  auctionId: string | number;
}

export default function AuctionReportLotPerformanceSection({
  auctionId,
}: AuctionReportLotPerformanceSectionProps) {
  const { ref, enabled } = useLazySection<HTMLDivElement>();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [reserveMet, setReserveMet] = useState("all");
  const [estimateBand, setEstimateBand] = useState("all");
  const [sortBy, setSortBy] = useState<NonNullable<AuctionReportLotsParams["sort_by"]>>("sale_order");
  const [sortDir, setSortDir] = useState<NonNullable<AuctionReportLotsParams["sort_dir"]>>("asc");

  const deferredSearch = useDeferredValue(search);
  const query = useAuctionReportLotPerformance(
    auctionId,
    {
      page,
      per_page: 10,
      search: deferredSearch || undefined,
      status: status === "all" ? undefined : (status as AuctionReportLotsParams["status"]),
      reserve_met:
        reserveMet === "all" ? undefined : reserveMet === "yes",
      estimate_band:
        estimateBand === "all"
          ? undefined
          : (estimateBand as AuctionReportLotsParams["estimate_band"]),
      sort_by: sortBy,
      sort_dir: sortDir,
    },
    { enabled }
  );

  const data = query.data;
  const aggregates = data?.aggregates || {};
  const meta = data?.meta || {};
  const currency = data?.context?.currency || "USD";
  const timezone = data?.context?.timezone;
  const cards = [
    { label: "Sold lots", value: toNumber(aggregates.sold_lots_count) },
    { label: "Unsold lots", value: toNumber(aggregates.unsold_lots_count) },
    { label: "Withdrawn lots", value: toNumber(aggregates.withdrawn_lots_count) },
    { label: "Passed lots", value: toNumber(aggregates.passed_lots_count) },
    { label: "Reserve met", value: toNumber(aggregates.reserve_met_count) },
    { label: "Reserve not met", value: toNumber(aggregates.reserve_not_met_count) },
    { label: "Above estimate", value: toNumber(aggregates.lots_above_high_estimate_count) },
    { label: "Within estimate", value: toNumber(aggregates.lots_within_estimate_count) },
    { label: "Below estimate", value: toNumber(aggregates.lots_below_low_estimate_count) },
  ];

  return (
    <section ref={ref} className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-xl font-semibold tracking-tight">Lot Performance</h3>
        <p className="text-sm text-muted-foreground">
          Sales outcomes, reserve performance, estimate positioning, and top lot-level results.
        </p>
      </div>

      {!enabled || query.isLoading ? (
        <ReportSectionLoading rows={4} />
      ) : query.isError || !data ? (
        <ReportSectionError
          title="Lot performance unavailable"
          message={getErrorMessage(query.error, "Unable to load lot performance data.")}
          onRetry={() => query.refetch()}
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => (
              <Card key={card.label}>
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                    <p className="mt-1 text-3xl font-semibold tracking-tight">{card.value}</p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="space-y-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    Top and important lots
                  </CardTitle>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => query.refetch()}>
                    Refresh
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                <Input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search lots, winners, consignors"
                  className="xl:col-span-2"
                />
                <Select
                  value={status}
                  onValueChange={(value) => {
                    setStatus(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="passed">Passed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={reserveMet}
                  onValueChange={(value) => {
                    setReserveMet(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Reserve" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All reserve states</SelectItem>
                    <SelectItem value="yes">Reserve met</SelectItem>
                    <SelectItem value="no">Reserve not met</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={estimateBand}
                  onValueChange={(value) => {
                    setEstimateBand(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Estimate band" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All estimate bands</SelectItem>
                    <SelectItem value="above_high">Above estimate</SelectItem>
                    <SelectItem value="within">Within estimate</SelectItem>
                    <SelectItem value="below_low">Below estimate</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2 xl:col-span-2">
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale_order">Sale order</SelectItem>
                      <SelectItem value="lot_number">Lot number</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="final_price">Final price</SelectItem>
                      <SelectItem value="bids_count">Bids count</SelectItem>
                      <SelectItem value="winner_name">Winner</SelectItem>
                      <SelectItem value="consignor_name">Consignor</SelectItem>
                      <SelectItem value="reserve_met">Reserve met</SelectItem>
                      <SelectItem value="sold_at">Sold at</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortDir} onValueChange={(value) => setSortDir(value as typeof sortDir)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Direction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
          {(data.items || []).length === 0 ? (
            <ReportSectionEmpty
              title="No lot rows matched the current filters"
              message="Adjust the lot filters or sorting to see performance records."
            />
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {(data.items || []).map((lot) => (
                  <div
                    key={`${lot.lot_id}-${lot.sale_order ?? lot.lot_number}`}
                    className="rounded-xl border border-border/70 bg-background p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">Lot {lot.lot_number}</p>
                        <p className="text-sm text-muted-foreground">{lot.title}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Sale order {toNumber(lot.sale_order)}
                        </p>
                      </div>
                      <Badge variant="outline">{formatStatusLabel(lot.status || "unknown")}</Badge>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Bids</p>
                        <p className="mt-1 text-sm font-medium">{toNumber(lot.bids_count).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Final price</p>
                        <p className="mt-1 text-sm font-medium">
                          {formatCurrency(toNumber(lot.final_price), currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Reserve</p>
                        <div className="mt-1">
                          <Badge variant={lot.reserve_met ? "default" : "secondary"}>
                            {lot.reserve_met ? "Met" : "Not met"}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Sold at</p>
                        <p className="mt-1 text-sm font-medium">
                          {formatDateTime(lot.sold_at || undefined, timezone)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Winner</p>
                        <p className="mt-1 text-sm font-medium">{lot.winner_name || "No winner"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Consignor</p>
                        <p className="mt-1 text-sm font-medium">
                          {lot.consignor_name || "Unknown consignor"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden overflow-x-auto rounded-xl border border-border/70 md:block">
                <Table className="min-w-[1080px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lot</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Bids</TableHead>
                      <TableHead>Final price</TableHead>
                      <TableHead>Reserve</TableHead>
                      <TableHead>Winner</TableHead>
                      <TableHead>Consignor</TableHead>
                      <TableHead>Sold at</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(data.items || []).map((lot) => (
                      <TableRow key={`${lot.lot_id}-${lot.sale_order ?? lot.lot_number}`}>
                        <TableCell className="align-top whitespace-normal">
                          <p className="font-medium text-foreground">Lot {lot.lot_number}</p>
                          <p className="text-xs text-muted-foreground">{lot.title}</p>
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            Sale order {toNumber(lot.sale_order)}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{formatStatusLabel(lot.status || "unknown")}</Badge>
                        </TableCell>
                        <TableCell>{toNumber(lot.bids_count).toLocaleString()}</TableCell>
                        <TableCell>{formatCurrency(toNumber(lot.final_price), currency)}</TableCell>
                        <TableCell>
                          <Badge variant={lot.reserve_met ? "default" : "secondary"}>
                            {lot.reserve_met ? "Met" : "Not met"}
                          </Badge>
                        </TableCell>
                        <TableCell>{lot.winner_name || "No winner"}</TableCell>
                        <TableCell>{lot.consignor_name || "Unknown consignor"}</TableCell>
                        <TableCell>{formatDateTime(lot.sold_at || undefined, timezone)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

              <ReportPagination
                page={toNumber(meta.current_page, 1)}
                lastPage={toNumber(meta.last_page, 1)}
                total={toNumber(meta.total, (data.items || []).length)}
                onPageChange={setPage}
              />
            </CardContent>
          </Card>
        </>
      )}
    </section>
  );
}
