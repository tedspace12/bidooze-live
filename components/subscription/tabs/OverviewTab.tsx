"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  CalendarDays,
  Loader2,
} from "lucide-react";
import {
  useSubscriptionDetails,
  useUpdateAutoRenew,
  useCancelSubscription,
} from "@/features/subscription/hooks/useSubscription";
import type { SubscriptionStatus } from "@/features/subscription/types";

function StatusBadge({ status }: { status: SubscriptionStatus }) {
  switch (status) {
    case "active":
      return <Badge className="bg-green-600 hover:bg-green-600 gap-1"><CheckCircle2 className="h-3 w-3" />Active</Badge>;
    case "trial":
      return <Badge className="bg-blue-600 hover:bg-blue-600 gap-1"><Clock className="h-3 w-3" />Free Trial</Badge>;
    case "grace":
      return <Badge variant="outline" className="border-yellow-500 text-yellow-700 bg-yellow-50 gap-1"><Clock className="h-3 w-3" />Grace Period</Badge>;
    case "expired":
      return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />Expired</Badge>;
    case "cancelled":
      return <Badge variant="outline" className="border-destructive text-destructive gap-1"><XCircle className="h-3 w-3" />Cancelled</Badge>;
  }
}

function TrialCountdown({ daysRemaining }: { daysRemaining: number }) {
  const pct = Math.max(0, Math.min(100, (daysRemaining / 7) * 100));
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Trial progress</span>
        <span>{daysRemaining} day{daysRemaining !== 1 ? "s" : ""} left</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-blue-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function OverviewTab({ onSubscribeClick }: { onSubscribeClick: () => void }) {
  const { data, isLoading } = useSubscriptionDetails();
  const updateAutoRenew = useUpdateAutoRenew();
  const cancelSubscription = useCancelSubscription();
  const [cancelReason, setCancelReason] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const sub = data?.subscription;
  const plan = data?.plan;

  // ─── No subscription yet ───────────────────────────────────────────────────
  if (!sub) {
    return (
      <Card className="text-center py-12">
        <CardContent className="space-y-4">
          <div className="mx-auto h-14 w-14 rounded-full bg-muted flex items-center justify-center">
            <CalendarDays className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">No active subscription</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Choose a plan to start creating and managing auctions.
            </p>
          </div>
          <Button onClick={onSubscribeClick}>View Plans</Button>
        </CardContent>
      </Card>
    );
  }

  const isActive = sub.status === "active" || sub.status === "trial" || sub.status === "grace";
  const canCancel = sub.status === "active" || sub.status === "trial" || sub.status === "grace";

  return (
    <div className="space-y-6">
      {/* Status card */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>{plan?.name ?? sub.plan.name} Plan</CardTitle>
              <CardDescription className="mt-1">
                {plan?.price_display && (
                  <span className="font-medium text-foreground">{plan.price_display} </span>
                )}
                {plan?.billing_period && (
                  <span>/ {plan.billing_period === "yearly" ? "year" : plan.billing_period === "monthly" ? "month" : "period"}</span>
                )}
              </CardDescription>
            </div>
            <StatusBadge status={sub.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Trial countdown */}
          {sub.is_in_trial && (
            <TrialCountdown daysRemaining={sub.days_remaining} />
          )}

          {/* Date grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {sub.starts_at && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Started</p>
                <p className="text-sm font-medium">{new Date(sub.starts_at).toLocaleDateString()}</p>
              </div>
            )}
            {sub.ends_at && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                  {sub.status === "grace" ? "Expired" : "Renews"}
                </p>
                <p className="text-sm font-medium">{new Date(sub.ends_at).toLocaleDateString()}</p>
              </div>
            )}
            {sub.is_in_grace && sub.grace_ends_at && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Grace ends</p>
                <p className="text-sm font-medium text-yellow-700">{new Date(sub.grace_ends_at).toLocaleDateString()}</p>
              </div>
            )}
            {sub.trial_ends_at && sub.is_in_trial && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Trial ends</p>
                <p className="text-sm font-medium">{new Date(sub.trial_ends_at).toLocaleDateString()}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Days remaining</p>
              <p className="text-sm font-medium">{sub.days_remaining}</p>
            </div>
          </div>

          {/* CTA when expired/cancelled */}
          {(sub.status === "expired" || sub.status === "cancelled") && (
            <Button className="w-full sm:w-auto" onClick={onSubscribeClick}>
              Renew Subscription
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Auto-renew */}
      {isActive && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Auto-Renew</CardTitle>
            <CardDescription>
              Automatically renew your subscription when it expires using your default payment method.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Switch
                id="auto-renew"
                checked={sub.auto_renew}
                disabled={updateAutoRenew.isPending}
                onCheckedChange={(val) => updateAutoRenew.mutate(val)}
              />
              <Label htmlFor="auto-renew" className="cursor-pointer">
                {updateAutoRenew.isPending ? "Updating…" : sub.auto_renew ? "Enabled" : "Disabled"}
              </Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancel subscription */}
      {canCancel && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Cancel Subscription</CardTitle>
            <CardDescription>
              Cancelling will allow access until the end of the current period. This cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">Cancel Subscription</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancel Subscription?</DialogTitle>
                  <DialogDescription>
                    You will retain access until{" "}
                    <strong>{sub.ends_at ? new Date(sub.ends_at).toLocaleDateString() : "the end of your period"}</strong>.
                    After that, auction creation and management will be disabled.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="cancel-reason">Reason (optional)</Label>
                  <Textarea
                    id="cancel-reason"
                    placeholder="Tell us why you're cancelling…"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    rows={3}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCancelOpen(false)}>
                    Keep Subscription
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={cancelSubscription.isPending}
                    onClick={() =>
                      cancelSubscription.mutate(cancelReason || undefined, {
                        onSuccess: () => setCancelOpen(false),
                      })
                    }
                  >
                    {cancelSubscription.isPending ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Cancelling…</>
                    ) : "Yes, Cancel"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
