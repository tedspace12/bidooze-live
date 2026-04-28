"use client"

import * as React from "react"
import { type LucideIcon } from "lucide-react"
import { toast } from "sonner"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { NotificationPopover } from "@/components/notifications/NotificationPopover"
import { useAuthStore } from "@/features/auth/store/authStore"
import type { NotificationBasePath } from "@/features/notifications/services/notificationService"

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const { user: currentUser } = useAuthStore()
  const isAdmin = currentUser?.role === "admin" || currentUser?.role === "superadmin"
  const notificationBasePath: NotificationBasePath = isAdmin ? "admin" : "auctioneer"

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            if (item.title === "Notification") {
              return (
                <SidebarMenuItem key={item.title}>
                  <NotificationPopover
                    basePath={notificationBasePath}
                    side="right"
                    align="end"
                    sideOffset={8}
                    renderTrigger={({ unreadCount }) => (
                      <SidebarMenuButton size="sm" className="relative flex items-center gap-2">
                        <item.icon className="shrink-0" />
                        <span>{item.title}</span>
                        {unreadCount > 0 && (
                          <Badge
                            variant="destructive"
                            className="absolute top-1 right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                          >
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </Badge>
                        )}
                      </SidebarMenuButton>
                    )}
                  />
                </SidebarMenuItem>
              )
            }

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  size="sm"
                  asChild={item.url !== "#"}
                  onClick={(e) => {
                    if (item.url === "#") {
                      e.preventDefault()
                      toast.info(`${item.title} clicked`)
                    }
                  }}
                >
                  {item.url === "#" ? (
                    <>
                      <item.icon className="shrink-0" />
                      <span>{item.title}</span>
                    </>
                  ) : (
                    <a href={item.url} className="flex items-center gap-2">
                      <item.icon className="shrink-0" />
                      <span>{item.title}</span>
                    </a>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
