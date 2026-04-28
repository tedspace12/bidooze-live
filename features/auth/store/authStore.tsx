"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import type { AuthSession, AuthUser, AuctioneerProfile, TeamMemberInfo, TeamPermissions } from "@/features/auth/types";
import { clearSessionFromDocument, readSessionFromDocument, writeSessionToDocument } from "@/lib/auth-session";
import { getToken, removeToken, setToken } from "@/services/api";

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
  }) => void;
  clearSession: () => void;
};

const AuthStoreContext = createContext<AuthStoreState | null>(null);

export function AuthStoreProvider({ children }: { children: React.ReactNode }) {
  const initial = readSessionFromDocument();
  const [token, setTokenState] = useState<string | null>(initial?.token || getToken());
  const [user, setUserState] = useState<AuthUser | null>(initial?.user || null);
  const [auctioneer, setAuctioneerState] = useState<AuctioneerProfile | null>(initial?.auctioneer || null);
  const [canAccess, setCanAccess] = useState<boolean>(!!initial?.can_access_auctioneer_features);
  const [teamMember, setTeamMemberState] = useState<TeamMemberInfo | null>(
    (initial?.team_member as TeamMemberInfo | null | undefined) ?? null
  );

  const value = useMemo<AuthStoreState>(() => {
    const isAuthenticated = !!token;

    const hasPermission = (key: keyof TeamPermissions): boolean => {
      // Platform admins always have full access
      if (user?.role === "admin" || user?.role === "superadmin") return true;
      // No team_member record = this user IS the auctioneer owner
      if (!teamMember) return true;
      if (teamMember.role === "owner") return true;
      if (teamMember.role === "custom") return teamMember.custom_permissions?.[key] ?? false;
      return BUILT_IN_ROLE_PERMISSIONS[teamMember.role as Exclude<TeamMemberInfo["role"], "custom">]?.[key] ?? false;
    };

    return {
      token,
      user,
      auctioneer,
      teamMember,
      canAccessAuctioneerFeatures: canAccess,
      isAuthenticated,
      hasPermission,
      setSession: (payload) => {
        const nextToken = payload.token ?? getToken();
        if (nextToken) setToken(nextToken);
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
        writeSessionToDocument(session);
      },
      clearSession: () => {
        setTokenState(null);
        setUserState(null);
        setAuctioneerState(null);
        setTeamMemberState(null);
        setCanAccess(false);
        clearSessionFromDocument();
        removeToken();
      },
    };
  }, [token, user, auctioneer, teamMember, canAccess]);

  return <AuthStoreContext.Provider value={value}>{children}</AuthStoreContext.Provider>;
}

export function useAuthStore() {
  const ctx = useContext(AuthStoreContext);
  if (!ctx) {
    throw new Error("useAuthStore must be used within AuthStoreProvider");
  }
  return ctx;
}
