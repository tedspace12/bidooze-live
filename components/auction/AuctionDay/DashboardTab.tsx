import { useState } from "react";
import { Package, Users, Store, DollarSign, TrendingUp, Eye } from "lucide-react";
import { StatCard } from "../StatCard";
import { LinearTabs } from "../LinearTabs";
import { PremiumTable } from "../PremiumTable";
import { StatusBadge } from "../StatusBadge";

interface Registration {
  id: number;
  bidderCard: string;
  reputation: string;
  bidCount: number;
  permission: string;
  dateTime: string;
  site: string;
  notes: string;
  shippingRequested: boolean;
}

interface LotStat {
  id: number;
  lotNumber: string;
  title: string;
  timeLeft: string;
  highBid: number;
  maxBid: number;
  views: number;
  watchers: number;
  status: "live" | "pending" | "closed";
}

const mockRegistrations: Registration[] = [
  { id: 1, bidderCard: "B001", reputation: "Excellent", bidCount: 24, permission: "Approved", dateTime: "2024-12-07 10:30", site: "Online", notes: "VIP", shippingRequested: true },
  { id: 2, bidderCard: "B002", reputation: "Good", bidCount: 12, permission: "Approved", dateTime: "2024-12-07 11:15", site: "Online", notes: "", shippingRequested: false },
  { id: 3, bidderCard: "B003", reputation: "New", bidCount: 0, permission: "Pending", dateTime: "2024-12-07 12:00", site: "Online", notes: "First time", shippingRequested: true },
];

const mockLotStats: LotStat[] = [
  { id: 1, lotNumber: "001", title: "Vintage Rolex Submariner", timeLeft: "2h 15m", highBid: 12500, maxBid: 15000, views: 342, watchers: 28, status: "live" },
  { id: 2, lotNumber: "002", title: "Louis Vuitton Keepall 55", timeLeft: "2h 15m", highBid: 2800, maxBid: 3200, views: 189, watchers: 15, status: "live" },
  { id: 3, lotNumber: "003", title: "Hermes Birkin 30 Togo", timeLeft: "2h 15m", highBid: 18500, maxBid: 22000, views: 567, watchers: 42, status: "live" },
];

const subTabs = [
  { id: "details", label: "Details" },
  { id: "registration", label: "Registration" },
  { id: "lotstats", label: "Lot Stats" },
];

export function DashboardTab() {
  const [activeSubTab, setActiveSubTab] = useState("details");

  const registrationColumns = [
    { key: "bidderCard", header: "Bidder Card" },
    { 
      key: "reputation", 
      header: "Reputation",
      render: (item: Registration) => (
        <span className={`text-sm font-medium ${
          item.reputation === "Excellent" ? "text-green-700" :
          item.reputation === "Good" ? "text-foreground" : "text-muted-foreground"
        }`}>{item.reputation}</span>
      )
    },
    { key: "bidCount", header: "Bid Count", className: "text-center" },
    { 
      key: "permission", 
      header: "Permission",
      render: (item: Registration) => (
        <StatusBadge status={item.permission === "Approved" ? "completed" : "pending"} label={item.permission} />
      )
    },
    { key: "dateTime", header: "Date/Time" },
    { key: "site", header: "Site" },
    { key: "notes", header: "Notes" },
    { 
      key: "shippingRequested", 
      header: "Shipping",
      render: (item: Registration) => (
        <span className={item.shippingRequested ? "text-green-700" : "text-muted-foreground"}>
          {item.shippingRequested ? "Yes" : "No"}
        </span>
      )
    },
  ];

  const lotStatsColumns = [
    { key: "lotNumber", header: "Lot #" },
    { 
      key: "title", 
      header: "Title",
      render: (item: LotStat) => (
        <span className="font-medium text-foreground">{item.title}</span>
      )
    },
    { key: "timeLeft", header: "Time Left" },
    { 
      key: "highBid", 
      header: "High Bid",
      render: (item: LotStat) => (
        <span className="font-semibold text-foreground">${item.highBid.toLocaleString()}</span>
      )
    },
    { 
      key: "maxBid", 
      header: "Max Bid",
      render: (item: LotStat) => (
        <span className="text-muted-foreground">${item.maxBid.toLocaleString()}</span>
      )
    },
    { 
      key: "views", 
      header: "Views",
      render: (item: LotStat) => (
        <span className="flex items-center gap-1 text-muted-foreground">
          <Eye className="h-3 w-3" />
          {item.views}
        </span>
      )
    },
    { key: "watchers", header: "Watchers" },
    { 
      key: "status", 
      header: "Status",
      render: (item: LotStat) => <StatusBadge status={item.status} />
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={Package} label="Lot Count" value="156" />
        <StatCard icon={Users} label="Check-ins" value="89" />
        <StatCard icon={Store} label="Unique Sellers" value="12" />
        <StatCard icon={DollarSign} label="Est. Min" value="$45,000" />
        <StatCard icon={TrendingUp} label="Est. Max" value="$78,000" />
        <StatCard icon={DollarSign} label="Avg Per Lot" value="$395" />
      </div>

      {/* Sub Tabs */}
      <div className="premium-card">
        <LinearTabs 
          tabs={subTabs} 
          activeTab={activeSubTab} 
          onTabChange={setActiveSubTab}
          className="mb-6"
        />

        {activeSubTab === "details" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Auction Name</span>
                  <span className="font-medium text-foreground">Premium Estate Auction</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Status</span>
                  <StatusBadge status="live" />
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Start Time</span>
                  <span className="font-medium text-foreground">Dec 15, 2024 10:00 AM</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">End Time</span>
                  <span className="font-medium text-foreground">Dec 15, 2024 6:00 PM</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Total Bids</span>
                  <span className="font-medium text-foreground">1,247</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Current Revenue</span>
                  <span className="font-semibold text-green-700">$52,340</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Active Bidders</span>
                  <span className="font-medium text-foreground">67</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Lots Closed</span>
                  <span className="font-medium text-foreground">42 / 156</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "registration" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <PremiumTable columns={registrationColumns} data={mockRegistrations} />
          </div>
        )}

        {activeSubTab === "lotstats" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <PremiumTable columns={lotStatsColumns} data={mockLotStats} />
          </div>
        )}
      </div>
    </div>
  );
}
