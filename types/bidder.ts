export type ReputationStatus = 'excellent' | 'good' | 'neutral' | 'warning' | 'poor' | 'banned';

export interface BidderType {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  countryCode: string;
  avatar?: string;
  reputation: ReputationStatus;
  totalBids: number;
  wonAuctions: number;
  winRate: number;
  isBlocked: boolean;
  joinedAt: string;
  lastActive: string;
  reputationHistory: ReputationHistoryItem[];
  biddingHistory: BiddingHistoryItem[];
}

export interface ReputationHistoryItem {
  id: string;
  date: string;
  previousStatus: ReputationStatus;
  newStatus: ReputationStatus;
  reason: string;
}

export interface BiddingHistoryItem {
  id: string;
  auctionTitle: string;
  bidAmount: number;
  date: string;
  status: 'won' | 'lost' | 'active';
}

export const REPUTATION_CONFIG: Record<ReputationStatus, { label: string; description: string }> = {
  excellent: {
    label: 'Excellent',
    description: 'Outstanding bidder with perfect payment history and high activity',
  },
  good: {
    label: 'Good',
    description: 'Reliable bidder with consistent positive track record',
  },
  neutral: {
    label: 'Neutral',
    description: 'New or average bidder with limited history',
  },
  warning: {
    label: 'Warning',
    description: 'Bidder with some concerning behaviors or payment delays',
  },
  poor: {
    label: 'Poor',
    description: 'Bidder with multiple issues or unpaid bids',
  },
  banned: {
    label: 'Banned',
    description: 'Platform-wide ban due to serious violations',
  },
};

export const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AE', name: 'United Arab Emirates' },
];
