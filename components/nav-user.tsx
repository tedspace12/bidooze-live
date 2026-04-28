"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useAuthStore } from "@/features/auth/store/authStore"
import { NotificationPopover } from "@/components/notifications/NotificationPopover"
import type { NotificationBasePath } from "@/features/notifications/services/notificationService"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const { logout } = useAuth()
  const { user: currentUser, canAccessAuctioneerFeatures } = useAuthStore()
  const isAdmin = currentUser?.role === "admin" || currentUser?.role === "superadmin";
  const isApprovedAuctioneer = currentUser?.role === "auctioneer" && canAccessAuctioneerFeatures;

  const notificationBasePath: NotificationBasePath = isAdmin ? "admin" : "auctioneer";

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
    } catch {
      // Error is handled by the mutation's onError
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link
                href={
                  isAdmin
                    ? "/admin/settings"
                    : isApprovedAuctioneer
                      ? "/settings"
                      : "/auctioneer/application-status"
                }
                passHref
              >
              <DropdownMenuItem>
                <BadgeCheck />
                {isAdmin || isApprovedAuctioneer ? "Account" : "Application Status"}
              </DropdownMenuItem>
              </Link>
              {!isAdmin && isApprovedAuctioneer && (
                <Link href={'/billing'} passHref>
                <DropdownMenuItem>
                  <CreditCard />
                  Billing
                </DropdownMenuItem>
                </Link>
              )}
              {(isAdmin || isApprovedAuctioneer) && (
                <NotificationPopover
                  basePath={notificationBasePath}
                  side={isMobile ? "top" : "right"}
                  align="end"
                  renderTrigger={({ unreadCount }) => (
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <div className="relative">
                        <Bell />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-destructive rounded-full border-2 border-background" />
                        )}
                      </div>
                      Notifications
                      {unreadCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  )}
                />
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault()
                handleLogout()
              }}
              disabled={logout.isPending}
            >
              <LogOut />
              {logout.isPending ? "Logging out..." : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
