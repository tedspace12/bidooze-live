import Cookies from "js-cookie";
import { AuthPanel, sessionCookieName } from "@/lib/auth-panel";

export type AuthSessionPayload = {
  token: string | null;
  user: {
    id: number;
    name: string;
    email: string;
    role: "auctioneer" | "admin" | "superadmin";
    account_status: string;
  } | null;
  auctioneer: {
    id: number;
    status: string;
    registration_step: number;
    company_name: string | null;
  } | null;
  can_access_auctioneer_features: boolean;
  team_member?: {
    id: string;
    role: "owner" | "admin" | "clerk" | "cataloger" | "accountant" | "custom";
    custom_permissions: {
      edit_miscellaneous: boolean;
      create_edit_auctions: boolean;
      run_live_auction: boolean;
      process_payments: boolean;
      view_reports: boolean;
      export_financials: boolean;
      manage_users: boolean;
      transfer_ownership: boolean;
      manage_billing: boolean;
    } | null;
  } | null;
};

// For RAW (still URI-encoded) cookie values — e.g. proxy.ts reading
// request.cookies, which does not auto-decode the way js-cookie does.
export function parseSessionCookie(raw?: string | null): AuthSessionPayload | null {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw);
    return JSON.parse(decoded) as AuthSessionPayload;
  } catch {
    return null;
  }
}

// For values js-cookie has already decoded for us.
function parseDecodedSession(raw?: string | null): AuthSessionPayload | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSessionPayload;
  } catch {
    return null;
  }
}

export function readSessionFromDocument(panel: AuthPanel): AuthSessionPayload | null {
  if (typeof document === "undefined") return null;
  return parseDecodedSession(Cookies.get(sessionCookieName(panel)));
}

export function writeSessionToDocument(session: AuthSessionPayload, panel: AuthPanel) {
  if (typeof document === "undefined") return;
  // No `expires` — this stays a session cookie, cleared when the browser closes.
  // sameSite: "lax", not "strict" — see the matching comment on setToken() in
  // services/api.ts; this cookie needs to survive the same third-party
  // redirect-back flows (Stripe Connect, Paystack, OAuth).
  Cookies.set(sessionCookieName(panel), JSON.stringify(session), {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export function clearSessionFromDocument(panel: AuthPanel) {
  if (typeof document === "undefined") return;
  Cookies.remove(sessionCookieName(panel), { path: "/" });
}
