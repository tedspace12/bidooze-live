"use client";

import { useState } from "react";
import { Plus, MoreHorizontal, Pencil, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useMiscFormulas } from "@/features/miscellaneous/hooks/useMiscFormulas";
import { FormulaSheet, FORMULA_TYPE_LABELS, FORMULA_TYPE_COLORS } from "./FormulaSheet";
import type { Formula, FormulaType } from "@/lib/miscellaneous/types";

const ALL_TYPES: FormulaType[] = [
  "buyer_premium",
  "buyer_tax",
  "seller_tax",
  "buyer_lot_charge",
  "commission_flat",
  "commission_sliding",
  "salesperson_comm",
  "vat",
];

function rateSummary(f: Formula): string {
  switch (f.type) {
    case "buyer_premium":
    case "buyer_tax":
    case "seller_tax":
    case "commission_flat":
    case "salesperson_comm":
      return `${f.rate_pct}%`;
    case "commission_sliding":
      return `Sliding — ${f.tiers.length} tier${f.tiers.length !== 1 ? "s" : ""}`;
    case "buyer_lot_charge":
      return f.flat_amount !== null ? `$${f.flat_amount}` : `${f.rate_pct}%`;
    case "vat":
      return `${f.rate_pct}%${f.included_in_hammer ? " incl." : ""}`;
  }
}

type FormulaPayload = Omit<Formula, "id" | "tenant_id" | "auction_reference_count" | "created_at" | "updated_at">;

export function FormulasList() {
  const { formulas, create, update, remove } = useMiscFormulas();
  const [typeFilter, setTypeFilter] = useState<FormulaType | "all">("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Formula | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Formula | null>(null);

  const data = formulas.data ?? [];
  const filtered = typeFilter === "all" ? data : data.filter((f) => f.type === typeFilter);

  const openCreate = () => {
    setEditing(null);
    setSheetOpen(true);
  };

  const openEdit = (f: Formula) => {
    setEditing(f);
    setSheetOpen(true);
  };

  const handleSave = (payload: FormulaPayload & { id?: string }) => {
    if (payload.id) {
      const { id, ...rest } = payload;
      update.mutate({ id, payload: rest }, { onSuccess: () => setSheetOpen(false) });
    } else {
      create.mutate(payload, { onSuccess: () => setSheetOpen(false) });
    }
  };

  if (formulas.isLoading) {
    return (
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {/* Type filter pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setTypeFilter("all")}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              typeFilter === "all"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            All ({data.length})
          </button>
          {ALL_TYPES.filter((t) => data.some((f) => f.type === t)).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                typeFilter === t
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              {FORMULA_TYPE_LABELS[t]} ({data.filter((f) => f.type === t).length})
            </button>
          ))}
        </div>

        <Button size="sm" onClick={openCreate}>
          <Plus className="h-3.5 w-3.5" />
          New Formula
        </Button>
      </div>

      {/* Empty state */}
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 py-16 text-center">
          <p className="text-sm font-medium">No formulas yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first rate formula to reference from auctions.
          </p>
          <Button size="sm" className="mt-4" onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" />
            New Formula
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            No {FORMULA_TYPE_LABELS[typeFilter as FormulaType]} formulas yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((f) => (
            <FormulaCard
              key={f.id}
              formula={f}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Sheet */}
      <FormulaSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        formula={editing}
        onSave={handleSave}
        isSaving={create.isPending || update.isPending}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete formula?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.name}</strong> is used in{" "}
              {deleteTarget?.auction_reference_count ?? 0} auction
              {(deleteTarget?.auction_reference_count ?? 0) !== 1 ? "s" : ""}. Deleting it
              will not affect those auctions, but it will no longer be available for new ones.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) {
                  remove.mutate(deleteTarget.id, {
                    onSuccess: () => setDeleteTarget(null),
                  });
                }
              }}
            >
              {remove.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function FormulaCard({
  formula,
  onEdit,
  onDelete,
}: {
  formula: Formula;
  onEdit: (f: Formula) => void;
  onDelete: (f: Formula) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/50 bg-card/60 p-4 transition-colors hover:bg-card">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
              FORMULA_TYPE_COLORS[formula.type]
            )}
          >
            {FORMULA_TYPE_LABELS[formula.type]}
          </span>
          {formula.is_default && (
            <span className="flex items-center gap-0.5 rounded border border-yellow-500/30 bg-yellow-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-yellow-700">
              <Star className="h-2.5 w-2.5" />
              Default
            </span>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(formula)}>
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(formula)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Name + rate */}
      <div>
        <p className="font-medium text-foreground">{formula.name}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{rateSummary(formula)}</p>
      </div>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
        {formula.notes ? (
          <span className="truncate max-w-[180px]">{formula.notes}</span>
        ) : (
          <span />
        )}
        <Badge variant="secondary" className="ml-auto shrink-0">
          {formula.auction_reference_count} auction{formula.auction_reference_count !== 1 ? "s" : ""}
        </Badge>
      </div>
    </div>
  );
}
