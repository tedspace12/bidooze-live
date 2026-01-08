export type AuctionStatus = "scheduled" | "live" | "closed";

export interface AuctionLot {
  id: number | string;
  lot_number: string;
  title: string;
  description: string;
  quantity: number;
  starting_bid: number;
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
  auction_start_at: string;
  auction_end_at: string;
  preview_start_at?: string;
  preview_end_at?: string;
  checkout_start_at?: string;
  checkout_end_at?: string;
  timezone: string;
  status: AuctionStatus;
  currency: string;
  lots: AuctionLot[];
}

export interface CreateAuctionLotInput {
  lot_number: string;
  title: string;
  description: string;
  quantity: number;
  starting_bid: number;
  reserve_price?: number | null;
  estimate_low?: number | null;
  estimate_high?: number | null;
  lot_stagger_seconds?: number | null;
  seller_id?: number | null;
}

export interface CreateAuctionPayload {
  code: string;
  name: string;
  description?: string;
  auction_start_at: string;
  auction_end_at: string;
  preview_start_at?: string;
  preview_end_at?: string;
  checkout_start_at?: string;
  checkout_end_at?: string;
  timezone: string;

  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;

  currency: string;
  commission_percentage?: number;
  buyer_premium_percentage?: number;
  buyer_tax_percentage?: number;
  seller_tax_percentage?: number;
  buyer_lot_charge_1?: number;
  buyer_lot_charge_2?: number;
  minimum_bid_amount?: number;
  tax_exempt_all?: boolean;

  shipping_availability?: string;
  shipping_account?: string;
  add_handling_charges?: boolean;
  handling_charge_type?: string;
  handling_charge_amount?: number;

  bidding_type: string;
  bid_type: string;
  bid_amount_type: string;
  soft_close_seconds?: number;
  lot_stagger_seconds?: number;
  show_immediate_bid_states?: boolean;
  times_the_money_bidding?: boolean;
  show_bid_reserve_states?: boolean;

  require_credit_card_registration?: boolean;
  bidder_authentication?: string;
  authentication_required_hours?: number;
  successful_bidder_registration_option?: string;
  starting_bid_card_number?: string;
  max_amount_per_item?: number;

  terms_and_conditions?: string;
  bp_explanation?: string;
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

  lots: CreateAuctionLotInput[];

  // Files
  feature_image: File;
  lot_images?: Record<string, File[]>;
}


