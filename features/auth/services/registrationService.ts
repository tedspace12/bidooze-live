import { withoutAuth } from "@/services/api";
import type {
  StepOnePayload,
  StepTwoPayload,
  StepThreePayload,
  StepFourPayload,
  StepFivePayload,
  StepOneResponse,
  RegistrationCompleteResponse,
  SubmitRegistrationPayload,
  RegistrationProgressResponse,
} from "../types";

type ApiErrorLike = {
  response?: {
    data?: unknown;
  };
  message?: string;
};

type RegistrationStepResponse = {
  message?: string;
  data?: unknown;
} & Record<string, unknown>;

export interface SocialContactInfoPayload {
  registration_token: string;
  provider: "google" | "facebook";
  token: string;
  contact_name: string;
  business_address: string;
  phone_number: string;
  website?: string;
  socials?: Array<{ platform: string; url: string }>;
}

const extractPayloadData = <T>(payload: unknown): T => {
  if (payload && typeof payload === "object" && "data" in payload) {
    const data = (payload as { data?: unknown }).data;
    if (data !== undefined) return data as T;
  }
  return payload as T;
};

const rethrowApiError = (error: unknown): never => {
  const err = error as ApiErrorLike;
  throw err?.response?.data || { message: err?.message || "Request failed" };
};

export const registrationService = {
  /**
   * Step 1: Company Information
   */
  async submitStepOne(data: StepOnePayload): Promise<StepOneResponse> {
    try {
      const res = await withoutAuth.post<StepOneResponse>(
        "/auctioneer/company-info",
        data
      );
      // Handle both direct data and wrapped responses
      if (res.data.registration_token) {
        return res.data;
      }
      return extractPayloadData<StepOneResponse>(res.data);
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  /**
   * Step 2: Personal Information
   */
  async submitStepTwo(data: StepTwoPayload): Promise<RegistrationStepResponse> {
    try {
      const res = await withoutAuth.post<RegistrationStepResponse>(
        "/auctioneer/contact-info",
        data
      );
      return extractPayloadData<RegistrationStepResponse>(res.data);
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  /**
   * Step 2 (Social): Contact Info via OAuth — replaces email/password with provider token
   */
  async submitSocialContactInfo(data: SocialContactInfoPayload): Promise<RegistrationStepResponse> {
    try {
      const res = await withoutAuth.post<RegistrationStepResponse>(
        "/auctioneer/social-contact-info",
        data
      );
      return extractPayloadData<RegistrationStepResponse>(res.data);
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  /**
   * Step 3: Bank Information
   */
  async submitStepThree(data: StepThreePayload): Promise<RegistrationStepResponse> {
    try {
      const res = await withoutAuth.post<RegistrationStepResponse>(
        "/auctioneer/bank-info",
        data
      );
      return extractPayloadData<RegistrationStepResponse>(res.data);
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  /**
   * Step 4: Credentials & Documents
   * Files are uploaded directly to Cloudinary beforehand; this receives URLs.
   */
  async submitStepFour(data: StepFourPayload): Promise<RegistrationStepResponse> {
    try {
      const res = await withoutAuth.post<RegistrationStepResponse>(
        "/auctioneer/credentials-documents",
        {
          registration_token: data.registration_token,
          licenseNumber: data.licenseNumber,
          licenseExpirationDate: data.licenseExpirationDate,
          certifications: data.certifications,
          associations: data.associations,
          licenseDocuments: data.licenseDocuments, // string[] of Cloudinary URLs
        }
      );
      return extractPayloadData<RegistrationStepResponse>(res.data);
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  /**
   * Step 5: Verification Documents (Final Step)
   * Files are uploaded directly to Cloudinary beforehand; this receives URL arrays.
   */
  async submitStepFive(data: StepFivePayload): Promise<RegistrationCompleteResponse> {
    try {
      const res = await withoutAuth.post<RegistrationCompleteResponse>(
        "/auctioneer/submit",
        {
          registration_token: data.registration_token,
          background_check_consent: data.background_check_consent,
          identity_verification: data.identity_verification,   // string[]
          business_verification: data.business_verification,   // string[]
          compliance_documentation: data.compliance_documentation, // string[]
        }
      );
      return extractPayloadData<RegistrationCompleteResponse>(res.data);
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  /**
   * Submit Registration (Final submission after Step 5)
   */
  async submitRegistration(data: SubmitRegistrationPayload): Promise<RegistrationCompleteResponse> {
    try {
      const res = await withoutAuth.post<RegistrationCompleteResponse>(
        "/auctioneer/submit",
        data
      );
      return extractPayloadData<RegistrationCompleteResponse>(res.data);
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  /**
   * Get Registration Progress
   */
  async getRegistrationProgress(registrationToken: string): Promise<RegistrationProgressResponse> {
    try {
      const res = await withoutAuth.get<RegistrationProgressResponse>(
        "/auctioneer/progress",
        {
          params: { registration_token: registrationToken },
        }
      );
      return res.data;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },
};

