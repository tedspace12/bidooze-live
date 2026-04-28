import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../services/adminService";
import { toast } from "sonner";

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
};

export const useAdmin = () => {
  const queryClient = useQueryClient();

  const useDashboardStats = () => {
    return useQuery({
      queryKey: ["admin", "stats"],
      queryFn: () => adminService.getDashboardStats(),
    });
  };

  const useAuctioneerStats = () => {
    return useQuery({
      queryKey: ["admin", "auctioneer-stats"],
      queryFn: () => adminService.getAuctioneerStats(),
    });
  };

  const useBidderStatistics = () => {
    return useQuery({
      queryKey: ["admin", "bidder-statistics"],
      queryFn: () => adminService.getBidderStatistics(),
    });
  };

  const usePendingApplications = () => {
    return useQuery({
      queryKey: ["admin", "pending-applications"],
      queryFn: () => adminService.getPendingApplications(),
    });
  };

  const useAuctioneers = (params?: { status?: string; search?: string; page?: number; per_page?: number }) => {
    return useQuery({
      queryKey: ["admin", "auctioneers", params],
      queryFn: () => adminService.getAuctioneers(params),
    });
  };

  const useActivityLogs = (params?: {
    page?: number;
    per_page?: number;
    action?: string;
    entity_type?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
  }) => {
    return useQuery({
      queryKey: ["admin", "activity-logs", params],
      queryFn: () => adminService.getActivityLogs(params),
    });
  };

  const useActivityLogDetail = (id?: string, enabled?: boolean) => {
    return useQuery({
      queryKey: ["admin", "activity-logs", id],
      queryFn: () => adminService.getActivityLogDetail(String(id)),
      enabled: !!id && !!enabled,
    });
  };

  const useBidders = (params?: {
    status?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }) => {
    return useQuery({
      queryKey: ["admin", "bidders", params],
      queryFn: () => adminService.getBidders(params),
    });
  };

  const useBidderDetails = (id?: number) => {
    return useQuery({
      queryKey: ["admin", "bidder", id],
      queryFn: () => adminService.getBidder(Number(id)),
      enabled: !!id,
    });
  };

  const approveAuctioneer = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) =>
      adminService.approveAuctioneer(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      toast.success("Auctioneer application approved successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to approve auctioneer"));
    },
  });

  const rejectAuctioneer = useMutation({
    mutationFn: ({ id, reason, notes }: { id: number; reason: string; notes?: string }) =>
      adminService.rejectAuctioneer(id, reason, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      toast.success("Auctioneer application rejected");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to reject auctioneer"));
    },
  });

  const requestReview = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes: string }) =>
      adminService.requestReview(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      toast.success("Application marked for review");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to request review"));
    },
  });

  const updateBidderStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      adminService.updateBidderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "bidders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "bidder"] });
      toast.success("Bidder status updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update bidder status"));
    },
  });

  const createAdmin = useMutation({
    mutationFn: (data: { name: string; email: string}) =>
      adminService.createAdmin(data),
    onSuccess: () => {
      toast.success("New admin created successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create admin"));
    },
  });

  return {
    useDashboardStats,
    useAuctioneerStats,
    useBidderStatistics,
    usePendingApplications,
    useAuctioneers,
    useActivityLogs,
    useActivityLogDetail,
    useBidders,
    useBidderDetails,
    approveAuctioneer,
    rejectAuctioneer,
    requestReview,
    updateBidderStatus,
    createAdmin,
  };
};
