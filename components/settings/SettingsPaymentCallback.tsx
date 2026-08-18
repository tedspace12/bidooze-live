"use client";

import { useEffect } from "react";
import { useRouter } from "@bprogress/next/app";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { withAuctioneerAuth } from "@/services/api";

interface SettingsPaymentCallbackProps {
  mode: "return" | "refresh";
}

type Envelope<T> = { message?: string; data: T };
const unwrap = <T,>(payload: unknown): T =>
  payload && typeof payload === "object" && "data" in payload
    ? (payload as Envelope<T>).data
    : (payload as T);

export function SettingsPaymentCallback({ mode }: SettingsPaymentCallbackProps) {
  const router = useRouter();
  const message = mode === "refresh" ? "Returning to Stripe setup..." : "Checking payment setup status...";

  useEffect(() => {
    if (mode === "refresh") {
      router.replace("/settings?tab=payouts");
      return;
    }

    withAuctioneerAuth
      .get("/auctioneer/settings/payout")
      .then((res) => {
        const data = unwrap<{ payment_account_connected?: boolean }>(res.data);
        if (data?.payment_account_connected) {
          toast.success("Payment account connected");
        } else {
          toast.info("Payment setup is not complete yet");
        }
      })
      .catch(() => {
        toast.error("Could not verify payment setup status");
      })
      .finally(() => {
        router.replace("/settings?tab=payouts");
      });
  }, [mode, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md rounded-lg">
        <CardHeader>
          <CardTitle>Payout Setup</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{message}</span>
        </CardContent>
        <CardContent className="pt-0">
          <Button type="button" variant="outline" className="w-full" onClick={() => router.replace("/settings?tab=payouts")}>
            Return to settings
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
