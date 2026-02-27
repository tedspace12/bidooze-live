import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { auctionService } from "../services/auctionService";
import type { AuctionSettingsPayload } from "../types";

type FinancialSettingsPayload = AuctionSettingsPayload & { tax_exempt_all?: boolean };

export const useAuctionFinancials = (auctionId: string | number) => {
  const qc = useQueryClient();

  return {
    summary: useQuery({
      queryKey: ["auction", auctionId, "financials"],
      queryFn: () => auctionService.getAuctionFinancials(auctionId),
      enabled: !!auctionId,
    }),

    lots: useQuery({
      queryKey: ["auction", auctionId, "financials", "lots"],
      queryFn: () => auctionService.getAuctionFinancialLots(auctionId),
      enabled: !!auctionId,
    }),

    settings: useQuery({
      queryKey: ["auction", auctionId, "financials", "settings"],
      queryFn: () => auctionService.getAuctionFinancialSettings(auctionId),
      enabled: !!auctionId,
    }),

    updateSettings: useMutation({
      mutationFn: (payload: FinancialSettingsPayload) =>
        auctionService.updateAuctionFinancialSettings(auctionId, payload),
      onSuccess: () =>
        qc.invalidateQueries({ queryKey: ["auction", auctionId, "financials", "settings"] }),
    }),
  };
};
