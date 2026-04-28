import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  adminSubscriptionService,
  type CreateCouponPayload,
  type CreatePlanPayload,
  type SuspendAuctioneerPayload,
  type UpdateCouponPayload,
  type UpdatePlanPayload,
} from "../services/adminSubscriptionService";

const getMsg = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object" && "message" in error) {
    const m = (error as { message?: unknown }).message;
    if (typeof m === "string" && m.trim()) return m;
  }
  return fallback;
};

const KEYS = {
  subscriptions: (p?: object) => ["admin", "subscriptions", p] as const,
  subscription: (id: number) => ["admin", "subscription", id] as const,
  subStats: ["admin", "subscription-stats"] as const,
  subReports: (p?: object) => ["admin", "subscription-reports", p] as const,
  expiring: (p?: object) => ["admin", "subscriptions-expiring", p] as const,
  grace: (p?: object) => ["admin", "subscriptions-grace", p] as const,
  payments: (p?: object) => ["admin", "subscription-payments", p] as const,
  plans: ["admin", "subscription-plans"] as const,
  coupons: (p?: object) => ["admin", "coupons", p] as const,
  coupon: (id: number) => ["admin", "coupon", id] as const,
};

export function useAdminSubscription() {
  const qc = useQueryClient();

  const invalidateSub = (id?: number) => {
    qc.invalidateQueries({ queryKey: ["admin", "subscriptions"] });
    qc.invalidateQueries({ queryKey: KEYS.subStats });
    if (id) qc.invalidateQueries({ queryKey: KEYS.subscription(id) });
  };

  // ─── Queries ────────────────────────────────────────────────────────────────

  const useSubscriptions = (params?: { status?: string; search?: string; page?: number; per_page?: number }) =>
    useQuery({ queryKey: KEYS.subscriptions(params), queryFn: () => adminSubscriptionService.getSubscriptions(params) });

  const useSubscriptionDetail = (id?: number) =>
    useQuery({
      queryKey: KEYS.subscription(id!),
      queryFn: () => adminSubscriptionService.getSubscription(id!),
      enabled: !!id,
    });

  const useSubscriptionStats = () =>
    useQuery({
      queryKey: KEYS.subStats,
      queryFn: () => adminSubscriptionService.getSubscriptionStats(),
      staleTime: 60_000,
    });

  const useSubscriptionReports = (params?: { from?: string; to?: string; group_by?: "day" | "month" }) =>
    useQuery({
      queryKey: KEYS.subReports(params),
      queryFn: () => adminSubscriptionService.getSubscriptionReports(params),
      enabled: !!(params?.from && params?.to),
    });

  const useExpiringSoon = (params?: { days?: number; per_page?: number }) =>
    useQuery({ queryKey: KEYS.expiring(params), queryFn: () => adminSubscriptionService.getExpiringSoon(params) });

  const useInGrace = (params?: { per_page?: number }) =>
    useQuery({ queryKey: KEYS.grace(params), queryFn: () => adminSubscriptionService.getInGrace(params) });

  const useAdminPayments = (params?: { status?: string; provider?: string; from?: string; to?: string; search?: string; per_page?: number; page?: number }) =>
    useQuery({ queryKey: KEYS.payments(params), queryFn: () => adminSubscriptionService.getPayments(params) });

  const useAdminPlans = () =>
    useQuery({ queryKey: KEYS.plans, queryFn: () => adminSubscriptionService.getPlans(), staleTime: 60_000 });

  const useAdminCoupons = (params?: { is_active?: boolean; search?: string; per_page?: number; page?: number }) =>
    useQuery({ queryKey: KEYS.coupons(params), queryFn: () => adminSubscriptionService.getCoupons(params) });

  const useAdminCouponDetail = (id?: number) =>
    useQuery({
      queryKey: KEYS.coupon(id!),
      queryFn: () => adminSubscriptionService.getCoupon(id!),
      enabled: !!id,
    });

  // ─── Subscription mutations ──────────────────────────────────────────────────

  const activateSubscription = useMutation({
    mutationFn: ({ id, days, notes }: { id: number; days: number; notes?: string }) =>
      adminSubscriptionService.activateSubscription(id, days, notes),
    onSuccess: (_, { id }) => { toast.success("Subscription activated."); invalidateSub(id); },
    onError: (e) => toast.error(getMsg(e, "Failed to activate subscription.")),
  });

  const extendSubscription = useMutation({
    mutationFn: ({ id, days, notes }: { id: number; days: number; notes?: string }) =>
      adminSubscriptionService.extendSubscription(id, days, notes),
    onSuccess: (_, { id }) => { toast.success("Subscription extended."); invalidateSub(id); },
    onError: (e) => toast.error(getMsg(e, "Failed to extend subscription.")),
  });

  const expireSubscription = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) =>
      adminSubscriptionService.expireSubscription(id, notes),
    onSuccess: (_, { id }) => { toast.success("Subscription expired."); invalidateSub(id); },
    onError: (e) => toast.error(getMsg(e, "Failed to expire subscription.")),
  });

  const cancelSubscription = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      adminSubscriptionService.cancelSubscription(id, reason),
    onSuccess: (_, { id }) => { toast.success("Subscription cancelled."); invalidateSub(id); },
    onError: (e) => toast.error(getMsg(e, "Failed to cancel subscription.")),
  });

  const changeSubscriptionDates = useMutation({
    mutationFn: ({ id, ends_at, starts_at, notes }: { id: number; ends_at: string; starts_at?: string; notes?: string }) =>
      adminSubscriptionService.changeSubscriptionDates(id, { ends_at, starts_at, notes }),
    onSuccess: (_, { id }) => { toast.success("Subscription dates updated."); invalidateSub(id); },
    onError: (e) => toast.error(getMsg(e, "Failed to update subscription dates.")),
  });

  const recordPayment = useMutation({
    mutationFn: ({ id, ...payload }: {
      id: number;
      amount_usd: number;
      amount_paid: number;
      currency: string;
      provider: string;
      reference?: string;
      paid_at?: string;
      notes?: string;
      plan_id?: number;
    }) => adminSubscriptionService.recordPayment(id, payload),
    onSuccess: (_, { id }) => {
      toast.success("Payment recorded and subscription activated.");
      invalidateSub(id);
      qc.invalidateQueries({ queryKey: ["admin", "subscription-payments"] });
    },
    onError: (e) => toast.error(getMsg(e, "Failed to record payment.")),
  });

  const resendPaymentLink = useMutation({
    mutationFn: (id: number) => adminSubscriptionService.resendPaymentLink(id),
    onSuccess: () => toast.success("Payment link resent to auctioneer."),
    onError: (e) => toast.error(getMsg(e, "Failed to resend payment link.")),
  });

  // ─── Auctioneer account mutations ────────────────────────────────────────────

  const suspendAuctioneer = useMutation({
    mutationFn: ({ id, ...payload }: { id: number } & SuspendAuctioneerPayload) =>
      adminSubscriptionService.suspendAuctioneer(id, payload),
    onSuccess: () => { toast.success("Auctioneer suspended."); qc.invalidateQueries({ queryKey: ["admin", "auctioneers"] }); qc.invalidateQueries({ queryKey: ["admin", "auctioneer"] }); },
    onError: (e) => toast.error(getMsg(e, "Failed to suspend auctioneer.")),
  });

  const unsuspendAuctioneer = useMutation({
    mutationFn: (id: number) => adminSubscriptionService.unsuspendAuctioneer(id),
    onSuccess: () => { toast.success("Auctioneer unsuspended."); qc.invalidateQueries({ queryKey: ["admin", "auctioneers"] }); qc.invalidateQueries({ queryKey: ["admin", "auctioneer"] }); },
    onError: (e) => toast.error(getMsg(e, "Failed to unsuspend auctioneer.")),
  });

  const banAuctioneer = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      adminSubscriptionService.banAuctioneer(id, reason),
    onSuccess: () => { toast.success("Auctioneer permanently banned."); qc.invalidateQueries({ queryKey: ["admin", "auctioneers"] }); qc.invalidateQueries({ queryKey: ["admin", "auctioneer"] }); },
    onError: (e) => toast.error(getMsg(e, "Failed to ban auctioneer.")),
  });

  // ─── Plan mutations ──────────────────────────────────────────────────────────

  const createPlan = useMutation({
    mutationFn: (payload: CreatePlanPayload) => adminSubscriptionService.createPlan(payload),
    onSuccess: () => { toast.success("Plan created."); qc.invalidateQueries({ queryKey: KEYS.plans }); },
    onError: (e) => toast.error(getMsg(e, "Failed to create plan.")),
  });

  const updatePlan = useMutation({
    mutationFn: ({ id, ...payload }: { id: number } & UpdatePlanPayload) =>
      adminSubscriptionService.updatePlan(id, payload),
    onSuccess: () => { toast.success("Plan updated."); qc.invalidateQueries({ queryKey: KEYS.plans }); },
    onError: (e) => toast.error(getMsg(e, "Failed to update plan.")),
  });

  // ─── Coupon mutations ────────────────────────────────────────────────────────

  const createCoupon = useMutation({
    mutationFn: (payload: CreateCouponPayload) => adminSubscriptionService.createCoupon(payload),
    onSuccess: () => { toast.success("Coupon created."); qc.invalidateQueries({ queryKey: ["admin", "coupons"] }); },
    onError: (e) => toast.error(getMsg(e, "Failed to create coupon.")),
  });

  const updateCoupon = useMutation({
    mutationFn: ({ id, ...payload }: { id: number } & UpdateCouponPayload) =>
      adminSubscriptionService.updateCoupon(id, payload),
    onSuccess: () => { toast.success("Coupon updated."); qc.invalidateQueries({ queryKey: ["admin", "coupons"] }); },
    onError: (e) => toast.error(getMsg(e, "Failed to update coupon.")),
  });

  const deleteCoupon = useMutation({
    mutationFn: (id: number) => adminSubscriptionService.deleteCoupon(id),
    onSuccess: (data) => { toast.success(data.message); qc.invalidateQueries({ queryKey: ["admin", "coupons"] }); },
    onError: (e) => toast.error(getMsg(e, "Failed to delete/deactivate coupon.")),
  });

  const assignCoupon = useMutation({
    mutationFn: ({ id, user_id }: { id: number; user_id: number }) =>
      adminSubscriptionService.assignCoupon(id, user_id),
    onSuccess: (data) => { toast.success(data.message); qc.invalidateQueries({ queryKey: ["admin", "coupons"] }); },
    onError: (e) => toast.error(getMsg(e, "Failed to assign coupon.")),
  });

  return {
    // queries
    useSubscriptions,
    useSubscriptionDetail,
    useSubscriptionStats,
    useSubscriptionReports,
    useExpiringSoon,
    useInGrace,
    useAdminPayments,
    useAdminPlans,
    useAdminCoupons,
    useAdminCouponDetail,
    // subscription mutations
    activateSubscription,
    extendSubscription,
    expireSubscription,
    cancelSubscription,
    changeSubscriptionDates,
    recordPayment,
    resendPaymentLink,
    // auctioneer mutations
    suspendAuctioneer,
    unsuspendAuctioneer,
    banAuctioneer,
    // plan mutations
    createPlan,
    updatePlan,
    // coupon mutations
    createCoupon,
    updateCoupon,
    deleteCoupon,
    assignCoupon,
  };
}
