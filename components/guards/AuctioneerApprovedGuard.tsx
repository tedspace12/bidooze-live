"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/authStore";

export function AuctioneerApprovedGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, canAccessAuctioneerFeatures, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;
    if (user?.role === "auctioneer" && !canAccessAuctioneerFeatures) {
      if (!pathname.startsWith("/auctioneer/application-status")) {
        router.replace("/auctioneer/application-status");
      }
    }
  }, [isAuthenticated, user?.role, canAccessAuctioneerFeatures, pathname, router]);

  return <>{children}</>;
}
