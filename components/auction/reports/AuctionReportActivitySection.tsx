"use client";

import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Bar, BarChart } from "recharts";
import { Activity, TrendingUp, UserPlus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useAuctionReportActivity } from "@/features/auction/hooks/useAuctionReports";

import {
  ReportSectionEmpty,
  ReportSectionError,
  ReportSectionLoading,
  formatCurrency,
  getErrorMessage,
  toNumber,
  useLazySection,
} from "./report-utils";

interface AuctionReportActivitySectionProps {
  auctionId: string | number;
}

const chartConfig = {
  bids: {
    label: "Bids",
    color: "hsl(var(--primary))",
  },
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-2))",
  },
  registrations: {
    label: "Registrations",
    color: "hsl(var(--chart-4))",
  },
};

export default function AuctionReportActivitySection({
  auctionId,
}: AuctionReportActivitySectionProps) {
  const { ref, enabled } = useLazySection<HTMLDivElement>();
  const [bucket, setBucket] = useState<"hourly" | "daily" | "lot_order">("daily");
  const [isMobile, setIsMobile] = useState(false);
  const query = useAuctionReportActivity(auctionId, { bucket }, { enabled });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const sync = () => setIsMobile(mediaQuery.matches);
    sync();

    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  const formatTickLabel = (value: string) => {
    if (!isMobile) return value;
    if (value.length <= 8) return value;
    if (/^\d{2}\s\w{3}\s\d{4}$/.test(value)) {
      return value.slice(0, 6);
    }
    return `${value.slice(0, 7)}…`;
  };

  if (!enabled || query.isLoading) {
    return (
      <section ref={ref} className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold tracking-tight">Bidding Activity</h3>
          <p className="text-sm text-muted-foreground">Bucketed bid, revenue, and registration performance.</p>
        </div>
        <ReportSectionLoading rows={3} />
      </section>
    );
  }

  if (query.isError || !query.data) {
    return (
      <section ref={ref} className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold tracking-tight">Bidding Activity</h3>
          <p className="text-sm text-muted-foreground">Bucketed bid, revenue, and registration performance.</p>
        </div>
        <ReportSectionError
          title="Activity charts unavailable"
          message={getErrorMessage(query.error, "Unable to load activity series.")}
          onRetry={() => query.refetch()}
        />
      </section>
    );
  }

  const series = query.data.series || {};
  const currency = query.data.context?.currency || "USD";
  const bidsData = (series.bids_over_time || []).map((item) => ({
    label: item.label || String(item.bucket || ""),
    bids: toNumber(item.bids_count),
  }));
  const revenueData = (series.revenue_over_time || []).map((item) => ({
    label: item.label || String(item.bucket || ""),
    revenue: toNumber(item.revenue),
  }));
  const registrationsData = (series.registrations_over_time || []).map((item) => ({
    label: item.label || String(item.bucket || ""),
    registrations: toNumber(item.registrations_count),
  }));
  const hasData = bidsData.length > 0 || revenueData.length > 0 || registrationsData.length > 0;

  return (
    <section ref={ref} className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold tracking-tight">Bidding Activity</h3>
          <p className="text-sm text-muted-foreground">
            Real chart data from bucketed reporting endpoints. No synthetic chart values.
          </p>
        </div>
        <Select value={bucket} onValueChange={(value) => setBucket(value as typeof bucket)}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Bucket" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hourly">Hourly</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="lot_order">By closing order</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!hasData ? (
        <ReportSectionEmpty
          title="No activity buckets returned"
          message="The activity report endpoint returned no chartable series for the current bucket selection."
        />
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-2">
            <Card className="min-w-0 overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  Bids over time
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
                <ChartContainer config={chartConfig} className={isMobile ? "h-[220px] w-full min-w-0" : "h-[280px] w-full min-w-0"}>
                  <LineChart
                    data={bidsData}
                    margin={isMobile ? { top: 8, right: 8, left: 4, bottom: 0 } : { top: 8, right: 12, left: 8, bottom: 0 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      minTickGap={isMobile ? 32 : 24}
                      tickFormatter={formatTickLabel}
                      interval={isMobile ? "preserveStartEnd" : 0}
                    />
                    <YAxis
                      hide={isMobile}
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      width={40}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    {!isMobile ? <ChartLegend content={<ChartLegendContent />} /> : null}
                    <Line
                      dataKey="bids"
                      type="monotone"
                      stroke="var(--color-bids)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="min-w-0 overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  Revenue over time
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
                <ChartContainer config={chartConfig} className={isMobile ? "h-[220px] w-full min-w-0" : "h-[280px] w-full min-w-0"}>
                  <BarChart
                    data={revenueData}
                    margin={isMobile ? { top: 8, right: 8, left: 4, bottom: 0 } : { top: 8, right: 12, left: 8, bottom: 0 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      minTickGap={isMobile ? 32 : 24}
                      tickFormatter={formatTickLabel}
                      interval={isMobile ? "preserveStartEnd" : 0}
                    />
                    <YAxis
                      hide={isMobile}
                      tickLine={false}
                      axisLine={false}
                      width={48}
                      tickFormatter={(value) => formatCurrency(Number(value), currency)}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => formatCurrency(Number(value), currency)}
                        />
                      }
                    />
                    {!isMobile ? <ChartLegend content={<ChartLegendContent />} /> : null}
                    <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="min-w-0 overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserPlus className="h-4 w-4 text-muted-foreground" />
                Registrations trend
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
              <ChartContainer config={chartConfig} className={isMobile ? "h-[200px] w-full min-w-0" : "h-[220px] w-full min-w-0"}>
                <BarChart
                  data={registrationsData}
                  margin={isMobile ? { top: 8, right: 8, left: 4, bottom: 0 } : { top: 8, right: 12, left: 8, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    minTickGap={isMobile ? 32 : 24}
                    tickFormatter={formatTickLabel}
                    interval={isMobile ? "preserveStartEnd" : 0}
                  />
                  <YAxis hide={isMobile} allowDecimals={false} tickLine={false} axisLine={false} width={40} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  {!isMobile ? <ChartLegend content={<ChartLegendContent />} /> : null}
                  <Bar dataKey="registrations" fill="var(--color-registrations)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </>
      )}
    </section>
  );
}
