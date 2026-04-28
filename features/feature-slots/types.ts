export type FeatureSlotStatus = "active" | "scheduled" | "expired" | "empty";
export type FeatureSlotPlacement = string;
export type FeatureSlotScope = string;
export type FeatureSlotResolvedSource = "win" | "assignment" | "fallback";
export type SlotTargetKind = "win" | "assignment";
export type FeatureSlotHistoryAssignedBy = "admin" | "auctioneer";
export type SlotRoundStatus = "pending" | "open" | "settled" | "cancelled";
export type SlotPaymentStatus = "unpaid" | "invoiced" | "paid";

// ─── Resolved auction (used by admin FeatureSlotCard) ────────────────────────

export interface FeatureSlotResolvedAuction {
  auction_id: number | string;
  title: string;
  status: string;
  image_url?: string | null;
  start_datetime?: string | null;
  end_datetime?: string | null;
  currency?: string | null;
  stats?: {
    bid_count: number;
    highest_bid: number | null;
  };
}

export interface FeatureSlotResolved {
  source: FeatureSlotResolvedSource;
  auction?: FeatureSlotResolvedAuction | null;
}

// ─── Admin slot active win / assignment ───────────────────────────────────────

export interface AdminActiveWin {
  win_id: number;
  auctioneer_id: number;
  auction_id: number | null;
  win_starts_at: string;
  win_ends_at: string;
  status: string;
}

export interface AdminActiveAssignment {
  assignment_id: number;
  slot_id: number;
  auction_id: number;
  auctioneer_id: number;
  starts_at: string;
  ends_at: string;
  status: string;
}

// ─── Admin FeatureSlot (GET /admin/featured/slots) ───────────────────────────

export interface FeatureSlot {
  slot_id: number | string;
  position: number;
  scope_type?: string | null;
  scope_value?: string | null;
  active_win?: AdminActiveWin | null;
  active_assignment?: AdminActiveAssignment | null;
  resolved?: FeatureSlotResolved | null;
  // legacy fields kept for feature-slot-utils.ts compat
  id?: number | string;
  placement?: FeatureSlotPlacement | null;
  scope?: FeatureSlotScope | null;
  win?: FeatureSlotContent | null;
  assignment?: FeatureSlotContent | null;
  fallback?: FeatureSlotFallback | null;
  history?: FeatureSlotHistoryItem[];
}

// ─── Admin slot detail (PATCH /admin/featured/slots/{slot} response) ─────────

export interface AdminSlotDetail {
  slot_id: number;
  scope_type: string;
  scope_value: string | null;
  position: number;
  minimum_bid: number;
  bid_day_of_week: number;
  bid_day_name: string;
  bid_opens_time: string;
  bid_closes_time: string;
  slot_duration_days: number;
  auto_schedule: boolean;
  is_active: boolean;
}

// ─── Admin slot round ─────────────────────────────────────────────────────────

export interface AdminSlotRound {
  id: number;
  slot_id: number;
  status: SlotRoundStatus;
  bid_opens_at: string;
  bid_closes_at: string;
  slot_starts_at: string;
  slot_ends_at: string;
  bids_count: number;
  current_highest_bid: number | null;
  winner_auctioneer_id: number | null;
  winning_amount: number | null;
  payment_status: SlotPaymentStatus;
  created_at: string;
}

// ─── Open slot (auctioneer GET /feature-slots/open) ───────────────────────────

export interface OpenSlotRound {
  round_id: number;
  status: SlotRoundStatus;
  bid_opens_at: string;
  bid_closes_at: string;
  slot_starts_at: string | null;
  slot_ends_at: string | null;
  current_highest_bid: number | null;
  bids_count: number;
  minimum_next_bid: number;
}

export interface OpenFeatureSlot {
  id: number;
  scope_type: "global" | "state" | string;
  scope_value: string | null;
  placement: string;
  position: number;
  minimum_bid: number;
  round: OpenSlotRound | null;
}

// ─── My wins (auctioneer GET /feature-slots/my-wins) ─────────────────────────

export interface FeatureSlotWinSlot {
  id: number;
  scope_type: string;
  scope_value: string | null;
  placement: string;
  position: number;
}

export interface FeatureSlotWin {
  id: number;
  status: "active" | "expired" | string;
  price: number;
  win_starts_at: string;
  win_ends_at: string;
  auction_assigned: boolean;
  auction: {
    id: number | string;
    name?: string | null;
    title?: string | null;
    feature_image_url?: string | null;
    image_url?: string | null;
    auction_start_at?: string | null;
    auction_end_at?: string | null;
    status?: string;
  } | null;
  slot: FeatureSlotWinSlot;
  payment_status: SlotPaymentStatus;
  round_id: number;
}

export interface MyWinsResponse {
  active: FeatureSlotWin[];
  data: FeatureSlotWin[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface FeatureSlotAssignmentCreatePayload {
  feature_slot_id: number | string;
  auction_id: number | string;
  starts_at: string;
  ends_at?: string | null;
}

export interface AuctioneerSlotAssignPayload {
  auction_id: number | string;
  starts_at?: string;
  ends_at?: string | null;
}

export interface FeatureSlotBidPayload {
  amount: number;
}

export interface SlotPaymentPayload {
  currency?: string;
  return_url?: string;
  provider?: string;
}

export interface SlotPaymentResponse {
  message: string;
  payment_url: string | null;
  payment: {
    id: number;
    round_id: number;
    amount: number;
    currency: string;
    amount_usd: number;
    provider: string;
    provider_reference: string;
    status: string;
    paid_at: string | null;
  };
}

export interface AdminSlotUpdatePayload {
  minimum_bid?: number;
  bid_day_of_week?: number;
  bid_opens_time?: string;
  bid_closes_time?: string;
  slot_duration_days?: number;
  auto_schedule?: boolean;
  is_active?: boolean;
}

export interface CreateSlotRoundPayload {
  bid_opens_at: string;
  bid_closes_at: string;
  slot_duration_days?: number;
}

// ─── Legacy content types (kept for feature-slot-utils.ts compat) ─────────────

export interface FeatureSlotFallback {
  title?: string | null;
  image_url?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
}

export interface FeatureSlotContent {
  id?: number | string;
  starts_at?: string | null;
  ends_at?: string | null;
  auction?: {
    id: number | string;
    name?: string | null;
    title?: string | null;
    feature_image_url?: string | null;
    image_url?: string | null;
    auction_start_at?: string | null;
    auction_end_at?: string | null;
    status: string;
  } | null;
}

export interface FeatureSlotHistoryItem {
  id: number | string;
  assigned_by: FeatureSlotHistoryAssignedBy;
  auction?: {
    id: number | string;
    name?: string | null;
    feature_image_url?: string | null;
    auction_start_at?: string | null;
    auction_end_at?: string | null;
    status: string;
  } | null;
  starts_at?: string | null;
  ends_at?: string | null;
  status?: "completed" | "expired" | string;
  created_at?: string;
}
