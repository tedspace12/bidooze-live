import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService, CurrentUserResponse, LoginResponse, LoginSuccessResponse } from "../services/authService";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/features/auth/store/authStore";
import { clearMfaSession, saveMfaSession } from "@/lib/mfa-session";

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
};

export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const {
    setSession,
    clearSession,
    user: currentUser,
    auctioneer: currentAuctioneer,
    canAccessAuctioneerFeatures: currentCanAccess,
  } = useAuthStore();

  // Get current user
  const useCurrentUser = () => {
    const query = useQuery<CurrentUserResponse>({
      queryKey: ["current-user"],
      queryFn: () => authService.getCurrentUser(),
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
    
    useEffect(() => {
      if (!query.data) return;
      const payload = query.data;
      const user = payload?.user || null;
      const hasAuctioneer = typeof payload?.auctioneer !== "undefined";
      const hasCanAccess = typeof payload?.can_access_auctioneer_features !== "undefined";
      const nextUser =
        user && currentUser && user.id === currentUser.id
          ? {
              ...user,
              avatar: user.avatar ?? user.avatar_url ?? currentUser.avatar ?? null,
            }
          : user
            ? {
                ...user,
                avatar: user.avatar ?? user.avatar_url ?? null,
              }
            : user;
      const nextAuctioneer = hasAuctioneer ? payload?.auctioneer || null : currentAuctioneer || null;
      const nextCanAccess = hasCanAccess
        ? !!payload?.can_access_auctioneer_features
        : currentCanAccess;

      const sameUser =
        currentUser &&
        nextUser &&
        currentUser.id === nextUser.id &&
        currentUser.name === nextUser.name &&
        currentUser.email === nextUser.email &&
        currentUser.role === nextUser.role &&
        currentUser.account_status === nextUser.account_status &&
        currentUser.avatar === nextUser.avatar;

      const sameAuctioneer =
        currentAuctioneer &&
        nextAuctioneer &&
        currentAuctioneer.id === nextAuctioneer.id &&
        currentAuctioneer.status === nextAuctioneer.status &&
        currentAuctioneer.registration_step === nextAuctioneer.registration_step &&
        currentAuctioneer.company_name === nextAuctioneer.company_name;

      const bothAuctioneerNull = !currentAuctioneer && !nextAuctioneer;

      if (
        (sameUser || (!currentUser && !nextUser)) &&
        (sameAuctioneer || bothAuctioneerNull) &&
        currentCanAccess === nextCanAccess
      ) {
        return;
      }
      setSession({
        token: null,
        user: nextUser,
        auctioneer: nextAuctioneer,
        can_access_auctioneer_features: nextCanAccess,
      });
    }, [query.data]);

    return query;
  };

  // Auctioneer login mutation
  const loginAuctioneer = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.loginAuctioneer(email, password),
    mutationKey: ["auth", "login", "auctioneer"],
    onSuccess: (data: LoginResponse, variables: { email: string; password: string }) => {
      if ("mfa_required" in data && data.mfa_required) {
        clearSession();
        saveMfaSession({
          email: variables.email,
          mfa_channel: data.mfa_channel || "email",
          expires_at: Date.now() + (data.expires_in ?? 300) * 1000,
        });
        toast.message(data.message || "MFA required. Check your email.");
        router.push("/auth/mfa");
        return;
      }
      const success = data as LoginSuccessResponse;
      clearMfaSession();
      const user = success.user;
      if (user.role !== "auctioneer") {
        clearSession();
        toast.error("Wrong portal. Please use the correct login.");
        return;
      }
      if (user.account_status !== "active") {
        clearSession();
        toast.error("Your account is not active.");
        return;
      }
      const userWithAvatar = {
        ...success.user,
        avatar: success.user.avatar ?? success.user.avatar_url ?? null,
      };
      setSession({
        token: success.token,
        user: userWithAvatar,
        auctioneer: success.auctioneer,
        can_access_auctioneer_features: success.can_access_auctioneer_features,
      });
      queryClient.setQueryData(["current-user"], {
        user: userWithAvatar,
        auctioneer: success.auctioneer,
        can_access_auctioneer_features: success.can_access_auctioneer_features,
      });
      toast.success("Login successful!");
      router.push(
        success.can_access_auctioneer_features ? "/auctioneer/dashboard" : "/auctioneer/application-status"
      );
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, "Login failed. Please try again.");
      toast.error(message);
    },
  });

  // Admin login mutation
  const loginAdmin = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.loginAdmin(email, password),
    mutationKey: ["auth", "login", "admin"],
    onSuccess: (data: LoginResponse, variables: { email: string; password: string }) => {
      if ("mfa_required" in data && data.mfa_required) {
        clearSession();
        saveMfaSession({
          email: variables.email,
          mfa_channel: data.mfa_channel || "email",
          expires_at: Date.now() + (data.expires_in ?? 300) * 1000,
        });
        toast.message(data.message || "MFA required. Check your email.");
        router.push("/auth/mfa");
        return;
      }
      const success = data as LoginSuccessResponse;
      clearMfaSession();
      if (success.user.role !== "admin" && success.user.role !== "superadmin") {
        clearSession();
        toast.error("Wrong portal. Please use the correct login.");
        return;
      }
      const userWithAvatar = {
        ...success.user,
        avatar: success.user.avatar ?? success.user.avatar_url ?? null,
      };
      setSession({
        token: success.token,
        user: userWithAvatar,
        auctioneer: success.auctioneer,
        can_access_auctioneer_features: true,
      });
      queryClient.setQueryData(["current-user"], {
        user: userWithAvatar,
        auctioneer: success.auctioneer,
        can_access_auctioneer_features: true,
      });
      toast.success("Login successful!");
      router.push("/admin/dashboard");
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, "Login failed. Please try again.");
      toast.error(message);
    },
  });

  // Logout mutation
  const logout = useMutation({
    mutationFn: () => authService.logout(),
    mutationKey: ["auth", "logout"],
    onSuccess: () => {
      queryClient.clear();
      clearSession();
      clearMfaSession();
      toast.success("Logged out successfully");
      router.push("/login");
    },
    onError: () => {
      // Even if logout fails, clear local state
      queryClient.clear();
      clearSession();
      clearMfaSession();
      router.push("/login");
    },
  });

  const verifyMfa = useMutation({
    mutationFn: (payload: { email: string; otp: string }) =>
      authService.verifyMfa(payload),
    mutationKey: ["auth", "mfa", "verify"],
    onSuccess: (data: LoginSuccessResponse) => {
      clearMfaSession();
      const userWithAvatar = {
        ...data.user,
        avatar: data.user.avatar ?? data.user.avatar_url ?? null,
      };
      setSession({
        token: data.token,
        user: userWithAvatar,
        auctioneer: data.auctioneer,
        can_access_auctioneer_features: data.can_access_auctioneer_features,
      });
      queryClient.setQueryData(["current-user"], {
        user: userWithAvatar,
        auctioneer: data.auctioneer,
        can_access_auctioneer_features: data.can_access_auctioneer_features,
      });
      toast.success("MFA verified successfully!");
      if (data.user.role === "admin" || data.user.role === "superadmin") {
        router.push("/admin/dashboard");
      } else {
        router.push(
          data.can_access_auctioneer_features ? "/auctioneer/dashboard" : "/auctioneer/application-status"
        );
      }
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, "MFA verification failed.");
      toast.error(message);
    },
  });

  const resendMfa = useMutation({
    mutationFn: (payload: { email: string }) => authService.resendMfa(payload),
    mutationKey: ["auth", "mfa", "resend"],
    onSuccess: (data, variables: { email: string }) => {
      saveMfaSession({
        email: variables.email,
        expires_at: Date.now() + (data.expires_in ?? 300) * 1000,
        mfa_channel: "email",
      });
      toast.success(data.message || "MFA code resent.");
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, "Failed to resend MFA code.");
      toast.error(message);
    },
  });

  return {
    useCurrentUser,
    loginAuctioneer,
    loginAdmin,
    verifyMfa,
    resendMfa,
    logout,
  };
};
