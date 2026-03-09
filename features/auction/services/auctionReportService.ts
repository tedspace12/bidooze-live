import { withAuth } from "@/services/api";

import type {
  AuctionReportActivityData,
  AuctionReportActivityParams,
  AuctionReportBiddersData,
  AuctionReportBiddersParams,
  AuctionReportConsignorsData,
  AuctionReportConsignorsParams,
  AuctionReportExceptionsData,
  AuctionReportExportFormat,
  AuctionReportExportResult,
  AuctionReportFileExport,
  AuctionReportFinancialData,
  AuctionReportLotsData,
  AuctionReportLotsParams,
  AuctionReportQueuedExport,
  AuctionReportSummaryData,
} from "../report-types";

type ApiErrorLike = {
  response?: {
    data?: unknown;
  };
  message?: string;
};

type MessageEnvelope<T = unknown> = {
  message?: string;
  data?: T;
};

const rethrowApiError = (error: unknown): never => {
  const err = error as ApiErrorLike;
  throw err?.response?.data || { message: err?.message || "Request failed" };
};

const extractObjectData = <T>(payload: unknown): T => {
  if (payload && typeof payload === "object" && "data" in payload) {
    const nested = (payload as MessageEnvelope).data;
    if (nested !== undefined) {
      return nested as T;
    }
  }

  return payload as T;
};

const extractMessage = (payload: unknown, fallback = "Request processed successfully.") => {
  if (!payload || typeof payload !== "object") return fallback;
  const message = (payload as MessageEnvelope).message;
  return typeof message === "string" && message.trim() ? message : fallback;
};

const extractFilename = (contentDisposition?: string): string | undefined => {
  if (!contentDisposition) return undefined;

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const basicMatch = contentDisposition.match(/filename=\"?([^\"]+)\"?/i);
  return basicMatch?.[1];
};

const parseExportResponse = async (
  blob: Blob,
  contentType?: string,
  contentDisposition?: string
): Promise<AuctionReportExportResult> => {
  const normalizedType = (contentType || blob.type || "").toLowerCase();

  if (normalizedType.includes("application/json")) {
    const text = await blob.text();
    const payload = JSON.parse(text) as MessageEnvelope<Record<string, unknown>>;
    return {
      kind: "queued",
      message: extractMessage(payload, "Auction report export queued successfully."),
      data: extractObjectData<Record<string, unknown>>(payload),
    } as AuctionReportQueuedExport;
  }

  return {
    kind: "file",
    blob,
    filename: extractFilename(contentDisposition),
  } as AuctionReportFileExport;
};

export const auctionReportService = {
  async getAuctionReportSummary(
    auctionId: string | number
  ): Promise<AuctionReportSummaryData> {
    try {
      const res = await withAuth.get<MessageEnvelope | AuctionReportSummaryData>(
        `auctions/${auctionId}/reports/summary`
      );
      return extractObjectData<AuctionReportSummaryData>(res.data);
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async getAuctionReportLotPerformance(
    auctionId: string | number,
    params?: AuctionReportLotsParams
  ): Promise<AuctionReportLotsData> {
    try {
      const res = await withAuth.get<MessageEnvelope | AuctionReportLotsData>(
        `auctions/${auctionId}/reports/lots`,
        { params }
      );
      return extractObjectData<AuctionReportLotsData>(res.data);
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async getAuctionReportActivity(
    auctionId: string | number,
    params?: AuctionReportActivityParams
  ): Promise<AuctionReportActivityData> {
    try {
      const res = await withAuth.get<MessageEnvelope | AuctionReportActivityData>(
        `auctions/${auctionId}/reports/activity`,
        { params }
      );
      return extractObjectData<AuctionReportActivityData>(res.data);
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async getAuctionReportBidders(
    auctionId: string | number,
    params?: AuctionReportBiddersParams
  ): Promise<AuctionReportBiddersData> {
    try {
      const res = await withAuth.get<MessageEnvelope | AuctionReportBiddersData>(
        `auctions/${auctionId}/reports/bidders`,
        { params }
      );
      return extractObjectData<AuctionReportBiddersData>(res.data);
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async getAuctionReportFinancials(
    auctionId: string | number
  ): Promise<AuctionReportFinancialData> {
    try {
      const res = await withAuth.get<MessageEnvelope | AuctionReportFinancialData>(
        `auctions/${auctionId}/reports/financials`
      );
      return extractObjectData<AuctionReportFinancialData>(res.data);
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async getAuctionReportConsignors(
    auctionId: string | number,
    params?: AuctionReportConsignorsParams
  ): Promise<AuctionReportConsignorsData> {
    try {
      const res = await withAuth.get<MessageEnvelope | AuctionReportConsignorsData>(
        `auctions/${auctionId}/reports/consignors`,
        { params }
      );
      return extractObjectData<AuctionReportConsignorsData>(res.data);
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async getAuctionReportExceptions(
    auctionId: string | number
  ): Promise<AuctionReportExceptionsData> {
    try {
      const res = await withAuth.get<MessageEnvelope | AuctionReportExceptionsData>(
        `auctions/${auctionId}/reports/exceptions`
      );
      return extractObjectData<AuctionReportExceptionsData>(res.data);
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async exportAuctionReportSummary(
    auctionId: string | number,
    params?: { format?: AuctionReportExportFormat }
  ): Promise<AuctionReportExportResult> {
    try {
      const res = await withAuth.get<Blob>(
        `auctions/${auctionId}/reports/export/summary`,
        {
          params,
          responseType: "blob",
          validateStatus: (status: number) => status >= 200 && status < 300,
        }
      );

      return parseExportResponse(
        res.data,
        res.headers["content-type"],
        res.headers["content-disposition"]
      );
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async exportAuctionReportLots(
    auctionId: string | number,
    params?: AuctionReportLotsParams & { format?: AuctionReportExportFormat }
  ): Promise<AuctionReportExportResult> {
    try {
      const res = await withAuth.get<Blob>(`auctions/${auctionId}/reports/export/lots`, {
        params,
        responseType: "blob",
        validateStatus: (status: number) => status >= 200 && status < 300,
      });

      return parseExportResponse(
        res.data,
        res.headers["content-type"],
        res.headers["content-disposition"]
      );
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async exportAuctionReportBidders(
    auctionId: string | number,
    params?: AuctionReportBiddersParams & { format?: AuctionReportExportFormat }
  ): Promise<AuctionReportExportResult> {
    try {
      const res = await withAuth.get<Blob>(`auctions/${auctionId}/reports/export/bidders`, {
        params,
        responseType: "blob",
        validateStatus: (status: number) => status >= 200 && status < 300,
      });

      return parseExportResponse(
        res.data,
        res.headers["content-type"],
        res.headers["content-disposition"]
      );
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async exportAuctionReportSettlement(
    auctionId: string | number,
    params?: { format?: AuctionReportExportFormat }
  ): Promise<AuctionReportExportResult> {
    try {
      const res = await withAuth.get<Blob>(
        `auctions/${auctionId}/reports/export/settlement`,
        {
          params,
          responseType: "blob",
          validateStatus: (status: number) => status >= 200 && status < 300,
        }
      );

      return parseExportResponse(
        res.data,
        res.headers["content-type"],
        res.headers["content-disposition"]
      );
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async exportAuctionReportFull(
    auctionId: string | number,
    params?: { format?: AuctionReportExportFormat }
  ): Promise<AuctionReportExportResult> {
    try {
      const res = await withAuth.get<Blob>(`auctions/${auctionId}/reports/export/full`, {
        params,
        responseType: "blob",
        validateStatus: (status: number) => status >= 200 && status < 300,
      });

      return parseExportResponse(
        res.data,
        res.headers["content-type"],
        res.headers["content-disposition"]
      );
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },
};
