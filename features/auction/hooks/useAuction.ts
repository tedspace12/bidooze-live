import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { auctionService } from "../services/auctionService";
import type { CreateAuctionPayload, CreateSellerPayload } from "../types";

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

  return {
    createAuction,
    useAuctions,
    useAuctionById,
    useMyAuctions,
    useAuctioneerSellers,
    createAuctioneerSeller,
  };
};


