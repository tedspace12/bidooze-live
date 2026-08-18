import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { redirect } from "next/navigation";
import { clearSessionFromDocument } from "@/lib/auth-session";
import { AuthPanel, currentAuthPanel, tokenCookieName } from "@/lib/auth-panel";
import { dispatchRegistrationIncomplete } from "@/lib/registration-reminder";

// Extend Axios config to support skipAuth
declare module "axios" {
  export interface AxiosRequestConfig {
    skipAuth?: boolean;
    skipForbiddenRedirect?: boolean;
    // The panel this specific request actually authenticated as — stamped
    // by sendWithToken() below. The 401 handler reads this instead of
    // guessing from the current URL, so a background request for one panel
    // (e.g. an auctioneer-scoped poll firing while sitting on an admin page)
    // can never cause the OTHER panel's session to be cleared.
    panel?: AuthPanel;
  }
}

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:8000/api";

let isHandlingUnauthorized = false;

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// panel is always required here — there is no hidden default or route
// inference at this level. Callers that genuinely don't know their panel
// statically (see withAuth below) must resolve one explicitly first.
export const getToken = (panel: AuthPanel): string | null => Cookies.get(tokenCookieName(panel)) ?? null;

export const setToken = (token: string, panel: AuthPanel): void => {
  Cookies.set(tokenCookieName(panel), token, {
    expires: 7,
    path: "/",
    // Lax, not Strict: Strict withholds the cookie on the first request back
    // from a third-party redirect (Stripe Connect onboarding, Paystack,
    // OAuth) even though the destination is our own domain, since the
    // navigation *originates* cross-site — which is exactly what sent users
    // to /login instead of back to their settings page after connecting
    // Stripe. Lax still blocks cross-site POST/PUT/DELETE (real CSRF
    // protection); it only allows top-level GET navigations like this one.
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
};

export const removeToken = (panel: AuthPanel): void => {
  Cookies.remove(tokenCookieName(panel), { path: "/" });
};

// Polls briefly for the token right after it's written, guarding against the
// rare case where a request fires before a just-set cookie is visible yet
// (e.g. immediately after login/MFA redirect).
const TOKEN_POLL_ATTEMPTS = 10;
const TOKEN_POLL_DELAY_MS = 500;

async function getTokenWithRetry(panel: AuthPanel): Promise<string | null> {
  for (let attempt = 0; attempt < TOKEN_POLL_ATTEMPTS; attempt++) {
    const token = getToken(panel);
    if (token) return token;
    if (attempt < TOKEN_POLL_ATTEMPTS - 1) {
      await new Promise((resolve) => setTimeout(resolve, TOKEN_POLL_DELAY_MS));
    }
  }
  return null;
}

api.interceptors.request.use((config) => {
  // Auth header will be attached by withAuth helper
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<unknown>) => {
    const status = error.response?.status;
    const data = error.response?.data;
    const url = error.config?.url || "";
    const errorMessage =
      data && typeof data === "object" ? (data as { message?: string }).message : undefined;


    // List of public/auth routes where 401 should NOT redirect
    const authEndpoints = [
      "/admin/login",
      "/auctioneer/login",
      "/login",
      "/auth/login",
      "/auth/mfa/verify",
      "/auth/mfa/resend",
      "/auctioneer/password/forgot",
      "/auctioneer/password/reset",
      "/admin/password/forgot",
      "/admin/password/reset",
    ];

    const isAuthRequest = authEndpoints.some((endpoint) => url === endpoint);

    if (status === 401 && !error.config?.skipAuth && !isAuthRequest) {
      if (!isHandlingUnauthorized) {
        isHandlingUnauthorized = true;
        // Only the panel that actually made this request gets logged out —
        // a 401 on one panel's token must never touch the other panel's.
        // Prefer the panel actually stamped on the failed request; only fall
        // back to guessing from the current URL for requests that never went
        // through sendWithToken (skipAuth calls, or requests issued outside
        // withAdminAuth/withAuctioneerAuth/withAuth).
        const panel = error.config?.panel ?? currentAuthPanel();
        removeToken(panel);
        clearSessionFromDocument(panel);
        toast.error("Your session has expired. Please log in again.");
        const loginPath = panel === "admin" ? "/admin/login" : "/login";
        // Avoid throwing redirect in interceptor on server; only on client
        if (typeof window !== "undefined") {
          window.location.href = loginPath;
        } else {
          redirect(loginPath);
        }
        setTimeout(() => {
          isHandlingUnauthorized = false;
        }, 2000);
      }
    } else if (status === 402) {
      // Subscription required — fire event so SubscriptionRequiredModal can show
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("subscription-required"));
      }
    } else if (status === 403 && !error.config?.skipForbiddenRedirect) {
      toast.error(errorMessage || "Not approved yet.");
      if (typeof window !== "undefined") {
        window.location.href = "/auctioneer/application-status";
      } else {
        redirect("/auctioneer/application-status");
      }
    } else if (status === 422) {
      // Validation errors are handled at call site, but we normalize here
      // so callers can access error.response.data.errors
      const errors = data && typeof data === "object" ? (data as { errors?: unknown }).errors : undefined;
      const requirements =
        errors && typeof errors === "object" ? (errors as Record<string, unknown>).auctioneer_requirements : undefined;
      if (Array.isArray(requirements) && requirements.length > 0) {
        dispatchRegistrationIncomplete(requirements.filter((r): r is string => typeof r === "string"));
      }
    }

    return Promise.reject(error);
  }
);

type HttpMethod = "get" | "post" | "put" | "patch" | "delete";
type AuthMethodConfig = AxiosRequestConfig & { skipAuth?: boolean; skipForbiddenRedirect?: boolean };

async function sendWithToken<T>(
  method: HttpMethod,
  panel: AuthPanel,
  url: string,
  dataOrConfig: unknown,
  maybeConfig: AuthMethodConfig | undefined
): Promise<AxiosResponse<T>> {
  const hasBody = method === "post" || method === "put" || method === "patch";
  const config: AuthMethodConfig = (hasBody ? maybeConfig : (dataOrConfig as AuthMethodConfig | undefined)) || {};

  if (!config.headers) config.headers = {};
  // Stamp which panel this request actually authenticated as, so the 401
  // handler can identify the right session instead of guessing from the URL.
  config.panel = panel;

  if (!config.skipAuth) {
    const token = await getTokenWithRetry(panel);
    if (token) (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  if (hasBody) {
    return api[method]<T>(url, dataOrConfig, config);
  }
  return api[method]<T>(url, config);
}

// Bound to one fixed panel — this is what every feature service should use.
// The panel is baked into which of these two objects you import, so it's
// never inferred and never forgettable at the call site.
function createFixedPanelAuthMethod(method: HttpMethod, panel: AuthPanel) {
  return <T = unknown>(url: string, dataOrConfig?: unknown, maybeConfig?: AuthMethodConfig) =>
    sendWithToken<T>(method, panel, url, dataOrConfig, maybeConfig);
}

export const withAdminAuth = {
  get: createFixedPanelAuthMethod("get", "admin"),
  post: createFixedPanelAuthMethod("post", "admin"),
  put: createFixedPanelAuthMethod("put", "admin"),
  patch: createFixedPanelAuthMethod("patch", "admin"),
  delete: createFixedPanelAuthMethod("delete", "admin"),
};

export const withAuctioneerAuth = {
  get: createFixedPanelAuthMethod("get", "auctioneer"),
  post: createFixedPanelAuthMethod("post", "auctioneer"),
  put: createFixedPanelAuthMethod("put", "auctioneer"),
  patch: createFixedPanelAuthMethod("patch", "auctioneer"),
  delete: createFixedPanelAuthMethod("delete", "auctioneer"),
};

// Generic fallback for the small number of genuinely panel-ambiguous calls
// (current-user, logout) that are called identically from both panels' UIs.
// `panel` is required in the config — there's no default here either, callers
// must resolve one (typically via currentAuthPanel()) and pass it explicitly.
type GenericAuthMethodConfig = AuthMethodConfig & { panel: AuthPanel };

function createGenericAuthMethod(method: HttpMethod) {
  return <T = unknown>(url: string, dataOrConfig?: unknown, maybeConfig?: GenericAuthMethodConfig) => {
    const hasBody = method === "post" || method === "put" || method === "patch";
    const config = (hasBody ? maybeConfig : (dataOrConfig as GenericAuthMethodConfig | undefined)) || undefined;
    if (!config?.panel) {
      throw new Error(`withAuth.${method}("${url}") requires an explicit { panel } — no default is inferred.`);
    }
    return sendWithToken<T>(method, config.panel, url, dataOrConfig, maybeConfig);
  };
}

export const withAuth = {
  get: createGenericAuthMethod("get"),
  post: createGenericAuthMethod("post"),
  put: createGenericAuthMethod("put"),
  patch: createGenericAuthMethod("patch"),
  delete: createGenericAuthMethod("delete"),
};

function createWithoutAuthMethod(method: HttpMethod) {
  return async function <T = unknown>(
    url: string,
    dataOrConfig?: unknown,
    maybeConfig?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const hasBody = method === "post" || method === "put" || method === "patch";
    const config: AxiosRequestConfig = (
      hasBody ? maybeConfig : (dataOrConfig as AxiosRequestConfig | undefined)
    ) || {};

    if (hasBody) {
      const body = dataOrConfig;
      return api[method]<T>(url, body, config);
    }

    return api[method]<T>(url, config);
  };
}

export const withoutAuth = {
  get: createWithoutAuthMethod("get"),
  post: createWithoutAuthMethod("post"),
  put: createWithoutAuthMethod("put"),
  patch: createWithoutAuthMethod("patch"),
  delete: createWithoutAuthMethod("delete"),
};

export default api;
