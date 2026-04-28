import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { subscriptionService } from "../services/subscriptionService";
import type { AddPaymentMethodPayload, InitiatePaymentPayload } from "../types";

const KEYS = {
  subscription: ["subscription"] as const,
  plans: ["subscription", "plans"] as const,
  payments: (page: number) => ["subscription", "payments", page] as const,
  paymentMethods: ["payment-methods"] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useSubscriptionDetails() {
  return useQuery({
    queryKey: KEYS.subscription,
    queryFn: () => subscriptionService.getSubscription(),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePlans() {
  return useQuery({
    queryKey: KEYS.plans,
    queryFn: () => subscriptionService.getPlans(),
    staleTime: 10 * 60 * 1000,
  });
}

export function usePaymentHistory(page = 1) {
  return useQuery({
    queryKey: KEYS.payments(page),
    queryFn: () => subscriptionService.getPayments(page),
  });
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: KEYS.paymentMethods,
    queryFn: () => subscriptionService.getPaymentMethods(),
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useInitiatePayment() {
  return useMutation({
    mutationFn: (payload: InitiatePaymentPayload) =>
      subscriptionService.initiatePayment(payload),
    onError: () => {
      toast.error("Failed to initiate payment. Please try again.");
    },
  });
}

export function useUpdateAutoRenew() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (auto_renew: boolean) => subscriptionService.updateAutoRenew(auto_renew),
    onSuccess: (data) => {
      toast.success(data.auto_renew ? "Auto-renew enabled." : "Auto-renew disabled.");
      qc.invalidateQueries({ queryKey: KEYS.subscription });
    },
    onError: () => {
      toast.error("Failed to update auto-renew setting.");
    },
  });
}

export function useCancelSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reason?: string) => subscriptionService.cancelSubscription(reason),
    onSuccess: () => {
      toast.success("Subscription cancelled. Access continues until the period ends.");
      qc.invalidateQueries({ queryKey: KEYS.subscription });
    },
    onError: () => {
      toast.error("Failed to cancel subscription.");
    },
  });
}

export function useAddPaymentMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddPaymentMethodPayload) =>
      subscriptionService.addPaymentMethod(payload),
    onSuccess: () => {
      toast.success("Payment method saved.");
      qc.invalidateQueries({ queryKey: KEYS.paymentMethods });
    },
    onError: () => {
      toast.error("Failed to save payment method. Please check your card details.");
    },
  });
}

export function useSetDefaultPaymentMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => subscriptionService.setDefaultPaymentMethod(id),
    onSuccess: () => {
      toast.success("Default payment method updated.");
      qc.invalidateQueries({ queryKey: KEYS.paymentMethods });
    },
    onError: () => {
      toast.error("Failed to update default payment method.");
    },
  });
}

export function useDeletePaymentMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => subscriptionService.deletePaymentMethod(id),
    onSuccess: () => {
      toast.success("Payment method removed.");
      qc.invalidateQueries({ queryKey: KEYS.paymentMethods });
    },
    onError: () => {
      toast.error("Failed to remove payment method.");
    },
  });
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: (coupon_code: string) => subscriptionService.validateCoupon(coupon_code),
  });
}
