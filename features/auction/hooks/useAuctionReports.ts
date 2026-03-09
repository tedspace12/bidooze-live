import { useMutation, useQuery } from "@tanstack/react-query";

import type {
  AuctionReportActivityParams,
  AuctionReportBiddersParams,
  AuctionReportConsignorsParams,
  AuctionReportExportFormat,
  AuctionReportLotsParams,
} from "../report-types";
import { auctionReportService } from "../services/auctionReportService";

interface QueryOptions {
  enabled?: boolean;
}

export const useAuctionReportSummary = (
  auctionId: string | number,
  options?: QueryOptions
) =>
  useQuery({
    queryKey: ["auction", auctionId, "reports", "summary"],
    queryFn: () => auctionReportService.getAuctionReportSummary(auctionId),
    enabled: !!auctionId && (options?.enabled ?? true),
  });

export const useAuctionReportLotPerformance = (
  auctionId: string | number,
  params?: AuctionReportLotsParams,
  options?: QueryOptions
) =>
  useQuery({
    queryKey: ["auction", auctionId, "reports", "lots", params],
    queryFn: () => auctionReportService.getAuctionReportLotPerformance(auctionId, params),
    enabled: !!auctionId && (options?.enabled ?? true),
  });

export const useAuctionReportActivity = (
  auctionId: string | number,
  params?: AuctionReportActivityParams,
  options?: QueryOptions
) =>
  useQuery({
    queryKey: ["auction", auctionId, "reports", "activity", params],
    queryFn: () => auctionReportService.getAuctionReportActivity(auctionId, params),
    enabled: !!auctionId && (options?.enabled ?? true),
  });

export const useAuctionReportBidders = (
  auctionId: string | number,
  params?: AuctionReportBiddersParams,
  options?: QueryOptions
) =>
  useQuery({
    queryKey: ["auction", auctionId, "reports", "bidders", params],
    queryFn: () => auctionReportService.getAuctionReportBidders(auctionId, params),
    enabled: !!auctionId && (options?.enabled ?? true),
  });

export const useAuctionReportFinancials = (
  auctionId: string | number,
  options?: QueryOptions
) =>
  useQuery({
    queryKey: ["auction", auctionId, "reports", "financials"],
    queryFn: () => auctionReportService.getAuctionReportFinancials(auctionId),
    enabled: !!auctionId && (options?.enabled ?? true),
  });

export const useAuctionReportConsignors = (
  auctionId: string | number,
  params?: AuctionReportConsignorsParams,
  options?: QueryOptions
) =>
  useQuery({
    queryKey: ["auction", auctionId, "reports", "consignors", params],
    queryFn: () => auctionReportService.getAuctionReportConsignors(auctionId, params),
    enabled: !!auctionId && (options?.enabled ?? true),
  });

export const useAuctionReportExceptions = (
  auctionId: string | number,
  options?: QueryOptions
) =>
  useQuery({
    queryKey: ["auction", auctionId, "reports", "exceptions"],
    queryFn: () => auctionReportService.getAuctionReportExceptions(auctionId),
    enabled: !!auctionId && (options?.enabled ?? true),
  });

export const useAuctionReportSummaryExport = (auctionId: string | number) =>
  useMutation({
    mutationFn: (params?: { format?: AuctionReportExportFormat }) =>
      auctionReportService.exportAuctionReportSummary(auctionId, params),
  });

export const useAuctionReportLotsExport = (auctionId: string | number) =>
  useMutation({
    mutationFn: (params?: AuctionReportLotsParams & { format?: AuctionReportExportFormat }) =>
      auctionReportService.exportAuctionReportLots(auctionId, params),
  });

export const useAuctionReportBiddersExport = (auctionId: string | number) =>
  useMutation({
    mutationFn: (params?: AuctionReportBiddersParams & { format?: AuctionReportExportFormat }) =>
      auctionReportService.exportAuctionReportBidders(auctionId, params),
  });

export const useAuctionReportSettlementExport = (auctionId: string | number) =>
  useMutation({
    mutationFn: (params?: { format?: AuctionReportExportFormat }) =>
      auctionReportService.exportAuctionReportSettlement(auctionId, params),
  });

export const useAuctionReportFullExport = (auctionId: string | number) =>
  useMutation({
    mutationFn: (params?: { format?: AuctionReportExportFormat }) =>
      auctionReportService.exportAuctionReportFull(auctionId, params),
  });

