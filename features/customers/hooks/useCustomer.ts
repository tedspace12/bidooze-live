import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  customerService,
  ConsignorBankAccountPayload,
  ConsignorCreatePayload,
  ConsignorStatusPayload,
  ConsignorUpdatePayload,
} from "../services/customerService";

export const useCustomer = () => {
  const queryClient = useQueryClient();

  // Consignors
  const useConsignors = (params?: Parameters<typeof customerService.getConsignors>[0]) => {
    return useQuery({
      queryKey: ["consignors", params],
      queryFn: () => customerService.getConsignors(params),
    });
  };

  const useConsignorNotes = (
    consignorId: string | number,
    params?: Parameters<typeof customerService.getConsignorNotes>[1]
  ) => {
    return useQuery({
      queryKey: ["consignors", consignorId, "notes", params],
      queryFn: () => customerService.getConsignorNotes(consignorId, params),
      enabled: !!consignorId,
    });
  };

  const useConsignorActivity = (
    consignorId: string | number,
    params?: Parameters<typeof customerService.getConsignorActivity>[1]
  ) => {
    return useQuery({
      queryKey: ["consignors", consignorId, "activity", params],
      queryFn: () => customerService.getConsignorActivity(consignorId, params),
      enabled: !!consignorId,
    });
  };

  const createConsignor = useMutation({
    mutationFn: (data: ConsignorCreatePayload) => customerService.createConsignor(data),
    mutationKey: ["create-consignor"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consignors"] });
    },
  });

  const updateConsignor = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: ConsignorUpdatePayload }) =>
      customerService.updateConsignor(id, data),
    mutationKey: ["update-consignor"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consignors"] });
    },
  });

  const updateConsignorBankAccount = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: ConsignorBankAccountPayload }) =>
      customerService.updateConsignorBankAccount(id, data),
    mutationKey: ["update-consignor-bank-account"],
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["consignors"] });
      queryClient.invalidateQueries({ queryKey: ["consignors", variables.id, "activity"] });
    },
  });

  const updateConsignorStatus = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: ConsignorStatusPayload }) =>
      customerService.updateConsignorStatus(id, data),
    mutationKey: ["update-consignor-status"],
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["consignors"] });
      queryClient.invalidateQueries({ queryKey: ["consignors", variables.id, "activity"] });
    },
  });

  const addConsignorNote = useMutation({
    mutationFn: ({ id, content }: { id: string | number; content: string }) =>
      customerService.addConsignorNote(id, { content }),
    mutationKey: ["add-consignor-note"],
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["consignors"] });
      queryClient.invalidateQueries({ queryKey: ["consignors", variables.id, "notes"] });
      queryClient.invalidateQueries({ queryKey: ["consignors", variables.id, "activity"] });
    },
  });

  // Bidders
  const useBidders = (params?: Parameters<typeof customerService.getBidders>[0]) => {
    return useQuery({
      queryKey: ["customers", "bidders", params],
      queryFn: () => customerService.getBidders(params),
      placeholderData: (previousData) => previousData,
    });
  };

  const useBidderById = (id: string | number) => {
    return useQuery({
      queryKey: ["customers", "bidder", id],
      queryFn: () => customerService.getBidderById(id),
      enabled: !!id,
    });
  };

  const blockBidder = useMutation({
    mutationFn: ({ bidderId, reason }: { bidderId: string | number; reason?: string }) =>
      customerService.blockBidder(bidderId, reason),
  });

  const unblockBidder = useMutation({
    mutationFn: ({ bidderId }: { bidderId: string | number }) =>
      customerService.unblockBidder(bidderId),
  });

  return {
    // Consignors
    useConsignors,
    useConsignorNotes,
    useConsignorActivity,
    createConsignor,
    updateConsignor,
    updateConsignorBankAccount,
    updateConsignorStatus,
    addConsignorNote,
    // Bidders
    useBidders,
    useBidderById,
    blockBidder,
    unblockBidder,
  };
};

