import { withAuth } from "@/services/api";

export type NotificationBasePath = "admin" | "auctioneer" | "buyer";

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface NotificationListParams {
  per_page?: number;
  page?: number;
  unread?: 1 | 0;
}

export const notificationService = {
  async getNotifications(
    basePath: NotificationBasePath,
    params?: NotificationListParams
  ): Promise<AppNotification[]> {
    const res = await withAuth.get<{ data: AppNotification[] }>(
      `/${basePath}/notifications`,
      { params: { per_page: 30, ...params } }
    );
    return res.data.data ?? [];
  },

  async getUnreadCount(basePath: NotificationBasePath): Promise<number> {
    const res = await withAuth.get<{ count: number }>(
      `/${basePath}/notifications/unread-count`
    );
    return res.data.count ?? 0;
  },

  async markAsRead(basePath: NotificationBasePath, id: string): Promise<void> {
    await withAuth.patch(`/${basePath}/notifications/${id}/read`);
  },

  async markAllRead(basePath: NotificationBasePath): Promise<void> {
    await withAuth.patch(`/${basePath}/notifications/read-all`);
  },

  async deleteNotification(basePath: NotificationBasePath, id: string): Promise<void> {
    await withAuth.delete(`/${basePath}/notifications/${id}`);
  },
};
