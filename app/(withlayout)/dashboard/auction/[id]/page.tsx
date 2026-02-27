'use client';
import { useParams } from "next/navigation";
import AuctionHeader from "@/components/auction/AuctionHeader";
import AuctionTabs from "@/components/auction/AuctionTabs";
import { useAuction } from "@/features/auction/hooks/useAuction";

export default function Index() {
  const { id } = useParams<{ id: string }>();
  const { useAuctionById } = useAuction();

  const auctionId = Number(id);

  const { data: auction, isLoading, error } = useAuctionById(auctionId);


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground font-body">Loading auction...</p>
        </div>
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-display font-semibold text-foreground mb-2">
            Auction Not Found
          </h1>
          <p className="text-muted-foreground font-body">
            The auction you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <AuctionHeader auction={auction} />
        <AuctionTabs auction={auction} />
      </div>
    </main>
  );
}
