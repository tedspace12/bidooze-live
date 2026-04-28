import { withAuth } from "@/services/api";

// ─── Shared ───────────────────────────────────────────────────────────────────

export interface AdminSubUser {
  id: number;
  name: string;
  email: string;
}

export interface AdminSubPlanRef {
  id: number;
  name: string;
}

// ─── Subscription ─────────────────────────────────────────────────────────────

export interface AdminSubscription {
  id: number;
  user_id: number;
  user: AdminSubUser;
  plan: AdminSubPlanRef;
  status: "trial" | "active" | "grace" | "expired" | "cancelled";
  is_accessible: boolean;
  days_remaining: number;
  auto_renew: boolean;
  is_grandfathered: boolean;
  trial_ends_at: string | null;
  starts_at: string | null;
  ends_at: string | null;
  grace_ends_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  admin_notes: string | null;
  created_at: string;
}

export interface AdminSubscriptionPayment {
  id: number;
  amount_usd: number;
  amount_paid: number;
  currency: string;
  exchange_rate: number;
  status: "paid" | "pending" | "failed" | "refunded";
  type: "new" | "renewal" | "manual";
  provider: string;
  provider_reference: string;
  paid_at: string;
  created_at: string;
}

export interface AdminSubscriptionDetail extends AdminSubscription {
  payments: AdminSubscriptionPayment[];
}

export interface PaginatedAdminSubscriptions {
  data: AdminSubscription[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface AdminSubscriptionStats {
  counts: {
    trial: number;
    active: number;
    grace: number;
    expired: number;
    cancelled: number;
  };
  revenue: {
    total_usd: number;
    this_month_usd: number;
  };
  renewal_rate_percent: number;
}

export interface AdminSubscriptionReportTrend {
  period: string;
  payments: number;
  revenue_usd: number;
  new_subscriptions: number;
}

export interface AdminSubscriptionReport {
  period: { from: string; to: string };
  trends: AdminSubscriptionReportTrend[];
}

// ─── Global payments ──────────────────────────────────────────────────────────

export interface AdminPaymentItem {
  id: number;
  subscription_id: number;
  amount_usd: number;
  amount_paid: number;
  currency: string;
  exchange_rate: number;
  status: "paid" | "pending" | "failed" | "refunded";
  type: "new" | "renewal" | "manual";
  provider: string;
  provider_reference: string;
  paid_at: string;
  created_at: string;
  user: AdminSubUser;
  plan: AdminSubPlanRef;
}

export interface PaginatedAdminPayments {
  data: AdminPaymentItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// ─── Plans ────────────────────────────────────────────────────────────────────

export interface AdminPlan {
  id: number;
  name: string;
  slug: string;
  price_usd: number;
  duration_days: number;
  trial_days: number;
  features: string[];
  is_active: boolean;
  created_at: string;
}

export interface CreatePlanPayload {
  name: string;
  slug: string;
  price_usd: number;
  duration_days: number;
  trial_days?: number;
  features?: string[];
  is_active?: boolean;
}

export type UpdatePlanPayload = Partial<Omit<CreatePlanPayload, "slug">>;

// ─── Coupons ──────────────────────────────────────────────────────────────────

export interface AdminCoupon {
  id: number;
  code: string;
  description: string | null;
  discount_type: "percent" | "fixed_usd";
  discount_value: string;
  max_uses: number | null;
  uses_count: number;
  max_uses_per_user: number;
  valid_from: string | null;
  valid_until: string | null;
  plan_id: number | null;
  plan_name: string | null;
  is_active: boolean;
  is_exhausted: boolean;
  is_expired: boolean;
  created_at: string;
}

export interface AdminCouponDetail extends AdminCoupon {
  created_by: { id: number; name: string };
  recent_uses: Array<{
    user: AdminSubUser;
    discount_applied_usd: number;
    used_at: string;
  }>;
}

export interface CreateCouponPayload {
  code?: string;
  description?: string;
  discount_type: "percent" | "fixed_usd";
  discount_value: number;
  max_uses?: number | null;
  max_uses_per_user?: number;
  valid_from?: string;
  valid_until?: string;
  plan_id?: number | null;
  is_active?: boolean;
}

export type UpdateCouponPayload = Partial<Omit<CreateCouponPayload, "code" | "discount_type">>;

// ─── Auctioneer account control ───────────────────────────────────────────────

export interface SuspendAuctioneerPayload {
  reason: string;
  notes?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type ApiErrorLike = { response?: { data?: unknown }; message?: string };

const rethrow = (error: unknown): never => {
  const err = error as ApiErrorLike;
  throw err?.response?.data || { message: err?.message || "Request failed" };
};

// ─── Service ──────────────────────────────────────────────────────────────────

export const adminSubscriptionService = {
  // ─── Auctioneer account control ─────────────────────────────────────────────

  async suspendAuctioneer(id: number, payload: SuspendAuctioneerPayload) {
    try {
      const res = await withAuth.post<{ message: string; data: { user_id: number; suspended_at: string; suspension_reason: string } }>(
        `/admin/auctioneers/${id}/suspend`, payload
      );
      return res.data.data;
    } catch (e) { throw rethrow(e); }
  },

  async unsuspendAuctioneer(id: number) {
    try {
      const res = await withAuth.post<{ message: string }>(`/admin/auctioneers/${id}/unsuspend`);
      return res.data;
    } catch (e) { throw rethrow(e); }
  },

  async banAuctioneer(id: number, reason: string) {
    try {
      const res = await withAuth.post<{ message: string; data: { user_id: number; account_status: string; reason: string } }>(
        `/admin/auctioneers/${id}/ban`, { reason }
      );
      return res.data.data;
    } catch (e) { throw rethrow(e); }
  },

  // ─── Subscriptions ──────────────────────────────────────────────────────────

  async getSubscriptions(params?: { status?: string; search?: string; page?: number; per_page?: number }): Promise<PaginatedAdminSubscriptions> {
    try {
      const res = await withAuth.get<{ data: PaginatedAdminSubscriptions }>("/admin/subscriptions", { params });
      return res.data.data;
    } catch (e) { throw rethrow(e); }
  },

  async getSubscription(id: number): Promise<AdminSubscriptionDetail> {
    try {
      const res = await withAuth.get<{ data: AdminSubscriptionDetail }>(`/admin/subscriptions/${id}`);
      return res.data.data;
    } catch (e) { throw rethrow(e); }
  },

  async getSubscriptionStats(): Promise<AdminSubscriptionStats> {
    try {
      const res = await withAuth.get<{ data: AdminSubscriptionStats }>("/admin/subscriptions/stats");
      return res.data.data;
    } catch (e) { throw rethrow(e); }
  },

  async getSubscriptionReports(params?: { from?: string; to?: string; group_by?: "day" | "month" }): Promise<AdminSubscriptionReport> {
    try {
      const res = await withAuth.get<{ data: AdminSubscriptionReport }>("/admin/subscriptions/reports", { params });
      return res.data.data;
    } catch (e) { throw rethrow(e); }
  },

  async getExpiringSoon(params?: { days?: number; per_page?: number }): Promise<PaginatedAdminSubscriptions> {
    try {
      const res = await withAuth.get<{ data: PaginatedAdminSubscriptions }>("/admin/subscriptions/expiring-soon", { params });
      return res.data.data;
    } catch (e) { throw rethrow(e); }
  },

  async getInGrace(params?: { per_page?: number }): Promise<PaginatedAdminSubscriptions> {
    try {
      const res = await withAuth.get<{ data: PaginatedAdminSubscriptions }>("/admin/subscriptions/in-grace", { params });
      return res.data.data;
    } catch (e) { throw rethrow(e); }
  },

  async activateSubscription(id: number, days: number, notes?: string): Promise<AdminSubscription> {
    try {
      const res = await withAuth.post<{ data: AdminSubscription }>(`/admin/subscriptions/${id}/activate`, { days, notes });
      return res.data.data;
    } catch (e) { throw rethrow(e); }
  },

  async extendSubscription(id: number, days: number, notes?: string): Promise<AdminSubscription> {
    try {
      const res = await withAuth.post<{ data: AdminSubscription }>(`/admin/subscriptions/${id}/extend`, { days, notes });
      return res.data.data;
    } catch (e) { throw rethrow(e); }
  },

  async expireSubscription(id: number, notes?: string): Promise<AdminSubscription> {
    try {
      const res = await withAuth.post<{ data: AdminSubscription }>(`/admin/subscriptions/${id}/expire`, { notes });
      return res.data.data;
    } catch (e) { throw rethrow(e); }
  },

  async cancelSubscription(id: number, reason?: string): Promise<AdminSubscription> {
    try {
      const res = await withAuth.post<{ data: AdminSubscription }>(`/admin/subscriptions/${id}/cancel`, { reason });
      return res.data.data;
    } catch (e) { throw rethrow(e); }
  },

  async changeSubscriptionDates(id: number, payload: { ends_at: string; starts_at?: string; notes?: string }): Promise<AdminSubscription> {
    try {
      const res = await withAuth.post<{ data: AdminSubscription }>(`/admin/subscriptions/${id}/change-dates`, payload);
      return res.data.data;
    } catch (e) { throw rethrow(e); }
  },

  async recordPayment(id: number, payload: {
    amount_usd: number;
    amount_paid: number;
    currency: string;
    provider: string;
    reference?: string;
    paid_at?: string;
    notes?: string;
    plan_id?: number;
  }): Promise<{ subscription: AdminSubscription; payment: AdminSubscriptionPayment }> {
    try {
      const res = await withAuth.post<{ data: { subscription: AdminSubscription; payment: AdminSubscriptionPayment } }>(
        `/admin/subscriptions/${id}/record-payment`, payload
      );
      return res.data.data;
    } catch (e) { throw rethrow(e); }
  },

  async resendPaymentLink(id: number): Promise<{ message: string; renew_url: string }> {
    try {
      const res = await withAuth.post<{ message: string; renew_url: string }>(`/admin/subscriptions/${id}/resend-payment-link`);
      return res.data;
    } catch (e) { throw rethrow(e); }
  },

  // ─── Global payments ────────────────────────────────────────────────────────

  async getPayments(params?: { status?: string; provider?: string; from?: string; to?: string; search?: string; per_page?: number; page?: number }): Promise<PaginatedAdminPayments> {
    try {
      const res = await withAuth.get<{ data: PaginatedAdminPayments }>("/admin/subscription-payments", { params });
      return res.data.data;
    } catch (e) { throw rethrow(e); }
  },

  // ─── Plans ──────────────────────────────────────────────────────────────────

  async getPlans(): Promise<AdminPlan[]> {
    try {
      const res = await withAuth.get<{ data: AdminPlan[] }>("/admin/subscription-plans");
      return res.data.data;
    } catch (e) { throw rethrow(e); }
  },

  async createPlan(payload: CreatePlanPayload): Promise<AdminPlan> {
    try {
      const res = await withAuth.post<{ data: AdminPlan }>("/admin/subscription-plans", payload);
      return res.data.data;
    } catch (e) { throw rethrow(e); }
  },

  async updatePlan(id: number, payload: UpdatePlanPayload): Promise<AdminPlan> {
    try {
      const res = await withAuth.patch<{ data: AdminPlan }>(`/admin/subscription-plans/${id}`, payload);
      return res.data.data;
    } catch (e) { throw rethrow(e); }
  },

  // ─── Coupons ────────────────────────────────────────────────────────────────

  async getCoupons(params?: { is_active?: boolean; search?: string; per_page?: number; page?: number }): Promise<PaginatedAdminCoupons> {
    try {
      const res = await withAuth.get<{ data: PaginatedAdminCoupons }>("/admin/coupons", { params });
      return res.data.data;
    } catch (e) { throw rethrow(e); }
  },

  async getCoupon(id: number): Promise<AdminCouponDetail> {
    try {
      const res = await withAuth.get<{ data: AdminCouponDetail }>(`/admin/coupons/${id}`);
      return res.data.data;
    } catch (e) { throw rethrow(e); }
  },

  async createCoupon(payload: CreateCouponPayload): Promise<AdminCoupon> {
    try {
      const res = await withAuth.post<{ data: AdminCoupon }>("/admin/coupons", payload);
      return res.data.data;
    } catch (e) { throw rethrow(e); }
  },

  async updateCoupon(id: number, payload: UpdateCouponPayload): Promise<AdminCoupon> {
    try {
      const res = await withAuth.patch<{ data: AdminCoupon }>(`/admin/coupons/${id}`, payload);
      return res.data.data;
    } catch (e) { throw rethrow(e); }
  },

  async deleteCoupon(id: number): Promise<{ message: string }> {
    try {
      const res = await withAuth.delete<{ message: string }>(`/admin/coupons/${id}`);
      return res.data;
    } catch (e) { throw rethrow(e); }
  },

  async assignCoupon(id: number, user_id: number): Promise<{ message: string; discount_applied_usd: number }> {
    try {
      const res = await withAuth.post<{ message: string; discount_applied_usd: number }>(`/admin/coupons/${id}/assign`, { user_id });
      return res.data;
    } catch (e) { throw rethrow(e); }
  },

  // ─── User subscription lookup ────────────────────────────────────────────────

  async getUserSubscription(userId: number): Promise<AdminSubscription | null> {
    try {
      const res = await withAuth.get<{ data: AdminSubscription | null }>(`/admin/users/${userId}/subscription`);
      return res.data.data;
    } catch (e) { throw rethrow(e); }
  },
};

export interface PaginatedAdminCoupons {
  data: AdminCoupon[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
