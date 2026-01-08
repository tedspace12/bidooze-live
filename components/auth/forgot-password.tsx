/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { useRouter } from "@bprogress/next/app";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { toast } from "sonner";

export function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      toast.success("Password reset code has been sent to your email!");
      setIsEmailSent(true);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message);
    }
  };

  const handleBackToLogin = () => {
    router.push("/login");
  };

  const handleContinueToReset = () => {
    router.push(`/reset-password?email=${encodeURIComponent(email)}`);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-muted"
    //   style={{
    //     background:
    //       "linear-gradient(135deg, #E8F0E3 0%, #C5D9BA 50%, #E8F0E3 100%)",
    //   }}
    >
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
                {isEmailSent ? "Check Your Email" : "Forgot Password"}
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                {isEmailSent
                  ? "We've sent a reset code to your email address"
                  : "Enter your email address to receive a reset code"}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEmailSent ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      A password reset code has been sent to{" "}
                      <span className="font-medium text-[#3F6B2D]">
                        {email}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Please check your email and click the button below to
                      continue with the reset process.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Button
                      onClick={handleContinueToReset}
                      className="w-full text-white"
                    >
                      Continue to Reset Password
                    </Button>
                    <Button
                      onClick={handleBackToLogin}
                      variant="outline"
                      className="w-full"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Login
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-[#3F6B2D]"
                    >
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="admin@exam.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      type="submit"
                      className="w-full text-white"
                    //   disabled={requestPasswordReset.isPending}
                    >
                      {isEmailSent ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending Reset Code...
                        </>
                      ) : (
                        "Send Reset Code"
                      )}
                    </Button>
                    <Button
                      onClick={handleBackToLogin}
                      variant="outline"
                      className="w-full"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Login
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
