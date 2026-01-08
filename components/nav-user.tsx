"use client"

import { useState } from "react"
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"

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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"

interface Notification {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  type: "info" | "success" | "warning" | "error"
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "New Bid Received",
    message: "A new bid of ₦15,000,000 was placed on Lot #1",
    time: "2 minutes ago",
    read: false,
    type: "success"
  },
  {
    id: "2",
    title: "Auction Ending Soon",
    message: "Luxury Cars Timed Auction ends in 2 hours",
    time: "15 minutes ago",
    read: false,
    type: "warning"
  },
  {
    id: "3",
    title: "Payment Received",
    message: "Payment of ₦5,200,000 received from John Adewale",
    time: "1 hour ago",
    read: true,
    type: "success"
  },
  {
    id: "4",
    title: "System Update",
    message: "Platform maintenance scheduled for tonight at 2 AM",
    time: "3 hours ago",
    read: true,
    type: "info"
  },
]

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
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

  const handleNotificationClick = () => {
    setIsNotificationOpen(true)
  }

  const handleNotificationItemClick = (notification: Notification) => {
    // Mark as read
    setNotifications(notifications.map(n => 
      n.id === notification.id ? { ...n, read: true } : n
    ))
    toast.info(notification.title, {
      description: notification.message,
    })
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
    toast.success("All notifications marked as read")
    setIsNotificationOpen(false)
  }

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
              <Link href={'/settings'} passHref>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              </Link>
              <Link href={'/billing'} passHref>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              </Link>
              <Popover open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
                <PopoverTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => {
                    e.preventDefault()
                    handleNotificationClick()
                  }}>
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
                </PopoverTrigger>
                <PopoverContent 
                  className="w-80 p-0" 
                  align="end"
                  side={isMobile ? "top" : "right"}
                >
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">Notifications</h4>
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={markAllAsRead}
                          className="h-7 text-xs"
                        >
                          Mark all as read
                        </Button>
                      )}
                    </div>
                  </div>
                  <ScrollArea className="h-[400px]">
                    {notifications.length > 0 ? (
                      <div className="divide-y">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => handleNotificationItemClick(notification)}
                            className={`p-4 cursor-pointer hover:bg-accent transition-colors ${
                              !notification.read ? "bg-blue-50/50" : ""
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-1.5 h-3 w-3 rounded-full shrink-0 ${
                                !notification.read 
                                  ? "bg-destructive" 
                                  : "bg-transparent"
                              }`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{notification.title}</p>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {notification.time}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-sm text-muted-foreground">
                        No notifications
                      </div>
                    )}
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault()
                toast.info("Logging out...", {
                  description: "You will be redirected to the login page.",
                })
                // In a real app, you would call a logout function here
                setTimeout(() => {
                  toast.success("Logged out successfully")
                }, 1000)
              }}
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
