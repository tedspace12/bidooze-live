"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Dispatched from the axios 402 interceptor in services/api.ts
export const SUBSCRIPTION_REQUIRED_EVENT = "subscription-required";

export function SubscriptionRequiredModal() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener(SUBSCRIPTION_REQUIRED_EVENT, handler);
    return () => window.removeEventListener(SUBSCRIPTION_REQUIRED_EVENT, handler);
  }, []);

  const handleGoToBilling = () => {
    setOpen(false);
    router.push("/billing?tab=plans");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <Lock className="h-6 w-6 text-destructive" />
          </div>
          <DialogTitle className="text-center">Subscription Required</DialogTitle>
          <DialogDescription className="text-center">
            An active subscription is required to perform this action. Renew or subscribe to continue
            creating and managing auctions.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button className="w-full gap-2" onClick={handleGoToBilling}>
            <CreditCard className="h-4 w-4" />
            Go to Billing
          </Button>
          <Button variant="outline" className="w-full" onClick={() => setOpen(false)}>
            Maybe later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
