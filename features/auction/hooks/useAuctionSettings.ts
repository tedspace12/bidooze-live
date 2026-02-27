import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { auctionService } from "../services/auctionService";
import type { AuctionSettingsPayload } from "../types";


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

  return { settings, updateSettings };
};
