"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { authService } from "@/features/auth/services/authService";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("buyer" | "auctioneer" | "admin" | "superadmin")[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const { useCurrentUser } = useAuth();
  const { data: user, isLoading, isError } = useCurrentUser();

  useEffect(() => {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      router.push("/login");
      return;
    }

    // Check if user has required role
    if (!isLoading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      router.push("/dashboard");
      return;
    }
  }, [user, isLoading, isError, router, allowedRoles]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md p-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  // If not authenticated or error, don't render children (redirect will happen)
  if (isError || !user) {
    return null;
  }

  // Check role if specified
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}

