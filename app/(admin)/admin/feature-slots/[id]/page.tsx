"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FeatureSlotDetailPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/feature-slots");
  }, [router]);
  return null;
}
