import { withAuth, withoutAuth, getToken, setToken, removeToken } from "@/services/api";
import { currentAuthPanel, type AuthPanel } from "@/lib/auth-panel";
import type { AuthUser, AuctioneerProfile, TeamMemberInfo, RegistrationProgress } from "../types";

export type { AuthPanel } from "@/lib/auth-panel";

type ApiErrorLike = {
  response?: {
    data?: unknown;
  };
  message?: string;
};

const rethrowApiError = (error: unknown): never => {
  const err = error as ApiErrorLike;
  throw err?.response?.data || { message: err?.message || "Request failed" };
};

export interface LoginSuccessResponse {
  message: string;
  user: AuthUser;
  auctioneer: AuctioneerProfile | null;
  can_access_auctioneer_features: boolean;
  team_member?: TeamMemberInfo | null;
  token: string;
  token_type: string;
  // Only present for auctioneer logins — reflects whatever registration
  // steps (payout, credentials, documents) were skipped during signup,
  // even for already-approved accounts, since submit() never required them.
  registration_progress?: RegistrationProgress;
}

export interface LoginMfaRequiredResponse {
  mfa_required: true;
  mfa_channel?: string;
  expires_in?: number;
  message: string;
}

export type LoginResponse = LoginSuccessResponse | LoginMfaRequiredResponse;

export interface CurrentUserResponse {
  user: AuthUser;
  auctioneer?: AuctioneerProfile | null;
  can_access_auctioneer_features?: boolean;
  team_member?: TeamMemberInfo | null;
}

export interface AcceptInvitePayload {
  token: string;
  display_name?: string;
  password: string;
}

export interface AcceptInviteResponse {
  message: string;
  token: string;
}

export interface SocialLoginPayload {
  provider: "google" | "facebook";
  token: string;
}

export type AuctioneerSocialLoginResponse =
  | LoginSuccessResponse
  | { status: "not_registered"; message: string }
  | { status: "pending_approval"; message: string };

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordPayload {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

const getPasswordEndpoint = (panel: AuthPanel, action: "forgot" | "reset") =>
  `/${panel}/password/${action}`;

export const authService = {
  /**
   * Auctioneer Login
   */
  async loginAuctioneer(email: string, password: string): Promise<LoginResponse> {
    try {
      const res = await withoutAuth.post<LoginResponse>("/auctioneer/login", { email, password });
      if ("token" in res.data && res.data.token) {
        setToken(res.data.token, "auctioneer");
      }
      return res.data;
    } catch (error: unknown) {
      return rethrowApiError(error);
    }
  },

  /**
   * Auctioneer Social Login (Google / Meta)
   * Sends OAuth2 access_token (from oauth2.initTokenClient / FB.login).
   * Backend uses Socialite userFromToken() to verify.
   */
  async socialLoginAuctioneer(payload: SocialLoginPayload): Promise<AuctioneerSocialLoginResponse> {
    try {
      const res = await withoutAuth.post<AuctioneerSocialLoginResponse>("/auctioneer/social", payload);
      if ("token" in res.data && res.data.token) {
        setToken(res.data.token, "auctioneer");
      }
      return res.data;
    } catch (error: unknown) {
      return rethrowApiError(error);
    }
  },

  /**
   * Admin Login
   */
  async loginAdmin(email: string, password: string): Promise<LoginResponse> {
    try {
      const res = await withoutAuth.post<LoginResponse>("/admin/login", { email, password });
      if ("token" in res.data && res.data.token) {
        setToken(res.data.token, "admin");
      }
      return res.data;
    } catch (error: unknown) {
      return rethrowApiError(error);
    }
  },

  /**
   * Verify MFA
   * `panel` identifies which login (admin or auctioneer) started this MFA
   * challenge — /auth/mfa is a shared route, so it can't be inferred from
   * the URL the way other auth calls can.
   */
  async verifyMfa(payload: { email: string; otp: string; panel: AuthPanel }): Promise<LoginSuccessResponse> {
    try {
      const res = await withoutAuth.post<LoginSuccessResponse>("/auth/mfa/verify", {
        email: payload.email,
        otp: payload.otp,
      });
      if (res.data.token) {
        setToken(res.data.token, payload.panel);
      }
      return res.data;
    } catch (error: unknown) {
      return rethrowApiError(error);
    }
  },

  /**
   * Resend MFA Code
   */
  async resendMfa(payload: { email: string }): Promise<{ message: string; expires_in?: number }> {
    try {
      const res = await withoutAuth.post<{ message: string; expires_in?: number }>(
        "/auth/mfa/resend",
        payload
      );
      return res.data;
    } catch (error: unknown) {
      return rethrowApiError(error);
    }
  },

  /**
   * Request Password Reset Link
   */
  async requestPasswordReset(panel: AuthPanel, email: string): Promise<ForgotPasswordResponse> {
    try {
      const res = await withoutAuth.post<ForgotPasswordResponse>(
        getPasswordEndpoint(panel, "forgot"),
        { email }
      );
      return res.data;
    } catch (error: unknown) {
      return rethrowApiError(error);
    }
  },

  /**
   * Reset Password
   */
  async resetPassword(
    panel: AuthPanel,
    payload: ResetPasswordPayload
  ): Promise<{ message: string }> {
    try {
      const res = await withoutAuth.post<{ message: string }>(
        getPasswordEndpoint(panel, "reset"),
        payload
      );
      return res.data;
    } catch (error: unknown) {
      return rethrowApiError(error);
    }
  },

  /**
   * Logout
   * Ambiguous by nature (called identically from both panels' UIs), so this
   * resolves the panel itself from the current route rather than requiring
   * every caller to plumb one through.
   */
  async logout(): Promise<void> {
    const panel = currentAuthPanel();
    try {
      await withAuth.post("/logout", undefined, { panel });
    } catch {
      // Continue even if logout fails
    } finally {
      removeToken(panel);
    }
  },

  /**
   * Get Current User
   */
  async getCurrentUser(): Promise<CurrentUserResponse> {
    try {
      const res = await withAuth.get<CurrentUserResponse>("/user", { panel: currentAuthPanel() });
      return res.data;
    } catch (error: unknown) {
      return rethrowApiError(error);
    }
  },

  /**
   * Accept team member invitation
   */
  async acceptInvite(payload: AcceptInvitePayload): Promise<AcceptInviteResponse> {
    try {
      const res = await withoutAuth.post<AcceptInviteResponse>("/auth/accept-invite", payload);
      if (res.data.token) {
        // Team invites are always for the auctioneer panel.
        setToken(res.data.token, "auctioneer");
      }
      return res.data;
    } catch (error: unknown) {
      return rethrowApiError(error);
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!getToken(currentAuthPanel());
  },
};
