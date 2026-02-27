import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { auctionService } from "../services/auctionService";

type BidderRegistrationStatus = "approved" | "rejected" | "suspended";

interface UpdateRegistrationPayload {
  status: BidderRegistrationStatus;
  rejection_reason?: string | null;
}

interface UpdateRegistrationInput {
  registrationId: string | number;
  payload: UpdateRegistrationPayload;
}

export const useAuctionBidders = (auctionId: string | number) => {
  const qc = useQueryClient();

  const bidders = useQuery({
    queryKey: ["auction", auctionId, "bidders"],
    queryFn: () => auctionService.getAuctionBidders(auctionId),
    enabled: !!auctionId,
  });

  const updateRegistration = useMutation({
    mutationFn: ({ registrationId, payload }: UpdateRegistrationInput) =>
      auctionService.updateBidderRegistration(auctionId, registrationId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["auction", auctionId, "bidders"] }),
  });

  return { bidders, updateRegistration };
};
