import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { AuctionOverviewResponse } from "@/features/auction/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculates the real-time status of an auction based on its start/end dates and current status.
 * This function is crucial for UX, ensuring the status badge is always accurate.
 * @param auction The auction object.
 * @returns The calculated status: 'Draft', 'Scheduled', 'Live', 'Closed', or 'Completed'.
 */
export function getAuctionStatus(auction: AuctionOverviewResponse): AuctionOverviewResponse['auction']['status'] {
  const now = new Date();
  const startDate = new Date(auction.auction.start_at);
  const endDate = new Date(auction.auction.end_at);

  // 1. If the status is explicitly 'Draft' or 'Completed', respect it.
  if (auction.auction.status === 'draft' || auction.auction.status === 'completed') {
    return auction.auction.status;
  }

  // 2. Check for Live status
  if (now >= startDate && now <= endDate) {
    return 'live';
  }

  // 3. Check for Scheduled status
  if (now < startDate) {
    return 'scheduled';
  }

  // 4. Check for Closed status (auction has ended but not yet marked as Completed/Settled)
  if (now > endDate) {
    return 'closed';
  }

  // Fallback to the stored status if none of the above apply (e.g., for 'Scheduled' if dates are in the future)
  return auction.auction.status;
}

/**
 * Formats a number as a currency string.
 * @param amount The number to format.
 * @param currency The currency code (e.g., 'NGN', 'USD').
 * @returns The formatted currency string.
 */
export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
