"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bell,
  Users,
  Hammer,
  BarChart3,
  Settings,
  MoreHorizontal,
  HelpCircle,
  LayoutDashboard,
  History,
  Activity,
  ShieldCheck
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { NavSecondary } from "@/components/nav-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useAuth } from "@/features/auth/hooks/useAuth";

const auctioneerNav = [
  {
    title: "Auctions",
    url: "/dashboard",
    icon: Hammer,
    isActive: true,
    items: [
      { title: "All Auctions", url: "/dashboard" },
      { title: "Create Auction", url: "/create-auction" },
    ],
  },
  {
    title: "Customers",
    url: "/customers/bidders",
    icon: Users,
    items: [
      { title: "Bidders", url: "/customers/bidders" },
      { title: "Consignor", url: "/customers/consignors" },
    ],
  },
  {
    title: "Miscellaneous",
    url: "/miscellaneous",
    icon: MoreHorizontal,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: BarChart3,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

const pendingNav = [
  {
    title: "Application Status",
    url: "/auctioneer/application-status",
    icon: ShieldCheck,
  },
];

const adminNav = [
  {
    title: "Admin Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Auctioneers",
    url: "/admin/auctioneers",
    icon: Hammer,
  },
  {
    title: "Bidders",
    url: "/admin/bidders",
    icon: Users,
  },
  {
    title: "Activity Log",
    url: "/admin/activity-log",
    icon: History,
  },
  {
    title: "System Health",
    url: "/admin/system-health",
    icon: Activity,
  },
  {
    title: "Admin Settings",
    url: "/admin/settings",
    icon: ShieldCheck,
  },
];

const secondaryNav = [
  {
    title: "Notification",
    url: "#",
    icon: Bell,
  },
  {
    title: "Support",
    url: "#",
    icon: HelpCircle,
  },
];

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const [mounted, setMounted] = React.useState(false);
  const { useCurrentUser } = useAuth();
  useCurrentUser();
  const { user, canAccessAuctioneerFeatures } = useAuthStore();

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const navItems = isAdmin ? adminNav : (canAccessAuctioneerFeatures ? auctioneerNav : pendingNav);
  const secondaryItems = isAdmin
    ? []
    : canAccessAuctioneerFeatures
      ? secondaryNav
      : secondaryNav.filter((item) => item.title === "Support");

  const avatarUrl = user?.avatar_url ?? undefined;

  const userData = {
    name: user?.name || "User",
    email: user?.email || "",
    avatar: user?.avatar || avatarUrl || "/avatars/user.jpg",
  };

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Sidebar variant="inset" {...props}>
        <SidebarContent>
          <div className="p-4 text-sm text-muted-foreground">Loading navigation...</div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" className="flex items-center gap-3">
                <div className="flex items-center justify-center size-9 rounded-lg">
                  <Image src={'/logo/BIDOOZE_ICON.svg'} alt="BIDOOZE ICON" width={120} height={120} />
                </div>
                <div className="flex flex-col text-left text-sm leading-tight">
                  <span className="font-semibold">Bidooze Live</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navItems} />
        {!isAdmin && secondaryItems.length > 0 && <NavSecondary items={secondaryItems} className="mt-auto" />}
      </SidebarContent>
    
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
