"use client"

import * as React from "react"
import { useState } from "react"
import { type LucideIcon, Bell } from "lucide-react"
import { toast } from "sonner"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

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
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

  const handleNotificationClick = (item: { title: string; url: string; icon: LucideIcon }) => {
    if (item.title === "Notification") {
      setIsNotificationOpen(true)
    } else if (item.url === "#") {
      toast.info(`${item.title} clicked`, {
        description: `Opening ${item.title.toLowerCase()}...`,
      })
    }
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
  }

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            if (item.title === "Notification") {
              return (
                <SidebarMenuItem key={item.title}>
                  <Popover open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
                    <PopoverTrigger asChild>
                      <SidebarMenuButton 
                        size="sm" 
                        onClick={() => handleNotificationClick(item)}
                        className="relative flex items-center gap-2"
                      >
                        <item.icon className="shrink-0"/>
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
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-80 p-0" 
                      align="end"
                      side="right"
                      sideOffset={8}
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
      handleNotificationClick(item)
    }
  }}
>
                  {item.url === "#" ? (
                    <>
                      <item.icon className="shrink-0"/>
                      <span>{item.title}</span>
                      </>
                  ) : (
                    <a href={item.url} className="flex items-center gap-2">
                      <item.icon className="shrink-0"/>
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
