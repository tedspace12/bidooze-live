"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import type { NotificationBasePath } from "@/features/notifications/services/notificationService";
import type { PopoverContentProps } from "@radix-ui/react-popover";
import { useIsMobile } from "@/hooks/useIsMobile";

interface NotificationPopoverProps {
  basePath: NotificationBasePath;
  renderTrigger: (props: { unreadCount: number }) => React.ReactElement;
  side?: PopoverContentProps["side"];
  align?: PopoverContentProps["align"];
  sideOffset?: number;
}

// ─── Shared notification list content ────────────────────────────────────────

function NotificationContent({
  basePath,
}: {
  basePath: NotificationBasePath;
}) {
  const { useUnreadCount, useNotificationList, markAsRead, markAllRead } =
    useNotifications(basePath);

  const { data: unreadCount = 0 } = useUnreadCount();
  const { data: notifications = [], isLoading } = useNotificationList();

  return (
    <>
      {/* Header — pr-10 leaves room for Sheet's built-in X button on mobile */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0 pr-10">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="h-5 px-1.5 text-xs">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground"
            disabled={markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            Mark all read
          </Button>
        )}
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-4">
                <Skeleton className="mt-1.5 h-2.5 w-2.5 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
            <Bell className="h-10 w-10 opacity-20" />
            <div>
              <p className="text-sm font-medium">You&apos;re all caught up</p>
              <p className="text-xs mt-0.5">No notifications right now.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                className={`w-full text-left px-4 py-3.5 transition-colors hover:bg-muted/50 active:bg-muted ${
                  !n.is_read ? "bg-blue-50/60 dark:bg-blue-950/20" : ""
                }`}
                onClick={() => {
                  if (!n.is_read) markAsRead.mutate(n.id);
                }}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1.5 h-2.5 w-2.5 rounded-full shrink-0 transition-colors ${
                      !n.is_read ? "bg-blue-500" : "bg-transparent"
                    }`}
                  />
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="text-sm font-medium leading-snug">{n.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function NotificationPopover({
  basePath,
  renderTrigger,
  side = "right",
  align = "end",
  sideOffset = 8,
}: NotificationPopoverProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const { useUnreadCount } = useNotifications(basePath);
  const { data: unreadCount = 0 } = useUnreadCount();

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          {renderTrigger({ unreadCount })}
        </SheetTrigger>
        <SheetContent side="bottom" className="flex flex-col rounded-t-2xl h-[85dvh] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Notifications</SheetTitle>
          </SheetHeader>
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="h-1.5 w-10 rounded-full bg-muted-foreground/30" />
          </div>
          <NotificationContent basePath={basePath} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {renderTrigger({ unreadCount })}
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 flex flex-col max-h-[520px]"
        side={side}
        align={align}
        sideOffset={sideOffset}
      >
        <NotificationContent basePath={basePath} />
      </PopoverContent>
    </Popover>
  );
}
