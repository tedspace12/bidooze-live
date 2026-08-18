"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import type { AuthSession, AuthUser, AuctioneerProfile, TeamMemberInfo, TeamPermissions } from "@/features/auth/types";
import { clearSessionFromDocument, readSessionFromDocument, writeSessionToDocument } from "@/lib/auth-session";
import { getToken, removeToken, setToken } from "@/services/api";
import { AuthPanel, detectAuthPanel } from "@/lib/auth-panel";
import { useHasMounted } from "@/hooks/useHasMounted";

// Built-in permissions per role (keeps auth layer self-contained)
const BUILT_IN_ROLE_PERMISSIONS: Record<
  Exclude<TeamMemberInfo["role"], "custom">,
  TeamPermissions
> = {
  owner:      { edit_miscellaneous: true,  create_edit_auctions: true,  run_live_auction: true,  process_payments: true,  view_reports: true,  export_financials: true,  manage_users: true,  transfer_ownership: true,  manage_billing: true  },
  admin:      { edit_miscellaneous: true,  create_edit_auctions: true,  run_live_auction: true,  process_payments: true,  view_reports: true,  export_financials: true,  manage_users: true,  transfer_ownership: false, manage_billing: false },
  clerk:      { edit_miscellaneous: false, create_edit_auctions: false, run_live_auction: true,  process_payments: true,  view_reports: true,  export_financials: false, manage_users: false, transfer_ownership: false, manage_billing: false },
  cataloger:  { edit_miscellaneous: false, create_edit_auctions: true,  run_live_auction: false, process_payments: false, view_reports: true,  export_financials: false, manage_users: false, transfer_ownership: false, manage_billing: false },
  accountant: { edit_miscellaneous: false, create_edit_auctions: false, run_live_auction: false, process_payments: false, view_reports: true,  export_financials: true,  manage_users: false, transfer_ownership: false, manage_billing: false },
};

type AuthStoreState = {
  token: string | null;
  user: AuthUser | null;
  auctioneer: AuctioneerProfile | null;
  teamMember: TeamMemberInfo | null;
  canAccessAuctioneerFeatures: boolean;
  isAuthenticated: boolean;
  hasPermission: (key: keyof TeamPermissions) => boolean;
  setSession: (payload: {
    token?: string | null;
    user: AuthUser | null;
    auctioneer: AuctioneerProfile | null;
    can_access_auctioneer_features?: boolean;
    team_member?: TeamMemberInfo | null;
    // Overrides the route-inferred panel — needed on shared routes like
    // /auth/mfa where the current page can't tell you which panel logged in.
    panel?: AuthPanel;
  }) => void;
  clearSession: () => void;
};

const AuthStoreContext = createContext<AuthStoreState | null>(null);

type AuthStoreProviderProps = {
  children: React.ReactNode;
  // When set, this provider permanently represents that one panel — no
  // pathname-based detection, no resyncing on navigation. Use this for
  // layouts that are physically scoped to a single panel (e.g. the admin
  // route group), so admin and auctioneer state can never share a slot or
  // race each other mid-navigation. Omit it only for providers that must
  // serve panel-ambiguous routes (the root provider, for public pages like
  // /login, /admin/login, /auth/mfa).
  panel?: AuthPanel;
};

export function AuthStoreProvider({ children, panel: fixedPanel }: AuthStoreProviderProps) {
  const pathname = usePathname();
  const panel = fixedPanel ?? detectAuthPanel(pathname || "/");

  const initial = readSessionFromDocument(panel);
  const [token, setTokenState] = useState<string | null>(initial?.token || getToken(panel));
  const [user, setUserState] = useState<AuthUser | null>(initial?.user || null);
  const [auctioneer, setAuctioneerState] = useState<AuctioneerProfile | null>(initial?.auctioneer || null);
  const [canAccess, setCanAccess] = useState<boolean>(!!initial?.can_access_auctioneer_features);
  const [teamMember, setTeamMemberState] = useState<TeamMemberInfo | null>(
    (initial?.team_member as TeamMemberInfo | null | undefined) ?? null
  );
  const [syncedPanel, setSyncedPanel] = useState(panel);

  // The server never sees cookies, so it always renders as logged out. The
  // client's first render (the hydration pass) DOES have cookie access, so
  // without this gate that first pass would render differently from the
  // server HTML — a real hydration mismatch, not just a cosmetic flash.
  // Gating the exposed values behind a post-mount flag keeps the first
  // client render identical to the server; real values apply one tick
  // later via a normal (non-hydration) re-render.
  const hasMounted = useHasMounted();

  // Re-sync from the matching panel's cookies whenever navigation crosses
  // between the admin and auctioneer panels, so each keeps its own session
  // without needing a full page reload. Adjusting state during render (rather
  // than in an effect) is React's documented pattern for this — see
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  //
  // Skipped entirely when `fixedPanel` is set: a fixed-panel provider never
  // represents more than one panel over its lifetime, so there is nothing to
  // resync — this is what removes the cross-panel race on login (a fixed
  // provider can never transiently read "the other panel's" cookies mid-
  // navigation, because it never reads any panel but its own).
  if (!fixedPanel && panel !== syncedPanel) {
    setSyncedPanel(panel);
    const session = readSessionFromDocument(panel);
    setTokenState(session?.token || getToken(panel));
    setUserState(session?.user || null);
    setAuctioneerState(session?.auctioneer || null);
    setCanAccess(!!session?.can_access_auctioneer_features);
    setTeamMemberState((session?.team_member as TeamMemberInfo | null | undefined) ?? null);
  }

  const value = useMemo<AuthStoreState>(() => {
    // Match the server's "logged out" render until we're past hydration.
    const effectiveToken = hasMounted ? token : null;
    const effectiveUser = hasMounted ? user : null;
    const effectiveAuctioneer = hasMounted ? auctioneer : null;
    const effectiveTeamMember = hasMounted ? teamMember : null;
    const effectiveCanAccess = hasMounted ? canAccess : false;
    const isAuthenticated = !!effectiveToken;

    const hasPermission = (key: keyof TeamPermissions): boolean => {
      // Platform admins always have full access
      if (effectiveUser?.role === "admin" || effectiveUser?.role === "superadmin") return true;
      // No team_member record = this user IS the auctioneer owner
      if (!effectiveTeamMember) return true;
      if (effectiveTeamMember.role === "owner") return true;
      if (effectiveTeamMember.role === "custom") return effectiveTeamMember.custom_permissions?.[key] ?? false;
      return BUILT_IN_ROLE_PERMISSIONS[effectiveTeamMember.role as Exclude<TeamMemberInfo["role"], "custom">]?.[key] ?? false;
    };

    return {
      token: effectiveToken,
      user: effectiveUser,
      auctioneer: effectiveAuctioneer,
      teamMember: effectiveTeamMember,
      canAccessAuctioneerFeatures: effectiveCanAccess,
      isAuthenticated,
      hasPermission,
      setSession: (payload) => {
        const targetPanel = payload.panel ?? panel;
        const nextToken = payload.token ?? getToken(targetPanel);
        if (nextToken) setToken(nextToken, targetPanel);
        setTokenState(nextToken || null);
        setUserState(payload.user);
        setAuctioneerState(payload.auctioneer);
        const nextCanAccess = !!payload.can_access_auctioneer_features;
        setCanAccess(nextCanAccess);
        const nextTeamMember = payload.team_member ?? null;
        setTeamMemberState(nextTeamMember);
        const session: AuthSession = {
          token: nextToken || null,
          user: payload.user,
          auctioneer: payload.auctioneer,
          can_access_auctioneer_features: nextCanAccess,
          team_member: nextTeamMember,
        };
        writeSessionToDocument(session, targetPanel);
      },
      clearSession: () => {
        setTokenState(null);
        setUserState(null);
        setAuctioneerState(null);
        setTeamMemberState(null);
        setCanAccess(false);
        clearSessionFromDocument(panel);
        removeToken(panel);
      },
    };
  }, [token, user, auctioneer, teamMember, canAccess, panel, hasMounted]);

  return <AuthStoreContext.Provider value={value}>{children}</AuthStoreContext.Provider>;
}

export function useAuthStore() {
  const ctx = useContext(AuthStoreContext);
  if (!ctx) {
    throw new Error("useAuthStore must be used within AuthStoreProvider");
  }
  return ctx;
}
