"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { readMfaSession } from "@/lib/mfa-session";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";

export default function MfaVerifyPage() {
  const router = useRouter();
  const { verifyMfa, resendMfa } = useAuth();
  const [code, setCode] = useState("");
  const [expiresAt, setExpiresAt] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    return readMfaSession()?.expires_at ?? null;
  });
  const [now, setNow] = useState(0);

  useEffect(() => {
    const session = readMfaSession();
    if (!session?.email) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    if (!expiresAt) return;
    const initialTick = setTimeout(() => {
      setNow(Date.now());
    }, 0);
    const id = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => {
      clearTimeout(initialTick);
      clearInterval(id);
    };
  }, [expiresAt]);

  const remainingSeconds = useMemo(() => {
    if (!expiresAt) return null;
    return Math.max(0, Math.floor((expiresAt - now) / 1000));
  }, [expiresAt, now]);

  const isExpired = remainingSeconds !== null && remainingSeconds <= 0;

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const session = readMfaSession();
    if (!session?.email) {
      router.replace("/login");
      return;
    }
    await verifyMfa.mutateAsync({ email: session.email, otp: code });
  };

  const handleResend = async () => {
    const session = readMfaSession();
    if (!session?.email) {
      router.replace("/login");
      return;
    }
    await resendMfa.mutateAsync({ email: session.email });
    const updated = readMfaSession();
    setExpiresAt(updated?.expires_at ?? null);
  };

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-xs flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <Image src={"/logo/Bidooze.svg"} alt="Bidooze logo" height={255} width={255} />
        </a>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Enter verification code</CardTitle>
            <CardDescription>We sent a 6-digit code to your email.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="mfa-otp" className="sr-only">
                    Verification code
                  </FieldLabel>
                  <InputOTP
                    id="mfa-otp"
                    maxLength={6}
                    value={code}
                    onChange={(value) => setCode(value)}
                    required
                  >
                    <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                  <FieldDescription className="text-center">
                    {remainingSeconds === null
                      ? "Enter the 6-digit code sent to your email."
                      : isExpired
                        ? "Code expired. Resend a new code."
                        : `Code expires in ${remainingSeconds}s`}
                  </FieldDescription>
                </Field>
                <Button type="submit" disabled={verifyMfa.isPending || isExpired || code.length !== 6}>
                  {verifyMfa.isPending ? "Verifying..." : "Verify"}
                </Button>
                <FieldDescription className="text-center">
                  Didn&apos;t receive the code?{" "}
                  <button
                    type="button"
                    className="underline underline-offset-4 disabled:text-muted-foreground"
                    onClick={handleResend}
                    disabled={resendMfa.isPending}
                  >
                    {resendMfa.isPending ? "Resending..." : "Resend"}
                  </button>
                </FieldDescription>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
