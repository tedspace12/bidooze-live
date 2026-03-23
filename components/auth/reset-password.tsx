"use client";

import { useState } from "react";
import { useRouter } from "@bprogress/next/app";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, LockKeyhole, Mail, ShieldAlert } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { AuthPanel } from "@/features/auth/services/authService";

const getPanel = (value: string | null): AuthPanel =>
  value === "admin" ? "admin" : "auctioneer";

const getLoginPath = (panel: AuthPanel) =>
  panel === "admin" ? "/admin/login" : "/login";

const getForgotPasswordPath = (panel: AuthPanel) =>
  `/forgot-password?panel=${panel}`;

const getPortalLabel = (panel: AuthPanel) =>
  panel === "admin" ? "Admin" : "Auctioneer";

export function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const panel = getPanel(searchParams.get("panel"));
  const portalLabel = getPortalLabel(panel);
  const loginPath = getLoginPath(panel);
  const forgotPasswordPath = getForgotPasswordPath(panel);
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";
  const hasValidLink = !!token && !!email;
  const { resetPassword } = useAuth();
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const passwordsMatch =
    !passwordConfirmation || password === passwordConfirmation;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasValidLink) return;

    try {
      await resetPassword.mutateAsync({
        panel,
        payload: {
          token,
          email,
          password,
          password_confirmation: passwordConfirmation,
        },
      });
    } catch {
      // Toast is handled in the auth hook.
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted">
      <div className="w-full flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="mx-auto mb-4 flex items-center justify-center">
            <Image
              src={"/logo/Bidooze.svg"}
              alt="Bidooze logo"
              width={225}
              height={225}
              className="w-auto h-16"
            />
          </div>
          <Card className="shadow-2xl border-0 backdrop-blur-xl bg-card/80">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-[#3F6B2D]">
                {hasValidLink ? "Reset Password" : "Invalid Reset Link"}
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                {hasValidLink
                  ? `Set a new password for your ${portalLabel.toLowerCase()} account`
                  : "This reset link is incomplete or has expired. Request a new one to continue."}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {hasValidLink ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-[#3F6B2D]"
                    >
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        className="pl-10"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-[#3F6B2D]"
                    >
                      New Password
                    </Label>
                    <div className="relative">
                      <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="password_confirmation"
                      className="text-sm font-medium text-[#3F6B2D]"
                    >
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="password_confirmation"
                        type="password"
                        placeholder="Confirm your new password"
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                    {!passwordsMatch && (
                      <p className="text-sm text-red-600">
                        Passwords do not match.
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Button
                      type="submit"
                      className="w-full text-white"
                      disabled={
                        resetPassword.isPending ||
                        !password.trim() ||
                        !passwordConfirmation.trim() ||
                        !passwordsMatch
                      }
                    >
                      {resetPassword.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Resetting Password...
                        </>
                      ) : (
                        "Reset Password"
                      )}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => router.push(loginPath)}
                      variant="outline"
                      className="w-full"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Login
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                      <ShieldAlert className="h-8 w-8 text-amber-600" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Request another password reset link and use the newest
                      email you receive.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Button
                      type="button"
                      onClick={() => router.push(forgotPasswordPath)}
                      className="w-full text-white"
                    >
                      Request New Reset Link
                    </Button>
                    <Button
                      type="button"
                      onClick={() => router.push(loginPath)}
                      variant="outline"
                      className="w-full"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Login
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
