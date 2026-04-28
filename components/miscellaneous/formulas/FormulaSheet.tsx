"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  Formula,
  FormulaType,
  CommissionQualifier,
  SlidingTier,
} from "@/lib/miscellaneous/types";
import { Plus, Trash2 } from "lucide-react";

// ── Meta ──────────────────────────────────────────────────────────────────────

export const FORMULA_TYPE_LABELS: Record<FormulaType, string> = {
  buyer_premium: "Buyer's Premium",
  buyer_tax: "Buyer Tax",
  seller_tax: "Seller Tax",
  buyer_lot_charge: "Lot Charge (Buyer)",
  commission_flat: "Commission — Flat",
  commission_sliding: "Commission — Sliding Scale",
  salesperson_comm: "Salesperson Commission",
  vat: "VAT",
};

export const FORMULA_TYPE_COLORS: Record<FormulaType, string> = {
  buyer_premium: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  buyer_tax: "bg-orange-500/10 text-orange-700 border-orange-500/20",
  seller_tax: "bg-purple-500/10 text-purple-700 border-purple-500/20",
  buyer_lot_charge: "bg-cyan-500/10 text-cyan-700 border-cyan-500/20",
  commission_flat: "bg-green-700/10 text-green-700 border-green-700/20",
  commission_sliding: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  salesperson_comm: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  vat: "bg-rose-500/10 text-rose-700 border-rose-500/20",
};

const QUALIFIER_LABELS: Record<CommissionQualifier, string> = {
  each: "Per lot",
  invoice_line: "Per invoice line",
  consignment_order: "Per consignment order",
  each_over_reserve: "Per lot over reserve",
  invoice_line_over_reserve: "Per invoice line over reserve",
};

// ── Internal form state type — loose so variant fields aren't blocked ─────────

type FormState = {
  type: FormulaType;
  name: string;
  is_default: boolean;
  notes?: string;
  // variant fields accessed via index signature
  [key: string]: unknown;
};

// ── External payload type (discriminated union) ────────────────────────────────

type FormulaPayload = Omit<
  Formula,
  "id" | "tenant_id" | "auction_reference_count" | "created_at" | "updated_at"
>;

interface FormulaSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  formula?: Formula | null;
  onSave: (payload: FormulaPayload & { id?: string }) => void;
  isSaving: boolean;
}

// ── Defaults ──────────────────────────────────────────────────────────────────

function baseDefaults(type: FormulaType): FormState {
  const base: Pick<FormState, "name" | "is_default" | "notes"> = {
    name: "",
    is_default: false,
    notes: "",
  };
  switch (type) {
    case "buyer_premium":
    case "buyer_tax":
    case "seller_tax":
    case "commission_flat":
    case "salesperson_comm":
      return { ...base, type, rate_pct: 0, qualifier: "each" };
    case "commission_sliding":
      return { ...base, type, tiers: [{ upper_bound: 1000, rate_pct: 10 }] };
    case "buyer_lot_charge":
      return { ...base, type, flat_amount: null, rate_pct: 0, applies_to: "per_lot" };
    case "vat":
      return { ...base, type, rate_pct: 0, included_in_hammer: false };
  }
}

function formulaToFormState(f: Formula): FormState {
  const copy = { ...f } as Record<string, unknown>;
  (["id", "tenant_id", "auction_reference_count", "created_at", "updated_at"] as const).forEach(
    (k) => delete copy[k]
  );
  return copy as FormState;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function FormulaSheet({
  open,
  onOpenChange,
  formula,
  onSave,
  isSaving,
}: FormulaSheetProps) {
  const [step, setStep] = useState<"type" | "form">(formula ? "form" : "type");
  const [form, setForm] = useState<FormState>(
    formula ? formulaToFormState(formula) : baseDefaults("buyer_premium")
  );

  useEffect(() => {
    if (formula) {
      setForm(formulaToFormState(formula));
      setStep("form");
    } else {
      setForm(baseDefaults("buyer_premium"));
      setStep("type");
    }
  }, [formula, open]);

  const selectType = (t: FormulaType) => {
    setForm(baseDefaults(t));
    setStep("form");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = form as unknown as FormulaPayload;
    onSave(formula ? { ...payload, id: formula.id } : payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0 pb-2">
          <DialogTitle>
            {formula ? "Edit Formula" : step === "type" ? "Select Formula Type" : "New Formula"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1 -mx-1">
          {step === "type" && !formula ? (
            <TypeSelector onSelect={selectType} />
          ) : (
            <form onSubmit={handleSubmit} id="formula-form" className="space-y-5 py-1">
              {/* Type chip + change link */}
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "rounded border px-2 py-0.5 text-xs font-medium",
                    FORMULA_TYPE_COLORS[form.type]
                  )}
                >
                  {FORMULA_TYPE_LABELS[form.type]}
                </span>
                {!formula && (
                  <button
                    type="button"
                    onClick={() => setStep("type")}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Change
                  </button>
                )}
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder={`e.g. Standard ${FORMULA_TYPE_LABELS[form.type]}`}
                  required
                  maxLength={60}
                />
              </div>

              {/* Type-specific fields */}
              <TypeFields form={form} setForm={setForm} />

              {/* Default toggle */}
              <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium">Set as default</p>
                  <p className="text-xs text-muted-foreground">
                    Pre-selected when creating new auctions
                  </p>
                </div>
                <Switch
                  checked={Boolean(form.is_default)}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, is_default: v }))}
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Notes (optional)</Label>
                <Textarea
                  value={(form.notes as string) ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Internal notes about this formula…"
                  rows={2}
                />
              </div>
            </form>
          )}
        </div>

        {step !== "type" && (
          <div className="shrink-0 flex gap-2 border-t border-border/40 pt-4 mt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" form="formula-form" disabled={isSaving} className="flex-1">
              {isSaving ? "Saving…" : formula ? "Save changes" : "Create formula"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Type selector ─────────────────────────────────────────────────────────────

function TypeSelector({ onSelect }: { onSelect: (t: FormulaType) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {(Object.keys(FORMULA_TYPE_LABELS) as FormulaType[]).map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => onSelect(type)}
          className={cn(
            "flex flex-col items-start gap-1.5 rounded-lg border p-3 text-left transition-colors hover:opacity-80",
            FORMULA_TYPE_COLORS[type]
          )}
        >
          <span className="text-sm font-medium">{FORMULA_TYPE_LABELS[type]}</span>
        </button>
      ))}
    </div>
  );
}

// ── Type-specific fields ──────────────────────────────────────────────────────
// Uses FormState (index-signature type) so variant fields are freely accessible.

function TypeFields({
  form,
  setForm,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}) {
  const patch = (update: Record<string, unknown>) =>
    setForm((f) => ({ ...f, ...update }));

  // Rate + qualifier variants
  if (
    form.type === "buyer_premium" ||
    form.type === "buyer_tax" ||
    form.type === "seller_tax" ||
    form.type === "commission_flat" ||
    form.type === "salesperson_comm"
  ) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Rate (%)</Label>
          <Input
            type="number"
            step="0.01"
            min={0}
            max={100}
            value={(form.rate_pct as number) ?? 0}
            onChange={(e) => patch({ rate_pct: Number(e.target.value) })}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Qualifier</Label>
          <Select
            value={(form.qualifier as string) ?? "each"}
            onValueChange={(v) => patch({ qualifier: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(QUALIFIER_LABELS) as [CommissionQualifier, string][]).map(
                ([val, label]) => (
                  <SelectItem key={val} value={val}>
                    {label}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  // Sliding scale
  if (form.type === "commission_sliding") {
    const tiers = (form.tiers as SlidingTier[]) ?? [];

    const updateTier = (i: number, p: Partial<SlidingTier>) =>
      patch({ tiers: tiers.map((t, idx) => (idx === i ? { ...t, ...p } : t)) });

    const addTier = () =>
      patch({
        tiers: [
          ...tiers,
          { upper_bound: (tiers[tiers.length - 1]?.upper_bound ?? 0) + 1000, rate_pct: 0 },
        ],
      });

    const removeTier = (i: number) =>
      patch({ tiers: tiers.filter((_, idx) => idx !== i) });

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">
            Tiers (ascending by upper bound)
          </Label>
          <Button type="button" variant="ghost" size="sm" onClick={addTier}>
            <Plus className="h-3.5 w-3.5" />
            Add tier
          </Button>
        </div>
        <div className="grid grid-cols-[1fr_1fr_2rem] gap-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          <span>Up to ($)</span>
          <span>Rate (%)</span>
          <span />
        </div>
        {tiers.map((tier, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_2rem] items-center gap-2">
            <Input
              type="number"
              step="0.01"
              min={0}
              value={tier.upper_bound}
              onChange={(e) => updateTier(i, { upper_bound: Number(e.target.value) })}
              required
            />
            <Input
              type="number"
              step="0.01"
              min={0}
              max={100}
              value={tier.rate_pct}
              onChange={(e) => updateTier(i, { rate_pct: Number(e.target.value) })}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => removeTier(i)}
              disabled={tiers.length <= 1}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
    );
  }

  // Buyer lot charge
  if (form.type === "buyer_lot_charge") {
    const flatAmount = form.flat_amount as number | null;
    const ratePct = form.rate_pct as number | null;

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Flat amount ($)</Label>
            <Input
              type="number"
              step="0.01"
              min={0}
              placeholder="Leave blank to use %"
              value={flatAmount ?? ""}
              onChange={(e) =>
                patch({
                  flat_amount: e.target.value === "" ? null : Number(e.target.value),
                  rate_pct: null,
                })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Rate (%)</Label>
            <Input
              type="number"
              step="0.01"
              min={0}
              max={100}
              placeholder="Leave blank to use flat"
              value={ratePct ?? ""}
              onChange={(e) =>
                patch({
                  rate_pct: e.target.value === "" ? null : Number(e.target.value),
                  flat_amount: null,
                })
              }
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Applies to</Label>
          <Select
            value={(form.applies_to as string) ?? "per_lot"}
            onValueChange={(v) => patch({ applies_to: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="per_lot">Per lot</SelectItem>
              <SelectItem value="per_invoice">Per invoice</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  // VAT
  if (form.type === "vat") {
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">VAT Rate (%)</Label>
          <Input
            type="number"
            step="0.01"
            min={0}
            max={100}
            value={(form.rate_pct as number) ?? 0}
            onChange={(e) => patch({ rate_pct: Number(e.target.value) })}
            required
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 px-3 py-2.5">
          <div>
            <p className="text-sm font-medium">Included in hammer price</p>
            <p className="text-xs text-muted-foreground">
              VAT is extracted from the hammer price, not added on top
            </p>
          </div>
          <Switch
            checked={Boolean(form.included_in_hammer)}
            onCheckedChange={(v) => patch({ included_in_hammer: v })}
          />
        </div>
      </div>
    );
  }

  return null;
}
