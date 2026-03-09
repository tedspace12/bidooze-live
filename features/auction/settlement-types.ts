export interface SettlementSummaryTotals {
  total_sales?: number | string | null;
  commission_rate?: number | string | null;
  commission_amount?: number | string | null;
  net_payout?: number | string | null;
  pending_invoices_count?: number | string | null;
  has_commission_overrides?: boolean | null;
  commission_rate_source?: string | null;
  [key: string]: unknown;
}

export interface SettlementReadiness {
  invoice_sendable_count?: number | string | null;
  invoice_paid_count?: number | string | null;
  payout_ready_count?: number | string | null;
  payout_processing_count?: number | string | null;
  payout_paid_count?: number | string | null;
  payout_held_count?: number | string | null;
  has_missing_payout_details?: boolean | null;
  sold_lots_count?: number | string | null;
  [key: string]: unknown;
}

export interface SettlementSummaryData {
  context?: Record<string, unknown>;
  totals?: SettlementSummaryTotals;
  readiness?: SettlementReadiness;
  [key: string]: unknown;
}

export interface SettlementInvoiceListParams {
  page?: number;
  per_page?: number;
  status?: string[];
  search?: string;
  sort_by?:
    | "invoice_number"
    | "buyer_name"
    | "amount"
    | "status"
    | "due_at"
    | "paid_at"
    | "created_at";
  sort_dir?: "asc" | "desc";
  invoice_ids?: Array<string | number>;
}

export interface SettlementPayoutListParams {
  page?: number;
  per_page?: number;
  status?: string[];
  search?: string;
  sort_by?:
    | "consignor_name"
    | "net_payout"
    | "status"
    | "due_at"
    | "paid_at"
    | "created_at";
  sort_dir?: "asc" | "desc";
  payout_ids?: Array<string | number>;
}

export interface SettlementExportParams {
  format?: "csv" | "excel";
  status?: string[];
  search?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
  invoice_ids?: Array<string | number>;
  payout_ids?: Array<string | number>;
}

export interface SettlementListResponse<T> {
  context?: Record<string, unknown>;
  items?: T[];
  meta?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface SettlementInvoiceListItem {
  invoice_id?: string | number;
  invoice_number?: string | null;
  lot_id?: string | number | null;
  lot_number?: string | number | null;
  lot_title?: string | null;
  buyer_id?: string | number | null;
  buyer_name?: string | null;
  amount?: number | string | null;
  commission_amount?: number | string | null;
  status?: string | null;
  due_at?: string | null;
  sent_at?: string | null;
  paid_at?: string | null;
  payment_method?: string | null;
  invoice_pdf_url?: string | null;
  export_url?: string | null;
  failure_reason?: string | null;
  notes?: string | null;
  [key: string]: unknown;
}

export interface SettlementPayoutListItem {
  payout_id?: string | number;
  payout_reference?: string | null;
  consignor_id?: string | number | null;
  consignor_name?: string | null;
  lots_sold_count?: number | string | null;
  total_sale?: number | string | null;
  net_payout?: number | string | null;
  status?: string | null;
  due_at?: string | null;
  sent_at?: string | null;
  paid_at?: string | null;
  payment_method?: string | null;
  export_url?: string | null;
  failure_reason?: string | null;
  notes?: string | null;
  [key: string]: unknown;
}

export interface SettlementDocument {
  id?: string | number;
  name?: string | null;
  label?: string | null;
  type?: string | null;
  url?: string | null;
  download_url?: string | null;
  preview_url?: string | null;
  export_url?: string | null;
  [key: string]: unknown;
}

export interface SettlementDocumentLinks {
  pdf_url?: string | null;
  export_url?: string | null;
  [key: string]: unknown;
}

export interface SettlementInvoiceDetailData {
  invoice?: Record<string, unknown>;
  buyer?: Record<string, unknown>;
  lots?: Record<string, unknown>[];
  totals?: Record<string, unknown>;
  payments?: Record<string, unknown>[];
  documents?: SettlementDocument[] | SettlementDocumentLinks | null;
  warnings?: Array<string | Record<string, unknown>>;
  timeline?: Record<string, unknown>[];
  activity?: Record<string, unknown>[];
  [key: string]: unknown;
}

export interface SettlementPayoutDetailData {
  payout?: Record<string, unknown>;
  consignor?: Record<string, unknown>;
  lots?: Record<string, unknown>[];
  totals?: Record<string, unknown>;
  warnings?: Array<string | Record<string, unknown>>;
  timeline?: Record<string, unknown>[];
  activity?: Record<string, unknown>[];
  documents?: SettlementDocument[] | SettlementDocumentLinks | null;
  [key: string]: unknown;
}

export interface SettlementActionFailure {
  reason?: string | null;
  [key: string]: unknown;
}

export interface SettlementActionResult {
  context?: Record<string, unknown>;
  success_count?: number | string | null;
  skipped_count?: number | string | null;
  failed_count?: number | string | null;
  failures?: SettlementActionFailure[];
  [key: string]: unknown;
}

export interface SettlementFileDownload {
  blob: Blob;
  filename?: string;
}
