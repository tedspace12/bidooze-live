// ─── Subscription ─────────────────────────────────────────────────────────────

export type SubscriptionStatus = "trial" | "active" | "grace" | "expired" | "cancelled";

export interface SubscriptionPlanSummary {
  id: number;
  name: string;
  duration_days: number;
}

export interface Subscription {
  id: number;
  status: SubscriptionStatus;
  is_accessible: boolean;
  is_in_trial: boolean;
  is_in_grace: boolean;
  days_remaining: number;
  auto_renew: boolean;
  trial_ends_at: string | null;
  starts_at: string | null;
  ends_at: string | null;
  grace_ends_at: string | null;
  cancelled_at: string | null;
  is_grandfathered: boolean;
  plan: SubscriptionPlanSummary;
}

// ─── Plans ────────────────────────────────────────────────────────────────────

export interface Plan {
  id: number;
  name: string;
  slug: string;
  price_usd: number;
  price_display: string;
  price_amount: number;
  currency: string;
  duration_days: number;
  trial_days: number;
  features: string[];
  billing_period: "yearly" | "monthly" | "custom";
}

// ─── Coupon ───────────────────────────────────────────────────────────────────

export interface CouponValidation {
  code: string;
  discount_type: "percent" | "fixed_usd";
  discount_value: string;
  discount_usd: number;
  original_usd: number;
  final_usd: number;
  original_display: string;
  final_display: string;
  currency: string;
}

// ─── Payment history ─────────────────────────────────────────────────────────

export type PaymentStatus = "paid" | "pending" | "failed";
export type PaymentType = "new" | "renewal" | "manual";

export interface PaymentHistoryItem {
  id: number;
  amount_paid: number;
  currency: string;
  amount_usd: number;
  status: PaymentStatus;
  type: PaymentType;
  provider: string;
  provider_reference: string;
  paid_at: string;
  created_at: string;
  plan: {
    name: string;
    duration_days: number;
  };
}

export interface PaginatedPayments {
  current_page: number;
  data: PaymentHistoryItem[];
  per_page: number;
  total: number;
  last_page: number;
}

// ─── Payment methods ──────────────────────────────────────────────────────────

export interface PaymentMethod {
  id: number;
  provider: string;
  label: string;
  card_holder_name: string;
  card_type: string;
  last4: string;
  expiry_month: string;
  expiry_year: string;
  bank: string;
  country_code: string;
  ref: string;
  is_default: boolean;
  created_at: string;
}

export interface AddPaymentMethodPayload {
  card_number: string;
  cvv: string;
  expiry_month: string;
  expiry_year: string;
  card_holder_name: string;
  provider: string;
  set_default: boolean;
}

// ─── API response wrappers ────────────────────────────────────────────────────

export interface SubscriptionDetailsResponse {
  message: string;
  data: {
    subscription: Subscription | null;
    plan: Plan | null;
  };
}

export interface PlansResponse {
  message: string;
  data: Plan[];
}

export interface InitiatePaymentPayload {
  currency?: string;
  return_url?: string;
  provider?: string;
  coupon_code?: string;
}

export interface CouponValidationResponse {
  message: string;
  data: CouponValidation;
}

export interface InitiatePaymentResponse {
  message: string;
  data: {
    provider_reference: string;
    amount: number;
    currency: string;
    provider_instructions: {
      provider: string;
      reference: string;
      amount: number;
      currency: string;
      authorization_url: string;
      redirect_url: string;
      return_url: string;
      access_code: string;
      message: string;
    };
  };
}

export interface AutoRenewResponse {
  message: string;
  data: { auto_renew: boolean };
}

export interface CancelSubscriptionResponse {
  message: string;
  data: Subscription;
}

export interface PaymentMethodResponse {
  message: string;
  data: PaymentMethod;
}

export interface PaymentMethodsResponse {
  message: string;
  data: PaymentMethod[];
}

export interface PaymentsResponse {
  message: string;
  data: PaginatedPayments;
}
