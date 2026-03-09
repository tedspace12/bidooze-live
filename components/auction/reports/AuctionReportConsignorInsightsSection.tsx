"use client";

import { useDeferredValue, useState } from "react";
import { Landmark, Package, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import { useAuctionReportConsignors } from "@/features/auction/hooks/useAuctionReports";
import type { AuctionReportConsignorsParams } from "@/features/auction/report-types";

import {
  ReportPagination,
  ReportSectionEmpty,
  ReportSectionError,
  ReportSectionLoading,
  formatCurrency,
  formatPercent,
  getErrorMessage,
  toNumber,
  useLazySection,
} from "./report-utils";

interface AuctionReportConsignorInsightsSectionProps {
  auctionId: string | number;
}

export default function AuctionReportConsignorInsightsSection({
  auctionId,
}: AuctionReportConsignorInsightsSectionProps) {
  const { ref, enabled } = useLazySection<HTMLDivElement>();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] =
    useState<NonNullable<AuctionReportConsignorsParams["sort_by"]>>("gross_sales");
  const [sortDir, setSortDir] =
    useState<NonNullable<AuctionReportConsignorsParams["sort_dir"]>>("desc");
  const deferredSearch = useDeferredValue(search);

  const query = useAuctionReportConsignors(
    auctionId,
    {
      page,
      per_page: 10,
      search: deferredSearch || undefined,
      sort_by: sortBy,
      sort_dir: sortDir,
    },
    { enabled }
  );

  if (!enabled || query.isLoading) {
    return (
      <section ref={ref} className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold tracking-tight">Consignor Insights</h3>
          <p className="text-sm text-muted-foreground">Consignor sell-through, gross sales, and payout readiness.</p>
        </div>
        <ReportSectionLoading rows={4} />
      </section>
    );
  }

  if (query.isError || !query.data) {
    return (
      <section ref={ref} className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold tracking-tight">Consignor Insights</h3>
          <p className="text-sm text-muted-foreground">Consignor sell-through, gross sales, and payout readiness.</p>
        </div>
        <ReportSectionError
          title="Consignor report unavailable"
          message={getErrorMessage(query.error, "Unable to load consignor insights.")}
          onRetry={() => query.refetch()}
        />
      </section>
    );
  }

  const data = query.data;
  const aggregates = data.aggregates || {};
  const meta = data.meta || {};
  const currency = data.context?.currency || "USD";
  const cards = [
    { label: "Consignors count", value: toNumber(aggregates.consignors_count), icon: Landmark },
    {
      label: "Gross sales total",
      value: formatCurrency(
        (data.items || []).reduce((sum, item) => sum + toNumber(item.gross_sales), 0),
        currency
      ),
      icon: Wallet,
    },
    {
      label: "Net payout estimate",
      value: formatCurrency(
        (data.items || []).reduce((sum, item) => sum + toNumber(item.net_payout_estimate), 0),
        currency
      ),
      icon: Wallet,
    },
    {
      label: "Lots submitted",
      value: (data.items || [])
        .reduce((sum, item) => sum + toNumber(item.lots_submitted), 0)
        .toLocaleString(),
      icon: Package,
    },
  ];

  return (
    <section ref={ref} className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-xl font-semibold tracking-tight">Consignor Insights</h3>
        <p className="text-sm text-muted-foreground">
          Sell-through and payout posture across the consignor base for this auction.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">{card.value}</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="space-y-1">
            <CardTitle className="text-base">Top consignors</CardTitle>
            <p className="text-sm text-muted-foreground">
              Ranked by sales and sell-through performance.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search consignor"
            />
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consignor_name">Consignor name</SelectItem>
                <SelectItem value="lots_submitted">Lots submitted</SelectItem>
                <SelectItem value="lots_sold">Lots sold</SelectItem>
                <SelectItem value="sell_through_rate">Sell-through rate</SelectItem>
                <SelectItem value="gross_sales">Gross sales</SelectItem>
                <SelectItem value="net_payout_estimate">Net payout estimate</SelectItem>
                <SelectItem value="payout_status">Payout status</SelectItem>
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
        </CardHeader>
        <CardContent className="space-y-4">
          {(data.items || []).length === 0 ? (
            <ReportSectionEmpty
              title="No consignor rows matched the current filters"
              message="Adjust search or sorting to inspect a different consignor segment."
            />
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {(data.items || []).map((item) => (
                  <div
                    key={item.consignor_id}
                    className="rounded-xl border border-border/70 bg-background p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{item.consignor_name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {toNumber(item.lots_sold).toLocaleString()} sold of{" "}
                          {toNumber(item.lots_submitted).toLocaleString()} submitted
                        </p>
                      </div>
                      <Badge variant="outline">{item.payout_status || "Not created"}</Badge>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Sell-through</p>
                        <p className="mt-1 text-sm font-medium">
                          {formatPercent(toNumber(item.sell_through_rate))}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Gross sales</p>
                        <p className="mt-1 text-sm font-medium">
                          {formatCurrency(toNumber(item.gross_sales), currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                          Net payout estimate
                        </p>
                        <p className="mt-1 text-sm font-medium">
                          {formatCurrency(toNumber(item.net_payout_estimate), currency)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden overflow-x-auto rounded-xl border border-border/70 md:block">
                <Table className="min-w-[920px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Consignor</TableHead>
                      <TableHead>Lots submitted</TableHead>
                      <TableHead>Lots sold</TableHead>
                      <TableHead>Sell-through</TableHead>
                      <TableHead>Gross sales</TableHead>
                      <TableHead>Net payout estimate</TableHead>
                      <TableHead>Payout status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(data.items || []).map((item) => (
                      <TableRow key={item.consignor_id}>
                        <TableCell className="font-medium">{item.consignor_name}</TableCell>
                        <TableCell>{toNumber(item.lots_submitted).toLocaleString()}</TableCell>
                        <TableCell>{toNumber(item.lots_sold).toLocaleString()}</TableCell>
                        <TableCell>{formatPercent(toNumber(item.sell_through_rate))}</TableCell>
                        <TableCell>{formatCurrency(toNumber(item.gross_sales), currency)}</TableCell>
                        <TableCell>{formatCurrency(toNumber(item.net_payout_estimate), currency)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.payout_status || "Not created"}</Badge>
                        </TableCell>
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
    </section>
  );
}
