// Registration Step Types
export interface StepOnePayload {
  company_name: string;
  business_reg_no: string;
  tax_id: string;
  business_type: string;
  specialization: string[];
  years_in_business: string;
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
  socials: Array<{
    platform: string;
    url: string;
  }>;
}

export interface StepThreePayload {
  registration_token: string;
  country: string;
  bank_name: string;
  account_name: string;
  account_number?: string;
  routing_number?: string;
  account_type: string;
  bank_identifiers?: Record<string, string>;
}

export interface StepFourPayload {
  registration_token: string;
  licenseNumber: string;
  licenseExpirationDate: string;
  certifications?: string;
  associations?: string;
  licenseDocuments: string[]; // Cloudinary URLs — uploaded directly before this call
}

export interface StepFivePayload {
  registration_token: string;
  identity_verification: string[];    // Cloudinary URLs
  business_verification: string[];
  background_check_consent: boolean;
  compliance_documentation: string[];
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
    };
  };
  can_submit: boolean;
}
