"use client";

import { useState } from "react";
import { useAdminSubscription } from "@/features/admin/hooks/useAdminSubscription";
import type { AdminCoupon, CreateCouponPayload } from "@/features/admin/services/adminSubscriptionService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ChevronLeft, ChevronRight, Edit2, Loader2, Plus, Search, Tag, Trash2, UserPlus,
} from "lucide-react";

// ─── Coupon form ──────────────────────────────────────────────────────────────

function CouponFormDialog({
  open, onClose, initial,
}: {
  open: boolean;
  onClose: () => void;
  initial?: AdminCoupon | null;
}) {
  const { createCoupon, updateCoupon } = useAdminSubscription();
  const isEdit = !!initial;

  const [form, setForm] = useState<CreateCouponPayload & { id?: number }>(() =>
    initial
      ? {
          id: initial.id,
          description: initial.description ?? "",
          discount_type: initial.discount_type,
          discount_value: Number(initial.discount_value),
          max_uses: initial.max_uses,
          max_uses_per_user: initial.max_uses_per_user,
          valid_from: initial.valid_from ? initial.valid_from.split("T")[0] : "",
          valid_until: initial.valid_until ? initial.valid_until.split("T")[0] : "",
          plan_id: initial.plan_id,
          is_active: initial.is_active,
        }
      : {
          code: "", description: "", discount_type: "percent",
          discount_value: 20, max_uses: null, max_uses_per_user: 1,
          valid_from: "", valid_until: "", plan_id: null, is_active: true,
        }
  );

  const isPending = createCoupon.isPending || updateCoupon.isPending;

  const submit = async () => {
    if (isEdit && form.id) {
      await updateCoupon.mutateAsync({
        id: form.id,
        description: form.description || undefined,
        discount_value: Number(form.discount_value),
        max_uses: form.max_uses,
        max_uses_per_user: Number(form.max_uses_per_user),
        valid_from: form.valid_from || undefined,
        valid_until: form.valid_until || undefined,
        plan_id: form.plan_id,
        is_active: form.is_active,
      });
    } else {
      await createCoupon.mutateAsync({
        code: form.code || undefined,
        description: form.description || undefined,
        discount_type: form.discount_type as "percent" | "fixed_usd",
        discount_value: Number(form.discount_value),
        max_uses: form.max_uses,
        max_uses_per_user: Number(form.max_uses_per_user),
        valid_from: form.valid_from || undefined,
        valid_until: form.valid_until || undefined,
        plan_id: form.plan_id,
        is_active: form.is_active,
      });
    }
    onClose();
  };

  const canSubmit = Number(form.discount_value) > 0 && !isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Coupon" : "Create Coupon"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          {!isEdit && (
            <div>
              <Label>Code <span className="text-xs text-muted-foreground">(leave blank to auto-generate)</span></Label>
              <Input
                value={form.code ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                className="mt-1 uppercase"
                placeholder="SAVE20 (optional)"
              />
            </div>
          )}
          <div>
            <Label>Description</Label>
            <Input
              value={form.description ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="mt-1"
              placeholder="20% launch discount"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Discount Type <span className="text-red-500">{!isEdit && "*"}</span></Label>
              <Select
                value={form.discount_type}
                onValueChange={(v) => setForm((p) => ({ ...p, discount_type: v as "percent" | "fixed_usd" }))}
                disabled={isEdit}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Percent (%)</SelectItem>
                  <SelectItem value="fixed_usd">Fixed USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>
                Value <span className="text-red-500">*</span>
                <span className="ml-1 text-xs text-muted-foreground">
                  {form.discount_type === "percent" ? "(0.01–100)" : "(USD)"}
                </span>
              </Label>
              <Input
                type="number" step="0.01" min={0.01}
                value={form.discount_value}
                onChange={(e) => setForm((p) => ({ ...p, discount_value: Number(e.target.value) }))}
                className="mt-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Max Uses <span className="text-xs text-muted-foreground">(blank = unlimited)</span></Label>
              <Input
                type="number" min={1}
                value={form.max_uses ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, max_uses: e.target.value ? Number(e.target.value) : null }))}
                className="mt-1"
                placeholder="unlimited"
              />
            </div>
            <div>
              <Label>Max Per User</Label>
              <Input
                type="number" min={1}
                value={form.max_uses_per_user ?? 1}
                onChange={(e) => setForm((p) => ({ ...p, max_uses_per_user: Number(e.target.value) }))}
                className="mt-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Valid From</Label>
              <Input type="date" value={form.valid_from ?? ""} onChange={(e) => setForm((p) => ({ ...p, valid_from: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label>Valid Until</Label>
              <Input type="date" value={form.valid_until ?? ""} onChange={(e) => setForm((p) => ({ ...p, valid_until: e.target.value }))} className="mt-1" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={!!form.is_active} onCheckedChange={(v) => setForm((p) => ({ ...p, is_active: v }))} />
            <Label className="cursor-pointer">Active</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={!canSubmit}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Create Coupon"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Assign dialog ────────────────────────────────────────────────────────────

function AssignCouponDialog({ couponId, open, onClose }: { couponId: number; open: boolean; onClose: () => void }) {
  const { assignCoupon } = useAdminSubscription();
  const [userId, setUserId] = useState("");
  const submit = async () => {
    await assignCoupon.mutateAsync({ id: couponId, user_id: Number(userId) });
    onClose();
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>Assign Coupon to User</DialogTitle></DialogHeader>
        <div>
          <Label>User ID <span className="text-red-500">*</span></Label>
          <Input type="number" value={userId} onChange={(e) => setUserId(e.target.value)} className="mt-1" placeholder="42" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={!userId || assignCoupon.isPending}>
            {assignCoupon.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CouponsPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminCoupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminCoupon | null>(null);
  const [assignTarget, setAssignTarget] = useState<AdminCoupon | null>(null);

  const { useAdminCoupons, deleteCoupon } = useAdminSubscription();
  const { data, isLoading } = useAdminCoupons({
    search: search || undefined,
    is_active: activeFilter === "all" ? undefined : activeFilter === "active",
    page,
    per_page: 25,
  });

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, data?.last_page ?? 1);

  const openCreate = () => { setEditTarget(null); setFormOpen(true); };
  const openEdit = (c: AdminCoupon) => { setEditTarget(c); setFormOpen(true); };

  const discountLabel = (c: AdminCoupon) =>
    c.discount_type === "percent" ? `${c.discount_value}%` : `$${c.discount_value}`;

  const validityLabel = (c: AdminCoupon) => {
    if (!c.valid_from && !c.valid_until) return "Always valid";
    const from = c.valid_from ? new Date(c.valid_from).toLocaleDateString() : "—";
    const until = c.valid_until ? new Date(c.valid_until).toLocaleDateString() : "—";
    return `${from} → ${until}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Coupons</h1>
          <p className="text-slate-600">Manage discount coupons for subscriptions.</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> New Coupon
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-lg border bg-white p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by code or description…"
            className="pl-10"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select value={activeFilter} onValueChange={(v) => { setActiveFilter(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
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
          <Card className="py-16 text-center border-0">
            <CardContent className="space-y-3">
              <Tag className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">No coupons found.</p>
              <Button onClick={openCreate} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" /> Create your first coupon
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Mobile */}
            <div className="space-y-3 p-4 md:hidden">
              {rows.map((c) => (
                <div key={c.id} className="rounded-lg border p-4 space-y-2 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono font-bold text-sm">{c.code}</p>
                      {c.description && <p className="text-xs text-muted-foreground">{c.description}</p>}
                    </div>
                    <Badge variant={c.is_active && !c.is_exhausted && !c.is_expired ? "default" : "outline"} className="text-xs shrink-0">
                      {c.is_exhausted ? "Exhausted" : c.is_expired ? "Expired" : c.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">{discountLabel(c)} off · {c.uses_count}/{c.max_uses ?? "∞"} uses</p>
                  <p className="text-xs text-muted-foreground">{validityLabel(c)}</p>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => openEdit(c)}>
                      <Edit2 className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => setAssignTarget(c)}>
                      <UserPlus className="h-3.5 w-3.5" /> Assign
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(c)}>
                      <Trash2 className="h-4 w-4" />
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
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Uses</TableHead>
                    <TableHead>Validity</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div>
                          <p className="font-mono font-bold text-sm">{c.code}</p>
                          {c.description && <p className="text-xs text-muted-foreground truncate max-w-48">{c.description}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{discountLabel(c)}</TableCell>
                      <TableCell className="text-sm">{c.uses_count} / {c.max_uses ?? "∞"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{validityLabel(c)}</TableCell>
                      <TableCell className="text-sm">{c.plan_name ?? <span className="text-muted-foreground">All plans</span>}</TableCell>
                      <TableCell>
                        <Badge variant={c.is_active && !c.is_exhausted && !c.is_expired ? "default" : "outline"} className="text-xs">
                          {c.is_exhausted ? "Exhausted" : c.is_expired ? "Expired" : c.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(c)} className="gap-1">
                            <Edit2 className="h-3.5 w-3.5" /> Edit
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setAssignTarget(c)} className="gap-1">
                            <UserPlus className="h-3.5 w-3.5" /> Assign
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(c)}
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Dialogs */}
      <CouponFormDialog open={formOpen} onClose={() => setFormOpen(false)} initial={editTarget} />

      {assignTarget && (
        <AssignCouponDialog
          couponId={assignTarget.id}
          open={!!assignTarget}
          onClose={() => setAssignTarget(null)}
        />
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete coupon {deleteTarget?.code}?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.uses_count
                ? "This coupon has existing uses and will be deactivated instead of deleted."
                : "This will permanently delete the coupon."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => { if (deleteTarget) deleteCoupon.mutate(deleteTarget.id); setDeleteTarget(null); }}
            >
              {deleteTarget?.uses_count ? "Deactivate" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
