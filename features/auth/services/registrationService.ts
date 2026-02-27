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
   * Step 4: Credentials & Documents (with file upload)
   */
  async submitStepFour(data: StepFourPayload): Promise<RegistrationStepResponse> {
    try {
      const formData = new FormData();

      // Add all text fields (using snake_case for backend)
      formData.append("registration_token", data.registration_token);
      formData.append("licenseNumber", data.licenseNumber);
      formData.append("licenseExpirationDate", data.licenseExpirationDate);
      
      if (data.certifications) {
        formData.append("certifications", data.certifications);
      }
      if (data.associations) {
        formData.append("associations", data.associations);
      }

      // Add license documents as files (using snake_case for backend)
      if (data.licenseDocuments) {
        const files = Array.isArray(data.licenseDocuments)
          ? data.licenseDocuments
          : Array.from(data.licenseDocuments);
        
        files.forEach((file: File, index: number) => {
          formData.append(`licenseDocuments[${index}]`, file);
        });
      }

      const res = await withoutAuth.post<RegistrationStepResponse>(
        "/auctioneer/credentials-documents",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return extractPayloadData<RegistrationStepResponse>(res.data);
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  /**
   * Step 5: Verification Documents (Final Step)
   * Endpoint: POST /api/auctioneer/submit
   * Payload: multipart/form-data with registration_token, background_check_consent,
   *          identity_verification[0], business_verification[0], compliance_documentation[0]
   */
  async submitStepFive(data: StepFivePayload): Promise<RegistrationCompleteResponse> {
    try {
      const formData = new FormData();

      // Add registration token
      formData.append("registration_token", data.registration_token);
      
      // Add background check consent (as string "true" or "false")
      formData.append("background_check_consent", data.background_check_consent.toString());

      // Add identity verification files
      // Format: identity_verification[0], identity_verification[1], etc.
      if (data.identity_verification) {
        const files = Array.isArray(data.identity_verification)
          ? data.identity_verification
          : Array.from(data.identity_verification);
        files.forEach((file: File, index: number) => {
          formData.append(`identity_verification[${index}]`, file);
        });
      }

      // Add business verification files
      // Format: business_verification[0], business_verification[1], etc.
      if (data.business_verification) {
        const files = Array.isArray(data.business_verification)
          ? data.business_verification
          : Array.from(data.business_verification);
        files.forEach((file: File, index: number) => {
          formData.append(`business_verification[${index}]`, file);
        });
      }

      // Add compliance documentation files (REQUIRED)
      // Format: compliance_documentation[0], compliance_documentation[1], etc.
      if (data.compliance_documentation) {
        const files = Array.isArray(data.compliance_documentation)
          ? data.compliance_documentation
          : Array.from(data.compliance_documentation);
        files.forEach((file: File, index: number) => {
          formData.append(`compliance_documentation[${index}]`, file);
        });
      }

      const res = await withoutAuth.post<RegistrationCompleteResponse>(
        "/auctioneer/submit",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "Accept": "application/json",
          },
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

