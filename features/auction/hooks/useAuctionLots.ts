import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { auctionService } from "../services/auctionService";
import type { UpdateLotPayload } from "../types";

type CreateLotPayload = Record<string, unknown> & { images?: File[] };
type UpdateLotWithImagesPayload = UpdateLotPayload & { images?: File[] };

interface UpdateLotMutationInput {
  lotId: string | number;
  payload: UpdateLotWithImagesPayload;
}

export const useAuctionLots = (auctionId: string | number) => {
  const qc = useQueryClient();

  const lots = useQuery({
    queryKey: ["auction", auctionId, "lots"],
    queryFn: () => auctionService.getAuctionLots(auctionId),
    enabled: !!auctionId,
  });

  const createLot = useMutation({
    mutationFn: (payload: CreateLotPayload) => auctionService.createLot(auctionId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["auction", auctionId, "lots"] }),
  });

  const updateLot = useMutation({
    mutationFn: ({ lotId, payload }: UpdateLotMutationInput) =>
      auctionService.updateLot(auctionId, lotId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["auction", auctionId, "lots"] }),
  });

  const startLot = useMutation({
    mutationFn: (lotId: number) =>
      auctionService.startLot(auctionId, lotId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["auction", auctionId, "lots"] }),
  });

  const endLot = useMutation({
    mutationFn: (lotId: number) =>
      auctionService.endLot(auctionId, lotId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["auction", auctionId, "lots"] }),
  });

  const deleteLot = useMutation({
    mutationFn: (lotId: number) =>
      auctionService.deleteLot(auctionId, lotId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["auction", auctionId, "lots"] }),
  });

  return { lots, createLot, updateLot, startLot, endLot, deleteLot };
};

export const useAuctionLot = (
  auctionId: string | number,
  lotId?: number
) => {
  return useQuery({
    queryKey: ["auction", auctionId, "lot", lotId],
    queryFn: () => auctionService.getAuctionLot(auctionId, lotId!),
    enabled: !!auctionId && !!lotId,
  });
};

