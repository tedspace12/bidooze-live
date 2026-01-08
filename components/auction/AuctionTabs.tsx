"use client";

import { useState, useEffect } from "react";
import { Auction } from "@/data";
import { getAuctionStatus } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import OverviewTab from "./tabs/OverviewTab";
import LotsTab from "./tabs/LotsTab";
import BiddersTab from "./tabs/BiddersTab";
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
  DollarSign // New icon for Financials
} from "lucide-react";

interface AuctionTabsProps {
  auction: Auction;
}

const tabs = [
  { value: "overview", label: "Overview", icon: LayoutDashboard },
  { value: "lots", label: "Lots", icon: Package },
  { value: "bidders", label: "Bidders", icon: Users },
  { value: "financials", label: "Financials", icon: DollarSign }, // New Financials tab
  { value: "live-console", label: "Live Console", icon: Radio },
  { value: "settlement", label: "Settlement", icon: CreditCard },
  { value: "reports", label: "Reports", icon: BarChart3 },
  { value: "settings", label: "Settings", icon: Settings },
];

export default function AuctionTabs({ auction }: AuctionTabsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const currentStatus = getAuctionStatus(auction);
  const isLive = currentStatus === "Live";
  const isClosed = currentStatus === "Closed" || currentStatus === "Completed";

  // Listen for custom event to switch tabs
  useEffect(() => {
    const handleTabSwitch = (e: CustomEvent) => {
      if (e.detail?.tab) {
        setActiveTab(e.detail.tab);
      }
    };

    window.addEventListener('switchAuctionTab' as any, handleTabSwitch as EventListener);
    return () => {
      window.removeEventListener('switchAuctionTab' as any, handleTabSwitch as EventListener);
    };
  }, []);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-border">
        <TabsList className="h-auto p-0 bg-transparent rounded-none gap-0">
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
                className="auction-tab-trigger relative px-4 py-3 rounded-none border-0 border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none font-body text-sm font-medium text-muted-foreground data-[state=active]:text-foreground data-[state=active]:font-semibold hover:text-foreground transition-all duration-200 gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.value === "live-console" && isLive && (
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse ml-1" />
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
