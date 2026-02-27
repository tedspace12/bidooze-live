import { useMutation, useQueryClient } from "@tanstack/react-query";
import { auctionService } from "../services/auctionService";


export const useAuctionActions = (auctionId: string | number) => {
  const qc = useQueryClient();

  const publishAuction = useMutation({
    mutationFn: () => auctionService.publishAuction(auctionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auction", auctionId] });
      qc.invalidateQueries({ queryKey: ["auction-overview", auctionId] });
    },
  });

  const pauseAuction = useMutation({
    mutationFn: () => auctionService.pauseAuction(auctionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auction", auctionId] });
      qc.invalidateQueries({ queryKey: ["auction-overview", auctionId] });
    },
  });

  const resumeAuction = useMutation({
    mutationFn: () => auctionService.resumeAuction(auctionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auction", auctionId] });
      qc.invalidateQueries({ queryKey: ["auction-overview", auctionId] });
    },
  });

  const closeAuction = useMutation({
    mutationFn: () => auctionService.closeAuction(auctionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auction", auctionId] });
      qc.invalidateQueries({ queryKey: ["auction-overview", auctionId] });
    },
  });

  const completeAuction = useMutation({
    mutationFn: () => auctionService.completeAuction(auctionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auction", auctionId] });
      qc.invalidateQueries({ queryKey: ["auction-overview", auctionId] });
    },
  });

  return { publishAuction, pauseAuction, resumeAuction, closeAuction, completeAuction };
};
