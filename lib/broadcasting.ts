"use client";

import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { API_BASE_URL, getToken } from "@/services/api";

type EchoInstance = Echo<"pusher">;

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

let echoInstance: EchoInstance | null = null;
let echoToken: string | null = null;

const getBroadcastAuthEndpoint = () => {
  const configuredEndpoint = process.env.NEXT_PUBLIC_BROADCAST_AUTH_ENDPOINT;
  if (configuredEndpoint) return configuredEndpoint;

  const apiUrl = new URL(API_BASE_URL, window.location.origin);
  if (apiUrl.pathname.endsWith("/api")) {
    apiUrl.pathname = apiUrl.pathname.slice(0, -4) || "/";
  }

  apiUrl.pathname = `${apiUrl.pathname.replace(/\/+$/, "")}/broadcasting/auth`;
  apiUrl.search = "";
  apiUrl.hash = "";

  return apiUrl.toString();
};

export const isBroadcastingConfigured = () => {
  return Boolean(process.env.NEXT_PUBLIC_PUSHER_APP_KEY);
};

export const getEcho = () => {
  if (typeof window === "undefined") return null;
  if (!isBroadcastingConfigured()) return null;

  const token = getToken();
  if (echoInstance && echoToken === token) return echoInstance;

  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }

  window.Pusher = Pusher;

  const host = process.env.NEXT_PUBLIC_PUSHER_HOST;
  const port = Number(process.env.NEXT_PUBLIC_PUSHER_PORT || 0) || undefined;
  const scheme = process.env.NEXT_PUBLIC_PUSHER_SCHEME || "https";

  echoInstance = new Echo({
    broadcaster: "pusher",
    key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
    cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || "mt1",
    forceTLS: scheme === "https",
    wsHost: host || undefined,
    wsPort: port,
    wssPort: port,
    enabledTransports: host ? ["ws", "wss"] : undefined,
    authEndpoint: getBroadcastAuthEndpoint(),
    auth: {
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  });
  echoToken = token;

  return echoInstance;
};

export const disconnectEcho = () => {
  echoInstance?.disconnect();
  echoInstance = null;
  echoToken = null;
};
