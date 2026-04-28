import { withAuth } from "@/services/api";
import type {
  SubscriptionDetailsResponse,
  PlansResponse,
  InitiatePaymentPayload,
  InitiatePaymentResponse,
  AutoRenewResponse,
  CancelSubscriptionResponse,
  PaymentMethodsResponse,
  PaymentMethodResponse,
  AddPaymentMethodPayload,
  PaymentsResponse,
  CouponValidationResponse,
} from "../types";

type ApiErrorLike = {
  response?: { data?: unknown };
  message?: string;
};

const rethrow = (error: unknown): never => {
  const err = error as ApiErrorLike;
  throw err?.response?.data || { message: err?.message || "Request failed" };
};

export const subscriptionService = {
  async getSubscription(): Promise<SubscriptionDetailsResponse["data"]> {
    try {
      const res = await withAuth.get<SubscriptionDetailsResponse>("/auctioneer/subscription");
      return res.data.data;
    } catch (e) {
      throw rethrow(e);
    }
  },

  async getPlans(): Promise<PlansResponse["data"]> {
    try {
      const res = await withAuth.get<PlansResponse>("/auctioneer/subscription/plans");
      return res.data.data;
    } catch (e) {
      throw rethrow(e);
    }
  },

  async initiatePayment(payload: InitiatePaymentPayload): Promise<InitiatePaymentResponse["data"]> {
    try {
      const res = await withAuth.post<InitiatePaymentResponse>(
        "/auctioneer/subscription/initiate",
        payload
      );
      return res.data.data;
    } catch (e) {
      throw rethrow(e);
    }
  },

  async updateAutoRenew(auto_renew: boolean): Promise<AutoRenewResponse["data"]> {
    try {
      const res = await withAuth.patch<AutoRenewResponse>(
        "/auctioneer/subscription/auto-renew",
        { auto_renew }
      );
      return res.data.data;
    } catch (e) {
      throw rethrow(e);
    }
  },

  async cancelSubscription(reason?: string): Promise<CancelSubscriptionResponse["data"]> {
    try {
      const res = await withAuth.post<CancelSubscriptionResponse>(
        "/auctioneer/subscription/cancel",
        { reason }
      );
      return res.data.data;
    } catch (e) {
      throw rethrow(e);
    }
  },

  async getPayments(page = 1): Promise<PaymentsResponse["data"]> {
    try {
      const res = await withAuth.get<PaymentsResponse>("/auctioneer/subscription/payments", {
        params: { page },
      });
      return res.data.data;
    } catch (e) {
      throw rethrow(e);
    }
  },

  async getPaymentMethods(): Promise<PaymentMethodsResponse["data"]> {
    try {
      const res = await withAuth.get<PaymentMethodsResponse>("/auctioneer/payment-methods");
      return res.data.data;
    } catch (e) {
      throw rethrow(e);
    }
  },

  async addPaymentMethod(payload: AddPaymentMethodPayload): Promise<PaymentMethodResponse["data"]> {
    try {
      const res = await withAuth.post<PaymentMethodResponse>(
        "/auctioneer/payment-methods",
        payload
      );
      return res.data.data;
    } catch (e) {
      throw rethrow(e);
    }
  },

  async setDefaultPaymentMethod(id: number): Promise<PaymentMethodResponse["data"]> {
    try {
      const res = await withAuth.patch<PaymentMethodResponse>(
        `/auctioneer/payment-methods/${id}/default`
      );
      return res.data.data;
    } catch (e) {
      throw rethrow(e);
    }
  },

  async deletePaymentMethod(id: number): Promise<void> {
    try {
      await withAuth.delete(`/auctioneer/payment-methods/${id}`);
    } catch (e) {
      throw rethrow(e);
    }
  },

  async validateCoupon(coupon_code: string): Promise<CouponValidationResponse["data"]> {
    try {
      const res = await withAuth.post<CouponValidationResponse>(
        "/auctioneer/subscription/validate-coupon",
        { coupon_code }
      );
      return res.data.data;
    } catch (e) {
      throw rethrow(e);
    }
  },
};
