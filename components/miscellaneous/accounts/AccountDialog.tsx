"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { Account, CreateAccountPayload, AccountRounding } from "@/lib/miscellaneous/types";

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  account?: Account | null;
  parentAccounts: Account[];
  onSave: (payload: CreateAccountPayload & { id?: number }) => void;
  isSaving: boolean;
}

const ROUNDING_LABELS: Record<AccountRounding, string> = {
  none: "None",
  nickel: "Nearest $0.05",
  dime: "Nearest $0.10",
  dollar: "Nearest $1.00",
};

const empty: Omit<CreateAccountPayload, "tenant_id"> = {
  parent_account_id: null,
  number: 1000,
  description: "",
  accepts_receipts: true,
  accepts_payments: false,
  surcharge_pct: 0,
  surcharge_flat: 0,
  surcharge_target: "buyer",
  rounding: "none",
  is_active: true,
};

export function AccountDialog({
  open,
  onOpenChange,
  account,
  parentAccounts,
  onSave,
  isSaving,
}: AccountDialogProps) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (account) {
      setForm({
        parent_account_id: account.parent_account_id,
        number: account.number,
        description: account.description,
        accepts_receipts: account.accepts_receipts,
        accepts_payments: account.accepts_payments,
        surcharge_pct: account.surcharge_pct,
        surcharge_flat: account.surcharge_flat,
        surcharge_target: account.surcharge_target,
        rounding: account.rounding,
        is_active: account.is_active,
      });
    } else {
      setForm(empty);
    }
  }, [account, open]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(account ? { ...form, id: account.id } : form);
  };

  const isEdit = !!account;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Account" : "New Account"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-1">
          {/* Number + Description */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Account #</Label>
              <Input
                type="number"
                min={1000}
                max={9999}
                value={form.number}
                onChange={(e) => set("number", Number(e.target.value))}
                required
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Input
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="e.g. Visa"
                maxLength={80}
                required
              />
            </div>
          </div>

          {/* Parent account */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Parent Account</Label>
            <Select
              value={form.parent_account_id?.toString() ?? "none"}
              onValueChange={(v) =>
                set("parent_account_id", v === "none" ? null : Number(v))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="No parent (top-level)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No parent (top-level)</SelectItem>
                {parentAccounts.map((p) => (
                  <SelectItem key={p.id} value={p.number.toString()}>
                    {p.number} — {p.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Receipts + Payments */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.accepts_receipts}
                onCheckedChange={(v) => set("accepts_receipts", !!v)}
              />
              Accepts receipts
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.accepts_payments}
                onCheckedChange={(v) => set("accepts_payments", !!v)}
              />
              Accepts payments
            </label>
          </div>

          {/* Surcharge */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Surcharge</Label>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground">Percent (%)</span>
                <Input
                  type="number"
                  step="0.01"
                  min={-100}
                  max={100}
                  value={form.surcharge_pct}
                  onChange={(e) => set("surcharge_pct", Number(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground">Flat ($)</span>
                <Input
                  type="number"
                  step="0.01"
                  value={form.surcharge_flat}
                  onChange={(e) => set("surcharge_flat", Number(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground">Target</span>
                <Select
                  value={form.surcharge_target}
                  onValueChange={(v) => set("surcharge_target", v as "buyer" | "seller")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buyer">Buyer</SelectItem>
                    <SelectItem value="seller">Seller</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Rounding */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Cash Rounding</Label>
            <Select
              value={form.rounding}
              onValueChange={(v) => set("rounding", v as AccountRounding)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(ROUNDING_LABELS) as [AccountRounding, string][]).map(
                  ([val, label]) => (
                    <SelectItem key={val} value={val}>
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 px-3 py-2.5">
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-xs text-muted-foreground">
                Inactive accounts are hidden from payment forms
              </p>
            </div>
            <Switch
              checked={form.is_active}
              onCheckedChange={(v) => set("is_active", v)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving…" : isEdit ? "Save changes" : "Create account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
