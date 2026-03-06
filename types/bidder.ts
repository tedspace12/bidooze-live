export type ReputationStatus = 'low_trust' | 'neutral' | 'reliable' | 'trusted' | 'elite';

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
  low_trust: {
    label: 'Low Trust',
    description: '0-40 score. Requires closer review due to weak trust signals.',
  },
  neutral: {
    label: 'Neutral',
    description: '41-60 score. Default level for new bidders (score 50, status provisional).',
  },
  reliable: {
    label: 'Reliable',
    description: '61-75 score. Consistent participation and acceptable bidder behavior.',
  },
  trusted: {
    label: 'Trusted',
    description: '76-90 score. Strong trust profile and stable transaction history.',
  },
  elite: {
    label: 'Elite',
    description: '91-100 score. Top-performing bidder with excellent reliability.',
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
