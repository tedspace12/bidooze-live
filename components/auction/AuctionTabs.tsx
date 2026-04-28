"use client";

import { useState, useEffect } from "react";
import { AuctionOverviewResponse } from "@/features/auction/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import OverviewTab from "./tabs/OverviewTab";
import LotsTab from "./tabs/LotsTab";
import BiddersTab from "./tabs/BiddersTab";
import BidsTab from "./tabs/BidsTab";
import LiveConsoleTab from "./tabs/LiveConsoleTab";
import FinancialsTab from "./tabs/FinancialsTab";
import SettlementTab from "./tabs/SettlementTab";
import ReportsTab from "./tabs/ReportsTab";
import SettingsTab from "./tabs/SettingsTab";
import {
  LayoutDashboard,
  Package,
  Users,
  Radio,
  CreditCard,
  BarChart3,
  Settings,
  DollarSign,
  Gavel,
} from "lucide-react";

interface AuctionTabsProps {
  auction: AuctionOverviewResponse;
}

const tabs = [
  { value: "overview", label: "Overview", icon: LayoutDashboard },
  { value: "lots", label: "Lots", icon: Package },
  { value: "bidders", label: "Bidders", icon: Users },
  { value: "bids", label: "Bids", icon: Gavel },
  { value: "financials", label: "Financials", icon: DollarSign },
  { value: "live-console", label: "Live Console", icon: Radio },
  { value: "settlement", label: "Settlement", icon: CreditCard },
  { value: "reports", label: "Reports", icon: BarChart3 },
  { value: "settings", label: "Settings", icon: Settings },
];

export default function AuctionTabs({ auction }: AuctionTabsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const currentStatus = auction.auction.status;
  const isLive = currentStatus === "live" || currentStatus === "paused";
  const isClosed = currentStatus === "closed" || currentStatus === "completed";

  // Listen for custom event to switch tabs
  useEffect(() => {
    const handleTabSwitch = (event: Event) => {
      const customEvent = event as CustomEvent<{ tab?: string }>;
      if (customEvent.detail?.tab) {
        setActiveTab(customEvent.detail.tab);
      }
    };

    window.addEventListener("switchAuctionTab", handleTabSwitch);
    return () => {
      window.removeEventListener("switchAuctionTab", handleTabSwitch);
    };
  }, []);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-border">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-2xl border border-border/70 bg-muted/25 p-2 sm:flex sm:flex-wrap sm:justify-start sm:gap-1 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            
            // Logic for tab visibility/disability based on status
            let isDisabled = false;
            if (tab.value === "live-console" && !isLive) {
              isDisabled = true;
            }
            if (tab.value === "settlement" && !isClosed) {
              isDisabled = true;
            }
            
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                disabled={isDisabled}
                className="auction-tab-trigger relative min-h-12 rounded-xl border border-transparent bg-background/80 px-3 py-3 font-body text-xs font-semibold text-muted-foreground shadow-sm transition-all duration-200 gap-2 hover:text-foreground data-[state=active]:border-primary/30 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-fit sm:rounded-none sm:border-0 sm:border-b-2 sm:bg-transparent sm:px-4 sm:text-sm sm:font-medium sm:shadow-none sm:data-[state=active]:bg-transparent sm:data-[state=active]:text-foreground sm:data-[state=active]:font-semibold sm:data-[state=active]:shadow-none"
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
                {tab.value === "live-console" && isLive && (
                  <span className="ml-1 h-2 w-2 rounded-full bg-success animate-pulse" />
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>

      <TabsContent value="overview" className="mt-6">
        <OverviewTab auction={auction} />
      </TabsContent>
      <TabsContent value="lots" className="mt-6">
        <LotsTab auction={auction} />
      </TabsContent>
      <TabsContent value="bidders" className="mt-6">
        <BiddersTab auction={auction} />
      </TabsContent>
      <TabsContent value="bids" className="mt-6">
        <BidsTab auction={auction} />
      </TabsContent>
      <TabsContent value="financials" className="mt-6">
        <FinancialsTab auction={auction} />
      </TabsContent>
      <TabsContent value="live-console" className="mt-6">
        <LiveConsoleTab auction={auction} />
      </TabsContent>
      <TabsContent value="settlement" className="mt-6">
        <SettlementTab auction={auction} />
      </TabsContent>
      <TabsContent value="reports" className="mt-6">
        <ReportsTab auction={auction} />
      </TabsContent>
      <TabsContent value="settings" className="mt-6">
        <SettingsTab auction={auction} />
      </TabsContent>
    </Tabs>
  );
}
