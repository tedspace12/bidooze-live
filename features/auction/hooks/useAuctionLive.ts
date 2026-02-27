import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { auctionService } from "../services/auctionService";


export const useAuctionLive = (auctionId: string | number) => {
  const qc = useQueryClient();

  const overview = useQuery({
    queryKey: ["auction", auctionId, "live"],
    queryFn: () => auctionService.getAuctionLiveState(auctionId),
    enabled: !!auctionId,
    refetchInterval: 5000, // live polling
  });

  const startSession = useMutation({
    mutationFn: () => auctionService.startLiveSession(auctionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["auction", auctionId, "live"] }),
  });

  const pauseSession = useMutation({
    mutationFn: () => auctionService.pauseLiveSession(auctionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["auction", auctionId, "live"] }),
  });

  const resumeSession = useMutation({
    mutationFn: () => auctionService.resumeLiveSession(auctionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["auction", auctionId, "live"] }),
  });

  const endSession = useMutation({
    mutationFn: () => auctionService.endLiveSession(auctionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["auction", auctionId, "live"] }),
  });

  const startLot = useMutation({
    mutationFn: (lotId: number) => auctionService.startLiveLot(auctionId, lotId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["auction", auctionId, "live"] }),
  });

  const sellLot = useMutation({
    mutationFn: (lotId: number) => auctionService.sellLiveLot(auctionId, lotId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["auction", auctionId, "live"] }),
  });

  const passLot = useMutation({
    mutationFn: (lotId: number) => auctionService.passLiveLot(auctionId, lotId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["auction", auctionId, "live"] }),
  });

  const floorBid = useMutation({
    mutationFn: (payload: { lotId: number; amount: number; auction_registration_id: number }) =>
      auctionService.placeFloorBid(auctionId, payload.lotId, {
        amount: payload.amount,
        auction_registration_id: payload.auction_registration_id,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["auction", auctionId, "live"] }),
  });

  return { overview, startSession, pauseSession, resumeSession, endSession, startLot, sellLot, passLot, floorBid };
};
