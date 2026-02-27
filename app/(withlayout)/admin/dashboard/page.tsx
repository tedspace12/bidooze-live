"use client";
import { useState } from "react";
import { useAdmin } from "@/features/admin/hooks/useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Hammer, Clock, CheckCircle, XCircle, Eye } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";


export default function AdminDashboard() {
  const { useDashboardStats, usePendingApplications, approveAuctioneer, rejectAuctioneer, requestReview, } = useAdmin();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: pendingApps, isLoading: appsLoading } = usePendingApplications();
  const [approveId, setApproveId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<"reject" | "review" | null>(null);
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");
  const router = useRouter();

  const openApproveDialog = (id: number) => {
    setApproveId(id);
  };

  const confirmApprove = async () => {
    if (!approveId) return;

    await approveAuctioneer.mutateAsync({ id: approveId });
    setApproveId(null);
  };


  const openRejectDialog = (id: number) => {
    setSelectedId(id);
    setActionType("reject");
  };

  const openReviewDialog = (id: number) => {
    setSelectedId(id);
    setActionType("review");
  };

  const closeDialog = () => {
    setSelectedId(null);
    setActionType(null);
    setNotes("");
    setReason("");
  };

  const handleConfirm = async () => {
    if (!selectedId) return;

    if (actionType === "reject") {
      await rejectAuctioneer.mutateAsync({
        id: selectedId,
        reason,
        notes,
      });
    }

    if (actionType === "review") {
      await requestReview.mutateAsync({
        id: selectedId,
        notes,
      });
    }

    closeDialog();
  };


  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-600 mt-1">Overview of platform performance and pending tasks.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{stats?.users.total}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Auctioneers</CardTitle>
            <Hammer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{stats?.users.auctioneers}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Auctioneers</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{stats?.auctioneers.approved}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold text-orange-600">{stats?.auctioneers.pending}</div>}
          </CardContent>
        </Card>
      </div>

      {/* Pending Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Auctioneer Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {appsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !pendingApps || pendingApps.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">No pending applications.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Date Applied</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingApps.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.company_name || "—"}</TableCell>
                    <TableCell>{app.contacts?.contact_name || "—"}</TableCell>
                    <TableCell>{app.contacts?.email || "—"}</TableCell>
                    <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        Pending
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/auctioneers/${app.id}`)}>
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => openApproveDialog(app.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-orange-600"
                        onClick={() => openReviewDialog(app.id)}
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => openRejectDialog(app.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={!!actionType} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "reject"
                ? "Reject Auctioneer Application"
                : "Request Additional Review"}
            </DialogTitle>
          </DialogHeader>

          {actionType === "reject" && (
            <div className="space-y-2">
              <Label>Reason (required)</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for rejection"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes for the auctioneer"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={
                (actionType === "reject" && !reason.trim()) ||
                (actionType === "review" && !notes.trim())
              }
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={!!approveId} onOpenChange={() => setApproveId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Auctioneer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this auctioneer?
              This action will allow them to create and manage auctions.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmApprove}
              disabled={approveAuctioneer.isPending}
            >
              {approveAuctioneer.isPending ? "Approving..." : "Approve"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
