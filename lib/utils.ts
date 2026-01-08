import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Auction } from "@/data";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculates the real-time status of an auction based on its start/end dates and current status.
 * This function is crucial for UX, ensuring the status badge is always accurate.
 * @param auction The auction object.
 * @returns The calculated status: 'Draft', 'Scheduled', 'Live', 'Closed', or 'Completed'.
 */
export function getAuctionStatus(auction: Auction): Auction['status'] {
  const now = new Date();
  const startDate = new Date(auction.startDate);
  const endDate = new Date(auction.endDate);

  // 1. If the status is explicitly 'Draft' or 'Completed', respect it.
  if (auction.status === 'Draft' || auction.status === 'Completed') {
    return auction.status;
  }

  // 2. Check for Live status
  if (now >= startDate && now <= endDate) {
    return 'Live';
  }

  // 3. Check for Scheduled status
  if (now < startDate) {
    return 'Scheduled';
  }

  // 4. Check for Closed status (auction has ended but not yet marked as Completed/Settled)
  if (now > endDate) {
    return 'Closed';
  }

  // Fallback to the stored status if none of the above apply (e.g., for 'Scheduled' if dates are in the future)
  return auction.status;
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
