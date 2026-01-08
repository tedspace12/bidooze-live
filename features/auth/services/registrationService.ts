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
      return res.data.data || res.data;
    } catch (error: any) {
      throw error?.response?.data || { message: error.message };
    }
  },

  /**
   * Step 2: Personal Information
   */
  async submitStepTwo(data: StepTwoPayload): Promise<{ message?: string; data?: any }> {
    try {
      const res = await withoutAuth.post<{ message?: string; data?: any }>(
        "/auctioneer/contact-info",
        data
      );
      return res.data.data || res.data;
    } catch (error: any) {
      throw error?.response?.data || { message: error.message };
    }
  },

  /**
   * Step 3: Bank Information
   */
  async submitStepThree(data: StepThreePayload): Promise<{ message?: string; data?: any }> {
    try {
      const res = await withoutAuth.post<{ message?: string; data?: any }>(
        "/auctioneer/bank-info",
        data
      );
      return res.data.data || res.data;
    } catch (error: any) {
      throw error?.response?.data || { message: error.message };
    }
  },

  /**
   * Step 4: Credentials & Documents (with file upload)
   */
  async submitStepFour(data: StepFourPayload): Promise<{ message?: string; data?: any }> {
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

      const res = await withoutAuth.post<{ message?: string; data?: any }>(
        "/auctioneer/credentials-documents",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return res.data.data || res.data;
    } catch (error: any) {
      throw error?.response?.data || { message: error.message };
    }
  },

  /**
   * Step 5: Verification Documents (Final Step)
   */
  async submitStepFive(data: StepFivePayload): Promise<RegistrationCompleteResponse> {
    try {
      const formData = new FormData();

      // Add registration token
      formData.append("registration_token", data.registration_token);
      formData.append("background_check_consent", data.background_check_consent.toString());

      // Add identity verification files (using snake_case for backend)
      if (data.identity_verification) {
        const files = Array.isArray(data.identity_verification)
          ? data.identity_verification
          : Array.from(data.identity_verification);
        files.forEach((file: File, index: number) => {
          formData.append(`identity_verification[${index}]`, file);
        });
      }

      // Add business verification files (using snake_case for backend)
      if (data.business_verification) {
        const files = Array.isArray(data.business_verification)
          ? data.business_verification
          : Array.from(data.business_verification);
        files.forEach((file: File, index: number) => {
          formData.append(`business_verification[${index}]`, file);
        });
      }

      // Add compliance documentation files (optional, using snake_case for backend)
      if (data.compliance_documentation) {
        const files = Array.isArray(data.compliance_documentation)
          ? data.compliance_documentation
          : Array.from(data.compliance_documentation);
        files.forEach((file: File, index: number) => {
          formData.append(`compliance_documentation[${index}]`, file);
        });
      }

      const res = await withoutAuth.post<RegistrationCompleteResponse>(
        "/auctioneer/upload-document",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return res.data.data || res.data;
    } catch (error: any) {
      throw error?.response?.data || { message: error.message };
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
      return res.data.data || res.data;
    } catch (error: any) {
      throw error?.response?.data || { message: error.message };
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
    } catch (error: any) {
      throw error?.response?.data || { message: error.message };
    }
  },
};

