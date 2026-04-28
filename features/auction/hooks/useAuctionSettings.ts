import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { auctionService } from "../services/auctionService";
import type { AuctionSettingsPayload, BidIncrementInput } from "../types";


export const useAuctionSettings = (auctionId: string | number) => {
  const qc = useQueryClient();

  const settings = useQuery({
    queryKey: ["auction", auctionId, "settings"],
    queryFn: () => auctionService.getAuctionSettings(auctionId),
    enabled: !!auctionId,
  });

  const updateSettings = useMutation({
    mutationFn: (payload: AuctionSettingsPayload) =>
      auctionService.updateAuctionSettings(auctionId, payload),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["auction", auctionId, "settings"] }),
  });

  const bidIncrements = useQuery({
    queryKey: ["auction", auctionId, "bid-increments"],
    queryFn: () => auctionService.getBidIncrements(auctionId),
    enabled: !!auctionId,
  });

  const saveBidIncrements = useMutation({
    mutationFn: (rows: BidIncrementInput[]) =>
      auctionService.updateBidIncrements(auctionId, rows),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["auction", auctionId, "bid-increments"] }),
  });

  return { settings, updateSettings, bidIncrements, saveBidIncrements };
};
