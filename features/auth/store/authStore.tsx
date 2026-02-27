"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import type { AuthSession, AuthUser, AuctioneerProfile } from "@/features/auth/types";
import { clearSessionFromDocument, readSessionFromDocument, writeSessionToDocument } from "@/lib/auth-session";
import { getToken, removeToken, setToken } from "@/services/api";

type AuthStoreState = {
  token: string | null;
  user: AuthUser | null;
  auctioneer: AuctioneerProfile | null;
  canAccessAuctioneerFeatures: boolean;
  isAuthenticated: boolean;
  setSession: (payload: {
    token?: string | null;
    user: AuthUser | null;
    auctioneer: AuctioneerProfile | null;
    can_access_auctioneer_features?: boolean;
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

  const value = useMemo<AuthStoreState>(() => {
    const isAuthenticated = !!token;
    return {
      token,
      user,
      auctioneer,
      canAccessAuctioneerFeatures: canAccess,
      isAuthenticated,
      setSession: (payload) => {
        const nextToken = payload.token ?? getToken();
        if (nextToken) setToken(nextToken);
        setTokenState(nextToken || null);
        setUserState(payload.user);
        setAuctioneerState(payload.auctioneer);
        const nextCanAccess = !!payload.can_access_auctioneer_features;
        setCanAccess(nextCanAccess);
        const session: AuthSession = {
          token: nextToken || null,
          user: payload.user,
          auctioneer: payload.auctioneer,
          can_access_auctioneer_features: nextCanAccess,
        };
        writeSessionToDocument(session);
      },
      clearSession: () => {
        setTokenState(null);
        setUserState(null);
        setAuctioneerState(null);
        setCanAccess(false);
        clearSessionFromDocument();
        removeToken();
      },
    };
  }, [token, user, auctioneer, canAccess]);

  return <AuthStoreContext.Provider value={value}>{children}</AuthStoreContext.Provider>;
}

export function useAuthStore() {
  const ctx = useContext(AuthStoreContext);
  if (!ctx) {
    throw new Error("useAuthStore must be used within AuthStoreProvider");
  }
  return ctx;
}
