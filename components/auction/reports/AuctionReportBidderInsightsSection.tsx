"use client";

import { useDeferredValue, useState } from "react";
import { Trophy, UserCheck, Users } from "lucide-react";

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
import { useAuctionReportBidders } from "@/features/auction/hooks/useAuctionReports";
import type { AuctionReportBiddersParams } from "@/features/auction/report-types";

import {
  ReportPagination,
  ReportSectionEmpty,
  ReportSectionError,
  ReportSectionLoading,
  formatCurrency,
  formatDateTime,
  formatPercent,
  getErrorMessage,
  toNumber,
  useLazySection,
} from "./report-utils";

interface AuctionReportBidderInsightsSectionProps {
  auctionId: string | number;
}

export default function AuctionReportBidderInsightsSection({
  auctionId,
}: AuctionReportBidderInsightsSectionProps) {
  const { ref, enabled } = useLazySection<HTMLDivElement>();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] =
    useState<NonNullable<AuctionReportBiddersParams["sort_by"]>>("total_spent");
  const [sortDir, setSortDir] =
    useState<NonNullable<AuctionReportBiddersParams["sort_dir"]>>("desc");
  const deferredSearch = useDeferredValue(search);

  const query = useAuctionReportBidders(
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
          <h3 className="text-xl font-semibold tracking-tight">Bidder Insights</h3>
          <p className="text-sm text-muted-foreground">Conversion, participation, and top bidder behavior.</p>
        </div>
        <ReportSectionLoading rows={4} />
      </section>
    );
  }

  if (query.isError || !query.data) {
    return (
      <section ref={ref} className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold tracking-tight">Bidder Insights</h3>
          <p className="text-sm text-muted-foreground">Conversion, participation, and top bidder behavior.</p>
        </div>
        <ReportSectionError
          title="Bidder report unavailable"
          message={getErrorMessage(query.error, "Unable to load bidder insights.")}
          onRetry={() => query.refetch()}
        />
      </section>
    );
  }

  const data = query.data;
  const aggregates = data.aggregates || {};
  const meta = data.meta || {};
  const currency = data.context?.currency || "USD";
  const timezone = data.context?.timezone;
  const cards = [
    { label: "Registrations", value: toNumber(aggregates.registrations_count), icon: Users },
    { label: "Approved bidders", value: toNumber(aggregates.approved_bidders_count), icon: UserCheck },
    { label: "Active bidders", value: toNumber(aggregates.active_bidders_count), icon: Users },
    { label: "Winning bidders", value: toNumber(aggregates.winning_bidders_count), icon: Trophy },
    { label: "Inactive registered", value: toNumber(aggregates.inactive_registered_bidders_count), icon: Users },
    {
      label: "Bidder conversion rate",
      value: formatPercent(toNumber(aggregates.bidder_conversion_rate)),
      icon: Trophy,
    },
    {
      label: "Avg bids per active bidder",
      value: toNumber(aggregates.average_bids_per_active_bidder).toFixed(2),
      icon: Trophy,
    },
    {
      label: "Top bidder concentration",
      value: formatPercent(toNumber(aggregates.top_bidder_concentration_rate)),
      icon: Trophy,
    },
  ];

  return (
    <section ref={ref} className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-xl font-semibold tracking-tight">Bidder Insights</h3>
        <p className="text-sm text-muted-foreground">
          Registration funnel, bidder activation, and top bidder concentration metrics.
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
                  <p className="mt-1 text-3xl font-semibold tracking-tight">{card.value}</p>
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
            <CardTitle className="text-base">Top bidders</CardTitle>
            <p className="text-sm text-muted-foreground">
              Sorted bidder leaderboard for participation and spend.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search bidder name or email"
            />
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bidder_name">Bidder name</SelectItem>
                <SelectItem value="bidder_email">Email</SelectItem>
                <SelectItem value="registration_status">Registration status</SelectItem>
                <SelectItem value="bids_count">Bids count</SelectItem>
                <SelectItem value="lots_won_count">Lots won</SelectItem>
                <SelectItem value="total_spent">Total spent</SelectItem>
                <SelectItem value="last_bid_at">Last bid at</SelectItem>
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
              title="No bidders matched the current filters"
              message="Adjust the bidder search or sort settings to inspect a different segment."
            />
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {(data.items || []).map((item) => (
                  <div
                    key={item.registration_id}
                    className="rounded-xl border border-border/70 bg-background p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{item.bidder_name}</p>
                        <p className="text-sm text-muted-foreground">{item.bidder_email}</p>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {item.registration_status || "Unknown"}
                      </p>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Bids</p>
                        <p className="mt-1 text-sm font-medium">{toNumber(item.bids_count).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Lots won</p>
                        <p className="mt-1 text-sm font-medium">
                          {toNumber(item.lots_won_count).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Total spent</p>
                        <p className="mt-1 text-sm font-medium">
                          {formatCurrency(toNumber(item.total_spent), currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Last bid</p>
                        <p className="mt-1 text-sm font-medium">
                          {formatDateTime(item.last_bid_at || undefined, timezone)}
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
                      <TableHead>Bidder</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Bids</TableHead>
                      <TableHead>Lots won</TableHead>
                      <TableHead>Total spent</TableHead>
                      <TableHead>Last bid</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(data.items || []).map((item) => (
                      <TableRow key={item.registration_id}>
                        <TableCell className="align-top whitespace-normal">
                          <p className="font-medium text-foreground">{item.bidder_name}</p>
                          <p className="text-xs text-muted-foreground">{item.bidder_email}</p>
                        </TableCell>
                        <TableCell>{item.registration_status || "Unknown"}</TableCell>
                        <TableCell>{toNumber(item.bids_count).toLocaleString()}</TableCell>
                        <TableCell>{toNumber(item.lots_won_count).toLocaleString()}</TableCell>
                        <TableCell>{formatCurrency(toNumber(item.total_spent), currency)}</TableCell>
                        <TableCell>{formatDateTime(item.last_bid_at || undefined, timezone)}</TableCell>
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
