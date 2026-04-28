import { withAuth } from "@/services/api";
import type {
  FeatureSlot,
  FeatureSlotAssignmentCreatePayload,
  AuctioneerSlotAssignPayload,
  FeatureSlotBidPayload,
  SlotPaymentPayload,
  SlotPaymentResponse,
  AdminSlotUpdatePayload,
  AdminSlotDetail,
  AdminSlotRound,
  CreateSlotRoundPayload,
  OpenFeatureSlot,
  MyWinsResponse,
} from "../types";

type ApiResponse<T> = { data: T };
type PaginatedResponse<T> = { data: { data: T[]; current_page: number; last_page: number; per_page: number; total: number } };

// ─── Admin available auctions (GET /admin/featured/available-auctions) ────────

export interface AvailableAuction {
  auction_id: number | string;
  title: string;
  status: string;
  state?: string | null;
  lots_count?: number;
  active_lots_count?: number;
  top_lot?: {
    lot_id: number;
    title: string;
    highest_bid: number | null;
    ends_at: string;
  } | null;
}

export interface SlotsParams {
  scope_type?: "global" | "state" | string;
  state_code?: string;
}

export interface StatesSummaryItem {
  code: string;
  name: string;
  auction_count: number;
}

export const featureSlotService = {
  // ─── Admin ──────────────────────────────────────────────────────────────────

  async getFeatureSlots(params?: SlotsParams): Promise<FeatureSlot[]> {
    const res = await withAuth.get<ApiResponse<FeatureSlot[]>>("/admin/featured/slots", { params });
    return res.data.data ?? [];
  },

  async getAvailableAuctions(params?: SlotsParams): Promise<AvailableAuction[]> {
    const res = await withAuth.get<ApiResponse<AvailableAuction[]>>("/admin/featured/available-auctions", { params });
    return res.data.data ?? [];
  },

  async createFeatureSlotAssignment(payload: FeatureSlotAssignmentCreatePayload): Promise<unknown> {
    const res = await withAuth.post("/admin/featured/assign", {
      slot_id: payload.feature_slot_id,
      auction_id: payload.auction_id,
      starts_at: payload.starts_at,
      ends_at: payload.ends_at,
    });
    return res.data;
  },

  async removeFeatureSlotAssignment(assignmentId: number | string): Promise<void> {
    await withAuth.delete(`/admin/featured/assign/${assignmentId}`);
  },

  async getFeatureSlotDetail(slotId: number | string): Promise<FeatureSlot> {
    const res = await withAuth.get<ApiResponse<FeatureSlot>>(`/admin/featured/slots/${slotId}`);
    return res.data.data;
  },

  async updateAdminSlot(slotId: number | string, payload: AdminSlotUpdatePayload): Promise<AdminSlotDetail> {
    const res = await withAuth.patch<{ message: string; data: AdminSlotDetail }>(
      `/admin/featured/slots/${slotId}`,
      payload
    );
    return res.data.data;
  },

  async getSlotRounds(
    slotId: number | string,
    params?: { per_page?: number }
  ): Promise<{ data: AdminSlotRound[]; current_page: number; last_page: number; per_page: number; total: number }> {
    const res = await withAuth.get<{ message: string; data: PaginatedResponse<AdminSlotRound>["data"] }>(
      `/admin/featured/slots/${slotId}/rounds`,
      { params }
    );
    return res.data.data;
  },

  async createSlotRound(slotId: number | string, payload: CreateSlotRoundPayload): Promise<AdminSlotRound> {
    const res = await withAuth.post<{ message: string; data: AdminSlotRound }>(
      `/admin/featured/slots/${slotId}/rounds`,
      payload
    );
    return res.data.data;
  },

  async cancelSlotRound(roundId: number | string): Promise<AdminSlotRound> {
    const res = await withAuth.post<{ message: string; data: AdminSlotRound }>(
      `/admin/featured/rounds/${roundId}/cancel`
    );
    return res.data.data;
  },

  // ─── Auctioneer ──────────────────────────────────────────────────────────────

  async getOpenSlots(params?: { scope_type?: "global" | "state"; state_code?: string }): Promise<OpenFeatureSlot[]> {
    const res = await withAuth.get<ApiResponse<OpenFeatureSlot[]>>("/feature-slots/open", { params });
    return res.data.data ?? [];
  },

  async bidOnSlot(slotId: number | string, payload: FeatureSlotBidPayload): Promise<unknown> {
    const res = await withAuth.post(`/feature-slots/${slotId}/bids`, payload);
    return res.data;
  },

  async getMySlotWins(): Promise<MyWinsResponse> {
    const res = await withAuth.get<MyWinsResponse>("/feature-slots/my-wins");
    return res.data;
  },

  async initiateSlotPayment(roundId: number | string, payload?: SlotPaymentPayload): Promise<SlotPaymentResponse> {
    const res = await withAuth.post<SlotPaymentResponse>(`/feature-slots/rounds/${roundId}/pay`, payload ?? {});
    return res.data;
  },

  async auctioneerAssignSlot(slotId: number | string, payload: AuctioneerSlotAssignPayload): Promise<unknown> {
    const res = await withAuth.post(`/feature-slots/${slotId}/assignments`, payload);
    return res.data;
  },

  // ─── Shared ──────────────────────────────────────────────────────────────────

  async getStatesSummary(country: "US" | "CA"): Promise<StatesSummaryItem[]> {
    const res = await withAuth.get<{ states: StatesSummaryItem[] }>("/auctions/states-summary", { params: { country } });
    return res.data.states ?? [];
  },
};
