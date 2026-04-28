"use client";

import Link from "next/link";
import { AlertTriangle, Clock, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscriptionDetails } from "@/features/subscription/hooks/useSubscription";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useState } from "react";

export function SubscriptionBanner() {
  const { auctioneer } = useAuthStore();
  const { data, isLoading } = useSubscriptionDetails();
  const [trialDismissed, setTrialDismissed] = useState(false);

  // Only show for approved auctioneers
  if (!auctioneer || auctioneer.status !== "approved") return null;
  if (isLoading || !data?.subscription) return null;

  const sub = data.subscription;
  const { status, days_remaining, is_in_trial, is_in_grace } = sub;

  // ─── Trial banner ──────────────────────────────────────────────────────────
  if (is_in_trial && !trialDismissed) {
    return (
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-blue-800">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="flex-1 text-sm">
          <span className="font-semibold">Free trial active — </span>
          {days_remaining > 0 ? (
            <span>{days_remaining} day{days_remaining !== 1 ? "s" : ""} remaining.</span>
          ) : (
            <span>Trial ends today.</span>
          )}{" "}
          <Link href="/billing?tab=plans" className="font-medium underline underline-offset-2 hover:text-blue-900">
            Subscribe now
          </Link>{" "}
          to keep full access.
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => setTrialDismissed(true)}
          className="shrink-0 rounded p-0.5 hover:bg-blue-100"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  // ─── Grace period banner ───────────────────────────────────────────────────
  if (is_in_grace || status === "grace") {
    return (
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-yellow-800">
        <Clock className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="flex-1 text-sm">
          <span className="font-semibold">Your subscription has expired — </span>
          {days_remaining > 0 ? (
            <span>you have {days_remaining} day{days_remaining !== 1 ? "s" : ""} of grace period left.</span>
          ) : (
            <span>grace period ends today.</span>
          )}{" "}
          <Link href="/billing?tab=plans" className="font-medium underline underline-offset-2 hover:text-yellow-900">
            Renew now
          </Link>{" "}
          to avoid losing access to auction features.
        </div>
      </div>
    );
  }

  // ─── Expired / cancelled banner ────────────────────────────────────────────
  if (status === "expired" || status === "cancelled") {
    return (
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-destructive">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="flex-1 text-sm">
          <span className="font-semibold">
            {status === "cancelled" ? "Subscription cancelled" : "Subscription expired"} —{" "}
          </span>
          creating and managing auctions is disabled.{" "}
        </div>
        <Button asChild size="sm" className="shrink-0 h-7 px-3 text-xs">
          <Link href="/billing?tab=plans">Renew</Link>
        </Button>
      </div>
    );
  }

  return null;
}
