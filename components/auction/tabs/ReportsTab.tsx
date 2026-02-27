import { AuctionOverviewResponse } from "@/features/auction/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Download, TrendingUp, Package, DollarSign, Clock, Target } from "lucide-react";

interface ReportsTabProps {
  auction: AuctionOverviewResponse;
}

function formatCurrency(amount: number, currency: AuctionOverviewResponse["auction"]["currency"]) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export default function ReportsTab({ auction }: ReportsTabProps) {
  const totalLots = auction.stats.lots_total || 0;
  const soldLots = auction.stats.lots_sold || 0;
  const totalBids = auction.stats.total_bids || 0;
  const avgBidsPerLot = totalLots > 0 ? (totalBids / totalLots).toFixed(1) : "0";
  const sellThroughRate = totalLots > 0 ? Math.round((soldLots / totalLots) * 100) : 0;
  const totalRevenue = auction.stats.total_revenue || 0;
  const avgLotPrice = soldLots > 0 ? Math.round(totalRevenue / soldLots) : 0;

  const reports = [
    { title: "Auction Summary", description: "Complete overview of auction performance", icon: BarChart3 },
    { title: "Lot Performance", description: "Individual lot results and analytics", icon: Package },
    { title: "Financial Report", description: "Revenue, commissions, and payouts", icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-foreground">Reports</h2>
          <p className="text-sm text-muted-foreground font-body mt-1">Analytics and performance insights</p>
        </div>
        <Button variant="outline" className="gap-2 font-body"><Download className="w-4 h-4" />Export All Reports</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-border shadow-soft"><CardContent className="p-4"><div className="flex items-center gap-3 mb-3"><div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center"><DollarSign className="w-4 h-4 text-accent-foreground" /></div></div><p className="text-xs text-muted-foreground font-body uppercase tracking-wide mb-1">Total Revenue</p><p className="text-xl font-semibold font-body text-accent tabular-nums">{formatCurrency(totalRevenue, auction.auction.currency)}</p></CardContent></Card>
        <Card className="border border-border shadow-soft"><CardContent className="p-4"><div className="flex items-center gap-3 mb-3"><div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center"><Target className="w-4 h-4 text-muted-foreground" /></div></div><p className="text-xs text-muted-foreground font-body uppercase tracking-wide mb-1">Sell-Through Rate</p><p className="text-xl font-semibold font-body text-foreground tabular-nums">{sellThroughRate}%</p></CardContent></Card>
        <Card className="border border-border shadow-soft"><CardContent className="p-4"><div className="flex items-center gap-3 mb-3"><div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center"><TrendingUp className="w-4 h-4 text-muted-foreground" /></div></div><p className="text-xs text-muted-foreground font-body uppercase tracking-wide mb-1">Avg Lot Price</p><p className="text-xl font-semibold font-body text-foreground tabular-nums">{formatCurrency(avgLotPrice, auction.auction.currency)}</p></CardContent></Card>
        <Card className="border border-border shadow-soft"><CardContent className="p-4"><div className="flex items-center gap-3 mb-3"><div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center"><Clock className="w-4 h-4 text-muted-foreground" /></div></div><p className="text-xs text-muted-foreground font-body uppercase tracking-wide mb-1">Avg Bids/Lot</p><p className="text-xl font-semibold font-body text-foreground tabular-nums">{avgBidsPerLot}</p></CardContent></Card>
      </div>

      <Card className="border border-border shadow-soft">
        <CardHeader className="border-b border-border"><CardTitle className="text-lg font-display font-semibold flex items-center gap-2"><BarChart3 className="w-5 h-5 text-muted-foreground" />Bidding Activity</CardTitle></CardHeader>
        <CardContent className="p-6"><div className="h-64 flex items-center justify-center bg-secondary/30 rounded-lg border border-dashed border-border"><div className="text-center"><BarChart3 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" /><p className="text-muted-foreground font-body">Chart visualization</p></div></div></CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.title} className="border border-border shadow-soft hover:shadow-medium transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center"><Icon className="w-5 h-5 text-muted-foreground" /></div>
                  <div><h3 className="font-body font-semibold text-foreground">{report.title}</h3><p className="text-sm text-muted-foreground font-body">{report.description}</p></div>
                </div>
                <Button variant="ghost" size="sm" className="gap-2 font-body"><Download className="w-4 h-4" />PDF</Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

