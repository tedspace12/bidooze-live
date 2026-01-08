import { withAuth } from "@/services/api";

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
  [key: string]: any;
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
  [key: string]: any;
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
      const data: any = res.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    } catch (error: any) {
      throw error?.response?.data || { message: error.message };
    }
  },

  /**
   * Get consignor by ID
   */
  async getConsignorById(id: string | number): Promise<Consignor> {
    try {
      const res = await withAuth.get<Consignor>(`/consignors/${id}`);
      return res.data as Consignor;
    } catch (error: any) {
      throw error?.response?.data || { message: error.message };
    }
  },

  /**
   * Create consignor
   */
  async createConsignor(data: Partial<Consignor>): Promise<Consignor> {
    try {
      const res = await withAuth.post<Consignor>("/consignors", data);
      return res.data as Consignor;
    } catch (error: any) {
      throw error?.response?.data || { message: error.message };
    }
  },

  /**
   * Update consignor
   */
  async updateConsignor(id: string | number, data: Partial<Consignor>): Promise<Consignor> {
    try {
      const res = await withAuth.put<Consignor>(`/consignors/${id}`, data);
      return res.data as Consignor;
    } catch (error: any) {
      throw error?.response?.data || { message: error.message };
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
      const data: any = res.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    } catch (error: any) {
      throw error?.response?.data || { message: error.message };
    }
  },

  /**
   * Get bidder by ID
   */
  async getBidderById(id: string | number): Promise<Bidder> {
    try {
      const res = await withAuth.get<Bidder>(`/bidders/${id}`);
      return res.data as Bidder;
    } catch (error: any) {
      throw error?.response?.data || { message: error.message };
    }
  },
};

