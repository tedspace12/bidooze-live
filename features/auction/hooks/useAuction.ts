import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { auctionService } from "../services/auctionService";
import type { CreateAuctionPayload } from "../types";

export const useAuction = () => {
  const queryClient = useQueryClient();

  const createAuction = useMutation({
    mutationFn: (payload: CreateAuctionPayload) => auctionService.createAuction(payload),
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

  return {
    createAuction,
    useAuctions,
    useAuctionById,
    useMyAuctions,
  };
};


