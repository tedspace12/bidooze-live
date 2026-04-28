"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTab } from "@/components/subscription/tabs/OverviewTab";
import { PlansTab } from "@/components/subscription/tabs/PlansTab";
import { PaymentHistoryTab } from "@/components/subscription/tabs/PaymentHistoryTab";
import { PaymentMethodsTab } from "@/components/subscription/tabs/PaymentMethodsTab";

const TABS = ["overview", "plans", "history", "payment-methods"] as const;
type Tab = (typeof TABS)[number];

export default function BillingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Honour ?tab= query param (used by banner CTAs and external links)
  useEffect(() => {
    const tab = searchParams.get("tab") as Tab | null;
    if (tab && TABS.includes(tab)) setActiveTab(tab);
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as Tab);
    router.replace(`/billing?tab=${tab}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing &amp; Subscription</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription, payment methods, and billing history.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="payment-methods">Cards</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab onSubscribeClick={() => handleTabChange("plans")} />
        </TabsContent>

        <TabsContent value="plans" className="mt-6">
          <PlansTab />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <PaymentHistoryTab />
        </TabsContent>

        <TabsContent value="payment-methods" className="mt-6">
          <PaymentMethodsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
