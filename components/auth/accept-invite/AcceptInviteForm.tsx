"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, AlertCircle, Clock } from "lucide-react";
import { authService } from "@/features/auth/services/authService";
import { useAuthStore } from "@/features/auth/store/authStore";

interface AcceptInviteFormProps {
  token: string;
}

export function AcceptInviteForm({ token }: AcceptInviteFormProps) {
  const router = useRouter();
  const { setSession } = useAuthStore();

  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorType, setErrorType] = useState<"expired" | "invalid" | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    setErrorType(null);

    try {
      await authService.acceptInvite({
        token,
        display_name: displayName.trim() || undefined,
        password,
      });

      // Token is now set in cookie by authService.acceptInvite — fetch full session
      const userData = await authService.getCurrentUser();
      setSession({
        token: null, // already in cookie
        user: userData.user,
        auctioneer: userData.auctioneer ?? null,
        can_access_auctioneer_features: userData.can_access_auctioneer_features ?? true,
        team_member: userData.team_member ?? null,
      });

      toast.success("Welcome! Your account is ready.");
      router.push("/dashboard");
    } catch (err: unknown) {
      const error = err as { status?: number; message?: string };
      if (error?.status === 410) {
        setErrorType("expired");
      } else if (error?.status === 404) {
        setErrorType("invalid");
      } else {
        toast.error(error?.message || "Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (errorType === "expired") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
          <Clock className="h-6 w-6 text-orange-600" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Invitation expired</h2>
          <p className="text-sm text-muted-foreground">
            This invitation link is more than 72 hours old. Ask your team administrator to send a new one.
          </p>
        </div>
      </div>
    );
  }

  if (errorType === "invalid") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Invalid invitation</h2>
          <p className="text-sm text-muted-foreground">
            This invitation link is not valid. It may have already been used or the link is incorrect.
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/login")} className="w-full">
          Go to login
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Accept your invitation</h1>
        <p className="text-sm text-muted-foreground">
          Set your display name and password to activate your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="display_name" className="text-sm">
            Display name <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            id="display_name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Jane Smith"
            maxLength={100}
            autoComplete="name"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
              autoComplete="new-password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm_password" className="text-sm">Confirm password</Label>
          <div className="relative">
            <Input
              id="confirm_password"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              required
              autoComplete="new-password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-destructive">Passwords do not match</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Activating account…" : "Activate account"}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <a href="/login" className="underline underline-offset-4 hover:text-foreground">
          Sign in
        </a>
      </p>
    </div>
  );
}
