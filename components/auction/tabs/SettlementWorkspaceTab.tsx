"use client";

import { useState, type ReactNode } from "react";
import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  FileText,
  Landmark,
  MessageSquareText,
  Receipt,
  RotateCcw,
  Send,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuctionSettlement } from "@/features/auction/hooks/useAuctionSettlement";
import { auctionService } from "@/features/auction/services/auctionService";
import type {
  SettlementActionFailure,
  SettlementActionResult,
  SettlementInvoiceDetailData,
  SettlementInvoiceListItem,
  SettlementPayoutDetailData,
  SettlementPayoutListItem,
  SettlementSummaryData,
} from "@/features/auction/settlement-types";
import { AuctionOverviewResponse } from "@/features/auction/types";
import { cn, formatCurrency } from "@/lib/utils";

interface SettlementTabProps {
  auction: AuctionOverviewResponse;
}

type Tone = "neutral" | "info" | "success" | "warning" | "danger";

type UnknownRecord = Record<string, unknown>;

interface SummaryView {
  totalSales: number;
  sellerCommissionRate: number;
  sellerCommissionAmount: number;
  netPayout: number;
  pendingInvoicesCount: number;
  hasSellerCommissionOverrides: boolean;
  sellerCommissionRateSource: string;
  invoiceSendableCount: number;
  invoicePaidCount: number;
  payoutReadyCount: number;
  payoutProcessingCount: number;
  payoutPaidCount: number;
  payoutHeldCount: number;
  hasMissingPayoutDetails: boolean;
  soldLotsCount: number;
}

interface InvoiceRowView {
  id: string;
  number: string;
  lotNumber: string;
  lotTitle: string;
  buyerName: string;
  amount: number;
  buyerPremiumAmount: number;
  status: string;
  dueAt?: string;
  sentAt?: string;
  paidAt?: string;
  paymentMethod?: string;
  pdfUrl?: string;
  exportUrl?: string;
  failureReason?: string;
  notes?: string;
}

interface PayoutRowView {
  id: string;
  reference: string;
  consignorName: string;
  lotsSoldCount: number;
  totalSale: number;
  netPayout: number;
  status: string;
  dueAt?: string;
  sentAt?: string;
  paidAt?: string;
  paymentMethod?: string;
  exportUrl?: string;
  failureReason?: string;
  notes?: string;
}

interface HistoryItemView {
  label: string;
  detail: string;
  meta: string;
  at?: string;
  amount?: number;
  statusLabel: string;
  tone: Tone;
}

interface TimelineItemView {
  title: string;
  detail: string;
  at?: string;
  actor: string;
  tone: Tone;
}

interface NoteItemView {
  title: string;
  body: string;
  tone: Tone;
}

interface AuditItemView {
  action: string;
  actor: string;
  at?: string;
  detail: string;
}

interface DocumentItemView {
  label: string;
  description: string;
  url?: string;
  actionLabel: string;
}

interface InvoiceLotView {
  lotNumber: string;
  title: string;
  hammer: number;
  premium: number;
  tax: number;
  fees: number;
  adjustment: number;
  total: number;
  note?: string;
}

interface PayoutLotView {
  lotNumber: string;
  title: string;
  saleValue: number;
  commission: number;
  withholding: number;
  adjustment: number;
  net: number;
  note?: string;
}

interface InvoiceDetailView {
  id: string;
  number: string;
  reference: string;
  status: string;
  buyerName: string;
  buyerCompany?: string;
  buyerEmail: string;
  buyerPhone: string;
  billingEmail: string;
  billingPhone: string;
  bidderNumber: string;
  address: string;
  issuedAt?: string;
  dueAt?: string;
  dueLabel: string;
  hammerTotal: number;
  premiumTotal: number;
  taxTotal: number;
  feesTotal: number;
  totalDue: number;
  totalPaid: number;
  balanceDue: number;
  lots: InvoiceLotView[];
  payments: HistoryItemView[];
  attempts: HistoryItemView[];
  sentHistory: HistoryItemView[];
  documents: DocumentItemView[];
  notes: NoteItemView[];
  failureReason?: string;
  timeline: TimelineItemView[];
  auditTrail: AuditItemView[];
}

interface PayoutDetailView {
  id: string;
  reference: string;
  status: string;
  consignorName: string;
  consignorCompany?: string;
  consignorEmail: string;
  consignorPhone: string;
  consignorNumber: string;
  address: string;
  payoutMethod: string;
  bankSummary: string;
  beneficiary: string;
  taxReference?: string;
  grossProceeds: number;
  commissionTotal: number;
  withholdingTotal: number;
  adjustmentsTotal: number;
  deductionsTotal: number;
  netPayout: number;
  lots: PayoutLotView[];
  createdAt?: string;
  approvedAt?: string;
  initiatedAt?: string;
  paidAt?: string;
  failedAt?: string;
  documents: DocumentItemView[];
  notes: NoteItemView[];
  failureReason?: string;
  timeline: TimelineItemView[];
  auditTrail: AuditItemView[];
}

const toneBadgeClasses: Record<Tone, string> = {
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
  info: "border-sky-200 bg-sky-50 text-sky-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  danger: "border-rose-200 bg-rose-50 text-rose-700",
};

const toneDotClasses: Record<Tone, string> = {
  neutral: "bg-slate-400",
  info: "bg-sky-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
};

const isRecord = (value: unknown): value is UnknownRecord =>
  !!value && typeof value === "object" && !Array.isArray(value);

const asRecord = (value: unknown): UnknownRecord => (isRecord(value) ? value : {});

const asRecords = (value: unknown): UnknownRecord[] =>
  Array.isArray(value) ? value.filter(isRecord) : [];

const firstDefined = (record: UnknownRecord, keys: string[]) =>
  keys.map((key) => record[key]).find((value) => value !== undefined && value !== null);

const toText = (value: unknown, fallback = "Not available") => {
  if (typeof value === "string") return value.trim() || fallback;
  if (typeof value === "number") return String(value);
  return fallback;
};

const toOptionalText = (value: unknown) => {
  if (typeof value === "string") return value.trim() || undefined;
  if (typeof value === "number") return String(value);
  return undefined;
};

const toNumber = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const pickText = (record: UnknownRecord, keys: string[], fallback = "Not available") =>
  toText(firstDefined(record, keys), fallback);

const pickOptionalText = (record: UnknownRecord, keys: string[]) =>
  toOptionalText(firstDefined(record, keys));

const pickNumber = (record: UnknownRecord, keys: string[], fallback = 0) =>
  toNumber(firstDefined(record, keys), fallback);

const normalizeTone = (status?: string | null): Tone => {
  const value = (status || "").toLowerCase();
  if (["paid", "succeeded", "applied", "delivered", "opened", "approved", "ready"].includes(value)) {
    return "success";
  }
  if (["failed", "error", "rejected", "held"].includes(value)) {
    return "danger";
  }
  if (["overdue", "pending", "processing", "draft", "warning", "skipped"].includes(value)) {
    return "warning";
  }
  if (["sent", "initiated", "manual_transfer", "bank_transfer"].includes(value)) {
    return "info";
  }
  return "neutral";
};

const prettyLabel = (value?: string | null, fallback = "Not available") => {
  if (!value) return fallback;
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getMessage = (error: unknown) => {
  const record = asRecord(error);
  const nested = asRecord(record.data);
  return (
    pickOptionalText(record, ["message"]) ||
    pickOptionalText(nested, ["message"]) ||
    "Request failed."
  );
};

function formatDateTime(value?: string) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatDate(value?: string) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(date);
}

function StatusBadge({ label, tone }: { label: string; tone: Tone }) {
  return (
    <Badge variant="outline" className={cn("gap-1.5 font-medium", toneBadgeClasses[tone])}>
      {label}
    </Badge>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="gap-0">
      <CardContent className="space-y-3 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="rounded-lg border border-border bg-muted/40 p-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        <div>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoGrid({ items }: { items: Array<{ label: string; value: ReactNode }> }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-border/70 bg-muted/20 p-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {item.label}
          </dt>
          <dd className="mt-1 break-words text-sm font-medium text-foreground">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function HistoryList({
  items,
  currency,
  emptyMessage,
}: {
  items: HistoryItemView[];
  currency: string;
  emptyMessage: string;
}) {
  if (!items.length) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={`${item.label}-${item.at ?? item.meta}`}
          className="flex flex-col gap-3 rounded-lg border border-border/70 bg-background p-3 sm:flex-row sm:justify-between"
        >
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <StatusBadge label={item.statusLabel} tone={item.tone} />
            </div>
            <p className="text-sm text-muted-foreground">{item.detail}</p>
            <p className="text-xs text-muted-foreground">{item.meta}</p>
          </div>
          <div className="text-sm sm:text-right">
            {typeof item.amount === "number" ? (
              <p className="font-semibold text-foreground">{formatCurrency(item.amount, currency)}</p>
            ) : null}
            <p className="text-xs text-muted-foreground">{formatDateTime(item.at)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function TimelineList({ items }: { items: TimelineItemView[] }) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={`${item.title}-${item.at ?? index}`} className="relative pl-6">
          {index < items.length - 1 ? (
            <span className="absolute left-[7px] top-5 h-[calc(100%-8px)] w-px bg-border" />
          ) : null}
          <span
            className={cn(
              "absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-background",
              toneDotClasses[item.tone]
            )}
          />
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              <p className="text-sm text-muted-foreground">{item.detail}</p>
              <p className="text-xs text-muted-foreground">Actor: {item.actor}</p>
            </div>
            <p className="text-xs text-muted-foreground">{formatDateTime(item.at)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function NotesList({ items }: { items: NoteItemView[] }) {
  if (!items.length) {
    return <p className="text-sm text-muted-foreground">No notes or warnings available.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={`${item.title}-${item.body}`} className={cn("rounded-lg border p-3", toneBadgeClasses[item.tone])}>
          <p className="text-sm font-medium">{item.title}</p>
          <p className="mt-1 text-sm">{item.body}</p>
        </div>
      ))}
    </div>
  );
}

function AuditList({ items }: { items: AuditItemView[] }) {
  if (!items.length) {
    return <p className="text-sm text-muted-foreground">No activity available.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={`${item.action}-${item.at ?? item.actor}`} className="rounded-lg border border-border/70 bg-background p-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <p className="text-sm font-medium text-foreground">{item.action}</p>
            <p className="text-xs text-muted-foreground">{formatDateTime(item.at)}</p>
          </div>
          <p className="text-xs text-muted-foreground">By {item.actor}</p>
          <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
        </div>
      ))}
    </div>
  );
}

const normalizeSummary = (data?: SettlementSummaryData): SummaryView => {
  const totals = asRecord(data?.totals);
  const readiness = asRecord(data?.readiness);

  return {
    totalSales: pickNumber(totals, ["total_sales"]),
    sellerCommissionRate: pickNumber(totals, ["commission_rate"]),
    sellerCommissionAmount: pickNumber(totals, ["commission_amount"]),
    netPayout: pickNumber(totals, ["net_payout"]),
    pendingInvoicesCount: pickNumber(totals, ["pending_invoices_count"]),
    hasSellerCommissionOverrides: !!firstDefined(totals, ["has_commission_overrides"]),
    sellerCommissionRateSource: pickText(totals, ["commission_rate_source"], "Standard"),
    invoiceSendableCount: pickNumber(readiness, ["invoice_sendable_count"]),
    invoicePaidCount: pickNumber(readiness, ["invoice_paid_count"]),
    payoutReadyCount: pickNumber(readiness, ["payout_ready_count"]),
    payoutProcessingCount: pickNumber(readiness, ["payout_processing_count"]),
    payoutPaidCount: pickNumber(readiness, ["payout_paid_count"]),
    payoutHeldCount: pickNumber(readiness, ["payout_held_count"]),
    hasMissingPayoutDetails: !!firstDefined(readiness, ["has_missing_payout_details"]),
    soldLotsCount: pickNumber(readiness, ["sold_lots_count"]),
  };
};

const normalizeInvoiceRow = (item: SettlementInvoiceListItem): InvoiceRowView => {
  const record = asRecord(item);
  return {
    id: toText(firstDefined(record, ["invoice_id"]), ""),
    number: pickText(record, ["invoice_number"], "Invoice"),
    lotNumber: toText(firstDefined(record, ["lot_number"]), "Not available"),
    lotTitle: pickText(record, ["lot_title"], "Untitled lot"),
    buyerName: pickText(record, ["buyer_name"], "Unknown buyer"),
    amount: pickNumber(record, ["amount"]),
    buyerPremiumAmount: pickNumber(record, ["commission_amount"]),
    status: toText(firstDefined(record, ["status"]), "pending"),
    dueAt: pickOptionalText(record, ["due_at"]),
    sentAt: pickOptionalText(record, ["sent_at"]),
    paidAt: pickOptionalText(record, ["paid_at"]),
    paymentMethod: pickOptionalText(record, ["payment_method"]),
    pdfUrl: pickOptionalText(record, ["invoice_pdf_url"]),
    exportUrl: pickOptionalText(record, ["export_url"]),
    failureReason: pickOptionalText(record, ["failure_reason"]),
    notes: pickOptionalText(record, ["notes"]),
  };
};

const normalizePayoutRow = (item: SettlementPayoutListItem): PayoutRowView => {
  const record = asRecord(item);
  return {
    id: toText(firstDefined(record, ["payout_id"]), ""),
    reference: pickText(record, ["payout_reference"], "Payout"),
    consignorName: pickText(record, ["consignor_name"], "Unknown consignor"),
    lotsSoldCount: pickNumber(record, ["lots_sold_count"]),
    totalSale: pickNumber(record, ["total_sale"]),
    netPayout: pickNumber(record, ["net_payout"]),
    status: toText(firstDefined(record, ["status"]), "pending"),
    dueAt: pickOptionalText(record, ["due_at"]),
    sentAt: pickOptionalText(record, ["sent_at"]),
    paidAt: pickOptionalText(record, ["paid_at"]),
    paymentMethod: pickOptionalText(record, ["payment_method"]),
    exportUrl: pickOptionalText(record, ["export_url"]),
    failureReason: pickOptionalText(record, ["failure_reason"]),
    notes: pickOptionalText(record, ["notes"]),
  };
};

const normalizeDocuments = (records: unknown): DocumentItemView[] => {
  const mapped = asRecords(records).map((item) => ({
    label: pickText(item, ["label", "name", "type"], "Document"),
    description: pickText(item, ["description", "type"], "Settlement document"),
    url:
      pickOptionalText(item, ["download_url", "preview_url", "url", "export_url"]) || undefined,
    actionLabel: pickOptionalText(item, ["action_label"]) || "Open",
  }));

  if (mapped.length) return mapped;

  const single = asRecord(records);
  const pdfUrl = pickOptionalText(single, ["pdf_url"]);
  const exportUrl = pickOptionalText(single, ["export_url"]);

  return [
    ...(pdfUrl
      ? [{ label: "Invoice PDF", description: "Preview or download the invoice PDF.", url: pdfUrl, actionLabel: "Open" }]
      : []),
    ...(exportUrl
      ? [{ label: "Export", description: "Download the settlement export file.", url: exportUrl, actionLabel: "Open" }]
      : []),
  ];
};

const normalizeWarnings = (
  warnings: unknown,
  additionalNotes: Array<string | undefined> = []
): NoteItemView[] => {
  const warningNotes = (Array.isArray(warnings) ? warnings : []).map((warning) => {
    if (typeof warning === "string") {
      return { title: "Warning", body: warning, tone: "warning" as Tone };
    }

    const record = asRecord(warning);
    return {
      title: pickText(record, ["title", "code", "level"], "Warning"),
      body: pickText(record, ["message", "detail", "reason"], "Settlement warning"),
      tone: normalizeTone(pickOptionalText(record, ["level", "status"])),
    };
  });

  const noteItems = additionalNotes
    .filter((note): note is string => !!note)
    .map((note) => ({ title: "Internal note", body: note, tone: "info" as Tone }));

  return [...warningNotes, ...noteItems];
};

const normalizeTimeline = (records: unknown): TimelineItemView[] =>
  asRecords(records).map((item) => ({
    title: pickText(item, ["title", "action", "event"], "Event"),
    detail: pickText(item, ["detail", "description", "message"], "No detail provided."),
    at: pickOptionalText(item, ["at", "created_at", "timestamp"]),
    actor: pickText(item, ["actor", "created_by", "user_name", "admin_name"], "System"),
    tone: normalizeTone(pickOptionalText(item, ["status", "level", "type"])),
  }));

const normalizeAudit = (records: unknown): AuditItemView[] =>
  asRecords(records).map((item) => ({
    action: pickText(item, ["action", "title", "event"], "Activity"),
    actor: pickText(item, ["actor", "admin_name", "user_name", "created_by"], "System"),
    at: pickOptionalText(item, ["at", "created_at", "timestamp"]),
    detail: pickText(item, ["detail", "description", "message"], "No detail provided."),
  }));

const normalizeHistory = (records: unknown): HistoryItemView[] =>
  asRecords(records).map((item) => ({
    label: pickText(item, ["label", "title", "action", "payment_method"], "Entry"),
    detail: pickText(item, ["detail", "description", "message", "reason"], "No detail provided."),
    meta: pickText(item, ["meta", "reference", "transaction_reference", "method"], "Settlement"),
    at: pickOptionalText(item, ["at", "created_at", "paid_at", "timestamp"]),
    amount: pickNumber(item, ["amount", "paid_amount"]),
    statusLabel: prettyLabel(pickOptionalText(item, ["status", "state"]) || "recorded", "Recorded"),
    tone: normalizeTone(pickOptionalText(item, ["status", "state", "result"])),
  }));

const normalizeInvoiceDetail = (data?: SettlementInvoiceDetailData): InvoiceDetailView | null => {
  if (!data) return null;

  const invoice = asRecord(data.invoice);
  const buyer = asRecord(data.buyer);
  const totals = asRecord(data.totals);
  const billingContact = asRecords(buyer.billing_contact)[0] || {};
  const notesField = pickOptionalText(invoice, ["notes"]);
  const failureReason =
    pickOptionalText(invoice, ["failure_reason"]) || pickOptionalText(totals, ["failure_reason"]);
  const billingAddress = [
    pickOptionalText(billingContact, ["address"]),
    pickOptionalText(billingContact, ["city"]),
    pickOptionalText(billingContact, ["state"]),
    pickOptionalText(billingContact, ["zip_code"]),
    pickOptionalText(billingContact, ["country"]),
  ]
    .filter(Boolean)
    .join(", ");

  return {
    id: toText(firstDefined(invoice, ["id", "invoice_id"]), ""),
    number: pickText(invoice, ["invoice_number"], "Invoice"),
    reference: pickText(invoice, ["reference", "invoice_reference"], "Not available"),
    status: toText(firstDefined(invoice, ["status"]), "pending"),
    buyerName: pickText(buyer, ["full_name", "name", "buyer_name"], "Unknown buyer"),
    buyerCompany: pickOptionalText(buyer, ["company", "company_name"]),
    buyerEmail: pickText(buyer, ["email", "primary_email", "billing_email"], "Not available"),
    buyerPhone: pickText(buyer, ["phone", "mobile", "primary_phone"], "Not available"),
    billingEmail:
      pickOptionalText(buyer, ["billing_email"]) ||
      pickOptionalText(invoice, ["billing_email"]) ||
      pickText(buyer, ["email"], "Not available"),
    billingPhone:
      pickOptionalText(billingContact, ["phone_number"]) ||
      pickOptionalText(buyer, ["billing_phone"]) ||
      pickOptionalText(invoice, ["billing_phone"]) ||
      pickText(buyer, ["phone"], "Not available"),
    bidderNumber:
      pickOptionalText(buyer, ["bidder_number", "registration_number"]) || "Not available",
    address:
      billingAddress ||
      pickOptionalText(buyer, ["address", "billing_address", "full_address"]) ||
      "Not available",
    issuedAt: pickOptionalText(invoice, ["issued_at", "created_at"]),
    dueAt: pickOptionalText(invoice, ["due_at"]),
    dueLabel: pickOptionalText(invoice, ["due_at"])
      ? `Due ${formatDate(pickOptionalText(invoice, ["due_at"]))}`
      : prettyLabel(pickOptionalText(invoice, ["status"]), "Status"),
    hammerTotal: pickNumber(totals, ["hammer_total", "subtotal", "sub_total"]),
    premiumTotal: pickNumber(totals, ["buyer_premium_total"]),
    taxTotal: pickNumber(totals, ["tax_total", "tax", "vat_total"]),
    feesTotal: pickNumber(totals, ["fixed_fees_total"]),
    totalDue: pickNumber(totals, ["grand_total", "total_due", "total"]),
    totalPaid: pickNumber(totals, ["total_paid", "paid_total"]),
    balanceDue: pickNumber(totals, ["outstanding_balance", "balance_due"]),
    lots: asRecords(data.lots).map((lot) => ({
      lotNumber: toText(firstDefined(lot, ["lot_number"]), "Not available"),
      title: pickText(lot, ["title", "lot_title"], "Untitled lot"),
      hammer: pickNumber(lot, ["hammer_price", "hammer", "sale_value"]),
      premium: pickNumber(lot, ["buyer_premium", "premium"]),
      tax: pickNumber(lot, ["tax_amount", "tax", "vat"]),
      fees: pickNumber(lot, ["fees", "fixed_fees_total"]),
      adjustment: pickNumber(lot, ["adjustment_amount", "adjustment", "adjustments", "discount"]),
      total: pickNumber(lot, ["total_amount", "line_total", "total", "grand_total"]),
      note: pickOptionalText(lot, ["adjustment_reason", "note", "notes"]),
    })),
    payments: normalizeHistory(data.payments),
    attempts: normalizeHistory(invoice.payment_attempts),
    sentHistory: normalizeHistory(invoice.sent_history),
    documents: normalizeDocuments(
      data.documents || {
        pdf_url: pickOptionalText(invoice, ["invoice_pdf_url"]),
        export_url: pickOptionalText(invoice, ["export_url"]),
      }
    ),
    notes: normalizeWarnings(data.warnings, [notesField, failureReason]),
    failureReason,
    timeline: normalizeTimeline(data.timeline),
    auditTrail: normalizeAudit(data.activity),
  };
};

const normalizePayoutDetail = (data?: SettlementPayoutDetailData): PayoutDetailView | null => {
  if (!data) return null;

  const payout = asRecord(data.payout);
  const consignor = asRecord(data.consignor);
  const totals = asRecord(data.totals);
  const notesField = pickOptionalText(payout, ["notes"]);
  const failureReason =
    pickOptionalText(payout, ["failure_reason"]) || pickOptionalText(totals, ["failure_reason"]);

  const bankSummary = [
    pickOptionalText(consignor, ["bank_name"]),
    pickOptionalText(consignor, ["bank_account_holder"]),
    pickOptionalText(consignor, ["bank_account_last4"])
      ? `****${pickOptionalText(consignor, ["bank_account_last4"])}`
      : undefined,
  ]
    .filter(Boolean)
    .join(" | ");

  return {
    id: toText(firstDefined(payout, ["id", "payout_id"]), ""),
    reference: pickText(payout, ["payout_reference", "reference"], "Payout"),
    status: toText(firstDefined(payout, ["status"]), "pending"),
    consignorName: pickText(consignor, ["name", "full_name", "consignor_name"], "Unknown consignor"),
    consignorCompany: pickOptionalText(consignor, ["company", "company_name"]),
    consignorEmail: pickText(consignor, ["email", "primary_email"], "Not available"),
    consignorPhone: pickText(consignor, ["phone", "mobile"], "Not available"),
    consignorNumber:
      pickOptionalText(consignor, ["consignor_number", "reference_number"]) || "Not available",
    address:
      pickOptionalText(consignor, ["address", "full_address", "billing_address"]) ||
      "Not available",
    payoutMethod:
      pickOptionalText(payout, ["payment_method"]) ||
      pickOptionalText(consignor, ["preferred_payout_method"]) ||
      "Not available",
    bankSummary:
      bankSummary ||
      pickOptionalText(consignor, ["bank_summary", "bank_account_summary", "bank_name"]) ||
      "Not available",
    beneficiary:
      pickOptionalText(consignor, ["bank_account_holder", "beneficiary_name", "account_name", "name"]) || "Not available",
    taxReference: pickOptionalText(consignor, ["tax_reference", "tin"]),
    grossProceeds: pickNumber(totals, ["gross_sale_amount", "gross_proceeds", "total_sale", "gross_total"]),
    commissionTotal: pickNumber(totals, ["commission_amount"]),
    withholdingTotal: pickNumber(totals, ["tax_withholding_amount", "withholding_total"]),
    adjustmentsTotal: pickNumber(totals, ["adjustments_total"]),
    deductionsTotal: pickNumber(totals, ["total_deductions", "deductions_total"]),
    netPayout: pickNumber(totals, ["net_payout", "net_total"]),
    lots: asRecords(data.lots).map((lot) => ({
      lotNumber: toText(firstDefined(lot, ["lot_number"]), "Not available"),
      title: pickText(lot, ["title", "lot_title"], "Untitled lot"),
      saleValue: pickNumber(lot, ["gross_sale_amount", "gross", "sale_value", "hammer_price"]),
      commission: pickNumber(lot, ["commission", "commission_amount"]),
      withholding: pickNumber(lot, ["tax_withholding_amount", "withholding", "withholding_tax", "tax_withholding"]),
      adjustment: pickNumber(lot, ["adjustment", "adjustments"]),
      net: pickNumber(lot, ["net_amount", "net", "net_payout"]),
      note: pickOptionalText(lot, ["note", "notes"]),
    })),
    createdAt: pickOptionalText(payout, ["created_at"]),
    approvedAt: pickOptionalText(payout, ["approved_at"]),
    initiatedAt: pickOptionalText(payout, ["initiated_at", "sent_at"]),
    paidAt: pickOptionalText(payout, ["paid_at"]),
    failedAt: pickOptionalText(payout, ["failed_at"]),
    documents: normalizeDocuments(
      data.documents || {
        export_url: pickOptionalText(payout, ["export_url"]),
      }
    ),
    notes: normalizeWarnings(data.warnings, [notesField, failureReason]),
    failureReason,
    timeline: normalizeTimeline(data.timeline),
    auditTrail: normalizeAudit(data.activity),
  };
};

const summarizeFailures = (failures: SettlementActionFailure[] | undefined) =>
  (failures || [])
    .slice(0, 3)
    .map((failure) => pickOptionalText(asRecord(failure), ["reason"]) || "Unknown failure")
    .join(" | ");

const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
};

export default function SettlementWorkspaceTab({ auction }: SettlementTabProps) {
  const currency = auction.auction.currency || "USD";
  const auctionLabel = auction.auction.name || `Auction #${auction.auction.id}`;
  const [invoiceId, setInvoiceId] = useState<string | number | null>(null);
  const [payoutId, setPayoutId] = useState<string | number | null>(null);
  const [isExportingInvoices, setIsExportingInvoices] = useState(false);
  const [isExportingPayouts, setIsExportingPayouts] = useState(false);

  const settlement = useAuctionSettlement(auction.auction.id, {
    selectedInvoiceId: invoiceId,
    selectedPayoutId: payoutId,
  });

  const summary = normalizeSummary(settlement.summary.data);
  const invoiceRows = (settlement.invoices.data?.items || []).map(normalizeInvoiceRow);
  const payoutRows = (settlement.payouts.data?.items || []).map(normalizePayoutRow);
  const invoiceDetail = normalizeInvoiceDetail(settlement.invoiceDetail.data);
  const payoutDetail = normalizePayoutDetail(settlement.payoutDetail.data);
  const selectedInvoiceRow = invoiceRows.find((item) => item.id === String(invoiceId));
  const selectedPayoutRow = payoutRows.find((item) => item.id === String(payoutId));
  const invoicePdfDocument = invoiceDetail?.documents.find((document) =>
    /pdf/i.test(document.label)
  );
  const payoutStatementDocument =
    payoutDetail?.documents.find((document) => /statement|export/i.test(document.label)) ||
    payoutDetail?.documents[0];

  const handleSendInvoices = async (invoiceIds?: Array<string | number>, forceResend?: boolean) => {
    try {
      const result: SettlementActionResult = await settlement.sendInvoices.mutateAsync(
        invoiceIds?.length ? { invoice_ids: invoiceIds, force_resend: forceResend } : undefined
      );
      toast.success("Invoice send run completed.", {
        description: `Success: ${toNumber(result.success_count)} | Skipped: ${toNumber(
          result.skipped_count
        )} | Failed: ${toNumber(result.failed_count)}${
          summarizeFailures(result.failures) ? ` | ${summarizeFailures(result.failures)}` : ""
        }`,
      });
    } catch (error: unknown) {
      toast.error("Failed to send settlement invoices.", {
        description: getMessage(error),
      });
    }
  };

  const handleInitiatePayouts = async (
    payoutIds?: Array<string | number>,
    forceRetry?: boolean
  ) => {
    try {
      const result: SettlementActionResult = await settlement.initiatePayouts.mutateAsync(
        payoutIds?.length ? { payout_ids: payoutIds, force_retry: forceRetry } : undefined
      );
      toast.success("Payout initiation completed.", {
        description: `Success: ${toNumber(result.success_count)} | Skipped: ${toNumber(
          result.skipped_count
        )} | Failed: ${toNumber(result.failed_count)}${
          summarizeFailures(result.failures) ? ` | ${summarizeFailures(result.failures)}` : ""
        }`,
      });
    } catch (error: unknown) {
      toast.error("Failed to initiate payouts.", {
        description: getMessage(error),
      });
    }
  };

  const handleInvoiceExport = async () => {
    try {
      setIsExportingInvoices(true);
      const file = await auctionService.exportAuctionSettlementInvoices(auction.auction.id, {
        format: "csv",
      });
      downloadBlob(file.blob, file.filename || `auction-${auction.auction.id}-settlement-invoices.csv`);
    } catch (error: unknown) {
      toast.error("Failed to export invoice settlement data.", {
        description: getMessage(error),
      });
    } finally {
      setIsExportingInvoices(false);
    }
  };

  const handlePayoutExport = async () => {
    try {
      setIsExportingPayouts(true);
      const file = await auctionService.exportAuctionSettlementPayouts(auction.auction.id, {
        format: "csv",
      });
      downloadBlob(file.blob, file.filename || `auction-${auction.auction.id}-settlement-payouts.csv`);
    } catch (error: unknown) {
      toast.error("Failed to export payout settlement data.", {
        description: getMessage(error),
      });
    } finally {
      setIsExportingPayouts(false);
    }
  };

  const openDocument = (document: DocumentItemView) => {
    if (!document.url) {
      toast.info("Document link unavailable for this record.");
      return;
    }
    window.open(document.url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <Tabs defaultValue="bidder" className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Settlement Management</h2>
            <p className="text-sm text-muted-foreground">
              Review buyer invoices and seller payouts for {auctionLabel}.
            </p>
            <p className="text-xs text-muted-foreground">
              Auction closed {formatDate(auction.auction.end_at)}.
            </p>
          </div>
          <div className="w-full">
            <TabsList className="grid h-auto w-full grid-cols-1 gap-1 rounded-lg border border-border bg-transparent p-1 sm:grid-cols-2">
              <TabsTrigger value="bidder" className="px-4 py-2 text-sm font-medium">
                Bidder Settlement
              </TabsTrigger>
              <TabsTrigger value="seller" className="px-4 py-2 text-sm font-medium">
                Seller Payouts
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="bidder" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Total sales"
              value={formatCurrency(summary.totalSales, currency)}
              description={`Across ${summary.soldLotsCount} sold lot${summary.soldLotsCount === 1 ? "" : "s"}.`}
              icon={Receipt}
            />
            <SummaryCard
              title="Pending invoices"
              value={`${summary.pendingInvoicesCount}`}
              description={`Sendable ${summary.invoiceSendableCount} | Paid ${summary.invoicePaidCount}`}
              icon={Clock3}
            />
            <SummaryCard
              title="Sendable invoices"
              value={`${summary.invoiceSendableCount}`}
              description="Eligible invoice rows that can be sent now."
              icon={Send}
            />
            <SummaryCard
              title="Paid invoices"
              value={`${summary.invoicePaidCount}`}
              description="Invoice rows already settled for this auction."
              icon={CheckCircle2}
            />
          </div>

          <Card className="gap-0 overflow-hidden pb-0">
            <CardHeader className="border-b">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Bidder invoices</CardTitle>
                  <CardDescription>
                    Sold-lot invoice rows from the settlement list endpoint.
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button type="button" variant="outline" size="sm" onClick={handleInvoiceExport} disabled={isExportingInvoices}>
                    <Download className="h-4 w-4" />
                    {isExportingInvoices ? "Exporting..." : "Export"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      void handleSendInvoices();
                    }}
                    disabled={settlement.sendInvoices.isPending}
                  >
                    <Send className="h-4 w-4" />
                    {settlement.sendInvoices.isPending ? "Sending..." : "Send all"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-0 py-0">
              {settlement.invoices.isLoading ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  Loading settlement invoices...
                </div>
              ) : settlement.invoices.isError ? (
                <div className="py-12 text-center text-sm text-rose-600">
                  {getMessage(settlement.invoices.error)}
                </div>
              ) : invoiceRows.length ? (
                <>
                  <div className="space-y-3 p-4 md:hidden">
                    {invoiceRows.map((item) => (
                      <div key={`${item.id}-${item.lotNumber}`} className="rounded-xl border border-border/70 bg-background p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-foreground">{item.number}</p>
                            <p className="text-xs text-muted-foreground">
                              Lot {item.lotNumber} · {item.lotTitle}
                            </p>
                          </div>
                          <StatusBadge label={prettyLabel(item.status)} tone={normalizeTone(item.status)} />
                        </div>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Buyer</p>
                            <p className="text-sm font-medium text-foreground">{item.buyerName}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.dueAt ? `Due ${formatDate(item.dueAt)}` : "No due date"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Amounts</p>
                            <p className="text-sm font-medium text-foreground">{formatCurrency(item.amount, currency)}</p>
                            <p className="text-xs text-muted-foreground">
                              Buyer premium {formatCurrency(item.buyerPremiumAmount, currency)}
                            </p>
                          </div>
                        </div>
                        <Button type="button" variant="outline" size="sm" className="mt-4 w-full" onClick={() => setInvoiceId(item.id)}>
                          View
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead>Invoice</TableHead>
                          <TableHead>Lot</TableHead>
                          <TableHead>Buyer</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Buyer premium</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[96px]" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoiceRows.map((item) => (
                          <TableRow key={`${item.id}-${item.lotNumber}`}>
                            <TableCell className="align-top whitespace-normal">
                              <p className="font-medium text-foreground">{item.number}</p>
                              <p className="text-xs text-muted-foreground">{item.paymentMethod || "No payment method"}</p>
                            </TableCell>
                            <TableCell className="align-top whitespace-normal">
                              <p className="font-medium text-foreground">Lot {item.lotNumber}</p>
                              <p className="text-xs text-muted-foreground">{item.lotTitle}</p>
                            </TableCell>
                            <TableCell className="align-top whitespace-normal">
                              <p className="font-medium text-foreground">{item.buyerName}</p>
                              <p className="text-xs text-muted-foreground">{item.dueAt ? `Due ${formatDate(item.dueAt)}` : "No due date"}</p>
                            </TableCell>
                            <TableCell>{formatCurrency(item.amount, currency)}</TableCell>
                            <TableCell>{formatCurrency(item.buyerPremiumAmount, currency)}</TableCell>
                            <TableCell>
                              <StatusBadge label={prettyLabel(item.status)} tone={normalizeTone(item.status)} />
                            </TableCell>
                            <TableCell>
                              <Button type="button" variant="ghost" size="sm" onClick={() => setInvoiceId(item.id)}>
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center">
                  <AlertCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No settlement invoice rows found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seller" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Total sales"
              value={formatCurrency(summary.totalSales, currency)}
              description="Shared settlement total from the summary endpoint."
              icon={Banknote}
            />
            <SummaryCard
              title="Seller commission"
              value={formatCurrency(summary.sellerCommissionAmount, currency)}
              description={`Rate ${summary.sellerCommissionRate}% from ${summary.sellerCommissionRateSource.toLowerCase()}.${
                summary.hasSellerCommissionOverrides ? " Overrides detected." : ""
              }`}
              icon={CreditCard}
            />
            <SummaryCard
              title="Ready payouts"
              value={`${summary.payoutReadyCount}`}
              description={`Processing ${summary.payoutProcessingCount} | Held ${summary.payoutHeldCount}${
                summary.hasMissingPayoutDetails ? " | Missing payout details" : ""
              }`}
              icon={Receipt}
            />
            <SummaryCard
              title="Net payout"
              value={formatCurrency(summary.netPayout, currency)}
              description={`Paid ${summary.payoutPaidCount} payout${summary.payoutPaidCount === 1 ? "" : "s"} so far.`}
              icon={Landmark}
            />
          </div>

          <Card className="gap-0 overflow-hidden pb-0">
            <CardHeader className="border-b">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Consignor payouts</CardTitle>
                  <CardDescription>
                    Payout rows grouped by consignor from the settlement endpoint.
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button type="button" variant="outline" size="sm" onClick={handlePayoutExport} disabled={isExportingPayouts}>
                    <Download className="h-4 w-4" />
                    {isExportingPayouts ? "Exporting..." : "Export payouts"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      void handleInitiatePayouts();
                    }}
                    disabled={settlement.initiatePayouts.isPending}
                  >
                    <Send className="h-4 w-4" />
                    {settlement.initiatePayouts.isPending ? "Initiating..." : "Initiate payouts"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-0 py-0">
              {settlement.payouts.isLoading ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  Loading settlement payouts...
                </div>
              ) : settlement.payouts.isError ? (
                <div className="py-12 text-center text-sm text-rose-600">
                  {getMessage(settlement.payouts.error)}
                </div>
              ) : payoutRows.length ? (
                <>
                  <div className="space-y-3 p-4 md:hidden">
                    {payoutRows.map((item) => (
                      <div key={item.id} className="rounded-xl border border-border/70 bg-background p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-foreground">{item.reference}</p>
                            <p className="text-xs text-muted-foreground">{item.consignorName}</p>
                          </div>
                          <StatusBadge label={prettyLabel(item.status)} tone={normalizeTone(item.status)} />
                        </div>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Totals</p>
                            <p className="text-sm font-medium text-foreground">{formatCurrency(item.totalSale, currency)}</p>
                            <p className="text-xs text-muted-foreground">
                              Net payout {formatCurrency(item.netPayout, currency)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Lots</p>
                            <p className="text-sm font-medium text-foreground">{item.lotsSoldCount}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.dueAt ? `Due ${formatDate(item.dueAt)}` : "No due date"}
                            </p>
                          </div>
                        </div>
                        <Button type="button" variant="outline" size="sm" className="mt-4 w-full" onClick={() => setPayoutId(item.id)}>
                          View details
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead>Payout</TableHead>
                          <TableHead>Consignor</TableHead>
                          <TableHead>Lots</TableHead>
                          <TableHead>Total sale</TableHead>
                          <TableHead>Net payout</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[110px]" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payoutRows.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="align-top whitespace-normal">
                              <p className="font-medium text-foreground">{item.reference}</p>
                              <p className="text-xs text-muted-foreground">{item.paymentMethod || "No payment method"}</p>
                            </TableCell>
                            <TableCell className="align-top whitespace-normal">
                              <p className="font-medium text-foreground">{item.consignorName}</p>
                              <p className="text-xs text-muted-foreground">{item.dueAt ? `Due ${formatDate(item.dueAt)}` : "No due date"}</p>
                            </TableCell>
                            <TableCell>{item.lotsSoldCount}</TableCell>
                            <TableCell>{formatCurrency(item.totalSale, currency)}</TableCell>
                            <TableCell>{formatCurrency(item.netPayout, currency)}</TableCell>
                            <TableCell>
                              <StatusBadge label={prettyLabel(item.status)} tone={normalizeTone(item.status)} />
                            </TableCell>
                            <TableCell>
                              <Button type="button" variant="ghost" size="sm" onClick={() => setPayoutId(item.id)}>
                                View details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center">
                  <AlertCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No settlement payout rows found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Sheet open={!!invoiceId} onOpenChange={(open) => !open && setInvoiceId(null)}>
        <SheetContent className="w-full sm:max-w-5xl">
          <SheetHeader className="border-b px-4 py-4 sm:px-6">
            <div className="pr-10">
              <div className="flex flex-wrap items-center gap-2">
                <SheetTitle className="text-xl">
                  {invoiceDetail?.number || selectedInvoiceRow?.number || "Invoice"}
                </SheetTitle>
                <StatusBadge
                  label={prettyLabel(invoiceDetail?.status || selectedInvoiceRow?.status || "pending")}
                  tone={normalizeTone(invoiceDetail?.status || selectedInvoiceRow?.status)}
                />
              </div>
              <SheetDescription className="mt-2">
                Buyer settlement workspace for {invoiceDetail?.buyerName || selectedInvoiceRow?.buyerName || "buyer"}.
              </SheetDescription>
            </div>
          </SheetHeader>
          <div className="overflow-y-auto p-4 sm:p-6">
            {settlement.invoiceDetail.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading invoice details...</p>
            ) : settlement.invoiceDetail.isError ? (
              <p className="text-sm text-rose-600">{getMessage(settlement.invoiceDetail.error)}</p>
            ) : invoiceDetail ? (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
                <div className="space-y-6">
                  <Card className="gap-0">
                    <CardHeader className="border-b">
                      <CardTitle>Buyer and billing details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 px-4 py-4 sm:px-6">
                      <StatusBadge label={invoiceDetail.dueLabel} tone={invoiceDetail.balanceDue > 0 ? "warning" : "success"} />
                      <InfoGrid
                        items={[
                          { label: "Buyer", value: invoiceDetail.buyerName },
                          { label: "Company", value: invoiceDetail.buyerCompany || "Not available" },
                          { label: "Bidder number", value: invoiceDetail.bidderNumber },
                          { label: "Buyer email", value: invoiceDetail.buyerEmail },
                          { label: "Buyer phone", value: invoiceDetail.buyerPhone },
                          { label: "Billing email", value: invoiceDetail.billingEmail },
                          { label: "Billing phone", value: invoiceDetail.billingPhone },
                          { label: "Invoice number", value: invoiceDetail.number },
                          { label: "Reference", value: invoiceDetail.reference },
                          { label: "Issued", value: formatDateTime(invoiceDetail.issuedAt) },
                          { label: "Due", value: formatDateTime(invoiceDetail.dueAt) },
                          { label: "Address", value: invoiceDetail.address },
                        ]}
                      />
                    </CardContent>
                  </Card>

                  <Card className="gap-0">
                    <CardHeader className="border-b">
                      <CardTitle>Line-item breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 px-4 py-4 sm:px-6">
                      <div className="space-y-3 md:hidden">
                        {invoiceDetail.lots.map((lot) => (
                          <div key={`${invoiceDetail.id}-${lot.lotNumber}`} className="rounded-xl border border-border/70 bg-background p-4">
                            <p className="font-medium text-foreground">Lot {lot.lotNumber}</p>
                            <p className="text-xs text-muted-foreground">{lot.title}</p>
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                              <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Charges</p>
                                <p className="text-sm text-foreground">Hammer {formatCurrency(lot.hammer, currency)}</p>
                                <p className="text-sm text-foreground">Buyer premium {formatCurrency(lot.premium, currency)}</p>
                                <p className="text-sm text-foreground">Tax {formatCurrency(lot.tax, currency)}</p>
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Adjustments</p>
                                <p className="text-sm text-foreground">Fees {formatCurrency(lot.fees, currency)}</p>
                                <p className="text-sm text-foreground">Adjustment {formatCurrency(lot.adjustment, currency)}</p>
                                <p className="text-sm font-medium text-foreground">Total {formatCurrency(lot.total, currency)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="hidden md:block">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Lot</TableHead>
                              <TableHead>Hammer</TableHead>
                              <TableHead>Buyer premium</TableHead>
                              <TableHead>Tax</TableHead>
                              <TableHead>Fees</TableHead>
                              <TableHead>Adjustment</TableHead>
                              <TableHead>Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {invoiceDetail.lots.map((lot) => (
                              <TableRow key={`${invoiceDetail.id}-${lot.lotNumber}`}>
                                <TableCell className="align-top whitespace-normal">
                                  <p className="font-medium text-foreground">Lot {lot.lotNumber}</p>
                                  <p className="text-xs text-muted-foreground">{lot.title}</p>
                                </TableCell>
                                <TableCell>{formatCurrency(lot.hammer, currency)}</TableCell>
                                <TableCell>{formatCurrency(lot.premium, currency)}</TableCell>
                                <TableCell>{formatCurrency(lot.tax, currency)}</TableCell>
                                <TableCell>{formatCurrency(lot.fees, currency)}</TableCell>
                                <TableCell>{formatCurrency(lot.adjustment, currency)}</TableCell>
                                <TableCell>{formatCurrency(lot.total, currency)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      <InfoGrid
                        items={[
                          { label: "Hammer total", value: formatCurrency(invoiceDetail.hammerTotal, currency) },
                          { label: "Buyer premium total", value: formatCurrency(invoiceDetail.premiumTotal, currency) },
                          { label: "Tax total", value: formatCurrency(invoiceDetail.taxTotal, currency) },
                          { label: "Fees total", value: formatCurrency(invoiceDetail.feesTotal, currency) },
                          { label: "Total due", value: formatCurrency(invoiceDetail.totalDue, currency) },
                          { label: "Total paid", value: formatCurrency(invoiceDetail.totalPaid, currency) },
                          { label: "Balance due", value: formatCurrency(invoiceDetail.balanceDue, currency) },
                        ]}
                      />
                    </CardContent>
                  </Card>

                  <Card className="gap-0">
                    <CardHeader className="border-b">
                      <CardTitle>Payments and activity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 px-4 py-4 sm:px-6">
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">Payments</h4>
                        <HistoryList items={invoiceDetail.payments} currency={currency} emptyMessage="No payments recorded." />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">Payment attempts</h4>
                        <HistoryList items={invoiceDetail.attempts} currency={currency} emptyMessage="No payment attempts recorded." />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">Sent history</h4>
                        <HistoryList items={invoiceDetail.sentHistory} currency={currency} emptyMessage="No send history recorded." />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">Timeline</h4>
                        <TimelineList items={invoiceDetail.timeline} />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="gap-0">
                    <CardHeader className="border-b">
                      <CardTitle>Action panel</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2 px-4 py-4 sm:px-6">
                      <Button
                        type="button"
                        onClick={() => handleSendInvoices([invoiceDetail.id || String(invoiceId)], true)}
                      >
                        <Send className="h-4 w-4" />
                        Resend invoice
                      </Button>
                      <Button type="button" variant="outline" onClick={() => toast.info("Mark paid endpoint is not part of the current settlement contract.")}>
                        <CheckCircle2 className="h-4 w-4" />
                        Mark paid
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (invoicePdfDocument) {
                            openDocument(invoicePdfDocument);
                            return;
                          }

                          if (selectedInvoiceRow?.pdfUrl) {
                            window.open(selectedInvoiceRow.pdfUrl, "_blank", "noopener,noreferrer");
                            return;
                          }

                          toast.info("Invoice PDF URL unavailable.");
                        }}
                      >
                        <Download className="h-4 w-4" />
                        Download PDF
                      </Button>
                      <Button type="button" variant="outline" onClick={() => toast.info("Add note is not yet exposed by the current settlement UI.")}>
                        <MessageSquareText className="h-4 w-4" />
                        Add note
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="gap-0">
                    <CardHeader className="border-b">
                      <CardTitle>Documents</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 px-4 py-4 sm:px-6">
                      {invoiceDetail.documents.map((document) => (
                        <div key={`${document.label}-${document.description}`} className="rounded-lg border border-border/70 bg-background p-3">
                          <p className="text-sm font-medium text-foreground">{document.label}</p>
                          <p className="text-sm text-muted-foreground">{document.description}</p>
                          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => openDocument(document)}>
                            <FileText className="h-4 w-4" />
                            {document.actionLabel}
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="gap-0">
                    <CardHeader className="border-b">
                      <CardTitle>Warnings and notes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 px-4 py-4 sm:px-6">
                      <NotesList items={invoiceDetail.notes} />
                    </CardContent>
                  </Card>

                  <Card className="gap-0">
                    <CardHeader className="border-b">
                      <CardTitle>Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 py-4 sm:px-6">
                      <AuditList items={invoiceDetail.auditTrail} />
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Invoice details unavailable.</p>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={!!payoutId} onOpenChange={(open) => !open && setPayoutId(null)}>
        <SheetContent className="w-full sm:max-w-5xl">
          <SheetHeader className="border-b px-4 py-4 sm:px-6">
            <div className="pr-10">
              <div className="flex flex-wrap items-center gap-2">
                <SheetTitle className="text-xl">
                  {payoutDetail?.reference || selectedPayoutRow?.reference || "Payout"}
                </SheetTitle>
                <StatusBadge
                  label={prettyLabel(payoutDetail?.status || selectedPayoutRow?.status || "pending")}
                  tone={normalizeTone(payoutDetail?.status || selectedPayoutRow?.status)}
                />
              </div>
              <SheetDescription className="mt-2">
                Seller settlement workspace for {payoutDetail?.consignorName || selectedPayoutRow?.consignorName || "consignor"}.
              </SheetDescription>
            </div>
          </SheetHeader>
          <div className="overflow-y-auto p-4 sm:p-6">
            {settlement.payoutDetail.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading payout details...</p>
            ) : settlement.payoutDetail.isError ? (
              <p className="text-sm text-rose-600">{getMessage(settlement.payoutDetail.error)}</p>
            ) : payoutDetail ? (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
                <div className="space-y-6">
                  <Card className="gap-0">
                    <CardHeader className="border-b">
                      <CardTitle>Consignor and payout details</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 py-4 sm:px-6">
                      <InfoGrid
                        items={[
                          { label: "Consignor", value: payoutDetail.consignorName },
                          { label: "Company", value: payoutDetail.consignorCompany || "Not available" },
                          { label: "Consignor number", value: payoutDetail.consignorNumber },
                          { label: "Consignor email", value: payoutDetail.consignorEmail },
                          { label: "Consignor phone", value: payoutDetail.consignorPhone },
                          { label: "Payout method", value: payoutDetail.payoutMethod },
                          { label: "Bank summary", value: payoutDetail.bankSummary },
                          { label: "Beneficiary", value: payoutDetail.beneficiary },
                          { label: "Tax reference", value: payoutDetail.taxReference || "Not available" },
                          { label: "Address", value: payoutDetail.address },
                        ]}
                      />
                    </CardContent>
                  </Card>

                  <Card className="gap-0">
                    <CardHeader className="border-b">
                      <CardTitle>Line-item breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 px-4 py-4 sm:px-6">
                      <div className="space-y-3 md:hidden">
                        {payoutDetail.lots.map((lot) => (
                          <div key={`${payoutDetail.id}-${lot.lotNumber}`} className="rounded-xl border border-border/70 bg-background p-4">
                            <p className="font-medium text-foreground">Lot {lot.lotNumber}</p>
                            <p className="text-xs text-muted-foreground">{lot.title}</p>
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                              <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Gross</p>
                                <p className="text-sm text-foreground">Sale {formatCurrency(lot.saleValue, currency)}</p>
                                <p className="text-sm text-foreground">Commission {formatCurrency(lot.commission, currency)}</p>
                                <p className="text-sm text-foreground">Withholding {formatCurrency(lot.withholding, currency)}</p>
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Net</p>
                                <p className="text-sm text-foreground">Adjustment {formatCurrency(lot.adjustment, currency)}</p>
                                <p className="text-sm font-medium text-foreground">Net {formatCurrency(lot.net, currency)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="hidden md:block">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Lot</TableHead>
                              <TableHead>Gross sale</TableHead>
                              <TableHead>Commission</TableHead>
                              <TableHead>Tax withholding</TableHead>
                              <TableHead>Adjustment</TableHead>
                              <TableHead>Net</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {payoutDetail.lots.map((lot) => (
                              <TableRow key={`${payoutDetail.id}-${lot.lotNumber}`}>
                                <TableCell className="align-top whitespace-normal">
                                  <p className="font-medium text-foreground">Lot {lot.lotNumber}</p>
                                  <p className="text-xs text-muted-foreground">{lot.title}</p>
                                </TableCell>
                                <TableCell>{formatCurrency(lot.saleValue, currency)}</TableCell>
                                <TableCell>{formatCurrency(lot.commission, currency)}</TableCell>
                                <TableCell>{formatCurrency(lot.withholding, currency)}</TableCell>
                                <TableCell>{formatCurrency(lot.adjustment, currency)}</TableCell>
                                <TableCell>{formatCurrency(lot.net, currency)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      <InfoGrid
                        items={[
                          { label: "Gross proceeds", value: formatCurrency(payoutDetail.grossProceeds, currency) },
                          { label: "Commission total", value: formatCurrency(payoutDetail.commissionTotal, currency) },
                          { label: "Withholding total", value: formatCurrency(payoutDetail.withholdingTotal, currency) },
                          { label: "Adjustments total", value: formatCurrency(payoutDetail.adjustmentsTotal, currency) },
                          { label: "Deductions total", value: formatCurrency(payoutDetail.deductionsTotal, currency) },
                          { label: "Final net payout", value: formatCurrency(payoutDetail.netPayout, currency) },
                          { label: "Created", value: formatDateTime(payoutDetail.createdAt) },
                          { label: "Approved", value: formatDateTime(payoutDetail.approvedAt) },
                          { label: "Initiated", value: formatDateTime(payoutDetail.initiatedAt) },
                          { label: "Paid", value: formatDateTime(payoutDetail.paidAt) },
                          { label: "Failed", value: formatDateTime(payoutDetail.failedAt) },
                        ]}
                      />
                    </CardContent>
                  </Card>

                  <Card className="gap-0">
                    <CardHeader className="border-b">
                      <CardTitle>Timeline</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 py-4 sm:px-6">
                      <TimelineList items={payoutDetail.timeline} />
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="gap-0">
                    <CardHeader className="border-b">
                      <CardTitle>Action panel</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2 px-4 py-4 sm:px-6">
                      <Button
                        type="button"
                        onClick={() =>
                          handleInitiatePayouts(
                            [payoutDetail.id || String(payoutId)],
                            normalizeTone(payoutDetail.status) === "danger"
                          )
                        }
                      >
                        <RotateCcw className="h-4 w-4" />
                        Retry payout
                      </Button>
                      <Button type="button" variant="outline" onClick={() => toast.info("Hold payout is not yet exposed by the current settlement UI.")}>
                        <ShieldAlert className="h-4 w-4" />
                        Hold payout
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (payoutStatementDocument) {
                            openDocument(payoutStatementDocument);
                            return;
                          }

                          if (selectedPayoutRow?.exportUrl) {
                            window.open(selectedPayoutRow.exportUrl, "_blank", "noopener,noreferrer");
                            return;
                          }

                          handlePayoutExport();
                        }}
                      >
                        <Download className="h-4 w-4" />
                        Download statement
                      </Button>
                      <Button type="button" variant="outline" onClick={() => toast.info("Add note is not yet exposed by the current settlement UI.")}>
                        <MessageSquareText className="h-4 w-4" />
                        Add note
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="gap-0">
                    <CardHeader className="border-b">
                      <CardTitle>Documents</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 px-4 py-4 sm:px-6">
                      {payoutDetail.documents.map((document) => (
                        <div key={`${document.label}-${document.description}`} className="rounded-lg border border-border/70 bg-background p-3">
                          <p className="text-sm font-medium text-foreground">{document.label}</p>
                          <p className="text-sm text-muted-foreground">{document.description}</p>
                          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => openDocument(document)}>
                            <FileText className="h-4 w-4" />
                            {document.actionLabel}
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="gap-0">
                    <CardHeader className="border-b">
                      <CardTitle>Warnings and notes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 px-4 py-4 sm:px-6">
                      <NotesList items={payoutDetail.notes} />
                    </CardContent>
                  </Card>

                  <Card className="gap-0">
                    <CardHeader className="border-b">
                      <CardTitle>Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 py-4 sm:px-6">
                      <AuditList items={payoutDetail.auditTrail} />
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Payout details unavailable.</p>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
