export type AuthPanel = "admin" | "auctioneer";

// Admin pages live under /admin/*; everything else is the auctioneer panel.
// This is route inference, and it is deliberately NOT used as a hidden
// default anywhere in services/api.ts or the feature services — every call
// there must state its panel explicitly (withAdminAuth / withAuctioneerAuth).
// It exists only for the handful of genuinely panel-ambiguous call sites that
// have no other signal to go on: the edge middleware (proxy.ts) and the small
// set of shared auth calls (current-user, logout) used identically by both
// panels' UIs.
export function detectAuthPanel(pathname: string): AuthPanel {
  return pathname.startsWith("/admin") ? "admin" : "auctioneer";
}

// Client-only convenience wrapper around detectAuthPanel for the shared call
// sites described above.
export function currentAuthPanel(): AuthPanel {
  if (typeof window === "undefined") return "auctioneer";
  return detectAuthPanel(window.location.pathname);
}

export const tokenCookieName = (panel: AuthPanel): string => `bidooze_auth_token_${panel}`;
export const sessionCookieName = (panel: AuthPanel): string => `bidooze_auth_session_${panel}`;
