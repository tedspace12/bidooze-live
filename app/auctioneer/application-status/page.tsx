"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAuthStore } from "@/features/auth/store/authStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const statusCopy: Record<string, string> = {
  pending_review: "We received your application and it's awaiting admin review.",
  under_review: "Your application needs additional review. You’ll be notified if anything is required.",
  rejected: "Your application was rejected.",
  approved: "Approved.",
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
};

export default function ApplicationStatusPage() {
  const router = useRouter();
  const { useCurrentUser, logout } = useAuth();
  const { user, auctioneer, canAccessAuctioneerFeatures, isAuthenticated } = useAuthStore();
  const { refetch, isFetching } = useCurrentUser();

  const status = auctioneer?.status || "pending_review";
  const statusLabel = useMemo(() => status.replace(/_/g, " ").toUpperCase(), [status]);
  const copy = statusCopy[status] || "Your application status is being processed.";

  const handleRefresh = async () => {
    try {
      const result = await refetch();
      const access = !!(result.data as { can_access_auctioneer_features?: boolean } | undefined)
        ?.can_access_auctioneer_features;
      if (access) {
        toast.success("Your application is approved.");
        router.push("/auctioneer/dashboard");
        return;
      }
      toast.success("Status refreshed.");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to refresh status."));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Please log in to view your application status.</p>
            <Button onClick={() => router.push("/login")}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/20">
      <Card className="w-full max-w-2xl border border-border shadow-sm">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Application Status</CardTitle>
            <Badge variant="outline">{statusLabel}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {auctioneer?.company_name || user?.name || "Auctioneer account"}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{copy}</p>
            <div className="text-sm text-muted-foreground">
              Registration step:{" "}
              <span className="font-medium text-foreground">{auctioneer?.registration_step || 0} / 5</span>
            </div>
          </div>

          {status === "rejected" ? (
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => router.push("/auctioneer/support")}>Contact Support</Button>
              <Button variant="secondary" onClick={handleRefresh} disabled={isFetching}>
                {isFetching ? "Refreshing..." : "Refresh Status"}
              </Button>
            </div>
          ) : status === "approved" || canAccessAuctioneerFeatures ? (
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => router.push("/auctioneer/dashboard")}>Go to Dashboard</Button>
              <Button variant="secondary" onClick={handleRefresh} disabled={isFetching}>
                {isFetching ? "Refreshing..." : "Refresh Status"}
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleRefresh} disabled={isFetching}>
                {isFetching ? "Refreshing..." : "Refresh Status"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => logout.mutateAsync()}
                disabled={logout.isPending}
              >
                {logout.isPending ? "Logging out..." : "Log out"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

