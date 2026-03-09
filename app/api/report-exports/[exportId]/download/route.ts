import { NextRequest, NextResponse } from "next/server";

import { AUTH_SESSION_COOKIE, parseSessionCookie } from "@/lib/auth-session";

const TOKEN_COOKIE = "bidooze_auth_token";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:8000/api";

const extractMessage = (payload: unknown, fallback: string) => {
  if (!payload || typeof payload !== "object") return fallback;
  const message = (payload as { message?: unknown }).message;
  return typeof message === "string" && message.trim() ? message : fallback;
};

const getAuthToken = (request: NextRequest): string | null => {
  const directToken = request.cookies.get(TOKEN_COOKIE)?.value;
  if (directToken) return directToken;

  const sessionRaw = request.cookies.get(AUTH_SESSION_COOKIE)?.value || null;
  const session = parseSessionCookie(sessionRaw);
  return session?.token || null;
};

const copyDownloadHeaders = (response: Response) => {
  const headers = new Headers();

  const headerNames = [
    "content-type",
    "content-disposition",
    "content-length",
    "cache-control",
    "etag",
    "last-modified",
  ];

  headerNames.forEach((name) => {
    const value = response.headers.get(name);
    if (value) headers.set(name, value);
  });

  return headers;
};

const fetchBackendDownload = async (
  exportId: string,
  token: string,
  visited = new Set<string>()
): Promise<Response> => {
  const target = `${API_BASE_URL}/auctioneer/reports/exports/${exportId}/download`;

  if (visited.has(target)) {
    throw new Error("Circular export download request detected.");
  }

  const nextVisited = new Set(visited);
  nextVisited.add(target);

  const response = await fetch(target, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    redirect: "follow",
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type")?.toLowerCase() || "";
  if (!contentType.includes("application/json")) {
    return response;
  }

  const payload = await response.clone().json().catch(() => null);
  const downloadUrl =
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    payload.data &&
    typeof payload.data === "object" &&
    "download_url" in payload.data &&
    typeof payload.data.download_url === "string"
      ? payload.data.download_url
      : payload &&
          typeof payload === "object" &&
          "download_url" in payload &&
          typeof payload.download_url === "string"
        ? payload.download_url
        : null;

  if (!downloadUrl) {
    return response;
  }

  const nestedResponse = await fetch(downloadUrl, {
    method: "GET",
    redirect: "follow",
    cache: "no-store",
  });

  return nestedResponse;
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ exportId: string }> }
) {
  const { exportId } = await context.params;
  const token = getAuthToken(request);

  if (!token) {
    return NextResponse.json(
      { message: "Authentication required for report download." },
      { status: 401 }
    );
  }

  try {
    const response = await fetchBackendDownload(exportId, token);
    const contentType = response.headers.get("content-type")?.toLowerCase() || "";

    if (!response.ok) {
      if (contentType.includes("application/json")) {
        const payload = await response.json().catch(() => null);
        return NextResponse.json(
          payload || { message: "Failed to download export." },
          { status: response.status }
        );
      }

      return NextResponse.json(
        { message: `Failed to download export. Backend returned ${response.status}.` },
        { status: response.status }
      );
    }

    if (contentType.includes("application/json")) {
      const payload = await response.json().catch(() => null);
      return NextResponse.json(
        { message: extractMessage(payload, "Invalid report export payload.") },
        { status: 502 }
      );
    }

    return new NextResponse(response.body, {
      status: response.status,
      headers: copyDownloadHeaders(response),
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error && error.message ? error.message : "Failed to download export.";
    return NextResponse.json({ message }, { status: 502 });
  }
}
