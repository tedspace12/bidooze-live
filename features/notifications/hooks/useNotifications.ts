"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  notificationService,
  type NotificationBasePath,
  type NotificationListParams,
} from "../services/notificationService";

export const useNotifications = (basePath: NotificationBasePath) => {
  const queryClient = useQueryClient();
  const listKey = ["notifications", basePath];
  const countKey = ["notifications", basePath, "unread-count"];

  const useNotificationList = (
    params?: NotificationListParams,
    options?: { enabled?: boolean }
  ) =>
    useQuery({
      queryKey: [...listKey, params],
      queryFn: () => notificationService.getNotifications(basePath, params),
      enabled: options?.enabled !== false,
    });

  const useUnreadCount = () =>
    useQuery({
      queryKey: countKey,
      queryFn: () => notificationService.getUnreadCount(basePath),
      staleTime: 30_000,
      refetchInterval: 60_000,
    });

  const markAsRead = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(basePath, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listKey });
      queryClient.invalidateQueries({ queryKey: countKey });
    },
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationService.markAllRead(basePath),
    onSuccess: () => {
      toast.success("All notifications marked as read");
      queryClient.invalidateQueries({ queryKey: listKey });
      queryClient.invalidateQueries({ queryKey: countKey });
    },
  });

  const deleteNotification = useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(basePath, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listKey });
      queryClient.invalidateQueries({ queryKey: countKey });
    },
  });

  return {
    useNotificationList,
    useUnreadCount,
    markAsRead,
    markAllRead,
    deleteNotification,
  };
};
