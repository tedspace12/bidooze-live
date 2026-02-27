import { useQuery } from "@tanstack/react-query";
import { auctionService } from "../services/auctionService";

export const useAuctionOverview = (auctionId: string | number) => {
  const overview = useQuery({
    queryKey: ["auction", auctionId, "overview"],
    queryFn: () => auctionService.getAuctionOverview(auctionId),
    enabled: !!auctionId,
  });

  const activity = useQuery({
    queryKey: ["auction", auctionId, "overview", "activity"],
    queryFn: () => auctionService.getAuctionActivity(auctionId),
    enabled: !!auctionId,
  });

  const recentBids = useQuery({
    queryKey: ["auction", auctionId, "overview", "recent-bids"],
    queryFn: () => auctionService.getAuctionRecentBids(auctionId),
    enabled: !!auctionId,
  });

    return { overview, activity, recentBids };
};


