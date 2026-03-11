import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { auctionService } from "../services/auctionService";
import type { CreateAuctionPayload, CreateSellerPayload, UpdateAuctionPayload } from "../types";

export const useAuction = () => {
  const queryClient = useQueryClient();

  type CreateAuctionMutationInput = {
    payload: CreateAuctionPayload;
    idempotencyKey?: string;
  };

  const createAuction = useMutation({
    mutationFn: ({ payload, idempotencyKey }: CreateAuctionMutationInput) =>
      auctionService.createAuction(payload, { idempotencyKey }),
    mutationKey: ["create-auction"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auctions"] });
      queryClient.invalidateQueries({ queryKey: ["my-auctions"] });
    },
  });

  const useAuctions = (
    params?: Parameters<typeof auctionService.getAuctions>[0]
  ) => {
    return useQuery({
      queryKey: ["auctions", params],
      queryFn: () => auctionService.getAuctions(params),
    });
  };

  const useAuctionById = (identifier: string | number) => {
    return useQuery({
      queryKey: ["auction", identifier],
      queryFn: () => auctionService.getAuction(identifier),
      enabled: !!identifier,
    });
  };

  const useAuctionEditById = (identifier: string | number) => {
    return useQuery({
      queryKey: ["auction-edit", identifier],
      queryFn: () => auctionService.getAuctionEdit(identifier),
      enabled: !!identifier,
    });
  };

  const useMyAuctions = (
    params?: Parameters<typeof auctionService.getMyAuctions>[0]
  ) => {
    return useQuery({
      queryKey: ["my-auctions", params],
      queryFn: () => auctionService.getMyAuctions(params),
    });
  };

  const useAuctioneerSellers = () => {
    return useQuery({
      queryKey: ["auctioneer-sellers"],
      queryFn: () => auctionService.getAuctioneerSellers(),
    });
  };

  const createAuctioneerSeller = useMutation({
    mutationFn: (payload: CreateSellerPayload) => auctionService.createAuctioneerSeller(payload),
    mutationKey: ["create-auctioneer-seller"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auctioneer-sellers"] });
    },
  });

  const updateAuction = useMutation({
    mutationFn: ({ auctionId, payload }: { auctionId: string | number; payload: UpdateAuctionPayload }) =>
      auctionService.updateAuction(auctionId, payload),
    mutationKey: ["update-auction"],
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["auction", variables.auctionId] });
      queryClient.invalidateQueries({ queryKey: ["auction-edit", variables.auctionId] });
      queryClient.invalidateQueries({ queryKey: ["auction-overview", variables.auctionId] });
      queryClient.invalidateQueries({ queryKey: ["auctions"] });
      queryClient.invalidateQueries({ queryKey: ["my-auctions"] });
    },
  });

  return {
    createAuction,
    updateAuction,
    useAuctions,
    useAuctionById,
    useAuctionEditById,
    useMyAuctions,
    useAuctioneerSellers,
    createAuctioneerSeller,
  };
};


