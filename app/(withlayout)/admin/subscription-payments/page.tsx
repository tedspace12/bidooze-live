"use client";

import { useState } from "react";
import { useAdminSubscription } from "@/features/admin/hooks/useAdminSubscription";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Search, Receipt } from "lucide-react";
import { useRouter } from "next/navigation";

const fmtDt = (d: string) => new Date(d).toLocaleDateString();

function paymentStatusBadge(status: string) {
  const map: Record<string, string> = {
    paid:     "bg-green-100 text-green-700 border-green-200",
    pending:  "bg-yellow-100 text-yellow-700 border-yellow-200",
    failed:   "bg-red-100 text-red-700 border-red-200",
    refunded: "bg-slate-100 text-slate-600 border-slate-200",
  };
  return <Badge className={map[status] ?? ""}>{status}</Badge>;
}

function typeBadge(type: string) {
  return <Badge variant="outline" className="capitalize text-xs">{type}</Badge>;
}

export default function SubscriptionPaymentsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [provider, setProvider] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  const { useAdminPayments } = useAdminSubscription();
  const { data, isLoading } = useAdminPayments({
    search: search || undefined,
    status: status === "all" ? undefined : status,
    provider: provider === "all" ? undefined : provider,
    from: from || undefined,
    to: to || undefined,
    page,
    per_page: 25,
  });

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, data?.last_page ?? 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Subscription Payments</h1>
        <p className="text-slate-600">All subscription payment transactions.</p>
      </div>

      {/* Filters */}
      <div className="rounded-lg border bg-white p-4 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email or reference…"
              className="pl-10"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
          <Select value={provider} onValueChange={(v) => { setProvider(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Providers</SelectItem>
              <SelectItem value="paystack">Paystack</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap">From</label>
            <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className="w-full sm:w-auto" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap">To</label>
            <Input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} className="w-full sm:w-auto" />
          </div>
          {(from || to) && (
            <Button variant="ghost" size="sm" onClick={() => { setFrom(""); setTo(""); setPage(1); }}>
              Clear dates
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white">
        {isLoading ? (
          <div className="space-y-4 p-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : rows.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <Receipt className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium text-slate-700">No payments found</p>
            <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            {/* Mobile */}
            <div className="space-y-3 p-4 md:hidden">
              {rows.map((p) => (
                <div key={p.id} className="rounded-lg border p-4 space-y-1 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">{p.user.name}</p>
                      <p className="text-xs text-muted-foreground">{p.user.email}</p>
                    </div>
                    {paymentStatusBadge(p.status)}
                  </div>
                  <p className="text-sm">${p.amount_usd} · {p.amount_paid.toLocaleString()} {p.currency}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="capitalize">{p.provider}</span>
                    <span>·</span>
                    {typeBadge(p.type)}
                    <span>·</span>
                    <span>{fmtDt(p.paid_at)}</span>
                  </div>
                  <Button
                    size="sm" variant="outline" className="w-full mt-2"
                    onClick={() => router.push(`/admin/subscriptions/${p.subscription_id}`)}
                  >
                    View Subscription
                  </Button>
                </div>
              ))}
            </div>

            {/* Desktop */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Auctioneer</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((p) => (
                    <TableRow key={p.id} className="cursor-pointer hover:bg-muted/30" onClick={() => router.push(`/admin/subscriptions/${p.subscription_id}`)}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{p.user.name}</p>
                          <p className="text-xs text-muted-foreground">{p.user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{p.plan.name}</TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">${p.amount_usd}</div>
                        <div className="text-xs text-muted-foreground">{p.amount_paid.toLocaleString()} {p.currency}</div>
                      </TableCell>
                      <TableCell className="text-sm capitalize">{p.provider}</TableCell>
                      <TableCell>{typeBadge(p.type)}</TableCell>
                      <TableCell>{paymentStatusBadge(p.status)}</TableCell>
                      <TableCell className="text-sm">{fmtDt(p.paid_at)}</TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground truncate max-w-32">
                        {p.provider_reference || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        <div className="flex flex-col gap-3 border-t px-4 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div>Showing {rows.length} of {total}</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || isLoading}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-24 text-center font-medium text-foreground">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages || isLoading}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
