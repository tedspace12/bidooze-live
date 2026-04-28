"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { FeatureSlotHistoryItem } from "@/features/feature-slots/types";

export function FeatureSlotHistory({ history }: { history?: FeatureSlotHistoryItem[] | null }) {
  if (!history || history.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
        No assignment history yet.
      </div>
    );
  }

  const statusBadge = (status?: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700 border-green-200">Completed</Badge>;
      case "expired":
        return <Badge className="bg-red-100 text-red-700 border-red-200">Expired</Badge>;
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>;
    }
  };

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-3 text-sm font-semibold text-slate-900">History</div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Auction</TableHead>
            <TableHead>Assigned by</TableHead>
            <TableHead>Time range</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((h) => (
            <TableRow key={String(h.id)}>
              <TableCell className="font-medium">
                {h.auction?.name ?? h.auction?.id ?? "—"}
              </TableCell>
              <TableCell>{h.assigned_by === "auctioneer" ? "Auctioneer (Win)" : "Admin"}</TableCell>
              <TableCell>
                {h.starts_at ? new Date(h.starts_at).toLocaleString() : "—"} →{" "}
                {h.ends_at ? new Date(h.ends_at).toLocaleString() : "—"}
              </TableCell>
              <TableCell>{statusBadge(h.status)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

