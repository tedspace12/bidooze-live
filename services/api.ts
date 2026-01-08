import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { toast } from "sonner";
import { redirect } from "next/navigation";

// Extend Axios config to support skipAuth
declare module "axios" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface AxiosRequestConfig {
    skipAuth?: boolean;
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:8000/api";

let isHandlingUnauthorized = false;

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getToken = (): string | null => {
  try {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(/(?:^|; )bidooze_auth_token=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
};

export const setToken = (token: string): void => {
  try {
    if (typeof document === "undefined") return;
    const expires = new Date();
    expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const secure = process.env.NODE_ENV === "production" ? "; secure" : "";
    document.cookie = `bidooze_auth_token=${encodeURIComponent(token)}; expires=${expires.toUTCString()}; path=/; samesite=strict${secure}`;
  } catch {
    // Silently fail if cookie setting fails
  }
};

export const removeToken = (): void => {
  try {
    if (typeof document === "undefined") return;
    document.cookie = "bidooze_auth_token=; Max-Age=0; path=/; samesite=strict;";
  } catch {
    // Silently fail if cookie removal fails
  }
};

api.interceptors.request.use((config) => {
  // Auth header will be attached by withAuth helper
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<any>) => {
    const status = error.response?.status;
    const data = error.response?.data as any;

    if (status === 401 && !error.config?.skipAuth) {
      if (!isHandlingUnauthorized) {
        isHandlingUnauthorized = true;
        removeToken();
        toast.error("Your session has expired. Please log in again.");
        // Avoid throwing redirect in interceptor on server; only on client
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        } else {
          redirect("/login");
        }
        setTimeout(() => {
          isHandlingUnauthorized = false;
        }, 2000);
      }
    } else if (status === 403) {
      toast.error(data?.message || "You do not have permission to perform this action.");
    } else if (status === 422) {
      // Validation errors are handled at call site, but we normalize here
      // so callers can access error.response.data.errors
    }

    return Promise.reject(error);
  }
);

type HttpMethod = "get" | "post" | "put" | "delete";

function createWithAuthMethod(method: HttpMethod) {
  return async function <T = any>(
    url: string,
    dataOrConfig?: any,
    maybeConfig?: AxiosRequestConfig & { skipAuth?: boolean }
  ): Promise<AxiosResponse<T>> {
    const token = getToken();

    const hasBody = method === "post" || method === "put";
    const config: AxiosRequestConfig = (hasBody ? maybeConfig : dataOrConfig) || {};

    if (!config.headers) config.headers = {};

    if (token && !config.skipAuth) {
      (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    } else if (!token && !config.skipAuth) {
      // If there's no token but endpoint is expected to be authed,
      // we still let the request go through; backend will return 401.
    }

    if (hasBody) {
      const body = dataOrConfig;
      return api[method]<T>(url, body, config);
    }

    return api[method]<T>(url, config);
  };
}

function createWithoutAuthMethod(method: HttpMethod) {
  return async function <T = any>(
    url: string,
    dataOrConfig?: any,
    maybeConfig?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const hasBody = method === "post" || method === "put";
    const config: AxiosRequestConfig = (hasBody ? maybeConfig : dataOrConfig) || {};

    if (hasBody) {
      const body = dataOrConfig;
      return api[method]<T>(url, body, config);
    }

    return api[method]<T>(url, config);
  };
}

export const withAuth = {
  get: createWithAuthMethod("get"),
  post: createWithAuthMethod("post"),
  put: createWithAuthMethod("put"),
  delete: createWithAuthMethod("delete"),
};

export const withoutAuth = {
  get: createWithoutAuthMethod("get"),
  post: createWithoutAuthMethod("post"),
  put: createWithoutAuthMethod("put"),
  delete: createWithoutAuthMethod("delete"),
};

export default api;


