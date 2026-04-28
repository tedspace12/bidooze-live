"use client";

import { useSearchParams } from "next/navigation";
import { AcceptInviteForm } from "@/components/auth/accept-invite/AcceptInviteForm";
import { AlertCircle } from "lucide-react";

export function AcceptInvitePageContent() {
  const params = useSearchParams();
  const token = params.get("token");

  if (!token) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Missing invitation token</h2>
          <p className="text-sm text-muted-foreground">
            This page requires a valid invitation link. Check your email for the original invitation.
          </p>
        </div>
      </div>
    );
  }

  return <AcceptInviteForm token={token} />;
}
