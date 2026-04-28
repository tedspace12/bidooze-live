"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Loader2, ExternalLink, Tag, X } from "lucide-react";
import { usePlans, useSubscriptionDetails, useInitiatePayment, useValidateCoupon } from "@/features/subscription/hooks/useSubscription";
import type { CouponValidation } from "@/features/subscription/types";
import { toast } from "sonner";

export function PlansTab() {
  const { data: plansData, isLoading: plansLoading } = usePlans();
  const { data: subData } = useSubscriptionDetails();
  const initiatePayment = useInitiatePayment();
  const validateCoupon = useValidateCoupon();
  const [subscribingId, setSubscribingId] = useState<number | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidation | null>(null);

  const currentPlanId = subData?.subscription?.plan?.id;
  const subStatus = subData?.subscription?.status;
  const hasActiveSub = subStatus === "active" || subStatus === "trial" || subStatus === "grace";

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    try {
      const data = await validateCoupon.mutateAsync(code);
      setAppliedCoupon(data);
      toast.success(`Coupon applied — ${data.discount_type === "percent" ? `${data.discount_value}% off` : `${data.discount_value} off`}`);
    } catch {
      toast.error("Invalid or expired coupon code.");
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
  };

  const handleSubscribe = async (_planSlug: string, planId: number) => {
    setSubscribingId(planId);
    try {
      const data = await initiatePayment.mutateAsync({
        return_url: `${window.location.origin}/subscription/success`,
        provider: "paystack",
        ...(appliedCoupon ? { coupon_code: appliedCoupon.code } : {}),
      });
      // Redirect to Paystack checkout
      window.location.href = data.provider_instructions.authorization_url;
    } catch {
      toast.error("Could not initiate payment. Please try again.");
    } finally {
      setSubscribingId(null);
    }
  };

  if (plansLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2].map((i) => <Skeleton key={i} className="h-56 w-full" />)}
      </div>
    );
  }

  if (!plansData?.length) {
    return (
      <Card className="py-12 text-center">
        <CardContent>
          <p className="text-muted-foreground">No plans available at this time.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {hasActiveSub && (
        <p className="text-sm text-muted-foreground">
          You currently have an active subscription. Subscribing again will extend your access period.
        </p>
      )}

      {/* Coupon code */}
      <div className="flex flex-col gap-2">
        {appliedCoupon ? (
          <div className="flex items-center gap-2 rounded-lg border border-green-600 bg-green-50 dark:bg-green-950/30 px-3 py-2 text-sm">
            <Tag className="h-4 w-4 text-green-600 shrink-0" />
            <span className="flex-1 text-green-700 dark:text-green-400">
              <span className="font-medium">{appliedCoupon.code}</span>
              {" — "}
              {appliedCoupon.discount_type === "percent"
                ? `${appliedCoupon.discount_value}% off`
                : `${appliedCoupon.discount_value} off`}
              {" · "}
              <span className="line-through text-muted-foreground">{appliedCoupon.original_display}</span>
              {" → "}
              <span className="font-semibold">{appliedCoupon.final_display}</span>
            </span>
            <button
              type="button"
              onClick={handleRemoveCoupon}
              className="text-green-600 hover:text-green-800 dark:hover:text-green-300"
              aria-label="Remove coupon"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2 max-w-sm">
            <Input
              placeholder="Coupon code"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
              className="uppercase placeholder:normal-case"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleApplyCoupon}
              disabled={!couponInput.trim() || validateCoupon.isPending}
            >
              {validateCoupon.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plansData.map((plan) => {
          const isCurrent = plan.id === currentPlanId && hasActiveSub;
          const isSubscribing = subscribingId === plan.id;

          return (
            <Card
              key={plan.id}
              className={isCurrent ? "border-2 border-green-600" : "border-2"}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  {isCurrent && (
                    <Badge className="bg-green-600 hover:bg-green-600 shrink-0">
                      <CheckCircle2 className="h-3 w-3 mr-1" />Current
                    </Badge>
                  )}
                </div>
                <div className="mt-1">
                  <span className="text-3xl font-bold">{plan.price_display}</span>
                  <span className="text-sm text-muted-foreground ml-1">
                    / {plan.billing_period === "yearly" ? "year" : plan.billing_period === "monthly" ? "month" : "period"}
                  </span>
                </div>
                {plan.price_display !== `$${plan.price_usd}` && (
                  <p className="text-xs text-muted-foreground">≈ ${plan.price_usd} USD</p>
                )}
                <CardDescription>
                  {plan.trial_days > 0 && `Includes ${plan.trial_days}-day free trial · `}
                  {plan.duration_days} days access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {plan.features.length > 0 && (
                  <ul className="space-y-1.5">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
                <Button
                  className="w-full gap-2"
                  variant={isCurrent ? "outline" : "default"}
                  disabled={isSubscribing || initiatePayment.isPending}
                  onClick={() => handleSubscribe(plan.slug, plan.id)}
                >
                  {isSubscribing ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Redirecting…</>
                  ) : (
                    <><ExternalLink className="h-4 w-4" />{isCurrent ? "Renew" : "Subscribe"}</>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
