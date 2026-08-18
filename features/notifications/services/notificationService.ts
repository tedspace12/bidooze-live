import { withAdminAuth, withAuctioneerAuth } from "@/services/api";

export type NotificationBasePath = "admin" | "auctioneer" | "buyer";

// "buyer" isn't a real panel with its own token today (no caller passes it —
// verified via components/nav-user.tsx / nav-secondary.tsx, which only ever
// resolve "admin" or "auctioneer"); treat anything but "admin" as auctioneer.
const clientFor = (basePath: NotificationBasePath) => (basePath === "admin" ? withAdminAuth : withAuctioneerAuth);

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
    const res = await clientFor(basePath).get<{ data: AppNotification[] }>(
      `/${basePath}/notifications`,
      { params: { per_page: 30, ...params } }
    );
    return res.data.data ?? [];
  },

  async getUnreadCount(basePath: NotificationBasePath): Promise<number> {
    const res = await clientFor(basePath).get<{ count: number }>(
      `/${basePath}/notifications/unread-count`
    );
    return res.data.count ?? 0;
  },

  async markAsRead(basePath: NotificationBasePath, id: string): Promise<void> {
    await clientFor(basePath).patch(`/${basePath}/notifications/${id}/read`);
  },

  async markAllRead(basePath: NotificationBasePath): Promise<void> {
    await clientFor(basePath).patch(`/${basePath}/notifications/read-all`);
  },

  async deleteNotification(basePath: NotificationBasePath, id: string): Promise<void> {
    await clientFor(basePath).delete(`/${basePath}/notifications/${id}`);
  },
};
