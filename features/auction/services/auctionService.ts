import { withAuth, withoutAuth } from "@/services/api";
import type { Auction, CreateAuctionPayload } from "../types";

export const auctionService = {
  async getAuctions(params?: {
    status?: "scheduled" | "live" | "closed";
    currency?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<Auction[]> {
    try {
      const res = await withoutAuth.get<Auction[]>("/auctions", { params });
      const data: any = res.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    } catch (error: any) {
      throw error?.response?.data || { message: error.message };
    }
  },

  async getAuction(identifier: string | number): Promise<Auction> {
    try {
      const res = await withoutAuth.get<Auction>(`/auctions/${identifier}`);
      return res.data as Auction;
    } catch (error: any) {
      throw error?.response?.data || { message: error.message };
    }
  },

  async createAuction(data: CreateAuctionPayload): Promise<Auction> {
    try {
      const formData = new FormData();

      // Primitive / scalar and non-file fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === "feature_image" || key === "lot_images" || key === "lots") {
          return;
        }

        if (value === undefined || value === null) return;

        if (Array.isArray(value) || typeof value === "object") {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      });

      // Lots as JSON
      if (data.lots && data.lots.length > 0) {
        formData.append("lots", JSON.stringify(data.lots));
      }

      // Feature image (required)
      if (data.feature_image) {
        formData.append("feature_image", data.feature_image);
      }

      // Lot images
      if (data.lot_images) {
        Object.entries(data.lot_images).forEach(([index, files]) => {
          files.forEach((file, imgIndex) => {
            formData.append(`lot_images[${index}][]`, file, file.name || `lot-${index}-${imgIndex}`);
          });
        });
      }

      const res = await withAuth.post<Auction>("/auctions", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data as Auction;
    } catch (error: any) {
      throw error?.response?.data || { message: error.message };
    }
  },

  async getMyAuctions(params?: {
    status?: string;
    page?: number;
  }): Promise<Auction[]> {
    try {
      const res = await withAuth.get<Auction[]>("/auctions/auctioneer/my-auctions", { params });
      const data: any = res.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    } catch (error: any) {
      throw error?.response?.data || { message: error.message };
    }
  },
};


