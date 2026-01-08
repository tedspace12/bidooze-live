"use client";

import { Badge } from "@/components/ui/badge";

function capitalizeWords(str: string) {
  return str
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function AuctionStatusBadge({ status }: { status: string }) {
  const styleMap: Record<string, string> = {
    draft: "bg-slate-200 text-slate-700",
    scheduled: "bg-blue-100 text-blue-700",
    live: "bg-emerald-100 text-emerald-700",
    closed: "bg-red-100 text-red-700",
    completed: "bg-purple-100 text-purple-700",
  };

  const lowerStatus = status.toLowerCase();
  const style = styleMap[lowerStatus] || "bg-gray-100 text-gray-700";

  return (
    <Badge className={`${style} capitalize px-3 py-1`}>
      {capitalizeWords(status.replace(/-/g, " "))}
    </Badge>
  );
}
