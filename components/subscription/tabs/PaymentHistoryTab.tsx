"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { usePaymentHistory } from "@/features/subscription/hooks/useSubscription";
import type { PaymentStatus } from "@/features/subscription/types";

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  switch (status) {
    case "paid":
      return <Badge className="bg-green-600 hover:bg-green-600 gap-1 text-xs"><CheckCircle2 className="h-3 w-3" />Paid</Badge>;
    case "failed":
      return <Badge variant="destructive" className="gap-1 text-xs"><XCircle className="h-3 w-3" />Failed</Badge>;
    case "pending":
      return <Badge variant="outline" className="gap-1 text-xs border-yellow-500 text-yellow-700"><Clock className="h-3 w-3" />Pending</Badge>;
  }
}

export function PaymentHistoryTab() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePaymentHistory(page);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
      </div>
    );
  }

  const payments = data?.data ?? [];
  const total = data?.total ?? 0;
  const lastPage = data?.last_page ?? 1;

  if (payments.length === 0) {
    return (
      <Card className="py-12 text-center">
        <CardContent>
          <p className="text-muted-foreground">No payment history yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment History</CardTitle>
          <CardDescription>{total} payment{total !== 1 ? "s" : ""} total</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center gap-4 px-6 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium truncate">{payment.plan.name}</p>
                    <PaymentStatusBadge status={payment.status} />
                    <Badge variant="outline" className="text-xs capitalize">
                      {payment.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {payment.paid_at
                      ? new Date(payment.paid_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : new Date(payment.created_at).toLocaleDateString()}
                    {" · "}{payment.provider} · Ref: {payment.provider_reference}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold">
                    {payment.currency}{" "}
                    {payment.amount_paid.toLocaleString()}
                  </p>
                  {payment.amount_usd && payment.currency !== "USD" && (
                    <p className="text-xs text-muted-foreground">≈ ${payment.amount_usd} USD</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {page} of {lastPage} · {total} total
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page >= lastPage}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
