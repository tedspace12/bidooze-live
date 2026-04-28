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
  LayoutGrid,
  History,
  Activity,
  ShieldCheck,
  Tag,
  BookOpen,
  Trophy,
  CreditCard,
  Receipt,
  Package,
  type LucideIcon,
} from "lucide-react";

import { NavGrouped } from "@/components/nav-grouped";
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
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useAuth } from "@/features/auth/hooks/useAuth";

const adminNavGroups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Management",
    items: [
      { title: "Feature Slots", url: "/admin/feature-slots", icon: LayoutGrid },
      { title: "Auctioneers", url: "/admin/auctioneers", icon: Hammer },
      { title: "Bidders", url: "/admin/bidders", icon: Users },
      { title: "Categories", url: "/admin/categories", icon: Tag },
    ],
  },
  {
    label: "Content",
    items: [
      { title: "Blog", url: "/admin/blogs", icon: BookOpen },
    ],
  },
  {
    label: "Subscriptions",
    items: [
      { title: "All Subscriptions", url: "/admin/subscriptions", icon: CreditCard },
      { title: "Payments", url: "/admin/subscription-payments", icon: Receipt },
      { title: "Plans", url: "/admin/subscription-plans", icon: Package },
      { title: "Coupons", url: "/admin/coupons", icon: Tag },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Activity Log", url: "/admin/activity-log", icon: History },
      { title: "System Health", url: "/admin/system-health", icon: Activity },
      { title: "Admin Settings", url: "/admin/settings", icon: ShieldCheck },
    ],
  },
];

type AuctioneerNavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  items?: { title: string; url: string }[];
  permission?: "create_edit_auctions" | "run_live_auction" | "edit_miscellaneous" | "view_reports" | "manage_billing";
};

const auctioneerNav: AuctioneerNavItem[] = [
  {
    title: "Auctions",
    url: "/dashboard",
    icon: Hammer,
    isActive: true,
    items: [
      { title: "All Auctions", url: "/dashboard" },
      { title: "Create Auction", url: "/create-auction" },
    ],
    permission: "create_edit_auctions",
  },
  {
    title: "Customers",
    url: "/customers/bidders",
    icon: Users,
    items: [
      { title: "Bidders", url: "/customers/bidders" },
      { title: "Consignor", url: "/customers/consignors" },
    ],
    permission: "create_edit_auctions",
  },
  {
    title: "Feature Slots",
    url: "/feature-slots",
    icon: Trophy,
  },
  {
    title: "Miscellaneous",
    url: "/miscellaneous",
    icon: MoreHorizontal,
    permission: "edit_miscellaneous",
  },
  {
    title: "Reports",
    url: "/reports",
    icon: BarChart3,
    permission: "view_reports",
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
  {
    title: "Billing",
    url: "/billing",
    icon: CreditCard,
    permission: "manage_billing",
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
    url: "/support",
    icon: HelpCircle,
  },
];

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const [mounted, setMounted] = React.useState(false);
  const { useCurrentUser } = useAuth();
  useCurrentUser();
  const { user, canAccessAuctioneerFeatures, hasPermission } = useAuthStore();

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  const visibleAuctioneerNav = auctioneerNav.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

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
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center gap-3 px-2 py-1.5">
                <Skeleton className="size-9 rounded-lg shrink-0" />
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-3.5 w-24 rounded" />
                </div>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <div className="px-3 py-2 space-y-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-2 py-2 rounded-md">
                <Skeleton className="size-4 rounded shrink-0" />
                <Skeleton className="h-3.5 rounded" style={{ width: `${[60, 80, 55, 90, 65, 70][i]}%` }} />
              </div>
            ))}
          </div>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3 px-3 py-2">
            <Skeleton className="size-8 rounded-lg shrink-0" />
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-2.5 w-32 rounded" />
            </div>
          </div>
        </SidebarFooter>
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
                  {isAdmin && (
                    <span className="text-xs text-muted-foreground">Admin Panel</span>
                  )}
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {isAdmin ? (
          <NavGrouped groups={adminNavGroups} />
        ) : canAccessAuctioneerFeatures ? (
          <NavMain items={visibleAuctioneerNav} />
        ) : (
          <div className="p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">Account</p>
            <Link
              href="/auctioneer/application-status"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground/70 hover:bg-sidebar-accent hover:text-foreground transition-colors"
            >
              <ShieldCheck className="h-4 w-4" />
              Application Status
            </Link>
          </div>
        )}
        {!isAdmin && secondaryItems.length > 0 && <NavSecondary items={secondaryItems} className="mt-auto" />}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
