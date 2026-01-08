'use client';
import { useParams } from "next/navigation";
import { mockAuction } from "@/data";
import AuctionHeader from "@/components/auction/AuctionHeader";
import AuctionTabs from "@/components/auction/AuctionTabs";

export default function Index() {
    const { id } = useParams();

  const auction = mockAuction.find((a) => a.id === id);

  if (!auction) return <div className="p-4 text-center">Auction not found.</div>;


  if (!auction) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-display font-semibold text-foreground mb-2">
            Auction Not Found
          </h1>
          <p className="text-muted-foreground font-body">
            The auction you're looking for doesn't exist.
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
