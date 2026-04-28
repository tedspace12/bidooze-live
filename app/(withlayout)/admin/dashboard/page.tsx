"use client";

import { useState } from "react";
import { useAdmin } from "@/features/admin/hooks/useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Hammer,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  TrendingUp,
  UserCheck,
  UserX,
  ShieldOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { AdminStats } from "@/features/admin/services/adminService";

// ─── Compact stat row ─────────────────────────────────────────────────────────

function StatItem({
  label,
  value,
  loading,
  color,
}: {
  label: string;
  value?: number;
  loading: boolean;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      {loading ? (
        <Skeleton className="h-5 w-12" />
      ) : (
        <span className={`text-sm font-bold tabular-nums ${color ?? "text-slate-800"}`}>
          {value ?? 0}
        </span>
      )}
    </div>
  );
}

// ─── Overview card ────────────────────────────────────────────────────────────

function OverviewCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">{children}</CardContent>
    </Card>
  );
}

// ─── Big number highlight ─────────────────────────────────────────────────────

function Highlight({ value, label, loading }: { value?: number; label: string; loading: boolean }) {
  return (
    <div className="flex items-end gap-2 pb-3 border-b mb-1">
      {loading ? (
        <Skeleton className="h-9 w-16" />
      ) : (
        <span className="text-4xl font-bold text-slate-800 tabular-nums">{value ?? 0}</span>
      )}
      <span className="pb-1 text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const {
    useDashboardStats,
    usePendingApplications,
    approveAuctioneer,
    rejectAuctioneer,
    requestReview,
  } = useAdmin();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: pendingApps, isLoading: appsLoading } = usePendingApplications();
  const [approveId, setApproveId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<"reject" | "review" | null>(null);
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");
  const router = useRouter();

  const openApproveDialog = (id: number) => setApproveId(id);
  const confirmApprove = async () => {
    if (!approveId) return;
    await approveAuctioneer.mutateAsync({ id: approveId });
    setApproveId(null);
  };
  const openRejectDialog = (id: number) => { setSelectedId(id); setActionType("reject"); };
  const openReviewDialog = (id: number) => { setSelectedId(id); setActionType("review"); };
  const closeDialog = () => { setSelectedId(null); setActionType(null); setNotes(""); setReason(""); };
  const handleConfirm = async () => {
    if (!selectedId) return;
    if (actionType === "reject") await rejectAuctioneer.mutateAsync({ id: selectedId, reason, notes });
    if (actionType === "review") await requestReview.mutateAsync({ id: selectedId, notes });
    closeDialog();
  };

  const s = stats as AdminStats | undefined;
  const pendingCount = s?.auctioneers.pending ?? 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-500">Platform overview and pending actions.</p>
        </div>
        {!statsLoading && pendingCount > 0 && (
          <Badge className="w-fit bg-orange-100 text-orange-700 border-orange-200 px-3 py-1 text-sm">
            <Clock className="mr-1.5 h-3.5 w-3.5" />
            {pendingCount} pending application{pendingCount !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {/* 3-column overview */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Users */}
        <OverviewCard title="Users" icon={Users}>
          <Highlight value={s?.users.total} label="total users" loading={statsLoading} />
          <StatItem label="Auctioneers" value={s?.users.auctioneers} loading={statsLoading} />
          <StatItem label="Buyers" value={s?.users.buyers} loading={statsLoading} />
          <StatItem label="Admins" value={s?.users.admins} loading={statsLoading} />
        </OverviewCard>

        {/* Auctioneers */}
        <OverviewCard title="Auctioneers" icon={Hammer}>
          <Highlight value={s?.auctioneers.approved} label="approved" loading={statsLoading} />
          <StatItem label="Pending" value={s?.auctioneers.pending} loading={statsLoading} color="text-orange-600" />
          <StatItem label="Under Review" value={s?.auctioneers.under_review} loading={statsLoading} color="text-blue-600" />
          <StatItem label="Rejected" value={s?.auctioneers.rejected} loading={statsLoading} color="text-red-600" />
        </OverviewCard>

        {/* Bidders */}
        <OverviewCard title="Bidders" icon={UserCheck}>
          <Highlight value={s?.bidders.total} label="total bidders" loading={statsLoading} />
          <StatItem label="Active" value={s?.bidders.active} loading={statsLoading} color="text-green-600" />
          <StatItem label="Suspended" value={s?.bidders.suspended} loading={statsLoading} color="text-orange-600" />
          <StatItem label="Disabled" value={s?.bidders.disabled} loading={statsLoading} color="text-red-600" />
        </OverviewCard>
      </div>

      {/* Recent Registrations */}
      {/* <div className="grid gap-4 sm:grid-cols-2">
        <Card className="flex flex-col gap-2 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">New registrations (7 days)</p>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          {statsLoading ? (
            <Skeleton className="h-9 w-16" />
          ) : (
            <p className="text-3xl font-bold text-slate-800">{s?.recent_activity.new_registrations_7days ?? 0}</p>
          )}
        </Card>
        <Card className="flex flex-col gap-2 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">New registrations (30 days)</p>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          {statsLoading ? (
            <Skeleton className="h-9 w-16" />
          ) : (
            <p className="text-3xl font-bold text-slate-800">{s?.recent_activity.new_registrations_30days ?? 0}</p>
          )}
        </Card>
      </div> */}

      {/* Pending Applications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2 text-base">
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              Pending Auctioneer Applications
            </span>
            {!appsLoading && pendingApps && pendingApps.length > 0 && (
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                {pendingApps.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {appsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !pendingApps || pendingApps.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-400" />
              <p className="font-medium text-slate-700">All caught up!</p>
              <p className="mt-1 text-sm text-muted-foreground">No pending applications at the moment.</p>
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="space-y-4 md:hidden">
                {pendingApps.map((app) => (
                  <div key={app.id} className="rounded-lg border p-4 shadow-sm">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-0.5">
                          <p className="font-medium text-slate-900">{app.company_name || "N/A"}</p>
                          <p className="text-sm text-slate-600">{app.contacts?.contact_name || "N/A"}</p>
                          <p className="break-all text-xs text-slate-500">{app.contacts?.email || "N/A"}</p>
                        </div>
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 shrink-0">Pending</Badge>
                      </div>
                      <p className="text-xs text-slate-500">Applied {new Date(app.created_at).toLocaleDateString()}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/auctioneers/${app.id}`)}>
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                        <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700" onClick={() => openApproveDialog(app.id)}>
                          <CheckCircle className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button variant="outline" size="sm" className="text-orange-600" onClick={() => openReviewDialog(app.id)}>
                          <Clock className="h-4 w-4 mr-1" /> Review
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => openRejectDialog(app.id)}>
                          <XCircle className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Date Applied</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingApps.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.company_name || "N/A"}</TableCell>
                        <TableCell>{app.contacts?.contact_name || "N/A"}</TableCell>
                        <TableCell>{app.contacts?.email || "N/A"}</TableCell>
                        <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-wrap justify-end gap-1.5">
                            <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/auctioneers/${app.id}`)}>
                              <Eye className="h-4 w-4 mr-1" /> View
                            </Button>
                            <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700" onClick={() => openApproveDialog(app.id)}>
                              <CheckCircle className="h-4 w-4 mr-1" /> Approve
                            </Button>
                            <Button variant="outline" size="sm" className="text-orange-600" onClick={() => openReviewDialog(app.id)}>
                              <Clock className="h-4 w-4 mr-1" /> Review
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => openRejectDialog(app.id)}>
                              <XCircle className="h-4 w-4 mr-1" /> Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <Dialog open={!!actionType} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {actionType === "reject" ? "Reject Application" : "Request Additional Review"}
            </DialogTitle>
          </DialogHeader>
          {actionType === "reject" && (
            <div className="space-y-2">
              <Label>Reason (required)</Label>
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for rejection" />
            </div>
          )}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" />
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={closeDialog} className="w-full sm:w-auto">Cancel</Button>
            <Button
              onClick={handleConfirm}
              className="w-full sm:w-auto"
              disabled={(actionType === "reject" && !reason.trim()) || (actionType === "review" && !notes.trim())}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!approveId} onOpenChange={() => setApproveId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Auctioneer</AlertDialogTitle>
            <AlertDialogDescription>
              This will allow the auctioneer to create and manage auctions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmApprove} disabled={approveAuctioneer.isPending}>
              {approveAuctioneer.isPending ? "Approving..." : "Approve"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
