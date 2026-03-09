import { API_BASE_URL, getToken, withAuth } from "@/services/api";
import type { ExportFormat, ExportStatus } from "@/components/reports/report-types";

type ApiErrorLike = {
  response?: {
    data?: unknown;
  };
  message?: string;
};

type MessageEnvelope<T = unknown, M = unknown> = {
  message?: string;
  data?: T;
  meta?: M;
};

export type ReportRunMode = "single" | "pack";
export type ReportRunStatus = "queued" | "processing" | "done" | "failed";

export interface ReportFiltersInput {
  date_from?: string;
  date_to?: string;
  auction_id?: string;
  timezone?: string;
}

export interface ReportFiltersOutput extends ReportFiltersInput {
  utc_from?: string;
  utc_to?: string;
}

export interface QueueReportRunPayload {
  mode?: ReportRunMode;
  report_id?: string;
  pack_id?: string;
  filters?: ReportFiltersInput;
}

export interface ReportRunResource {
  run_id: string;
  status: ReportRunStatus;
  mode: ReportRunMode;
  report_id: string | null;
  pack_id: string | null;
  queued_at: string;
  started_at?: string | null;
  completed_at?: string | null;
  failed_at?: string | null;
  error?: string | null;
  preview?: unknown;
}

export interface QueueReportRunResponse {
  message: string;
  data: ReportRunResource;
}

export interface ReportExportResource {
  export_id: string;
  run_id: string;
  mode?: ReportRunMode;
  report_id?: string | null;
  format: ExportFormat;
  status: ExportStatus;
  pack_id?: string | null;
  pack_name?: string | null;
  file_name?: string | null;
  mime_type?: string | null;
  size_bytes?: number | null;
  expires_at?: string | null;
  queued_at?: string | null;
  completed_at?: string | null;
  error?: string | null;
  download_url?: string | null;
  report_name?: string | null;
  generated_by?: string | null;
  filters_summary?: string | null;
}

export interface ReportExportsListMeta {
  page: number;
  per_page: number;
  total: number;
}

export interface ReportExportsListResponse {
  message: string;
  data: ReportExportResource[];
  meta: ReportExportsListMeta;
}

export interface ReportExportDownloadResult {
  blob: Blob;
  fileName?: string;
}

export interface ReportPresetResource {
  preset_id: string;
  name: string;
  mode: ReportRunMode;
  report_id: string | null;
  pack_id: string | null;
  filters: ReportFiltersOutput;
  created_at: string;
  updated_at: string;
}

export interface ReportPresetsListMeta {
  page: number;
  per_page: number;
  total: number;
}

export interface ReportPresetsListResponse {
  message: string;
  data: ReportPresetResource[];
  meta: ReportPresetsListMeta;
}

export interface CreateReportPresetPayload {
  name: string;
  mode?: ReportRunMode;
  report_id?: string;
  pack_id?: string;
  filters?: ReportFiltersInput;
}

export interface DeleteReportPresetResponse {
  message: string;
  data: {
    preset_id: string;
  };
}

export interface ReportsOverviewKpis {
  auctions_count?: number;
  live_auctions_count?: number;
  lots_count?: number;
  sold_lots_count?: number;
  total_revenue?: number;
  total_bids?: number;
  unique_bidders?: number;
  sell_through_rate?: number;
  outstanding_payments?: number;
}

export interface ReportsOverviewResponse {
  message: string;
  data: {
    kpis?: ReportsOverviewKpis;
    insights?: unknown[];
    top_auction?: unknown;
    top_lot?: unknown;
    filters?: ReportFiltersOutput;
  };
}

const rethrowApiError = (error: unknown): never => {
  const err = error as ApiErrorLike;
  throw err?.response?.data || { message: err?.message || "Request failed" };
};

const extractMessage = (
  payload: unknown,
  fallback = "Request processed successfully."
): string => {
  if (!payload || typeof payload !== "object") return fallback;
  const message = (payload as MessageEnvelope).message;
  return typeof message === "string" && message.trim() ? message : fallback;
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

const extractArrayData = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    const nested = (payload as MessageEnvelope).data;
    if (Array.isArray(nested)) return nested as T[];
  }
  return [];
};

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const extractListMeta = (
  payload: unknown,
  fallbackLength = 0
): ReportExportsListMeta => {
  if (!payload || typeof payload !== "object") {
    return { page: 1, per_page: fallbackLength, total: fallbackLength };
  }

  const meta = (payload as MessageEnvelope).meta;
  if (!meta || typeof meta !== "object") {
    return { page: 1, per_page: fallbackLength, total: fallbackLength };
  }

  return {
    page: toNumber((meta as { page?: unknown }).page, 1),
    per_page: toNumber((meta as { per_page?: unknown }).per_page, fallbackLength),
    total: toNumber((meta as { total?: unknown }).total, fallbackLength),
  };
};

const extractFilename = (contentDisposition?: string | null): string | undefined => {
  if (!contentDisposition) return undefined;

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const basicMatch = contentDisposition.match(/filename=\"?([^\"]+)\"?/i);
  return basicMatch?.[1];
};

const extractDownloadUrl = (payload: unknown): string | undefined => {
  if (!payload || typeof payload !== "object") return undefined;

  const direct = (payload as { download_url?: unknown }).download_url;
  if (typeof direct === "string" && direct.trim()) return direct;

  const nested = (payload as MessageEnvelope).data;
  if (nested && typeof nested === "object") {
    const nestedValue = (nested as { download_url?: unknown }).download_url;
    if (typeof nestedValue === "string" && nestedValue.trim()) return nestedValue;
  }

  return undefined;
};

const toAbsoluteUrl = (value: string): string => {
  if (/^https?:\/\//i.test(value)) return value;
  return new URL(value.replace(/^\//, ""), `${API_BASE_URL}/`).toString();
};

const isApiUrl = (value: string): boolean => {
  try {
    return new URL(value).origin === new URL(API_BASE_URL).origin;
  } catch {
    return false;
  }
};

const fetchExportFile = async (
  target: string,
  visited = new Set<string>()
): Promise<ReportExportDownloadResult> => {
  const absoluteTarget = toAbsoluteUrl(target);
  if (visited.has(absoluteTarget)) {
    throw { message: "Download endpoint returned a circular redirect URL." };
  }

  const nextVisited = new Set(visited);
  nextVisited.add(absoluteTarget);

  const headers = new Headers();
  if (isApiUrl(absoluteTarget)) {
    const token = getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(absoluteTarget, {
    method: "GET",
    headers,
    credentials: isApiUrl(absoluteTarget) ? "include" : "omit",
  });

  const contentType = response.headers.get("content-type")?.toLowerCase() || "";

  if (!response.ok) {
    if (contentType.includes("application/json")) {
      throw await response.json();
    }
    throw { message: `Export download failed with status ${response.status}.` };
  }

  if (contentType.includes("application/json")) {
    const payload = await response.json();
    const nestedDownloadUrl = extractDownloadUrl(payload);
    if (nestedDownloadUrl) {
      return fetchExportFile(nestedDownloadUrl, nextVisited);
    }
    throw { message: extractMessage(payload, "Invalid report export download payload.") };
  }

  return {
    blob: await response.blob(),
    fileName: extractFilename(response.headers.get("content-disposition")),
  };
};

export const reportService = {
  async queueRun(
    payload: QueueReportRunPayload,
    idempotencyKey?: string
  ): Promise<QueueReportRunResponse> {
    try {
      const res = await withAuth.post<MessageEnvelope | ReportRunResource>(
        "/auctioneer/reports/runs",
        payload,
        idempotencyKey
          ? {
              headers: {
                "Idempotency-Key": idempotencyKey,
              },
            }
          : undefined
      );

      const data = extractObjectData<ReportRunResource>(res.data);
      if (!data) {
        throw { message: "Invalid report run response payload." };
      }

      return {
        message: extractMessage(res.data, "Report run queued"),
        data,
      };
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async getRun(runId: string): Promise<QueueReportRunResponse> {
    try {
      const res = await withAuth.get<MessageEnvelope | ReportRunResource>(
        `/auctioneer/reports/runs/${runId}`
      );

      const data = extractObjectData<ReportRunResource>(res.data);
      if (!data) {
        throw { message: "Invalid report run payload." };
      }

      return {
        message: extractMessage(res.data),
        data,
      };
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async queueExport(
    runId: string,
    format: ExportFormat
  ): Promise<{ message: string; data: ReportExportResource }> {
    try {
      const res = await withAuth.post<MessageEnvelope | ReportExportResource>(
        `/auctioneer/reports/runs/${runId}/exports`,
        { format }
      );

      const data = extractObjectData<ReportExportResource>(res.data);
      if (!data) {
        throw { message: "Invalid report export response payload." };
      }

      return {
        message: extractMessage(res.data, "Report export queued"),
        data,
      };
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async listExports(params?: {
    status?: ExportStatus;
    page?: number;
    per_page?: number;
  }): Promise<ReportExportsListResponse> {
    try {
      const res = await withAuth.get<MessageEnvelope | ReportExportResource[]>(
        "/auctioneer/reports/exports",
        { params }
      );

      const data = extractArrayData<ReportExportResource>(res.data);
      return {
        message: extractMessage(res.data),
        data,
        meta: extractListMeta(res.data, data.length),
      };
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async downloadExport(
    exportId: string,
    downloadUrl?: string | null
  ): Promise<ReportExportDownloadResult> {
    try {
      return await fetchExportFile(
        downloadUrl || `/auctioneer/reports/exports/${exportId}/download`
      );
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async listPresets(params?: {
    page?: number;
    per_page?: number;
  }): Promise<ReportPresetsListResponse> {
    try {
      const res = await withAuth.get<MessageEnvelope | ReportPresetResource[]>(
        "/auctioneer/reports/presets",
        { params }
      );

      const data = extractArrayData<ReportPresetResource>(res.data);
      const meta = extractListMeta(res.data, data.length);
      return {
        message: extractMessage(res.data),
        data,
        meta,
      };
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async createPreset(
    payload: CreateReportPresetPayload
  ): Promise<{ message: string; data: ReportPresetResource }> {
    try {
      const res = await withAuth.post<MessageEnvelope | ReportPresetResource>(
        "/auctioneer/reports/presets",
        payload
      );

      const data = extractObjectData<ReportPresetResource>(res.data);
      if (!data) {
        throw { message: "Invalid report preset payload." };
      }

      return {
        message: extractMessage(res.data, "Report preset created successfully."),
        data,
      };
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async deletePreset(presetId: string): Promise<DeleteReportPresetResponse> {
    try {
      const res = await withAuth.delete<MessageEnvelope | DeleteReportPresetResponse["data"]>(
        `/auctioneer/reports/presets/${presetId}`
      );

      const data = extractObjectData<DeleteReportPresetResponse["data"]>(res.data);
      if (!data) {
        throw { message: "Invalid delete preset payload." };
      }

      return {
        message: extractMessage(res.data, "Report preset deleted successfully."),
        data,
      };
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async runPreset(
    presetId: string,
    payload?: { filters?: ReportFiltersInput }
  ): Promise<QueueReportRunResponse> {
    try {
      const res = await withAuth.post<MessageEnvelope | ReportRunResource>(
        `/auctioneer/reports/presets/${presetId}/run`,
        payload ?? {}
      );

      const data = extractObjectData<ReportRunResource>(res.data);
      if (!data) {
        throw { message: "Invalid preset run payload." };
      }

      return {
        message: extractMessage(res.data, "Report run queued"),
        data,
      };
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },

  async getOverview(
    filters?: ReportFiltersInput
  ): Promise<ReportsOverviewResponse> {
    try {
      const res = await withAuth.get<MessageEnvelope | ReportsOverviewResponse["data"]>(
        "/auctioneer/reports/overview",
        { params: filters }
      );

      const data = extractObjectData<ReportsOverviewResponse["data"]>(res.data);
      if (!data) {
        throw { message: "Invalid reports overview payload." };
      }

      return {
        message: extractMessage(res.data),
        data,
      };
    } catch (error: unknown) {
      throw rethrowApiError(error);
    }
  },
};
