import { withAuth, withoutAuth } from "@/services/api";
import type {
  Auction,
  AuctionOverviewResponse,
  CreateAuctionPayload,
  UpdateLotPayload,
  AuctionSettingsPayload,
  AuctionSeller,
  CreateSellerPayload,
  AuctionActivity,
  AuctionRecentBid,
} from "../types";

type ApiErrorLike = {
  response?: {
    data?: unknown;
  };
  message?: string;
};

type LotMutationPayload = Record<string, unknown> & { images?: File[] };
type UpdateLotWithImagesPayload = UpdateLotPayload & { images?: File[] };

const extractArrayData = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    const data = (payload as { data?: unknown }).data;
    if (Array.isArray(data)) return data as T[];
  }
  return [];
};

const extractPayloadData = <T>(payload: unknown): T => {
  if (payload && typeof payload === "object" && "data" in payload) {
    const data = (payload as { data?: unknown }).data;
    if (data !== undefined) return data as T;
  }
  return payload as T;
};

const rethrowApiError = (error: unknown): never => {
  const err = error as ApiErrorLike;
  throw err?.response?.data || { message: err?.message || "Request failed" };
};

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
      return extractArrayData<Auction>(res.data);
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async getAuction(identifier: string | number) {
    try {
      const res = await withAuth.get(`auctions/${identifier}/overview`);
      return res.data as AuctionOverviewResponse;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async createAuction(
    data: CreateAuctionPayload,
    options?: { idempotencyKey?: string }
  ): Promise<Auction> {
    try {
      const formData = new FormData();
      const jsonFieldNames = new Set(["categories", "auction_links", "bid_increments"]);

      // Primitive / scalar and non-file fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === "feature_images" || key === "lot_images" || key === "lots") {
          return;
        }

        if (value === undefined || value === null || value === "") return;

        if (jsonFieldNames.has(key)) {
          if (Array.isArray(value) && value.length === 0) return;
          formData.append(key, JSON.stringify(value));
          return;
        }

        formData.append(key, String(value));
      });

      // Lots as JSON
      if (data.lots && data.lots.length > 0) {
        formData.append("lots", JSON.stringify(data.lots));
      }

      // Feature images (required)
      (data.feature_images || []).forEach((file, index) => {
        formData.append("feature_images[]", file, file.name || `feature-${index}`);
      });

      // Lot images
      if (data.lot_images) {
        Object.entries(data.lot_images).forEach(([key, files]) => {
          const parsedIndex = Number.parseInt(key, 10);
          let index: number | null = Number.isInteger(parsedIndex) && parsedIndex >= 0 ? parsedIndex : null;

          if (index === null && data.lots?.length) {
            const lotIndex = data.lots.findIndex((lot) => lot.lot_number === key);
            if (lotIndex >= 0) index = lotIndex;
          }

          if (index === null) return;

          files.forEach((file, imgIndex) => {
            formData.append(`lot_images[${index}][]`, file, file.name || `lot-${index}-${imgIndex}`);
          });
        });
      }

      const headers: Record<string, string> = { "Content-Type": "multipart/form-data" };
      if (options?.idempotencyKey?.trim()) {
        headers["Idempotency-Key"] = options.idempotencyKey.trim();
      }

      const res = await withAuth.post<Auction>("/auctions", formData, {
        headers,
      });

      return res.data as Auction;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async getMyAuctions(params?: {
    status?: string;
    page?: number;
  }): Promise<Auction[]> {
    try {
      const res = await withAuth.get<Auction[]>("/auctions/auctioneer/my-auctions", { params });
      return extractArrayData<Auction>(res.data);
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async getAuctioneerSellers(): Promise<AuctionSeller[]> {
    try {
      const res = await withAuth.get<AuctionSeller[]>("/auctioneer/sellers");
      return extractArrayData<AuctionSeller>(res.data);
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async createAuctioneerSeller(data: CreateSellerPayload): Promise<AuctionSeller> {
    try {
      const res = await withAuth.post<AuctionSeller>("/auctioneer/sellers", data);
      return extractPayloadData<AuctionSeller>(res.data);
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async getAuctionOverview(auctionId: string | number) {
    try {
      const res = await withAuth.get(`auctions/${auctionId}/overview`);
      return res.data;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async getAuctionActivity(auctionId: string | number): Promise<AuctionActivity[]> {
    try {
      const res = await withAuth.get(`auctions/${auctionId}/activity`);
      return extractArrayData<AuctionActivity>(res.data);
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async getAuctionRecentBids(auctionId: string | number): Promise<AuctionRecentBid[]> {
    try {
      const res = await withAuth.get(`auctions/${auctionId}/recent-bids`);
      return extractArrayData<AuctionRecentBid>(res.data);
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async getAuctionLots(auctionId: string | number) {
    try {
      const res = await withAuth.get(`auctions/${auctionId}/lots`);
      return res.data;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async getAuctionLot(
    auctionId: string | number,
    lotId: string | number
  ) {
    try {
      const res = await withAuth.get(
        `auctions/${auctionId}/lots/${lotId}`
      );
      return res.data;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async createLot(auctionId: string | number, data: LotMutationPayload) {
    try {
      const hasImages = Array.isArray(data.images) && data.images.length > 0;
      let payload: LotMutationPayload | FormData = data;

      if (hasImages) {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (key === "images") return;
          if (value === undefined || value === null || value === "") return;
          formData.append(key, String(value));
        });
        (data.images || []).forEach((file) => {
          formData.append("images[]", file);
        });
        payload = formData;
      }

      const res = await withAuth.post(
        `auctions/${auctionId}/lots`,
        payload,
        hasImages ? { headers: { "Content-Type": "multipart/form-data" } } : undefined
      );
      return res.data;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async updateLot(
    auctionId: string | number,
    lotId: string | number,
    data: UpdateLotWithImagesPayload
  ) {
    try {
      const hasImages = Array.isArray(data.images) && data.images.length > 0;
      let payload: UpdateLotWithImagesPayload | FormData = data;

      if (hasImages) {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (key === "images") return;
          if (value === undefined || value === null || value === "") return;
          formData.append(key, String(value));
        });
        (data.images || []).forEach((file) => {
          formData.append("images[]", file);
        });
        payload = formData;
      }

      const res = await withAuth.patch(
        `auctions/${auctionId}/lots/${lotId}`,
        payload,
        hasImages ? { headers: { "Content-Type": "multipart/form-data" } } : undefined
      );
      return res.data;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async startLot(
    auctionId: string | number,
    lotId: string | number
  ) {
    try {
      const res = await withAuth.post(
        `auctions/${auctionId}/lots/${lotId}/start`
      );
      return res.data;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async endLot(
    auctionId: string | number,
    lotId: string | number
  ) {
    try {
      const res = await withAuth.post(
        `auctions/${auctionId}/lots/${lotId}/end`
      );
      return res.data;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async deleteLot(auctionId: string | number, lotId: string | number) {
    try {
      const res = await withAuth.delete(
        `auctions/${auctionId}/lots/${lotId}`
      );
      return res.data;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async getAuctionBidders(auctionId: string | number) {
    try {
      const res = await withAuth.get(
        `auctions/${auctionId}/bidders`
      );
      return res.data;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async updateBidderRegistration(
    auctionId: string | number,
    registrationId: string | number,
    data: { status: "approved" | "rejected" | "suspended"; rejection_reason?: string | null }
  ) {
    try {
      const res = await withAuth.patch(
        `auctions/${auctionId}/bidders/${registrationId}`,
        data
      );
      return res.data;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async getAuctionFinancials(auctionId: string | number) {
    try {
      const res = await withAuth.get(
        `auctions/${auctionId}/financials`
      );
      return res.data;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async getAuctionFinancialLots(auctionId: string | number) {
    try {
      const res = await withAuth.get(
        `auctions/${auctionId}/financials/lots`
      );
      return res.data;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async getAuctionFinancialSettings(auctionId: string | number) {
    try {
      const res = await withAuth.get(
        `auctions/${auctionId}/financials/settings`
      );
      return res.data;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async updateAuctionFinancialSettings(
    auctionId: string | number,
    data: AuctionSettingsPayload & { tax_exempt_all?: boolean }
  ) {
    try {
      const res = await withAuth.patch(
        `auctions/${auctionId}/financials/settings`,
        data
      );
      return res.data;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async getAuctionSettings(auctionId: string | number) {
    try {
      const res = await withAuth.get(
        `auctions/${auctionId}/settings`
      );
      return res.data;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async updateAuctionSettings(
    auctionId: string | number,
    data: AuctionSettingsPayload
  ) {
    try {
      const res = await withAuth.patch(
        `auctions/${auctionId}/settings`,
        data
      );
      return res.data;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async publishAuction(auctionId: string | number) {
    try {
      const res = await withAuth.post(
        `auctions/${auctionId}/publish`
      );
      return res.data;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async closeAuction(auctionId: string | number) {
    try {
      const res = await withAuth.post(
        `auctions/${auctionId}/close`
      );
      return res.data;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async pauseAuction(auctionId: string | number) {
    try {
      const res = await withAuth.post(
        `auctions/${auctionId}/pause`
      );
      return res.data;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async resumeAuction(auctionId: string | number) {
    try {
      const res = await withAuth.post(
        `auctions/${auctionId}/resume`
      );
      return res.data;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async completeAuction(auctionId: string | number) {
    try {
      const res = await withAuth.post(
        `auctions/${auctionId}/complete`
      );
      return res.data;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async deleteAuction(auctionId: string | number) {
    try {
      const res = await withAuth.delete(
        `auctions/${auctionId}`
      );
      return res.data;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async getAuctionLiveState(auctionId: string | number) {
    try {
      const res = await withAuth.get(
        `auctioneer/auctions/${auctionId}/live/overview`
      );
      return res.data;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async startLiveSession(auctionId: string | number) {
    try {
      const res = await withAuth.post(
        `auctioneer/auctions/${auctionId}/live/start`
      );
      return res.data;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async pauseLiveSession(auctionId: string | number) {
    try {
      const res = await withAuth.post(
        `auctioneer/auctions/${auctionId}/live/pause`
      );
      return res.data;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async resumeLiveSession(auctionId: string | number) {
    try {
      const res = await withAuth.post(
        `auctioneer/auctions/${auctionId}/live/resume`
      );
      return res.data;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async endLiveSession(auctionId: string | number) {
    try {
      const res = await withAuth.post(
        `auctioneer/auctions/${auctionId}/live/end`
      );
      return res.data;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async startLiveLot(auctionId: string | number, lotId: string | number) {
    try {
      const res = await withAuth.post(
        `auctioneer/auctions/${auctionId}/lots/${lotId}/start`
      );
      return res.data;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async sellLiveLot(auctionId: string | number, lotId: string | number) {
    try {
      const res = await withAuth.post(
        `auctioneer/auctions/${auctionId}/lots/${lotId}/sell`
      );
      return res.data;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async passLiveLot(auctionId: string | number, lotId: string | number) {
    try {
      const res = await withAuth.post(
        `auctioneer/auctions/${auctionId}/lots/${lotId}/pass`
      );
      return res.data;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async placeFloorBid(
    auctionId: string | number,
    lotId: string | number,
    data: { amount: number; auction_registration_id: number }
  ) {
    try {
      const res = await withAuth.post(
        `auctioneer/auctions/${auctionId}/lots/${lotId}/floor-bid`,
        data
      );
      return res.data;
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

};




