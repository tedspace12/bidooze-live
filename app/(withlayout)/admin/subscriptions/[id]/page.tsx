"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAdminSubscription } from "@/features/admin/hooks/useAdminSubscription";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowLeft, CheckCircle2, CalendarClock, RotateCcw,
  XCircle, Ban, Send, DollarSign, Loader2,
} from "lucide-react";
import type { AdminSubscription } from "@/features/admin/services/adminSubscriptionService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusBadge(status: AdminSubscription["status"]) {
  const map: Record<string, string> = {
    active: "bg-green-100 text-green-700 border-green-200",
    trial:  "bg-blue-100 text-blue-700 border-blue-200",
    grace:  "bg-yellow-100 text-yellow-700 border-yellow-200",
    expired:"bg-red-100 text-red-700 border-red-200",
    cancelled:"bg-slate-100 text-slate-600 border-slate-200",
  };
  return <Badge className={map[status] ?? ""}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
}

const fmt = (d: string | null) => d ? new Date(d).toLocaleDateString() : "—";
const fmtDt = (d: string | null) => d ? new Date(d).toLocaleString() : "—";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
      <span className="w-40 shrink-0 text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

// ─── Dialogs ──────────────────────────────────────────────────────────────────

function ActivateDialog({ subId, open, onClose }: { subId: number; open: boolean; onClose: () => void }) {
  const { activateSubscription } = useAdminSubscription();
  const [days, setDays] = useState("30");
  const [notes, setNotes] = useState("");
  const submit = async () => {
    await activateSubscription.mutateAsync({ id: subId, days: Number(days), notes: notes || undefined });
    onClose();
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>Activate Subscription</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Days to grant</Label><Input type="number" min={1} value={days} onChange={(e) => setDays(e.target.value)} className="mt-1" /></div>
          <div><Label>Notes (optional)</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1" rows={2} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={!days || activateSubscription.isPending}>
            {activateSubscription.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Activate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ExtendDialog({ subId, open, onClose }: { subId: number; open: boolean; onClose: () => void }) {
  const { extendSubscription } = useAdminSubscription();
  const [days, setDays] = useState("14");
  const [notes, setNotes] = useState("");
  const submit = async () => {
    await extendSubscription.mutateAsync({ id: subId, days: Number(days), notes: notes || undefined });
    onClose();
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>Extend Subscription</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Additional days</Label><Input type="number" min={1} value={days} onChange={(e) => setDays(e.target.value)} className="mt-1" /></div>
          <div><Label>Notes (optional)</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1" rows={2} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={!days || extendSubscription.isPending}>
            {extendSubscription.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Extend
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ChangeDatesDialog({ subId, open, onClose }: { subId: number; open: boolean; onClose: () => void }) {
  const { changeSubscriptionDates } = useAdminSubscription();
  const [endsAt, setEndsAt] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [notes, setNotes] = useState("");
  const submit = async () => {
    await changeSubscriptionDates.mutateAsync({ id: subId, ends_at: endsAt, starts_at: startsAt || undefined, notes: notes || undefined });
    onClose();
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>Change Dates</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Ends At <span className="text-red-500">*</span></Label><Input type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className="mt-1" /></div>
          <div><Label>Starts At (optional)</Label><Input type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className="mt-1" /></div>
          <div><Label>Notes (optional)</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1" rows={2} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={!endsAt || changeSubscriptionDates.isPending}>
            {changeSubscriptionDates.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RecordPaymentDialog({ subId, open, onClose }: { subId: number; open: boolean; onClose: () => void }) {
  const { recordPayment } = useAdminSubscription();
  const [form, setForm] = useState({
    amount_usd: "", amount_paid: "", currency: "NGN",
    provider: "bank_transfer", reference: "", paid_at: "", notes: "",
  });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));
  const submit = async () => {
    await recordPayment.mutateAsync({
      id: subId,
      amount_usd: Number(form.amount_usd),
      amount_paid: Number(form.amount_paid),
      currency: form.currency,
      provider: form.provider,
      reference: form.reference || undefined,
      paid_at: form.paid_at || undefined,
      notes: form.notes || undefined,
    });
    onClose();
  };
  const canSubmit = !!form.amount_usd && !!form.amount_paid && !!form.currency && !!form.provider && !recordPayment.isPending;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Record Manual Payment</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Amount USD <span className="text-red-500">*</span></Label><Input type="number" step="0.01" value={form.amount_usd} onChange={set("amount_usd")} className="mt-1" /></div>
            <div><Label>Amount Paid <span className="text-red-500">*</span></Label><Input type="number" value={form.amount_paid} onChange={set("amount_paid")} className="mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Currency <span className="text-red-500">*</span></Label><Input value={form.currency} onChange={set("currency")} className="mt-1" /></div>
            <div><Label>Provider <span className="text-red-500">*</span></Label><Input value={form.provider} onChange={set("provider")} className="mt-1" /></div>
          </div>
          <div><Label>Reference</Label><Input value={form.reference} onChange={set("reference")} className="mt-1" /></div>
          <div><Label>Paid At</Label><Input type="date" value={form.paid_at} onChange={set("paid_at")} className="mt-1" /></div>
          <div><Label>Notes</Label><Textarea value={form.notes} onChange={set("notes")} className="mt-1" rows={2} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={!canSubmit}>
            {recordPayment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Record Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SubscriptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const { useSubscriptionDetail, expireSubscription, cancelSubscription, resendPaymentLink } = useAdminSubscription();
  const { data: sub, isLoading } = useSubscriptionDetail(id);

  const [activateOpen, setActivateOpen] = useState(false);
  const [extendOpen, setExtendOpen] = useState(false);
  const [datesOpen, setDatesOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!sub) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        Subscription not found.
      </div>
    );
  }

  const paymentStatusBadge = (s: string) => {
    const map: Record<string, string> = {
      paid: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      failed: "bg-red-100 text-red-700",
      refunded: "bg-slate-100 text-slate-600",
    };
    return <Badge className={map[s] ?? ""}>{s}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800">{sub.user.name}</h1>
            {statusBadge(sub.status)}
            {sub.is_grandfathered && <Badge variant="outline" className="text-xs">Grandfathered</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">{sub.user.email}</p>
        </div>
      </div>

      {/* Info + Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Info card */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Subscription Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Plan" value={sub.plan.name} />
            <InfoRow label="Status" value={statusBadge(sub.status)} />
            <InfoRow label="Days Remaining" value={sub.days_remaining > 0 ? `${sub.days_remaining} days` : "—"} />
            <InfoRow label="Starts At" value={fmt(sub.starts_at)} />
            <InfoRow label="Ends At" value={fmt(sub.ends_at)} />
            <InfoRow label="Trial Ends At" value={fmt(sub.trial_ends_at)} />
            <InfoRow label="Grace Ends At" value={fmt(sub.grace_ends_at)} />
            <InfoRow label="Cancelled At" value={fmt(sub.cancelled_at)} />
            {sub.cancellation_reason && (
              <InfoRow label="Cancel Reason" value={sub.cancellation_reason} />
            )}
            <InfoRow label="Auto-Renew" value={
              <Badge variant={sub.auto_renew ? "default" : "outline"}>{sub.auto_renew ? "Enabled" : "Disabled"}</Badge>
            } />
            {sub.admin_notes && (
              <InfoRow label="Admin Notes" value={sub.admin_notes} />
            )}
            <InfoRow label="Created" value={fmt(sub.created_at)} />
          </CardContent>
        </Card>

        {/* Actions card */}
        <Card>
          <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button className="w-full gap-2" onClick={() => setActivateOpen(true)}>
              <CheckCircle2 className="h-4 w-4" /> Activate
            </Button>
            <Button variant="outline" className="w-full gap-2" onClick={() => setExtendOpen(true)}>
              <RotateCcw className="h-4 w-4" /> Extend
            </Button>
            <Button variant="outline" className="w-full gap-2" onClick={() => setDatesOpen(true)}>
              <CalendarClock className="h-4 w-4" /> Change Dates
            </Button>
            <Button variant="outline" className="w-full gap-2" onClick={() => setPaymentOpen(true)}>
              <DollarSign className="h-4 w-4" /> Record Payment
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2"
              disabled={resendPaymentLink.isPending}
              onClick={() => resendPaymentLink.mutate(id)}
            >
              {resendPaymentLink.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Resend Payment Link
            </Button>

            <div className="my-1 border-t" />

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full gap-2 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50">
                  <XCircle className="h-4 w-4" /> Expire Now
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Expire this subscription?</AlertDialogTitle>
                  <AlertDialogDescription>This will immediately mark the subscription as expired and remove access.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive hover:bg-destructive/90"
                    onClick={() => expireSubscription.mutate({ id })}
                  >
                    Expire
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="w-full gap-2 text-destructive hover:text-destructive">
                  <Ban className="h-4 w-4" /> Cancel Subscription
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel this subscription?</AlertDialogTitle>
                  <AlertDialogDescription>The auctioneer will retain access until the period ends.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Back</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive hover:bg-destructive/90"
                    onClick={() => cancelSubscription.mutate({ id })}
                  >
                    Cancel Subscription
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>

      {/* Payments */}
      {sub.payments.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sub.payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-sm">{fmtDt(p.paid_at)}</TableCell>
                    <TableCell className="text-sm capitalize">{p.provider}</TableCell>
                    <TableCell className="text-sm">
                      <div>${p.amount_usd}</div>
                      <div className="text-xs text-muted-foreground">{p.amount_paid.toLocaleString()} {p.currency}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-xs capitalize">{p.type}</Badge></TableCell>
                    <TableCell>{paymentStatusBadge(p.status)}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground truncate max-w-32">{p.provider_reference || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <ActivateDialog subId={id} open={activateOpen} onClose={() => setActivateOpen(false)} />
      <ExtendDialog subId={id} open={extendOpen} onClose={() => setExtendOpen(false)} />
      <ChangeDatesDialog subId={id} open={datesOpen} onClose={() => setDatesOpen(false)} />
      <RecordPaymentDialog subId={id} open={paymentOpen} onClose={() => setPaymentOpen(false)} />
    </div>
  );
}
