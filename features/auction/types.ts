export type AuctionStatus =
  | "draft"
  | "scheduled"
  | "live"
  | "paused"
  | "closed"
  | "completed";

export type CurrencyCode = string;
export type ShippingAvailability = "available" | "pickup-only" | "not-available";
export type HandlingChargeType = "flat" | "percentage" | "per-item";
export type BiddingType = "timed" | "live" | "hybrid";
export type AuctionFormat = "internet_only" | "webcast" | "floor_only" | "absentee";
export type BidVisibility = "public" | "sealed";
export type BidMechanism = "standard" | "proxy";
export type BidAmountType = "fixed_flat" | "maximum_up_to";
export type SuccessfulBidderRegistrationOption = "immediate" | "approval" | "deposit";
export type DepositType = "fixed" | "percentage";
export type DepositPolicy =
  | "refund_losers"
  | "apply_to_winner_invoice"
  | "non_refundable"
  | "hold_only"
  | "manual";

export interface BidIncrementInput {
  up_to_amount: number;
  increment: number;
}

export interface AuctionLot {
  id: number | string;
  lot_number: string;
  title: string;
  description?: string;
  quantity: number;
  starting_bid?: number;
  reserve_price?: number | null;
  estimate_low?: number | null;
  estimate_high?: number | null;
  lot_stagger_seconds?: number | null;
  seller_id?: number | null;
}

export interface Auction {
  id: number | string;
  code: string;
  name: string;
  description?: string;
  category?: string;
  categories?: string[];
  auction_start_at: string;
  auction_end_at: string;
  preview_start_at?: string;
  preview_end_at?: string;
  checkout_start_at?: string;
  checkout_end_at?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  timezone: string;
  status: AuctionStatus;
  currency: CurrencyCode;
  lots: AuctionLot[];
  lot_count: number;
  totalBidder: number;
  total_bidder?: number;

  feature_image_url?: string;
  total_bid_amount?: number;
  bid_count?: number;
  commission_percentage?: number;
  buyer_premium_percentage?: number;
  buyer_tax_percentage?: number;
  seller_tax_percentage?: number;
  bp_explanation?: string;
  short_bp_explanation?: string;
  tax_exempt_all?: boolean;
  terms_and_conditions?: string;
  payment_information?: string;
  shipping_pickup_info?: string;
  bidding_notice?: string;
  auction_notice?: string;
  soft_close_seconds?: number;
  lot_stagger_seconds?: number;
  auction_format?: AuctionFormat;
  bid_visibility?: BidVisibility;
  bid_mechanism?: BidMechanism;
  bidding_type: BiddingType;
  bid_amount_type: BidAmountType;
  require_credit_card_registration?: boolean;
  successful_bidder_registration_option?: SuccessfulBidderRegistrationOption;
  deposit_type?: DepositType;
  deposit_value?: number;
  deposit_cap?: number;
  deposit_policy?: DepositPolicy;
  open_bidding_at?: string;
  close_bidding_at?: string;
  force_bid_increment_schedule?: boolean;
  apply_bid_increment_per_item?: boolean;
  bid_increments?: BidIncrementInput[];
  created_at: string;
}

export interface CreateAuctionLotInput {
  lot_number: string;
  title: string;
  description?: string;
  quantity: number;
  starting_bid?: number;
  reserve_price?: number | null;
  estimate_low?: number | null;
  estimate_high?: number | null;
  lot_stagger_seconds?: number | null;
  seller_id?: number | null;
}

export type SellerStatus = "active" | "inactive" | "pending" | "suspended";

export interface AuctionSeller {
  id: string | number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  status?: SellerStatus;
}

export interface CreateSellerPayload {
  name: string;
  email: string;
  phone: string;
  address?: string;
  notes?: string;
  status: SellerStatus;
}

export interface UpdateLotPayload {
  lot_number?: string;
  title?: string;
  description?: string;
  quantity?: number;
  starting_bid?: number;
  reserve_price?: number | null;
  estimate_low?: number | null;
  estimate_high?: number | null;
  commission_percentage?: number | null;
  buyer_premium_percentage?: number | null;
  buyer_tax_percentage?: number | null;
  seller_tax_percentage?: number | null;
  lot_stagger_seconds?: number | null;
  seller_id?: number | null;
}

export interface CreateAuctionPayload {
  code?: string;
  name: string;
  description?: string;
  auction_start_at: string;
  auction_end_at: string;
  preview_start_at?: string;
  preview_end_at?: string;
  checkout_start_at?: string;
  checkout_end_at?: string;
  open_bidding_at?: string;
  close_bidding_at?: string;
  timezone: string;

  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  categories?: string[];

  currency: CurrencyCode;
  commission_percentage?: number;
  buyer_premium_percentage?: number;
  buyer_tax_percentage?: number;
  seller_tax_percentage?: number;
  buyer_lot_charge_1?: number;
  buyer_lot_charge_2?: number;
  minimum_bid_amount?: number;
  tax_exempt_all?: boolean;

  shipping_availability?: ShippingAvailability;
  shipping_account?: string;
  add_handling_charges?: boolean;
  handling_charge_type?: HandlingChargeType;
  handling_charge_amount?: number;

  bidding_type: BiddingType;
  auction_format?: AuctionFormat;
  bid_visibility?: BidVisibility;
  bid_mechanism?: BidMechanism;
  bid_amount_type: BidAmountType;
  soft_close_seconds: number;
  lot_stagger_seconds: number;
  default_lot_duration_seconds?: number;
  show_immediate_bid_states?: boolean;
  times_the_money_bidding?: boolean;
  show_bid_reserve_states?: boolean;
  force_bid_increment_schedule?: boolean;
  apply_bid_increment_per_item?: boolean;
  bid_increments?: BidIncrementInput[];

  require_credit_card_registration?: boolean;
  authentication_required_hours?: number;
  authentication_required_days?: number;
  successful_bidder_registration_option?: SuccessfulBidderRegistrationOption;
  deposit_type?: DepositType;
  deposit_value?: number;
  deposit_cap?: number;
  deposit_policy?: DepositPolicy;
  starting_bid_card_number?: number;
  live_starting_bid_card_number?: number;
  max_amount_per_item?: number;

  terms_and_conditions?: string;
  payment_information?: string;
  shipping_pickup_info?: string;
  bidding_notice?: string;
  auction_notice?: string;
  short_bp_explanation?: string;

  accept_mastercard?: boolean;
  accept_visa?: boolean;
  accept_amex?: boolean;
  accept_discover?: boolean;

  auction_links?: { url: string; description: string }[];

  email_subject?: string;
  email_body?: string;

  lots?: CreateAuctionLotInput[];

  // Files
  feature_images: File[];
  lot_images?: Record<string, File[]>;
}


export interface AuctionSettingsPayload {
  commissionRate?: number;
  buyerPremium?: number;
  allowAbsentee?: boolean;
  autoExtend?: boolean;
  extensionMinutes?: number;
  enableNotifications?: boolean;
  commission_percentage?: number;
  buyer_premium_percentage?: number;
  buyer_tax_percentage?: number;
  seller_tax_percentage?: number;
  buyer_lot_charge_1?: number;
  buyer_lot_charge_2?: number;
  minimum_bid_amount?: number;
  shipping_availability?: ShippingAvailability;
  shipping_account?: string;
  add_handling_charges?: boolean;
  handling_charge_type?: HandlingChargeType;
  handling_charge_amount?: number;
  auction_format?: AuctionFormat;
  soft_close_seconds?: number;
  lot_stagger_seconds?: number;
  show_immediate_bid_states?: boolean;
  times_the_money_bidding?: boolean;
  show_bid_reserve_states?: boolean;
  require_credit_card_registration?: boolean;
  successful_bidder_registration_option?: SuccessfulBidderRegistrationOption;
  starting_bid_card_number?: number;
  max_amount_per_item?: number;
}


export interface AuctionOverviewAuction {
  id: number;
  code: string;
  name: string;
  description: string;
  categories: string[];
  bidding_type: string;
  status: AuctionStatus;
  currency: CurrencyCode;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  timezone: string;

  start_at: string;
  end_at: string;
  actual_start_at: string | null;
  actual_end_at: string | null;
}

export interface AuctionOverviewStats {
  lots_total: number;
  lots_live: number;
  lots_sold: number;
  lots_with_bids: number;

  total_bids: number;
  total_bid_amount: number;
  submitted_bid_amount: number;
  accepted_bids: number;
  pending_approval_bids: number;
  rejected_bids: number;
  avg_bids_per_lot: number;

  bidders_total: number;
  bidders_approved: number;
  total_watchers: number;

  total_revenue: number;
  all_lots_have_images: boolean;
}


export interface AuctionOverviewTimeline {
  has_started: boolean;
  has_ended: boolean;

  is_live: boolean;
  is_paused: boolean;
  session_status?: string | null;

  can_go_live: boolean;
  can_close: boolean;
}

export interface AuctionOverviewResponse {
  auction: AuctionOverviewAuction;
  stats: AuctionOverviewStats;
  timeline: AuctionOverviewTimeline;
}


export interface ActivityLog {
  id: number;
  admin_id: number;
  admin_name: string;
  admin_role: string;
  action: string;
  entity_type: string;
  entity_id: number;
  previous_state: Record<string, unknown> | null;
  new_state: Record<string, unknown> | null;
  admin_note: string | null;
  reason: string | null;
  ip_address: string;
  user_agent: string;
  created_at: string;
  updated_at: string;
  admin: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export interface AuctionActivity {
  id: number;
  type: "bid" | "registration" | "lot_sold";
  lot_title?: string;
  bidder_name?: string;
  amount?: number;
  created_at: string;
}

export interface AuctionRecentBid {
  id: number | string;
  bidder?: string | null;
  title?: string | null;
  currentBid?: number | string | null;
  status?: string | null;
  timestamp?: string | null;
  lot_id?: number | string | null;
  lot_number?: number | string | null;
  amount?: number | string | null;
  bid_status?: string | null;
  lot_status?: string | null;
  is_winning?: boolean | null;
  placed_at?: string | null;
  bidder_name?: string | null;
  lot_title?: string | null;
  created_at?: string | null;
}






