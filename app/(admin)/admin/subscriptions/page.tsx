"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminSubscription } from "@/features/admin/hooks/useAdminSubscription";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ChevronLeft, ChevronRight, Eye, Search,
  CreditCard, Clock, AlertTriangle, XCircle, TrendingUp,
} from "lucide-react";
import type { AdminSubscription } from "@/features/admin/services/adminSubscriptionService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusBadge(status: AdminSubscription["status"]) {
  switch (status) {
    case "active":   return <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>;
    case "trial":    return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Trial</Badge>;
    case "grace":    return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Grace</Badge>;
    case "expired":  return <Badge className="bg-red-100 text-red-700 border-red-200">Expired</Badge>;
    case "cancelled":return <Badge className="bg-slate-100 text-slate-600 border-slate-200">Cancelled</Badge>;
    default:         return <Badge variant="outline">{status}</Badge>;
  }
}

function fmt(d: string | null) {
  return d ? new Date(d).toLocaleDateString() : "—";
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, accent, loading }: {
  label: string; value?: string | number; icon: React.ElementType; accent?: string; loading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-8 w-24" /> : (
          <div className={`text-2xl font-bold ${accent ?? ""}`}>{value ?? "—"}</div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AdminSubscriptionsPage() {
  const router = useRouter();
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { useSubscriptions, useSubscriptionStats } = useAdminSubscription();
  const { data: stats, isLoading: statsLoading } = useSubscriptionStats();
  const { data, isLoading } = useSubscriptions({
    status: status === "all" ? undefined : status,
    search: search || undefined,
    page,
    per_page: 20,
  });

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, data?.last_page ?? 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Subscriptions</h1>
        <p className="text-slate-600">Manage all auctioneer subscriptions.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active" value={stats?.counts.active} icon={CreditCard} accent="text-green-600" loading={statsLoading} />
        <StatCard label="Trial" value={stats?.counts.trial} icon={Clock} accent="text-blue-600" loading={statsLoading} />
        <StatCard label="Grace" value={stats?.counts.grace} icon={AlertTriangle} accent="text-yellow-600" loading={statsLoading} />
        <StatCard label="Expired / Cancelled" value={stats ? stats.counts.expired + stats.counts.cancelled : undefined} icon={XCircle} accent="text-red-600" loading={statsLoading} />
      </div>

      {/* Revenue row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-28" /> : (
              <div className="text-2xl font-bold">${stats?.revenue.total_usd.toLocaleString()}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-28" /> : (
              <div className="text-2xl font-bold">${stats?.revenue.this_month_usd.toLocaleString()}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <TrendingUp className="h-4 w-4" /> Renewal Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-20" /> : (
              <div className="text-2xl font-bold text-green-600">{stats?.renewal_rate_percent ?? "—"}%</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-lg border bg-white p-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full xl:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            className="pl-10"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="grace">Grace</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white">
        {isLoading ? (
          <div className="space-y-4 p-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : rows.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <CreditCard className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium text-slate-700">No subscriptions found</p>
            <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <>
            {/* Mobile */}
            <div className="space-y-3 p-4 md:hidden">
              {rows.map((s) => (
                <div key={s.id} className="rounded-lg border p-4 shadow-sm space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{s.user.name}</p>
                      <p className="text-sm text-slate-500">{s.user.email}</p>
                    </div>
                    {statusBadge(s.status)}
                  </div>
                  <p className="text-sm text-slate-600">{s.plan.name} · {s.days_remaining}d left · ends {fmt(s.ends_at)}</p>
                  <Button size="sm" variant="outline" className="w-full" onClick={() => router.push(`/admin/subscriptions/${s.id}`)}>
                    <Eye className="mr-1 h-4 w-4" /> View
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
                    <TableHead>Status</TableHead>
                    <TableHead>Days Left</TableHead>
                    <TableHead>Ends At</TableHead>
                    <TableHead>Auto-Renew</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{s.user.name}</p>
                          <p className="text-xs text-muted-foreground">{s.user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{s.plan.name}</TableCell>
                      <TableCell>{statusBadge(s.status)}</TableCell>
                      <TableCell>{s.days_remaining > 0 ? s.days_remaining : "—"}</TableCell>
                      <TableCell>{fmt(s.ends_at)}</TableCell>
                      <TableCell>
                        <Badge variant={s.auto_renew ? "default" : "outline"} className="text-xs">
                          {s.auto_renew ? "On" : "Off"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/subscriptions/${s.id}`)}>
                          <Eye className="mr-1 h-4 w-4" /> View
                        </Button>
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
