// Registration Step Types
export interface StepOnePayload {
  company_name: string;
  business_reg_no: string;
  tax_id: string;
  business_type: string;
  specialization: string[];
  years_in_business: number;
}

export interface StepTwoPayload {
  registration_token: string;
  contactName: string;
  businessAddress: string;
  phoneNumber: string;
  email: string;
  password: string;
  password_confirmation: string;
  website?: string;
  wants_subdomain: boolean;
  socials: Array<{
    platform: string;
    url: string;
  }>;
}

export type PaymentProvider = "stripe" | "paystack";

export interface StepThreePayload {
  registration_token: string;
  payment_provider: PaymentProvider;
  country?: string;
  stripe_return_url?: string;
  stripe_refresh_url?: string;
  bank_code?: string;
  bank_name?: string;
  account_number?: string;
  business_name?: string;
}

export interface PaymentAccountResponse {
  message?: string;
  data?: {
    payment_provider?: PaymentProvider;
    connected_account_id?: string;
    redirect_url?: string;
    subaccount_code?: string;
    business_name?: string;
    account_name?: string;
    bank_name?: string;
    account_number_last4?: string;
    payment_provider_connected?: boolean;
    onboarding_completed?: boolean;
  };
  step?: number;
}

export interface PaymentAccountStatusResponse {
  data?: {
    payment_provider?: PaymentProvider;
    payment_provider_connected?: boolean;
    onboarding_completed?: boolean;
    charges_enabled?: boolean;
    payouts_enabled?: boolean;
    details_submitted?: boolean;
    step?: number;
  };
}

export interface PaystackBank {
  name: string;
  slug: string;
  code: string;
  longcode?: string;
  country: string;
  currency: string;
  type?: string;
}

export interface PaystackResolveAccountResponse {
  data: {
    account_number: string;
    account_name: string;
  };
}

export interface StepFourPayload {
  registration_token: string;
  licenseNumber?: string;
  licenseExpirationDate?: string;
  certifications?: string;
  associations?: string;
  licenseDocuments?: string[]; // Cloudinary URLs — uploaded directly before this call
}

export interface StepFivePayload {
  registration_token: string;
  // Cloudinary URLs — required (non-empty) as of the submit() validation update.
  identity_verification: string[];
  business_verification: string[];
  background_check_consent?: boolean;
}

// Registration Response Types
export interface StepOneResponse {
  message?: string;
  registration_token: string;
  data?: unknown;
}

export interface RegistrationCompleteResponse {
  message: string;
  user?: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
  data?: unknown;
}

export interface SubmitRegistrationPayload {
  registration_token: string;
}

export interface TeamPermissions {
  edit_miscellaneous: boolean;
  create_edit_auctions: boolean;
  run_live_auction: boolean;
  process_payments: boolean;
  view_reports: boolean;
  export_financials: boolean;
  manage_users: boolean;
  transfer_ownership: boolean;
  manage_billing: boolean;
}

export interface TeamMemberInfo {
  id: string;
  role: "owner" | "admin" | "clerk" | "cataloger" | "accountant" | "custom";
  custom_permissions: TeamPermissions | null;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "auctioneer" | "admin" | "superadmin";
  account_status: string;
  avatar?: string | null;
  avatar_url?: string | null;
}

export interface AuctioneerProfile {
  id: number;
  status: string;
  registration_step: number;
  company_name: string | null;
}

export interface AuthSession {
  token: string | null;
  user: AuthUser | null;
  auctioneer: AuctioneerProfile | null;
  can_access_auctioneer_features: boolean;
  team_member?: TeamMemberInfo | null;
}

export interface RegistrationProgressStep {
  completed: boolean;
  step_number: number;
  name: string;
}

export interface RegistrationProgress {
  status: string;
  registration_step: number;
  is_complete: boolean;
  next_step: number;
  progress_percentage: number;
  steps: {
    company_info: RegistrationProgressStep;
    contact_info: RegistrationProgressStep;
    bank_info: RegistrationProgressStep & {
      payment_provider: PaymentProvider | null;
      payment_provider_connected: boolean;
    };
    credentials_documents: RegistrationProgressStep;
    // Identity + business verification docs are now required before submit()
    // will accept the registration.
    additional_documents: RegistrationProgressStep & {
      required_for_registration: boolean;
    };
  };
  can_submit: boolean;
  missing_requirements: string[];
}

export interface RegistrationProgressResponse {
  status: "draft" | "pending" | "approved" | "rejected" | "in_progress";
  registration_step: number;
  next_step: number;
  progress_percentage: number;
  steps: {
    company_info: {
      completed: boolean;
      step_number: number;
      name: string;
    };
    contact_info: {
      completed: boolean;
      step_number: number;
      name: string;
    };
    bank_info: {
      completed: boolean;
      step_number: number;
      name: string;
    };
    credentials_documents: {
      completed: boolean;
      step_number: number;
      name: string;
    };
    additional_documents: {
      completed: boolean;
      step_number: number;
      name: string;
      required_for_registration: boolean;
    };
  };
  can_submit: boolean;
}
