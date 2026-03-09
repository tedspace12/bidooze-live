import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { auctionService } from "../services/auctionService";
import type {
  SettlementInvoiceListParams,
  SettlementPayoutListParams,
} from "../settlement-types";

interface UseAuctionSettlementOptions {
  invoiceParams?: SettlementInvoiceListParams;
  payoutParams?: SettlementPayoutListParams;
  selectedInvoiceId?: string | number | null;
  selectedPayoutId?: string | number | null;
}

export const useAuctionSettlement = (
  auctionId: string | number,
  options: UseAuctionSettlementOptions = {}
) => {
  const qc = useQueryClient();
  const { invoiceParams, payoutParams, selectedInvoiceId, selectedPayoutId } = options;

  const invalidateSettlement = () =>
    qc.invalidateQueries({ queryKey: ["auction", auctionId, "settlement"] });

  return {
    summary: useQuery({
      queryKey: ["auction", auctionId, "settlement", "summary"],
      queryFn: () => auctionService.getAuctionSettlementSummary(auctionId),
      enabled: !!auctionId,
    }),

    invoices: useQuery({
      queryKey: ["auction", auctionId, "settlement", "invoices", invoiceParams ?? {}],
      queryFn: () => auctionService.getAuctionSettlementInvoices(auctionId, invoiceParams),
      enabled: !!auctionId,
    }),

    invoiceDetail: useQuery({
      queryKey: ["auction", auctionId, "settlement", "invoices", selectedInvoiceId, "detail"],
      queryFn: () => auctionService.getAuctionSettlementInvoice(auctionId, selectedInvoiceId as string | number),
      enabled: !!auctionId && !!selectedInvoiceId,
    }),

    payouts: useQuery({
      queryKey: ["auction", auctionId, "settlement", "payouts", payoutParams ?? {}],
      queryFn: () => auctionService.getAuctionSettlementPayouts(auctionId, payoutParams),
      enabled: !!auctionId,
    }),

    payoutDetail: useQuery({
      queryKey: ["auction", auctionId, "settlement", "payouts", selectedPayoutId, "detail"],
      queryFn: () => auctionService.getAuctionSettlementPayout(auctionId, selectedPayoutId as string | number),
      enabled: !!auctionId && !!selectedPayoutId,
    }),

    sendInvoices: useMutation({
      mutationFn: (payload?: {
        invoice_ids?: Array<string | number>;
        status?: Array<"draft" | "pending" | "failed">;
        force_resend?: boolean;
      }) => auctionService.sendAuctionSettlementInvoices(auctionId, payload),
      onSuccess: invalidateSettlement,
    }),

    initiatePayouts: useMutation({
      mutationFn: (payload?: {
        payout_ids?: Array<string | number>;
        payment_method?: "manual_transfer" | "bank_transfer" | "escrow_release";
        due_at?: string;
        notes?: string;
        force_retry?: boolean;
      }) => auctionService.initiateAuctionSettlementPayouts(auctionId, payload),
      onSuccess: invalidateSettlement,
    }),
  };
};
