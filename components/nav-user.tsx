"use client"

import {
  BadgeCheck,
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
import Link from "next/link"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useAuthStore } from "@/features/auth/store/authStore"

// Notifications are NOT rendered here on purpose. A Radix Popover nested
// inside a Radix DropdownMenuItem fights the dropdown's own focus/dismiss
// handling — it kept closing itself the moment you tried to click or even
// hover inside it. The notification bell now lives only in NavSecondary
// (components/app-sidebar.tsx), rendered as its own standalone sidebar
// trigger, which doesn't have this problem.
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
