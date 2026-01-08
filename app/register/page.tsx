"use client";
import { useEffect, useState } from "react";
import { RegistrationSidebar } from "@/components/auth/registration/RegistrationSidebar";
import { StepOne, StepOneData } from "@/components/auth/registration/StepOne";
import { StepTwo, StepTwoData } from "@/components/auth/registration/StepTwo";
import { StepThree, StepThreeData } from "@/components/auth/registration/StepThree";
import { StepFour, StepFourData } from "@/components/auth/registration/StepFour";
import { StepFive, StepFiveData } from "@/components/auth/registration/StepFive";
import { useRegistration } from "@/features/auth/hooks/useRegistration";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useRouter } from "@bprogress/next/app";

interface RegistrationData {
  stepOne?: StepOneData;
  stepTwo?: StepTwoData;
  stepThree?: StepThreeData;
  stepFour?: StepFourData;
  stepFive?: StepFiveData;
}

const Registration = () => {
  // Try to restore registration token from sessionStorage on mount
  const [registrationToken, setRegistrationToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("registration_token");
    }
    return null;
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RegistrationData>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasResumedFromProgress, setHasResumedFromProgress] = useState(false);
  const router = useRouter();

  // Initialize React Query mutations and queries
  const { stepOne, stepTwo, stepThree, stepFour, stepFive, submitRegistration, useRegistrationProgress } = useRegistration();
  
  // Query registration progress only on initial load to resume registration
  const { data: progressData } = useRegistrationProgress(registrationToken);

  // Resume to the correct step only once on initial load (when page refreshes)
  useEffect(() => {
    // Only resume if we haven't already resumed and we have progress data
    if (hasResumedFromProgress || !progressData || isCompleted) return;
    
    const targetStep = progressData.next_step || progressData.registration_step;
    if (targetStep && targetStep >= 1 && targetStep <= 5) {
      setCurrentStep(targetStep);
      setHasResumedFromProgress(true);
    }
  }, [progressData, isCompleted, hasResumedFromProgress]);

  const handleStepOneSubmit = async (data: StepOneData) => {
    try {
      // Transform camelCase form data to snake_case payload
      const payload = {
        company_name: data.companyName,
        business_reg_no: data.registerationNumber,
        tax_id: data.tin,
        business_type: data.businessType,
        specialization: data.specialization,
        years_in_business: data.yearsInBusiness,
      };

      const result = await stepOne.mutateAsync(payload);
      const token = result.registration_token || result.data?.registration_token;

      if (!token) {
        toast.error("Registration token not received. Please try again.");
        return;
      }

      setRegistrationToken(token);
      // Store token in sessionStorage for persistence across refreshes
      if (typeof window !== "undefined") {
        sessionStorage.setItem("registration_token", token);
      }
      setFormData((prev) => ({ ...prev, stepOne: data }));
      setCurrentStep(2);
      toast.success("Step 1 submitted successfully");
    } catch (error: any) {
      const errorMessage = error?.message || error?.response?.data?.message || "Error submitting Step 1. Please try again.";
      
      // Handle validation errors
      if (error?.errors && typeof error.errors === 'object') {
        Object.values(error.errors)
          .flat()
          .forEach((msg) => {
            if (typeof msg === 'string') {
              toast.error(msg);
            }
          });
      } else {
        toast.error(errorMessage);
      }
      console.error("Step 1 error:", error);
    }
  };

  const handleStepTwoSubmit = async (data: StepTwoData) => {
    if (!registrationToken) {
      toast.error("Registration token missing. Please start from Step 1.");
      return;
    }

    try {
      const payload = {
        registration_token: registrationToken,
        contactName: data.contactName,
        businessAddress: data.businessAddress,
        phoneNumber: data.phoneNumber,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
        website: data.website,
        socials: data.socials,
      };

      await stepTwo.mutateAsync(payload);
      setFormData((prev) => ({ ...prev, stepTwo: data }));
      setCurrentStep(3);
      toast.success("Step 2 submitted successfully");
    } catch (error: any) {
      const errorMessage = error?.message || error?.response?.data?.message || "Error submitting Step 2. Please try again.";
      
      if (error?.errors && typeof error.errors === 'object') {
        Object.values(error.errors)
          .flat()
          .forEach((msg) => {
            if (typeof msg === 'string') {
              toast.error(msg);
            }
          });
      } else {
        toast.error(errorMessage);
      }
      console.error("Step 2 error:", error);
    }
  };

  const handleStepThreeSubmit = async (data: StepThreeData) => {
    if (!registrationToken) {
      toast.error("Registration token missing. Please start from Step 1.");
      return;
    }

    try {
      // Data already matches backend snake_case for bank fields
      const payload = {
        registration_token: registrationToken,
        bank_name: data.bankName,
        account_name: data.accountHolderName,
        account_number: data.accountNumber,
        routing_number: data.routingNumber,
        account_type: data.accountType,
      };

      await stepThree.mutateAsync(payload);
      setFormData((prev) => ({ ...prev, stepThree: data }));
      setCurrentStep(4);
      toast.success("Step 3 submitted successfully");
    } catch (error: any) {
      const errorMessage = error?.message || error?.response?.data?.message || "Error submitting Step 3. Please try again.";
      
      if (error?.errors && typeof error.errors === 'object') {
        Object.values(error.errors)
          .flat()
          .forEach((msg) => {
            if (typeof msg === 'string') {
              toast.error(msg);
            }
          });
      } else {
        toast.error(errorMessage);
      }
      console.error("Step 3 error:", error);
    }
  };

  const handleStepFourSubmit = async (data: StepFourData) => {
    if (!registrationToken) {
      toast.error("Registration token missing. Please start from Step 1.");
      return;
    }

    try {
      const payload = {
        registration_token: registrationToken,
        licenseNumber: data.licenseNumber,
        licenseExpirationDate: data.licenseExpirationDate,
        certifications: data.certifications,
        associations: data.associations,
        licenseDocuments: data.licenseDocuments,
      };

      await stepFour.mutateAsync(payload);
      setFormData((prev) => ({ ...prev, stepFour: data }));
      setCurrentStep(5);
      toast.success("Step 4 submitted successfully");
    } catch (error: any) {
      const errorMessage = error?.message || error?.response?.data?.message || "Error submitting Step 4. Please try again.";
      
      if (error?.errors && typeof error.errors === 'object') {
        Object.values(error.errors)
          .flat()
          .forEach((msg) => {
            if (typeof msg === 'string') {
              toast.error(msg);
            }
          });
      } else {
        toast.error(errorMessage);
      }
      console.error("Step 4 error:", error);
    }
  };

  const handleFinalSubmit = async (data: StepFiveData) => {
    if (!registrationToken) {
      toast.error("Registration token missing. Please start from Step 1.");
      return;
    }

    try {
      // Step 1: Submit Step 5 data (documents)
      const stepFivePayload = {
        registration_token: registrationToken,
        identity_verification: data.identityVerification,
        business_verification: data.businessVerification,
        background_check_consent: data.backgroundCheckConsent,
        compliance_documentation: data.complianceDocumentation,
      };

      await stepFive.mutateAsync(stepFivePayload);
      setFormData((prev) => ({ ...prev, stepFive: data }));
      
      // Step 2: Submit final registration
      const submitPayload = {
        registration_token: registrationToken,
      };

      const result = await submitRegistration.mutateAsync(submitPayload);
      
      // Clear registration token from sessionStorage on completion
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("registration_token");
      }
      
      toast.success("Registration Complete!", {
        description: result?.message || "Your account has been created successfully.",
      });
      setIsCompleted(true);
    } catch (error: any) {
      const errorMessage = error?.message || error?.response?.data?.message || "Error submitting final step. Please try again.";
      
      if (error?.errors && typeof error.errors === 'object') {
        Object.values(error.errors)
          .flat()
          .forEach((msg) => {
            if (typeof msg === 'string') {
              toast.error(msg);
            }
          });
      } else {
        toast.error(errorMessage);
      }
      console.error("Final submission error:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <RegistrationSidebar currentStep={currentStep} />

      <main className="flex-1 flex items-center justify-center p-8 bg-muted md:ml-96">
        {isCompleted ? (
          <Card className="shadow-2xl border-0 backdrop-blur-xl bg-white/80 dark:bg-card/80 rounded-2xl">
            <CardHeader className="text-center pb-0">
              <CardTitle className="text-3xl font-extrabold text-[#3F6B2D] tracking-tight">
                Registration Submitted!
              </CardTitle>
              <p className="text-muted-foreground mt-2 text-base">
                Thank you for completing your registration.
              </p>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[#3F6B2D]/10">
                  <CheckCircle className="text-[#3F6B2D]" size={50} />
                </div>

                <p className="text-center text-lg leading-relaxed">
                  Your account has been successfully created and is now under review by
                  our verification team.
                </p>

                {progressData && (
                  <div className="bg-primary/10 p-4 rounded-xl text-center text-sm">
                    <p className="font-medium text-[#3F6B2D] mb-2">Registration Status</p>
                    <p className="text-muted-foreground">
                      Status: <span className="font-semibold capitalize">{progressData.status}</span>
                    </p>
                    <p className="text-muted-foreground mt-1">
                      Current Step: {progressData.registration_step} / 5
                    </p>
                    <p className="text-muted-foreground mt-1">
                      Next Step: {progressData.next_step}
                    </p>
                    <p className="text-muted-foreground mt-1">
                      Progress: {progressData.progress_percentage}% 
                    </p>
                    <div className="text-left mt-3 text-muted-foreground space-y-1">
                      <p className="font-medium text-foreground">Steps:</p>
                      {Object.values(progressData.steps).map((step) => (
                        <p key={step.step_number} className="text-xs">
                          {step.step_number}. {step.name} — {step.completed ? "Completed" : "Pending"}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-muted/40 p-4 rounded-xl text-center text-sm leading-relaxed">
                  <p className="font-medium text-[#3F6B2D]">What happens next?</p>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>• We'll verify your submitted details and documentation.</li>
                    <li>• This process usually takes <strong>24-48 hours</strong>.</li>
                    <li>• Once approved, you will gain full auctioneer access.</li>
                  </ul>
                </div>

                <Button
                  variant="default"
                  className="mt-4 w-full sm:w-auto px-8 py-2 text-base rounded-xl"
                  onClick={() => router.push("/login")}
                >
                  Go to Login Page
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  You will receive an email notification once your account is approved.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="w-full max-w-4xl bg-card rounded-2xl shadow-2xl p-8 md:p-12">
              {currentStep === 1 && (
                <StepOne
                  onNext={handleStepOneSubmit}
                  defaultValues={formData.stepOne}
                  isLoading={stepOne.isPending}
                />
              )}
              {currentStep === 2 && (
                <StepTwo
                  onNext={handleStepTwoSubmit}
                  onBack={() => setCurrentStep(1)}
                  defaultValues={formData.stepTwo}
                  isLoading={stepTwo.isPending}
                  registrationToken={registrationToken}
                />
              )}
              {currentStep === 3 && (
                <StepThree
                  onNext={handleStepThreeSubmit}
                  onBack={() => setCurrentStep(2)}
                  defaultValues={formData.stepThree}
                  isLoading={stepThree.isPending}
                  registrationToken={registrationToken}
                />
              )}
              {currentStep === 4 && (
                <StepFour
                  onNext={handleStepFourSubmit}
                  onBack={() => setCurrentStep(3)}
                  defaultValues={formData.stepFour}
                  isLoading={stepFour.isPending}
                  registrationToken={registrationToken}
                />
              )}
              {currentStep === 5 && (
                <StepFive
                  onSubmit={handleFinalSubmit}
                  onBack={() => setCurrentStep(4)}
                  defaultValues={formData.stepFive}
                  isLoading={stepFive.isPending}
                  registrationToken={registrationToken}
                />
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Registration;
