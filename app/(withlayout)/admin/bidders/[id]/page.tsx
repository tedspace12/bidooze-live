"use client";

import { useAdmin } from "@/features/admin/hooks/useAdmin";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  ShieldAlert,
  ShieldCheck,
  Star,
  User,
  Mail,
  Calendar,
  Trophy,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

const reputationLevelConfig: Record<string, { color: string; bg: string; border: string; label: string }> = {
  elite: { color: "text-purple-700", bg: "bg-purple-100", border: "border-purple-200", label: "Elite" },
  trusted: { color: "text-blue-700", bg: "bg-blue-100", border: "border-blue-200", label: "Trusted" },
  reliable: { color: "text-green-700", bg: "bg-green-100", border: "border-green-200", label: "Reliable" },
  neutral: { color: "text-slate-700", bg: "bg-slate-100", border: "border-slate-200", label: "Neutral" },
  low_trust: { color: "text-red-700", bg: "bg-red-100", border: "border-red-200", label: "Low Trust" },
};

function getReputationConfig(level?: string | null) {
  if (!level) return reputationLevelConfig.neutral;
  return reputationLevelConfig[level.toLowerCase().replace(/\s+/g, "_")] ?? reputationLevelConfig.neutral;
}

function MetricRow({ label, value }: { label: string; value?: number | string | null }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-slate-800">{value ?? "—"}</span>
    </div>
  );
}

function ScoreBar({ label, score, max = 100, weight }: { label: string; score?: number; max?: number; weight?: number }) {
  const pct = Math.min(100, Math.round(((score ?? 0) / max) * 100));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <div className="flex items-center gap-2">
          {weight !== undefined && (
            <span className="text-xs text-muted-foreground">weight: {weight}%</span>
          )}
          <span className="font-semibold text-slate-800">{score ?? 0}</span>
        </div>
      </div>
      <Progress value={pct} className="h-2" />
    </div>
  );
}

export default function BidderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { useBidderDetails, updateBidderStatus } = useAdmin();
  const [confirmStatus, setConfirmStatus] = useState<string | null>(null);

  const { data: bidder, isLoading } = useBidderDetails(Number(id));

  const handleStatusUpdate = async () => {
    if (!confirmStatus) return;
    await updateBidderStatus.mutateAsync({ id: Number(id), status: confirmStatus });
    setConfirmStatus(null);
  };

  const statusValue = bidder?.account_status || bidder?.status || "unknown";
  const rep = bidder?.reputation;
  const repConfig = getReputationConfig(rep?.level ?? bidder?.reputation_level);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!bidder) {
    return (
      <div className="py-12 text-center">
        <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
        <p className="font-medium text-slate-700">Bidder not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="w-full justify-start sm:w-auto">
        <ChevronLeft className="h-4 w-4 mr-2" /> Back to Bidders
      </Button>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-slate-800">{bidder.name}</h1>
          <p className="mt-1 break-all text-slate-500">{bidder.email}</p>
        </div>
        <Badge className={`w-fit px-4 py-1 text-sm font-semibold ${
          statusValue === "active" ? "bg-green-100 text-green-700" :
          statusValue === "suspended" ? "bg-orange-100 text-orange-700" :
          "bg-red-100 text-red-700"
        }`}>
          {statusValue.toUpperCase()}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" /> Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="break-all text-slate-700">{bidder.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-slate-700">Joined {new Date(bidder.created_at).toLocaleDateString()}</span>
              </div>
              {bidder.updated_at && (
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-slate-700">Updated {new Date(bidder.updated_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Account Management */}
            <div className="border-t pt-4">
              <p className="mb-3 text-xs text-muted-foreground">Account Management</p>
              {statusValue === "active" ? (
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={() => setConfirmStatus("suspended")}
                >
                  <ShieldAlert className="h-4 w-4 mr-2" /> Suspend Account
                </Button>
              ) : statusValue === "suspended" ? (
                <div className="space-y-2">
                  <Button
                    size="sm"
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => setConfirmStatus("active")}
                  >
                    <ShieldCheck className="h-4 w-4 mr-2" /> Reactivate
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => setConfirmStatus("disabled")}
                  >
                    <ShieldAlert className="h-4 w-4 mr-2" /> Disable Account
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => setConfirmStatus("active")}
                >
                  <ShieldCheck className="h-4 w-4 mr-2" /> Reactivate
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reputation Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-4 w-4" /> Reputation Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score + Level */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-50 border-2 border-yellow-200">
                  <Star className="h-6 w-6 fill-yellow-500 text-yellow-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-800">
                    {rep?.score ?? bidder.reputation_score}
                  </p>
                  <p className="text-sm text-muted-foreground">Reputation Score</p>
                </div>
              </div>
              <div className="flex flex-col items-start gap-2 sm:items-end">
                <Badge variant="outline" className={`${repConfig.bg} ${repConfig.color} ${repConfig.border} px-3 py-1 text-sm font-semibold`}>
                  {repConfig.label}
                </Badge>
                {(rep?.recommended_action ?? bidder.recommended_action) && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CheckCircle className="h-3 w-3" />
                    {rep?.recommended_action ?? bidder.recommended_action}
                  </div>
                )}
              </div>
            </div>

            {/* Score progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>Score out of 100</span>
                <span>100</span>
              </div>
              <Progress value={Math.min(100, rep?.score ?? bidder.reputation_score ?? 0)} className="h-3" />
            </div>

            {/* Component scores */}
            {rep?.components && rep.components.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Component Scores</p>
                {rep.components.map((comp, i) => (
                  <ScoreBar
                    key={i}
                    label={comp.name}
                    score={comp.raw_score ?? comp.value as number}
                    weight={comp.weight}
                  />
                ))}
              </div>
            )}

            {/* Weighted scores */}
            {rep?.weighted_scores && rep.weighted_scores.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Weighted Contribution</p>
                {rep.weighted_scores.map((comp, i) => (
                  <ScoreBar
                    key={i}
                    label={comp.name}
                    score={comp.weighted_score ?? comp.value as number}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Raw Metrics */}
      {rep?.raw_metrics && Object.keys(rep.raw_metrics).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" /> Activity Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { key: "total_bids", label: "Total Bids" },
                { key: "auctions_won", label: "Auctions Won" },
                { key: "payments_completed", label: "Payments Completed" },
                { key: "payments_failed", label: "Payments Failed" },
                { key: "disputes_raised", label: "Disputes Raised" },
                { key: "disputes_resolved", label: "Disputes Resolved" },
                { key: "disputes_lost", label: "Disputes Lost" },
                { key: "bid_retractions", label: "Bid Retractions" },
                { key: "no_shows", label: "No-Shows" },
                { key: "avg_payment_time_hours", label: "Avg Payment Time (hrs)" },
              ].map(({ key, label }) => {
                const val = rep.raw_metrics?.[key];
                if (val === undefined) return null;
                return <MetricRow key={key} label={label} value={val} />;
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status confirmation dialog */}
      <AlertDialog open={!!confirmStatus} onOpenChange={() => setConfirmStatus(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmStatus === "suspended" ? "Suspend Account" :
               confirmStatus === "disabled" ? "Disable Account" : "Reactivate Account"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmStatus === "suspended"
                ? "This bidder will be prevented from placing new bids. You can reactivate them later."
                : confirmStatus === "disabled"
                ? "This will permanently disable the bidder's account. This action is harder to reverse."
                : "This will restore the bidder's access to the platform."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusUpdate}
              disabled={updateBidderStatus.isPending}
              className={confirmStatus === "active" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {updateBidderStatus.isPending ? "Updating..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
