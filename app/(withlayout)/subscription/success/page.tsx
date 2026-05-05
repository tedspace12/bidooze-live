"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubscriptionDetails } from "@/features/subscription/hooks/useSubscription";
import { useQueryClient } from "@tanstack/react-query";

export default function SubscriptionSuccessPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useSubscriptionDetails();

  // Invalidate on mount so we always get the fresh post-payment status
  useEffect(() => {
    qc.invalidateQueries({ queryKey: ["subscription"] });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sub = data?.subscription;
  const plan = data?.plan;

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        {/* Success icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>

        <div>
          <h1 className="text-3xl font-bold">Payment Successful!</h1>
          <p className="text-muted-foreground mt-2">
            Your subscription has been activated. You now have full access to all auction features.
          </p>
        </div>

        {/* Subscription details */}
        {isLoading ? (
          <Card>
            <CardContent className="p-6 space-y-3">
              <Skeleton className="h-5 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-1/2 mx-auto" />
              <Skeleton className="h-4 w-2/3 mx-auto" />
            </CardContent>
          </Card>
        ) : sub ? (
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center justify-center gap-2">
                <span className="font-semibold text-lg">{plan?.name ?? sub.plan.name} Plan</span>
                <Badge className="bg-green-600 hover:bg-green-600">Active</Badge>
              </div>
              {plan?.price_display && (
                <p className="text-sm text-muted-foreground">{plan.price_display} / {plan.billing_period === "yearly" ? "year" : "month"}</p>
              )}
              {sub.ends_at && (
                <p className="text-sm text-muted-foreground">
                  Access until{" "}
                  <span className="font-medium text-foreground">
                    {new Date(sub.ends_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </p>
              )}
              {sub.days_remaining > 0 && (
                <p className="text-sm font-medium text-green-700">
                  {sub.days_remaining} days of access
                </p>
              )}
            </CardContent>
          </Card>
        ) : null}

        <div className="flex flex-col gap-3">
          <Button asChild size="lg" className="gap-2">
            <Link href="/dashboard">
              Go to Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/billing">View Billing Details</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
