"use client";

import { useEffect } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function AuctioneerLogoutPage() {
  const { logout } = useAuth();

  useEffect(() => {
    logout.mutateAsync();
  }, [logout]);

  return null;
}
