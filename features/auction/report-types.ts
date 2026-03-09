export type AuctionReportSortDir = "asc" | "desc";
export type AuctionReportExportFormat = "csv" | "excel";

export interface AuctionReportContext {
  auction_id?: number | string;
  auction_title?: string;
  currency?: string;
  status?: string;
  started_at?: string | null;
  ended_at?: string | null;
  timezone?: string;
  [key: string]: unknown;
}

export interface AuctionReportMeta {
  current_page?: number;
  per_page?: number;
  total?: number;
  last_page?: number;
  [key: string]: unknown;
}

export interface AuctionReportSummaryMetrics {
  lots_total?: number | string | null;
  lots_sold?: number | string | null;
  lots_unsold?: number | string | null;
  sell_through_rate?: number | string | null;
  total_bids?: number | string | null;
  unique_bidders_count?: number | string | null;
  total_revenue?: number | string | null;
  average_lot_price?: number | string | null;
  highest_sale_price?: number | string | null;
  lowest_sale_price?: number | string | null;
  [key: string]: unknown;
}

export interface AuctionReportSummaryData {
  context?: AuctionReportContext;
  metrics?: AuctionReportSummaryMetrics;
  [key: string]: unknown;
}

export interface AuctionReportLotsParams {
  page?: number;
  per_page?: number;
  status?: "pending" | "active" | "sold" | "passed" | "cancelled";
  search?: string;
  sort_by?:
    | "sale_order"
    | "lot_number"
    | "title"
    | "status"
    | "starting_bid"
    | "reserve_price"
    | "estimate_low"
    | "estimate_high"
    | "final_price"
    | "bids_count"
    | "winner_name"
    | "consignor_name"
    | "reserve_met"
    | "sold_at";
  sort_dir?: AuctionReportSortDir;
  reserve_met?: boolean;
  estimate_band?: "above_high" | "within" | "below_low" | "unknown";
  has_bids?: boolean;
}

export interface AuctionReportLotAggregates {
  sold_lots_count?: number | string | null;
  unsold_lots_count?: number | string | null;
  withdrawn_lots_count?: number | string | null;
  passed_lots_count?: number | string | null;
  reserve_met_count?: number | string | null;
  reserve_not_met_count?: number | string | null;
  lots_above_high_estimate_count?: number | string | null;
  lots_within_estimate_count?: number | string | null;
  lots_below_low_estimate_count?: number | string | null;
  [key: string]: unknown;
}

export interface AuctionReportLotItem {
  lot_id?: number | string;
  sale_order?: number | string | null;
  lot_number?: string | number | null;
  title?: string | null;
  status?: string | null;
  starting_bid?: number | string | null;
  reserve_price?: number | string | null;
  estimate_low?: number | string | null;
  estimate_high?: number | string | null;
  final_price?: number | string | null;
  bids_count?: number | string | null;
  winner_id?: number | string | null;
  winner_type?: string | null;
  winner_name?: string | null;
  consignor_id?: number | string | null;
  consignor_name?: string | null;
  reserve_met?: boolean | null;
  sold_at?: string | null;
  [key: string]: unknown;
}

export interface AuctionReportLotsData {
  context?: AuctionReportContext;
  aggregates?: AuctionReportLotAggregates;
  items?: AuctionReportLotItem[];
  meta?: AuctionReportMeta;
  [key: string]: unknown;
}

export interface AuctionReportActivityParams {
  bucket?: "hourly" | "daily" | "lot_order";
  date_from?: string;
  date_to?: string;
  timezone?: string;
}

export interface AuctionReportActivityBucket {
  bucket?: string | number;
  label?: string;
  bids_count?: number | string | null;
  revenue?: number | string | null;
  registrations_count?: number | string | null;
  [key: string]: unknown;
}

export interface AuctionReportActivityData {
  context?: AuctionReportContext;
  series?: {
    bids_over_time?: AuctionReportActivityBucket[];
    revenue_over_time?: AuctionReportActivityBucket[];
    registrations_over_time?: AuctionReportActivityBucket[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface AuctionReportBiddersParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?:
    | "bidder_name"
    | "bidder_email"
    | "registration_status"
    | "bids_count"
    | "lots_won_count"
    | "total_spent"
    | "last_bid_at";
  sort_dir?: AuctionReportSortDir;
}

export interface AuctionReportBidderAggregates {
  registrations_count?: number | string | null;
  approved_bidders_count?: number | string | null;
  active_bidders_count?: number | string | null;
  winning_bidders_count?: number | string | null;
  inactive_registered_bidders_count?: number | string | null;
  bidder_conversion_rate?: number | string | null;
  average_bids_per_active_bidder?: number | string | null;
  top_bidder_concentration_rate?: number | string | null;
  [key: string]: unknown;
}

export interface AuctionReportBidderItem {
  registration_id?: number | string;
  bidder_id?: number | string | null;
  bidder_name?: string | null;
  bidder_email?: string | null;
  registration_status?: string | null;
  bids_count?: number | string | null;
  lots_won_count?: number | string | null;
  total_spent?: number | string | null;
  last_bid_at?: string | null;
  [key: string]: unknown;
}

export interface AuctionReportBiddersData {
  context?: AuctionReportContext;
  aggregates?: AuctionReportBidderAggregates;
  items?: AuctionReportBidderItem[];
  meta?: AuctionReportMeta;
  [key: string]: unknown;
}

export interface AuctionReportFinancialTotals {
  hammer_total?: number | string | null;
  buyer_premium_total?: number | string | null;
  tax_total?: number | string | null;
  fees_total?: number | string | null;
  discounts_total?: number | string | null;
  refunds_total?: number | string | null;
  net_revenue?: number | string | null;
  average_revenue_per_sold_lot?: number | string | null;
  buyer_tax_total?: number | string | null;
  seller_withholding_total?: number | string | null;
  lot_fees_total?: number | string | null;
  shipping_total?: number | string | null;
  handling_total?: number | string | null;
  deposit_credits_total?: number | string | null;
  adjustments_total?: number | string | null;
  positive_adjustments_total?: number | string | null;
  seller_commission_total?: number | string | null;
  seller_payout_total?: number | string | null;
  payment_refunds_total?: number | string | null;
  deposit_refunds_total?: number | string | null;
  [key: string]: unknown;
}

export interface AuctionReportFinancialData {
  context?: AuctionReportContext;
  totals?: AuctionReportFinancialTotals;
  basis?: Record<string, string>;
  [key: string]: unknown;
}

export interface AuctionReportConsignorsParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?:
    | "consignor_name"
    | "lots_submitted"
    | "lots_sold"
    | "sell_through_rate"
    | "gross_sales"
    | "net_payout_estimate"
    | "payout_status";
  sort_dir?: AuctionReportSortDir;
}

export interface AuctionReportConsignorAggregates {
  consignors_count?: number | string | null;
  [key: string]: unknown;
}

export interface AuctionReportConsignorItem {
  consignor_id?: number | string;
  consignor_name?: string | null;
  lots_submitted?: number | string | null;
  lots_sold?: number | string | null;
  sell_through_rate?: number | string | null;
  gross_sales?: number | string | null;
  net_payout_estimate?: number | string | null;
  payout_id?: number | string | null;
  payout_status?: string | null;
  [key: string]: unknown;
}

export interface AuctionReportConsignorsData {
  context?: AuctionReportContext;
  aggregates?: AuctionReportConsignorAggregates;
  items?: AuctionReportConsignorItem[];
  meta?: AuctionReportMeta;
  [key: string]: unknown;
}

export interface AuctionReportExceptionsIssues {
  unpaid_invoices_count?: number | string | null;
  pending_settlement_count?: number | string | null;
  held_payouts_count?: number | string | null;
  reserve_failures_count?: number | string | null;
  withdrawn_lots_count?: number | string | null;
  disputed_lots_count?: number | string | null;
  failed_invoice_dispatch_count?: number | string | null;
  notes?: string[];
  [key: string]: unknown;
}

export interface AuctionReportExceptionsData {
  context?: AuctionReportContext;
  issues?: AuctionReportExceptionsIssues;
  [key: string]: unknown;
}

export interface AuctionReportExportQueuedData {
  export_id?: string;
  status?: string;
  format?: AuctionReportExportFormat;
  download_url?: string | null;
  download_path?: string | null;
  queued_at?: string | null;
  [key: string]: unknown;
}

export interface AuctionReportQueuedExport {
  kind: "queued";
  message: string;
  data: AuctionReportExportQueuedData;
}

export interface AuctionReportFileExport {
  kind: "file";
  blob: Blob;
  filename?: string;
}

export type AuctionReportExportResult =
  | AuctionReportQueuedExport
  | AuctionReportFileExport;

