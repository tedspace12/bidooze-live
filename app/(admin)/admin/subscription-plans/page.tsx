"use client";

import { useState } from "react";
import { useAdminSubscription } from "@/features/admin/hooks/useAdminSubscription";
import type { AdminPlan, CreatePlanPayload } from "@/features/admin/services/adminSubscriptionService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle2, Edit2, Loader2, Package, Plus, X } from "lucide-react";

// ─── Plan form ────────────────────────────────────────────────────────────────

const EMPTY_FORM: CreatePlanPayload & { id?: number } = {
  name: "", slug: "", price_usd: 0, duration_days: 30,
  trial_days: 7, features: [], is_active: true,
};

function PlanFormDialog({
  open, onClose, initial,
}: {
  open: boolean;
  onClose: () => void;
  initial?: AdminPlan | null;
}) {
  const { createPlan, updatePlan } = useAdminSubscription();
  const isEdit = !!initial;

  const [form, setForm] = useState<CreatePlanPayload & { id?: number }>(() =>
    initial
      ? { id: initial.id, name: initial.name, slug: initial.slug, price_usd: initial.price_usd, duration_days: initial.duration_days, trial_days: initial.trial_days, features: [...initial.features], is_active: initial.is_active }
      : { ...EMPTY_FORM, features: [] }
  );
  const [featureInput, setFeatureInput] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const addFeature = () => {
    const f = featureInput.trim();
    if (!f) return;
    setForm((p) => ({ ...p, features: [...(p.features ?? []), f] }));
    setFeatureInput("");
  };

  const removeFeature = (i: number) =>
    setForm((p) => ({ ...p, features: (p.features ?? []).filter((_, idx) => idx !== i) }));

  const isPending = createPlan.isPending || updatePlan.isPending;

  const submit = async () => {
    if (isEdit && form.id) {
      await updatePlan.mutateAsync({
        id: form.id, name: form.name, price_usd: Number(form.price_usd),
        duration_days: Number(form.duration_days), trial_days: Number(form.trial_days),
        features: form.features, is_active: form.is_active,
      });
    } else {
      await createPlan.mutateAsync({
        name: form.name, slug: form.slug, price_usd: Number(form.price_usd),
        duration_days: Number(form.duration_days), trial_days: Number(form.trial_days),
        features: form.features, is_active: form.is_active,
      });
    }
    onClose();
  };

  const canSubmit = !!form.name.trim() && (isEdit || !!form.slug.trim()) && Number(form.price_usd) > 0 && Number(form.duration_days) > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Plan" : "Create Plan"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Name <span className="text-red-500">*</span></Label>
              <Input value={form.name} onChange={set("name")} className="mt-1" placeholder="Standard" />
            </div>
            <div>
              <Label>Slug <span className="text-red-500">{!isEdit && "*"}</span></Label>
              <Input value={form.slug} onChange={set("slug")} className="mt-1" placeholder="standard" disabled={isEdit} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Price (USD) <span className="text-red-500">*</span></Label>
              <Input type="number" step="0.01" min={0} value={form.price_usd} onChange={set("price_usd")} className="mt-1" />
            </div>
            <div>
              <Label>Duration (days) <span className="text-red-500">*</span></Label>
              <Input type="number" min={1} value={form.duration_days} onChange={set("duration_days")} className="mt-1" />
            </div>
            <div>
              <Label>Trial (days)</Label>
              <Input type="number" min={0} value={form.trial_days} onChange={set("trial_days")} className="mt-1" />
            </div>
          </div>

          {/* Features */}
          <div>
            <Label>Features</Label>
            <div className="mt-2 flex gap-2">
              <Input
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                placeholder="Add a feature…"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
              />
              <Button type="button" variant="outline" size="sm" onClick={addFeature} disabled={!featureInput.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {(form.features ?? []).length > 0 && (
              <ul className="mt-2 space-y-1">
                {(form.features ?? []).map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm rounded bg-muted px-3 py-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                    <span className="flex-1">{f}</span>
                    <button type="button" onClick={() => removeFeature(i)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={form.is_active}
              onCheckedChange={(v) => setForm((p) => ({ ...p, is_active: v }))}
            />
            <Label className="cursor-pointer">Active (visible to auctioneers)</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={!canSubmit || isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Create Plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SubscriptionPlansPage() {
  const { useAdminPlans, updatePlan } = useAdminSubscription();
  const { data: plans, isLoading } = useAdminPlans();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminPlan | null>(null);

  const openCreate = () => { setEditTarget(null); setFormOpen(true); };
  const openEdit = (plan: AdminPlan) => { setEditTarget(plan); setFormOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Subscription Plans</h1>
          <p className="text-slate-600">Manage available plans for auctioneers.</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> New Plan
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-56 w-full" />)}
        </div>
      ) : !plans?.length ? (
        <Card className="py-16 text-center">
          <CardContent className="space-y-3">
            <Package className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">No plans yet.</p>
            <Button onClick={openCreate} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" /> Create your first plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} className={plan.is_active ? "border-2" : "border-2 opacity-60"}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <Badge variant={plan.is_active ? "default" : "outline"} className="shrink-0 text-xs">
                    {plan.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <CardDescription className="font-mono text-xs">{plan.slug}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-3xl font-bold">${plan.price_usd} <span className="text-sm font-normal text-muted-foreground">USD</span></div>
                <div className="text-sm text-muted-foreground">
                  {plan.duration_days} days · {plan.trial_days > 0 ? `${plan.trial_days}-day trial` : "No trial"}
                </div>
                {plan.features.length > 0 && (
                  <ul className="space-y-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex items-center justify-between pt-2 border-t gap-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Switch
                      checked={plan.is_active}
                      disabled={updatePlan.isPending}
                      onCheckedChange={(v) => updatePlan.mutate({ id: plan.id, is_active: v })}
                    />
                    {plan.is_active ? "Visible" : "Hidden"}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => openEdit(plan)} className="gap-1">
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PlanFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initial={editTarget}
      />
    </div>
  );
}
