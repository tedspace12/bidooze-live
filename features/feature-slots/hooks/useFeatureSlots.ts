"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  featureSlotService,
  type SlotsParams,
  type StatesSummaryItem,
} from "../services/featureSlotService";
import type {
  FeatureSlotAssignmentCreatePayload,
  AuctioneerSlotAssignPayload,
  FeatureSlotBidPayload,
  SlotPaymentPayload,
  AdminSlotUpdatePayload,
  CreateSlotRoundPayload,
} from "../types";

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object") {
    // Axios error: real message is in response.data.message
    const responseMsg = (error as { response?: { data?: { message?: unknown } } }).response?.data?.message;
    if (typeof responseMsg === "string" && responseMsg.trim()) return responseMsg;
    // Already-rethrown error: message is on the object directly
    const msg = (error as { message?: unknown }).message;
    if (typeof msg === "string" && msg.trim()) return msg;
  }
  return fallback;
};

export const useFeatureSlots = () => {
  const queryClient = useQueryClient();

  // ─── Admin queries ───────────────────────────────────────────────────────────

  const useFeatureSlotsList = (params?: SlotsParams, options?: { enabled?: boolean }) => {
    return useQuery({
      queryKey: ["feature-slots", params],
      queryFn: () => featureSlotService.getFeatureSlots(params),
      enabled: options?.enabled !== false,
    });
  };

  const useAvailableAuctions = (params?: SlotsParams, options?: { enabled?: boolean }) => {
    return useQuery({
      queryKey: ["feature-slots", "available-auctions", params],
      queryFn: () => featureSlotService.getAvailableAuctions(params),
      enabled: options?.enabled !== false,
    });
  };

  const useSlotRounds = (slotId?: number | string, params?: { per_page?: number }) => {
    return useQuery({
      queryKey: ["feature-slots", "rounds", slotId, params],
      queryFn: () => featureSlotService.getSlotRounds(slotId!, params),
      enabled: !!slotId,
    });
  };

  const useFeatureSlotDetail = (slotId?: number | string) => {
    return useQuery({
      queryKey: ["feature-slots", "detail", slotId],
      queryFn: () => featureSlotService.getFeatureSlotDetail(slotId!),
      enabled: !!slotId,
    });
  };

  // ─── Auctioneer queries ──────────────────────────────────────────────────────

  const useOpenSlots = (
    params?: { scope_type?: "global" | "state"; state_code?: string },
    options?: { enabled?: boolean }
  ) => {
    return useQuery({
      queryKey: ["feature-slots", "open", params],
      queryFn: () => featureSlotService.getOpenSlots(params),
      enabled: options?.enabled !== false,
    });
  };

  const useMySlotWins = (options?: { enabled?: boolean }) => {
    return useQuery({
      queryKey: ["feature-slots", "my-wins"],
      queryFn: () => featureSlotService.getMySlotWins(),
      enabled: options?.enabled !== false,
    });
  };

  // ─── Shared queries ──────────────────────────────────────────────────────────

  const useStatesSummary = (country: "US" | "CA", options?: { enabled?: boolean }) => {
    return useQuery<StatesSummaryItem[]>({
      queryKey: ["states-summary", country],
      queryFn: () => featureSlotService.getStatesSummary(country),
      enabled: options?.enabled !== false,
      staleTime: 5 * 60 * 1000,
    });
  };

  // ─── Admin mutations ─────────────────────────────────────────────────────────

  const assignAuctionToSlot = useMutation({
    mutationFn: (payload: FeatureSlotAssignmentCreatePayload) =>
      featureSlotService.createFeatureSlotAssignment(payload),
    onSuccess: async () => {
      toast.success("Slot assignment updated");
      await queryClient.invalidateQueries({ queryKey: ["feature-slots"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to assign auction to slot"));
    },
  });

  const removeSlotAssignment = useMutation({
    mutationFn: (assignmentId: number | string) =>
      featureSlotService.removeFeatureSlotAssignment(assignmentId),
    onSuccess: async () => {
      toast.success("Slot assignment removed");
      await queryClient.invalidateQueries({ queryKey: ["feature-slots"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to remove slot assignment"));
    },
  });

  const updateAdminSlot = useMutation({
    mutationFn: ({ slotId, payload }: { slotId: number | string; payload: AdminSlotUpdatePayload }) =>
      featureSlotService.updateAdminSlot(slotId, payload),
    onSuccess: async () => {
      toast.success("Slot settings updated");
      await queryClient.invalidateQueries({ queryKey: ["feature-slots"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update slot"));
    },
  });

  const createSlotRound = useMutation({
    mutationFn: ({ slotId, payload }: { slotId: number | string; payload: CreateSlotRoundPayload }) =>
      featureSlotService.createSlotRound(slotId, payload),
    onSuccess: async (_data, variables) => {
      toast.success("Round created");
      await queryClient.invalidateQueries({ queryKey: ["feature-slots", "rounds", variables.slotId] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create round"));
    },
  });

  const cancelSlotRound = useMutation({
    mutationFn: (roundId: number | string) => featureSlotService.cancelSlotRound(roundId),
    onSuccess: async () => {
      toast.success("Round cancelled");
      await queryClient.invalidateQueries({ queryKey: ["feature-slots", "rounds"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to cancel round"));
    },
  });

  // ─── Auctioneer mutations ────────────────────────────────────────────────────

  const bidOnSlot = useMutation({
    mutationFn: ({ slotId, payload }: { slotId: number | string; payload: FeatureSlotBidPayload }) =>
      featureSlotService.bidOnSlot(slotId, payload),
    onSuccess: async () => {
      toast.success("Bid placed successfully");
      await queryClient.invalidateQueries({ queryKey: ["feature-slots", "open"] });
      await queryClient.invalidateQueries({ queryKey: ["feature-slots", "my-wins"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to place bid"));
    },
  });

  const initiateSlotPayment = useMutation({
    mutationFn: ({ roundId, payload }: { roundId: number | string; payload?: SlotPaymentPayload }) =>
      featureSlotService.initiateSlotPayment(roundId, payload),
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to initiate payment"));
    },
  });

  const auctioneerAssignSlot = useMutation({
    mutationFn: ({ slotId, payload }: { slotId: number | string; payload: AuctioneerSlotAssignPayload }) =>
      featureSlotService.auctioneerAssignSlot(slotId, payload),
    onSuccess: async () => {
      toast.success("Auction assigned to slot");
      await queryClient.invalidateQueries({ queryKey: ["feature-slots", "my-wins"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to assign auction"));
    },
  });

  return {
    // queries
    useFeatureSlotsList,
    useAvailableAuctions,
    useSlotRounds,
    useFeatureSlotDetail,
    useOpenSlots,
    useMySlotWins,
    useStatesSummary,
    // admin mutations
    assignAuctionToSlot,
    removeSlotAssignment,
    updateAdminSlot,
    createSlotRound,
    cancelSlotRound,
    // auctioneer mutations
    bidOnSlot,
    initiateSlotPayment,
    auctioneerAssignSlot,
  };
};

export type FeatureSlotsApi = {
  useFeatureSlotsList: ReturnType<typeof useFeatureSlots>["useFeatureSlotsList"];
};
