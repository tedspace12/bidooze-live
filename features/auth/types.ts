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
  bank_name: string;
  account_name: string;
  account_number: string;
  routing_number: string;
  account_type: string;
}

export interface StepFourPayload {
  registration_token: string;
  licenseNumber: string;
  licenseExpirationDate: string;
  certifications?: string;
  associations?: string;
  licenseDocuments: FileList | File[] | null;
}

export interface StepFivePayload {
  registration_token: string;
  identity_verification: FileList | File[] | null;
  business_verification: FileList | File[] | null;
  background_check_consent: boolean;
  compliance_documentation: FileList | File[] | null; // Required, not optional
}

// Registration Response Types
export interface StepOneResponse {
  message?: string;
  registration_token: string;
  data?: any;
}

export interface RegistrationCompleteResponse {
  message: string;
  user?: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
  data?: any;
}

export interface SubmitRegistrationPayload {
  registration_token: string;
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

