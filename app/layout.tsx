import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Bidooze | Online Auction Management Platform",
    template: "%s | Bidooze",
  },
  description:
    "Bidooze helps auctioneers create auctions, manage lots, approve bidders, track bidding activity, and publish catalog-ready online auctions from one platform.",
  applicationName: "Bidooze",
  keywords: [
    "auction",
    "online auction platform",
    "auction management software",
    "auctioneer dashboard",
    "lot management",
    "bidder approval",
    "timed auction software",
  ],
  openGraph: {
    title: "Bidooze | Online Auction Management Platform",
    description:
      "Create auctions, manage lots, approve bidders, and run online auctions with a purpose-built auctioneer workflow.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bidooze | Online Auction Management Platform",
    description:
      "Create auctions, manage lots, approve bidders, and run online auctions with a purpose-built auctioneer workflow.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased ${inter.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
