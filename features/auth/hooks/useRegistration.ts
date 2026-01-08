import { useMutation, useQuery } from "@tanstack/react-query";
import { registrationService } from "../services/registrationService";
import type {
  StepOnePayload,
  StepTwoPayload,
  StepThreePayload,
  StepFourPayload,
  StepFivePayload,
  SubmitRegistrationPayload,
} from "../types";

export const useRegistration = () => {
  const stepOne = useMutation({
    mutationFn: registrationService.submitStepOne,
    mutationKey: ["registration", "step-one"],
  });

  const stepTwo = useMutation({
    mutationFn: registrationService.submitStepTwo,
    mutationKey: ["registration", "step-two"],
  });

  const stepThree = useMutation({
    mutationFn: registrationService.submitStepThree,
    mutationKey: ["registration", "step-three"],
  });

  const stepFour = useMutation({
    mutationFn: registrationService.submitStepFour,
    mutationKey: ["registration", "step-four"],
  });

  const stepFive = useMutation({
    mutationFn: registrationService.submitStepFive,
    mutationKey: ["registration", "step-five"],
  });

  const submitRegistration = useMutation({
    mutationFn: registrationService.submitRegistration,
    mutationKey: ["registration", "submit"],
  });

  const useRegistrationProgress = (registrationToken: string | null) => {
    return useQuery({
      queryKey: ["registration", "progress", registrationToken],
      queryFn: () => {
        if (!registrationToken) {
          throw new Error("Registration token is required");
        }
        return registrationService.getRegistrationProgress(registrationToken);
      },
      enabled: !!registrationToken,
      // Only fetch once on mount to resume registration, don't refetch automatically
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchInterval: false,
      staleTime: Infinity, // Don't consider data stale
    });
  };

  return {
    stepOne,
    stepTwo,
    stepThree,
    stepFour,
    stepFive,
    submitRegistration,
    useRegistrationProgress,
  };
};

