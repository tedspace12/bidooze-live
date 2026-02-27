"use client";

import queryClient from "@/app/query";
import { QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { ProgressProvider } from "@bprogress/next/app";
import { AuthStoreProvider } from "@/features/auth/store/authStore";

type Props = {
  children: React.ReactNode;
};

export default function Providers({ children }: Props) {
  return (
    <ProgressProvider
      height="4px"
      color="#3F6B2D"
      options={{ showSpinner: false }}
    >
      <QueryClientProvider client={queryClient}>
        <AuthStoreProvider>
          <Toaster richColors position="top-right" />
          <Suspense>{children}</Suspense>
        </AuthStoreProvider>
      </QueryClientProvider>
    </ProgressProvider>
  );
}
