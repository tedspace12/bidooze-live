import { withAuth } from "@/services/api";

type ApiErrorLike = {
  response?: {
    data?: unknown;
  };
  message?: string;
};

const extractArrayData = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    const data = (payload as { data?: unknown }).data;
    if (Array.isArray(data)) return data as T[];
  }
  return [];
};

const rethrowApiError = (error: unknown): never => {
  const err = error as ApiErrorLike;
  throw err?.response?.data || { message: err?.message || "Request failed" };
};

export interface Consignor {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  status: "active" | "inactive" | "pending" | "suspended";
  kycStatus?: "verified" | "pending" | "rejected";
  totalLots?: number;
  totalValue?: number;
  registrationDate?: string;
  [key: string]: unknown;
}

export interface Bidder {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  bidderCard?: string;
  reputation?: string;
  status: "active" | "inactive" | "blocked";
  registrationDate?: string;
  totalBids?: number;
  [key: string]: unknown;
}

export const customerService = {
  /**
   * Get all consignors
   */
  async getConsignors(params?: {
    status?: string;
    kycStatus?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<Consignor[]> {
    try {
      const res = await withAuth.get<Consignor[]>("/consignors", { params });
      return extractArrayData<Consignor>(res.data);
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  /**
   * Get consignor by ID
   */
  async getConsignorById(id: string | number): Promise<Consignor> {
    try {
      const res = await withAuth.get<Consignor>(`/consignors/${id}`);
      return res.data as Consignor;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  /**
   * Create consignor
   */
  async createConsignor(data: Partial<Consignor>): Promise<Consignor> {
    try {
      const res = await withAuth.post<Consignor>("/consignors", data);
      return res.data as Consignor;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  /**
   * Update consignor
   */
  async updateConsignor(id: string | number, data: Partial<Consignor>): Promise<Consignor> {
    try {
      const res = await withAuth.put<Consignor>(`/consignors/${id}`, data);
      return res.data as Consignor;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  /**
   * Get all bidders
   */
  async getBidders(params?: {
    status?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<Bidder[]> {
    try {
      const res = await withAuth.get<Bidder[]>("/bidders", { params });
      return extractArrayData<Bidder>(res.data);
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  /**
   * Get bidder by ID
   */
  async getBidderById(id: string | number): Promise<Bidder> {
    try {
      const res = await withAuth.get<Bidder>(`/bidders/${id}`);
      return res.data as Bidder;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },
};


