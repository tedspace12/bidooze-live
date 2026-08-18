"use client";

import { useState } from "react";
import { useAdmin } from "@/features/admin/hooks/useAdmin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Search, ChevronLeft, ChevronRight, Star, Users, UserCheck, UserX, ShieldOff, Award } from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

function StatCard({
  title,
  value,
  icon: Icon,
  loading,
  accent,
}: {
  title: string;
  value?: number | string;
  icon: React.ElementType;
  loading: boolean;
  accent?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className={`text-2xl font-bold ${accent ?? ""}`}>{value ?? "—"}</div>
        )}
      </CardContent>
    </Card>
  );
}

const getReputationBadge = (level?: string) => {
  if (!level) return <Badge variant="outline">N/A</Badge>;
  const map: Record<string, string> = {
    elite: "bg-purple-100 text-purple-700 border-purple-200",
    trusted: "bg-blue-100 text-blue-700 border-blue-200",
    reliable: "bg-green-100 text-green-700 border-green-200",
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
    low_trust: "bg-red-100 text-red-700 border-red-200",
  };
  const key = level.toLowerCase().replace(/\s+/g, "_");
  return <Badge variant="outline" className={map[key] ?? ""}>{level}</Badge>;
};

export default function BiddersPage() {
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const { useBidders, useBidderStatistics } = useAdmin();
  const { data, isLoading } = useBidders({
    status: status === "all" ? undefined : status,
    search: search || undefined,
    page,
    per_page: 15,
  });
  const { data: stats, isLoading: statsLoading } = useBidderStatistics();

  const bidders = data?.data || [];
  const meta = data?.meta;
  const total = typeof meta?.total === "number" ? meta.total : 0;
  const totalPages = Math.max(1, typeof meta?.last_page === "number" ? meta.last_page : 1);

  const getBidderStatus = (bidder: (typeof bidders)[number]) =>
    bidder.account_status || bidder.status || "unknown";

  const getStatusBadge = (value: string) => {
    switch (value) {
      case "active":
        return <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>;
      case "suspended":
        return <Badge className="bg-orange-100 text-orange-700 border-orange-200">Suspended</Badge>;
      case "disabled":
        return <Badge className="bg-red-100 text-red-700 border-red-200">Disabled</Badge>;
      default:
        return <Badge variant="outline">{value}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-slate-800">Bidder Management</h1>
        <p className="text-slate-600">Monitor bidders, reputation scores, and account health.</p>
      </div>

      {/* Stats */}
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total Bidders" value={stats?.total} icon={Users} loading={statsLoading} />
          <StatCard title="Active" value={stats?.active} icon={UserCheck} loading={statsLoading} accent="text-green-600" />
          <StatCard title="Suspended" value={stats?.suspended} icon={UserX} loading={statsLoading} accent="text-orange-600" />
          <StatCard title="Disabled" value={stats?.disabled} icon={ShieldOff} loading={statsLoading} accent="text-red-600" />
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reputation Breakdown</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex flex-wrap gap-6">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-5 w-24" />)}
              </div>
            ) : stats?.by_reputation ? (
              <div className="flex flex-wrap gap-6">
                {[
                  { label: "Elite", dot: "bg-purple-500", color: "text-purple-700" },
                  { label: "Trusted", dot: "bg-blue-500", color: "text-blue-700" },
                  { label: "Reliable", dot: "bg-green-500", color: "text-green-700" },
                  { label: "Neutral", dot: "bg-slate-400", color: "text-slate-600" },
                  { label: "Low Trust", dot: "bg-red-500", color: "text-red-700" },
                ].map(({ label, dot, color }) => {
                  const val = stats.by_reputation?.[label];
                  if (val === undefined) return null;
                  return (
                    <div key={label} className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full shrink-0 ${dot}`} />
                      <span className={`text-sm ${color}`}>{label}</span>
                      <span className="text-sm font-bold text-slate-800">{val}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">N/A</span>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-lg border bg-white p-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full xl:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search bidders..."
            className="pl-10"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="w-full sm:w-auto">
          <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white">
        {isLoading ? (
          <div className="space-y-4 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : bidders.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium text-slate-700">No bidders found</p>
            <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <>
            {/* Mobile */}
            <div className="space-y-4 p-4 md:hidden">
              {bidders.map((bidder) => (
                <div key={bidder.id} className="rounded-lg border p-4 shadow-sm">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">{bidder.name}</p>
                        <p className="break-all text-sm text-slate-500">{bidder.email}</p>
                      </div>
                      {getStatusBadge(getBidderStatus(bidder))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>Joined {new Date(bidder.created_at).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        {bidder.reputation_score}
                      </span>
                    </div>
                    {bidder.reputation_level && (
                      <div className="flex items-center gap-2">
                        {getReputationBadge(bidder.reputation_level)}
                      </div>
                    )}
                    <Button variant="outline" className="w-full" onClick={() => router.push(`/admin/bidders/${bidder.id}`)}>
                      <Eye className="mr-1 h-4 w-4" /> View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Reputation Score</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bidders.map((bidder) => (
                    <TableRow key={bidder.id}>
                      <TableCell className="font-medium">{bidder.name}</TableCell>
                      <TableCell>{bidder.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          <span>{bidder.reputation_score}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getReputationBadge(bidder.reputation_level)}</TableCell>
                      <TableCell>{getStatusBadge(getBidderStatus(bidder))}</TableCell>
                      <TableCell>{new Date(bidder.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/bidders/${bidder.id}`)}>
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
          <div>Showing {bidders.length} of {total} bidders</div>
          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || isLoading}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-24 text-center font-medium text-foreground">Page {page} of {totalPages}</div>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0 || isLoading}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
