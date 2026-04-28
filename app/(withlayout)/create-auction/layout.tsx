import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Online Auction",
  description:
    "Create a timed or live online auction in Bidooze. Configure auction dates, bidder registration, lot settings, images, shipping rules, and publishing from one workflow.",
  keywords: [
    "auction",
    "create online auction",
    "auction setup",
    "auction creation wizard",
    "auction lots",
    "bidder registration settings",
    "auctioneer workflow",
  ],
  openGraph: {
    title: "Create Online Auction | Bidooze",
    description:
      "Set up a new auction from scratch or copy an existing auction with reusable bidding, lot, and registration settings.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Create Online Auction | Bidooze",
    description:
      "Set up a new auction from scratch or copy an existing auction with reusable bidding, lot, and registration settings.",
  },
};

export default function CreateAuctionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
