"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useHasMounted } from "@/hooks/useHasMounted";
import {
  REGISTRATION_INCOMPLETE_EVENT,
  dismissRegistrationReminder,
  dispatchRegistrationIncomplete,
  readStoredMissingRequirements,
  wasRegistrationReminderDismissed,
} from "@/lib/registration-reminder";

const FALLBACK_MESSAGE = "Complete your registration to unlock all auctioneer features.";

export function RegistrationCompletionReminder() {
  const { user } = useAuthStore();
  const router = useRouter();
  // The server never sees the auth cookie (so it always renders null / dialog
  // closed), but a client reached here while already logged in (proxy.ts's
  // redirect chain, or a plain refresh of /dashboard) can have real `user`
  // data on its very first paint — producing a whole Dialog tree where the
  // server rendered nothing: a hydration mismatch. Gating on `mounted` keeps
  // the first client render identical to the server's; the dialog then opens
  // as an ordinary post-mount update.
  const mounted = useHasMounted();
  const [open, setOpen] = useState(false);
  const [missing, setMissing] = useState<string[]>([]);

  // Fired live by the axios interceptor when POST /auctions rejects with the
  // auctioneer_requirements validation error — and, below, replayed on mount
  // for anything already stored from a previous visit. Routing both through
  // this one listener means setState only ever happens inside a callback
  // (satisfies react-hooks/set-state-in-effect), never directly in an effect
  // body.
  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<string[]>).detail;
      setMissing(detail && detail.length > 0 ? detail : [FALLBACK_MESSAGE]);
      setOpen(true);
    };
    window.addEventListener(REGISTRATION_INCOMPLETE_EVENT, handler);
    return () => window.removeEventListener(REGISTRATION_INCOMPLETE_EVENT, handler);
  }, []);

  useEffect(() => {
    if (user?.role !== "auctioneer") return;
    if (wasRegistrationReminderDismissed()) return;
    const stored = readStoredMissingRequirements();
    if (stored && stored.length > 0) {
      dispatchRegistrationIncomplete(stored);
    }
  }, [user?.role]);

  if (!mounted || user?.role !== "auctioneer") return null;

  const handleDismiss = () => {
    dismissRegistrationReminder();
    setOpen(false);
  };

  const handleComplete = () => {
    setOpen(false);
    router.push("/settings?tab=payouts");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
          <DialogTitle className="text-center">Finish setting up your account</DialogTitle>
          <DialogDescription className="text-center">
            A few things from registration are still incomplete:
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2 text-sm">
          {missing.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-foreground"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button className="w-full" onClick={handleComplete}>
            Complete now
          </Button>
          <Button variant="outline" className="w-full" onClick={handleDismiss}>
            Remind me later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
