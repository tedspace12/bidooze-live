"use client";

import * as React from "react";
import {
  Bell,
  Users,
  Hammer,
  BarChart3,
  Settings,
  MoreHorizontal,
  HelpCircle,
  Building2,
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

const data = {
  org: {
    name: "Bidooze Live",
    logo: "/logo.png",
  },
  user: {
    name: "Abdulhameed",
    email: "durodolaabdulhameed2021@gmail.com",
    avatar: "/avatars/user.jpg",
  },
  navMain: [
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
  ],
  navSecondary: [ 
    { 
      title: "Notification",
      url: "#",
      icon: Bell,
    },
    { 
      title: "Support",
      url: "#",
      icon: HelpCircle, 
    }, ],
};

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/" className="flex items-center gap-3">
                {/* Logo */}
                <div className="flex items-center justify-center size-9 rounded-lg">
                <Image src={'/logo/BIDOOZE_ICON.svg'} alt="BIDOOZE ICON" width={120} height={120} />
                </div>

                {/* Organization Info */}
                <div className="flex flex-col text-left text-sm leading-tight">
                  <span className="font-semibold">{data.org.name}</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
    
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
