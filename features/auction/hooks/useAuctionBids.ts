import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { auctionService } from "../services/auctionService";

export const useAuctionBids = (auctionId: string | number) => {
  const qc = useQueryClient();

  const useBidsList = (params?: { status?: string; page?: number; per_page?: number }) =>
    useQuery({
      queryKey: ["auction", auctionId, "bids", params],
      queryFn: () => auctionService.getAuctionBids(auctionId, params),
      enabled: !!auctionId,
    });

  const approveBid = useMutation({
    mutationFn: (bidId: number | string) => auctionService.approveBid(bidId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["auction", auctionId, "bids"] }),
  });

  const rejectBid = useMutation({
    mutationFn: (payload: { bidId: number | string; reason?: string }) =>
      auctionService.rejectBid(payload.bidId, payload.reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["auction", auctionId, "bids"] }),
  });

  return { useBidsList, approveBid, rejectBid };
};
