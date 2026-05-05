import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { auctionService } from "../services/auctionService";
import type { CreateFloorBidderPayload } from "../types";
import { isBroadcastingConfigured } from "@/lib/broadcasting";
import { useAuctionBroadcasts } from "./useAuctionBroadcasts";


export const useAuctionLive = (auctionId: string | number) => {
  const qc = useQueryClient();
  const liveQueryKey = ["auction", auctionId, "live"] as const;

  const refreshLiveData = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["auction", auctionId, "live"] });
    qc.invalidateQueries({ queryKey: ["auction", auctionId, "bids"] });
  }, [qc, auctionId]);

  useAuctionBroadcasts({
    auctionId,
    role: "auctioneer",
    enabled: !!auctionId,
    onEvent: refreshLiveData,
  });

  const overview = useQuery({
    queryKey: liveQueryKey,
    queryFn: () => auctionService.getAuctionLiveState(auctionId),
    enabled: !!auctionId,
    refetchInterval: isBroadcastingConfigured() ? 30000 : 5000,
  });

  const startSession = useMutation({
    mutationFn: () => auctionService.startLiveSession(auctionId),
    onSuccess: refreshLiveData,
  });

  const pauseSession = useMutation({
    mutationFn: () => auctionService.pauseLiveSession(auctionId),
    onSuccess: refreshLiveData,
  });

  const resumeSession = useMutation({
    mutationFn: () => auctionService.resumeLiveSession(auctionId),
    onSuccess: refreshLiveData,
  });

  const endSession = useMutation({
    mutationFn: () => auctionService.endLiveSession(auctionId),
    onSuccess: refreshLiveData,
  });

  const startLot = useMutation({
    mutationFn: (lotId: number) => auctionService.startLiveLot(auctionId, lotId),
    onSuccess: refreshLiveData,
  });

  const sellLot = useMutation({
    mutationFn: (lotId: number) => auctionService.sellLiveLot(auctionId, lotId),
    onSuccess: refreshLiveData,
  });

  const passLot = useMutation({
    mutationFn: (lotId: number) => auctionService.passLiveLot(auctionId, lotId),
    onSuccess: refreshLiveData,
  });

  const floorBid = useMutation({
    mutationFn: (payload: { lotId: number; amount: number; auction_registration_id: number }) =>
      auctionService.placeFloorBid(auctionId, payload.lotId, {
        amount: payload.amount,
        auction_registration_id: payload.auction_registration_id,
      }),
    onSuccess: refreshLiveData,
  });

  const approveBid = useMutation({
    mutationFn: (bidId: number | string) => auctionService.approveBid(bidId),
    onSuccess: refreshLiveData,
  });

  const rejectBid = useMutation({
    mutationFn: (payload: { bidId: number | string; reason?: string }) =>
      auctionService.rejectBid(payload.bidId, payload.reason),
    onSuccess: refreshLiveData,
  });

  const floorBidders = useQuery({
    queryKey: ["auction", auctionId, "floor-bidders"],
    queryFn: () => auctionService.getFloorBidders(auctionId),
    enabled: !!auctionId,
  });

  const addFloorBidder = useMutation({
    mutationFn: (payload: CreateFloorBidderPayload) =>
      auctionService.createFloorBidder(auctionId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["auction", auctionId, "floor-bidders"] }),
  });

  return { overview, startSession, pauseSession, resumeSession, endSession, startLot, sellLot, passLot, floorBid, approveBid, rejectBid, floorBidders, addFloorBidder };
};
