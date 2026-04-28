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
import { Eye, Search, ChevronLeft, ChevronRight, Hammer, Clock, CheckCircle, XCircle, Loader } from "lucide-react";
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

export default function AuctioneersPage() {
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const { useAuctioneers, useAuctioneerStats } = useAdmin();
  const { data, isLoading } = useAuctioneers({
    status: status === "all" ? undefined : status,
    search: search || undefined,
    page,
    per_page: 10,
  });
  const { data: stats, isLoading: statsLoading } = useAuctioneerStats();

  const auctioneers = data?.data ?? [];
  const meta = data?.meta;
  const total = typeof meta?.total === "number" ? meta.total : 0;
  const totalPages = Math.max(1, typeof meta?.last_page === "number" ? meta.last_page : 1);

  const getStatusBadge = (value: string) => {
    switch (value) {
      case "approved":
        return <Badge className="bg-green-100 text-green-700 border-green-200">Approved</Badge>;
      case "pending":
      case "pending_review":
        return <Badge className="bg-orange-100 text-orange-700 border-orange-200">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>;
      case "under_review":
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Under Review</Badge>;
      default:
        return <Badge variant="outline">{value}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-slate-800">Auctioneer Management</h1>
        <p className="text-slate-600">View and manage all registered auctioneers.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total Auctioneers" value={stats?.total} icon={Hammer} loading={statsLoading} />
        <StatCard title="Approved" value={stats?.approved} icon={CheckCircle} loading={statsLoading} accent="text-green-600" />
        <StatCard title="Pending" value={stats?.pending} icon={Clock} loading={statsLoading} accent="text-orange-600" />
        <StatCard title="Under Review" value={stats?.under_review} icon={Loader} loading={statsLoading} accent="text-blue-600" />
        <StatCard title="Rejected" value={stats?.rejected} icon={XCircle} loading={statsLoading} accent="text-red-600" />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-lg border bg-white p-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full xl:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email or company..."
            className="pl-10"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="w-full sm:w-auto">
          <Select value={status} onValueChange={(val) => { setStatus(val); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending_review">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
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
        ) : auctioneers.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <Hammer className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium text-slate-700">No auctioneers found</p>
            <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <>
            {/* Mobile */}
            <div className="space-y-4 p-4 md:hidden">
              {auctioneers.map((auctioneer) => (
                <div key={auctioneer.id} className="rounded-lg border p-4 shadow-sm">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">{auctioneer.user?.name || "N/A"}</p>
                        <p className="text-sm text-slate-600">{auctioneer.company_name || "N/A"}</p>
                        <p className="break-all text-sm text-slate-500">{auctioneer.user?.email || "N/A"}</p>
                      </div>
                      {getStatusBadge(auctioneer.status)}
                    </div>
                    <p className="text-sm text-slate-500">Registered {new Date(auctioneer.created_at).toLocaleDateString()}</p>
                    <Button variant="outline" className="w-full" onClick={() => router.push(`/admin/auctioneers/${auctioneer.id}`)}>
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
                    <TableHead>Company</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auctioneers.map((auctioneer) => (
                    <TableRow key={auctioneer.id}>
                      <TableCell className="font-medium">{auctioneer.user?.name || "N/A"}</TableCell>
                      <TableCell>{auctioneer.company_name || "N/A"}</TableCell>
                      <TableCell>{auctioneer.user?.email || "N/A"}</TableCell>
                      <TableCell>{getStatusBadge(auctioneer.status)}</TableCell>
                      <TableCell>{new Date(auctioneer.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/auctioneers/${auctioneer.id}`)}>
                          <Eye className="mr-1 h-4 w-4" /> View Details
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
          <div>Showing {auctioneers.length} of {total} auctioneers</div>
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
