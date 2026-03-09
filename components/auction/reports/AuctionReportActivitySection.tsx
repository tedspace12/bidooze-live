"use client";

import { useState } from "react";
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
  const query = useAuctionReportActivity(auctionId, { bucket }, { enabled });

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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  Bids over time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[280px] w-full">
                  <LineChart data={bidsData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  Revenue over time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[280px] w-full">
                  <BarChart data={revenueData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => formatCurrency(Number(value), currency)}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => formatCurrency(Number(value), currency)}
                        />
                      }
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserPlus className="h-4 w-4 text-muted-foreground" />
                Registrations trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[220px] w-full">
                <BarChart data={registrationsData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
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
