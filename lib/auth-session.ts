export const AUTH_SESSION_COOKIE = "bidooze_auth_session";

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

export function parseSessionCookie(raw?: string | null): AuthSessionPayload | null {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw);
    return JSON.parse(decoded) as AuthSessionPayload;
  } catch {
    return null;
  }
}

export function readSessionFromDocument(): AuthSessionPayload | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${AUTH_SESSION_COOKIE}=([^;]*)`));
  return parseSessionCookie(match ? match[1] : null);
}

export function writeSessionToDocument(session: AuthSessionPayload) {
  if (typeof document === "undefined") return;
  const value = encodeURIComponent(JSON.stringify(session));
  const secure = process.env.NODE_ENV === "production" ? "; secure" : "";
  document.cookie = `${AUTH_SESSION_COOKIE}=${value}; path=/; samesite=strict${secure}`;
}

export function clearSessionFromDocument() {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_SESSION_COOKIE}=; Max-Age=0; path=/; samesite=strict;`;
}
