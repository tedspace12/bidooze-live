"use client";

import { useEffect } from "react";
import { useRouter } from "@bprogress/next/app";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { registrationService } from "@/features/auth/services/registrationService";

interface PaymentAccountCallbackProps {
  mode: "return" | "refresh";
}

export function PaymentAccountCallback({ mode }: PaymentAccountCallbackProps) {
  const router = useRouter();
  const message = mode === "refresh" ? "Returning to Stripe setup..." : "Checking payment setup status...";

  useEffect(() => {
    const registrationToken =
      typeof window !== "undefined" ? sessionStorage.getItem("registration_token") : null;

    if (!registrationToken) {
      router.replace("/register");
      return;
    }

    if (mode === "refresh") {
      sessionStorage.setItem("registration_resume_step", "3");
      router.replace("/register");
      return;
    }

    registrationService
      .getPaymentAccountStatus(registrationToken)
      .then((result) => {
        if (result.data?.payment_provider_connected || result.data?.onboarding_completed) {
          sessionStorage.setItem("registration_resume_step", "4");
          toast.success("Payment account connected");
        } else {
          sessionStorage.setItem("registration_resume_step", "3");
          toast.info("Payment setup is not complete yet");
        }
      })
      .catch(() => {
        toast.error("Could not verify payment setup status");
      })
      .finally(() => {
        router.replace("/register");
      });
  }, [mode, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md rounded-lg">
        <CardHeader>
          <CardTitle>Payment Setup</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{message}</span>
        </CardContent>
        <CardContent className="pt-0">
          <Button type="button" variant="outline" className="w-full" onClick={() => router.replace("/register")}>
            Return to registration
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
