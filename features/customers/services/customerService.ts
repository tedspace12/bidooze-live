import { withAuth } from "@/services/api";

type ApiErrorLike = {
  response?: {
    data?: unknown;
  };
  message?: string;
};

type MessageEnvelope = {
  message?: string;
  data?: unknown;
  meta?: unknown;
};

const rethrowApiError = (error: unknown): never => {
  const err = error as ApiErrorLike;
  throw err?.response?.data || { message: err?.message || "Request failed" };
};

const extractArrayData = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    const nested = (payload as MessageEnvelope).data;
    if (Array.isArray(nested)) return nested as T[];
  }
  return [];
};

const extractObjectData = <T>(payload: unknown): T | null => {
  if (!payload || typeof payload !== "object") return null;

  const nested = (payload as MessageEnvelope).data;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    return nested as T;
  }

  if (!Array.isArray(payload)) {
    return payload as T;
  }

  return null;
};

const extractMessage = (payload: unknown, fallback = "Request processed successfully."): string => {
  if (!payload || typeof payload !== "object") return fallback;
  const message = (payload as MessageEnvelope).message;
  return typeof message === "string" && message.trim() ? message : fallback;
};

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const toConsignorMeta = (payload: unknown, fallbackLength = 0): ConsignorPaginationMeta => {
  if (!payload || typeof payload !== "object") {
    return {
      page: 1,
      per_page: fallbackLength,
      total: fallbackLength,
    };
  }

  return {
    page: toNumber((payload as { page?: unknown }).page, 1),
    per_page: toNumber((payload as { per_page?: unknown }).per_page, fallbackLength),
    total: toNumber((payload as { total?: unknown }).total, fallbackLength),
  };
};

const toBidderMeta = (payload: unknown, fallbackLength = 0): BidderPaginationMeta => {
  if (!payload || typeof payload !== "object") {
    return {
      current_page: 1,
      last_page: 1,
      per_page: fallbackLength,
      total: fallbackLength,
    };
  }

  return {
    current_page: toNumber((payload as { current_page?: unknown }).current_page, 1),
    last_page: toNumber((payload as { last_page?: unknown }).last_page, 1),
    per_page: toNumber((payload as { per_page?: unknown }).per_page, fallbackLength),
    total: toNumber((payload as { total?: unknown }).total, fallbackLength),
  };
};

export type ConsignorStatus = "active" | "inactive" | "suspended";

export interface ConsignorPaginationMeta {
  page: number;
  per_page: number;
  total: number;
}

export interface ConsignorListItem {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  status: ConsignorStatus;
  commission_rate: number;
  total_lots: number;
  total_value: number;
  current_balance: number;
  outstanding_payments: number;
  registration_date: string;
  notes_count: number;
}

export interface ConsignorDropdownItem {
  id: string | number;
  name: string;
}

export interface ConsignorBankAccountMasked {
  account_holder: string;
  account_number_last4: string;
  bank_name: string;
}

export interface ConsignorRecord {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  address?: string | null;
  commission_rate: number;
  status: ConsignorStatus;
  avatar_url?: string | null;
  registration_date: string;
  total_lots: number;
  total_value: number;
  current_balance: number;
  outstanding_payments: number;
  bank_account?: ConsignorBankAccountMasked | null;
  notes_count: number;
}

export interface ConsignorCreatePayload {
  name: string;
  email: string;
  phone: string;
  address?: string | null;
  commission_rate: number;
  avatar_url?: string | null;
  account_holder?: string | null;
  account_number?: string | null;
  routing_number?: string | null;
  bank_name?: string | null;
}

export interface ConsignorUpdatePayload {
  name?: string;
  email?: string;
  phone?: string;
  address?: string | null;
  commission_rate?: number;
  avatar_url?: string | null;
}

export interface ConsignorBankAccountPayload {
  account_holder: string;
  account_number: string;
  routing_number: string;
  bank_name: string;
}

export interface ConsignorStatusPayload {
  status: ConsignorStatus;
  reason?: string | null;
}

export interface ConsignorNote {
  id: string | number;
  content: string;
  created_by: string | number;
  created_at: string;
}

export interface ConsignorActivityLog {
  id: string | number;
  event: string;
  old_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
  performed_by?: string | number | null;
  created_at: string;
}

export interface ConsignorListResponse<T = ConsignorListItem> {
  message: string;
  data: T[];
  meta: ConsignorPaginationMeta;
}

export interface ConsignorMutationResponse {
  message: string;
  data: ConsignorRecord;
}

export interface ConsignorBankAccountResponse {
  message: string;
  data: ConsignorBankAccountMasked;
}

export interface ConsignorNoteResponse {
  message: string;
  data: ConsignorNote;
}

export interface ConsignorNotesListResponse {
  message: string;
  data: ConsignorNote[];
  meta: ConsignorPaginationMeta;
}

export interface ConsignorActivityResponse {
  message: string;
  data: ConsignorActivityLog[];
  meta: ConsignorPaginationMeta;
}

export interface GetConsignorsParams {
  status?: ConsignorStatus;
  search?: string;
  joined_from?: string;
  joined_to?: string;
  per_page?: number;
  page?: number;
}

export interface BidderReputation {
  score?: number | string;
  level?: string | null;
  status?: string | null;
}

export interface BidderListItem {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  country?: string;
  reputation?: BidderReputation | null;
  totalBids?: number;
  winRate?: number;
  status?: string;
  avatar?: string | null;
  [key: string]: unknown;
}

export interface BidderDetail {
  id: string | number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country?: string;
  address?: string;
  avatar?: string | null;
  reputation?: BidderReputation | null;
  totalBids?: number;
  wonAuctions?: number;
  winRate?: number;
  isBlocked?: boolean;
  joinedAt?: string;
  lastActive?: string;
  reputationHistory?: Array<{
    id: string | number;
    date: string;
    previousStatus?: string | null;
    newStatus?: string | null;
    reason?: string | null;
  }>;
  biddingHistory?: Array<{
    id: string | number;
    auctionTitle: string;
    bidAmount: number | string;
    date: string;
    status: string;
  }>;
  [key: string]: unknown;
}

export interface BidderPaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface BidderListResponse {
  data: BidderListItem[];
  meta: BidderPaginationMeta;
}

export interface BidderBlockResponse {
  message: string;
  data: {
    bidder_id: number | string;
    is_blocked: boolean;
    reason?: string | null;
    blocked_at?: string;
  };
}

export const customerService = {
  async getConsignors(params?: GetConsignorsParams): Promise<ConsignorListResponse<ConsignorListItem>> {
    try {
      const res = await withAuth.get<MessageEnvelope | ConsignorListItem[]>(
        "/auctioneer/consignors",
        { params }
      );

      const data = extractArrayData<ConsignorListItem>(res.data);
      const meta =
        res.data && typeof res.data === "object"
          ? toConsignorMeta((res.data as MessageEnvelope).meta, data.length)
          : toConsignorMeta(undefined, data.length);

      return {
        message: extractMessage(res.data),
        data,
        meta,
      };
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async getConsignorDropdown(params?: Omit<GetConsignorsParams, "status"> & { status?: ConsignorStatus }): Promise<ConsignorListResponse<ConsignorDropdownItem>> {
    try {
      const res = await withAuth.get<MessageEnvelope | ConsignorDropdownItem[]>(
        "/auctioneer/consignors",
        { params: { ...params, mode: "dropdown" } }
      );

      const data = extractArrayData<ConsignorDropdownItem>(res.data);
      const meta =
        res.data && typeof res.data === "object"
          ? toConsignorMeta((res.data as MessageEnvelope).meta, data.length)
          : toConsignorMeta(undefined, data.length);

      return {
        message: extractMessage(res.data),
        data,
        meta,
      };
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async createConsignor(payload: ConsignorCreatePayload): Promise<ConsignorMutationResponse> {
    try {
      const res = await withAuth.post<MessageEnvelope | ConsignorRecord>(
        "/auctioneer/consignors",
        payload
      );

      const data = extractObjectData<ConsignorRecord>(res.data);
      if (!data) {
        throw { message: "Invalid consignor response payload." };
      }

      return {
        message: extractMessage(res.data, "Consignor created successfully."),
        data,
      };
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async updateConsignor(
    consignorId: string | number,
    payload: ConsignorUpdatePayload
  ): Promise<ConsignorMutationResponse> {
    try {
      const res = await withAuth.patch<MessageEnvelope | ConsignorRecord>(
        `/auctioneer/consignors/${consignorId}`,
        payload
      );

      const data = extractObjectData<ConsignorRecord>(res.data);
      if (!data) {
        throw { message: "Invalid consignor response payload." };
      }

      return {
        message: extractMessage(res.data, "Consignor updated successfully."),
        data,
      };
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async updateConsignorBankAccount(
    consignorId: string | number,
    payload: ConsignorBankAccountPayload
  ): Promise<ConsignorBankAccountResponse> {
    try {
      const res = await withAuth.put<MessageEnvelope | ConsignorBankAccountMasked>(
        `/auctioneer/consignors/${consignorId}/bank-account`,
        payload
      );

      const data = extractObjectData<ConsignorBankAccountMasked>(res.data);
      if (!data) {
        throw { message: "Invalid bank account response payload." };
      }

      return {
        message: extractMessage(res.data, "Bank account updated successfully."),
        data,
      };
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async updateConsignorStatus(
    consignorId: string | number,
    payload: ConsignorStatusPayload
  ): Promise<ConsignorMutationResponse> {
    try {
      const res = await withAuth.patch<MessageEnvelope | ConsignorRecord>(
        `/auctioneer/consignors/${consignorId}/status`,
        payload
      );

      const data = extractObjectData<ConsignorRecord>(res.data);
      if (!data) {
        throw { message: "Invalid consignor status response payload." };
      }

      return {
        message: extractMessage(res.data, "Consignor status updated successfully."),
        data,
      };
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async addConsignorNote(
    consignorId: string | number,
    payload: { content: string }
  ): Promise<ConsignorNoteResponse> {
    try {
      const res = await withAuth.post<MessageEnvelope | ConsignorNote>(
        `/auctioneer/consignors/${consignorId}/notes`,
        payload
      );

      const data = extractObjectData<ConsignorNote>(res.data);
      if (!data) {
        throw { message: "Invalid consignor note response payload." };
      }

      return {
        message: extractMessage(res.data, "Note added successfully."),
        data,
      };
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async getConsignorNotes(
    consignorId: string | number,
    params?: { per_page?: number; page?: number }
  ): Promise<ConsignorNotesListResponse> {
    try {
      const res = await withAuth.get<MessageEnvelope | ConsignorNote[]>(
        `/auctioneer/consignors/${consignorId}/notes`,
        { params }
      );

      const data = extractArrayData<ConsignorNote>(res.data);
      const meta =
        res.data && typeof res.data === "object"
          ? toConsignorMeta((res.data as MessageEnvelope).meta, data.length)
          : toConsignorMeta(undefined, data.length);

      return {
        message: extractMessage(res.data),
        data,
        meta,
      };
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async getConsignorActivity(
    consignorId: string | number,
    params?: { per_page?: number; page?: number }
  ): Promise<ConsignorActivityResponse> {
    try {
      const res = await withAuth.get<MessageEnvelope | ConsignorActivityLog[]>(
        `/auctioneer/consignors/${consignorId}/activity`,
        { params }
      );

      const data = extractArrayData<ConsignorActivityLog>(res.data);
      const meta =
        res.data && typeof res.data === "object"
          ? toConsignorMeta((res.data as MessageEnvelope).meta, data.length)
          : toConsignorMeta(undefined, data.length);

      return {
        message: extractMessage(res.data),
        data,
        meta,
      };
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async getBidders(params?: {
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<BidderListResponse> {
    try {
      const res = await withAuth.get<MessageEnvelope | BidderListItem[]>("/bidders", { params });

      const list = extractArrayData<BidderListItem>(res.data);
      const meta =
        res.data && typeof res.data === "object"
          ? toBidderMeta((res.data as MessageEnvelope).meta, list.length)
          : toBidderMeta(undefined, list.length);

      return { data: list, meta };
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async getBidderById(id: string | number): Promise<BidderDetail> {
    try {
      const res = await withAuth.get<MessageEnvelope | BidderDetail>(`/bidders/${id}`);
      const payload = res.data;
      if (payload && typeof payload === "object" && "data" in payload) {
        const nested = (payload as MessageEnvelope).data;
        if (nested && typeof nested === "object") {
          return nested as BidderDetail;
        }
      }
      return payload as BidderDetail;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async blockBidder(bidderId: string | number, reason?: string): Promise<BidderBlockResponse> {
    try {
      const payload = reason ? { reason } : {};
      const res = await withAuth.post<BidderBlockResponse>(`/bidders/${bidderId}/block`, payload);
      return res.data;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async unblockBidder(bidderId: string | number): Promise<BidderBlockResponse> {
    try {
      const res = await withAuth.delete<BidderBlockResponse>(`/bidders/${bidderId}/block`);
      return res.data;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },
};
