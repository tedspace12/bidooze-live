"use client";

import { useState } from "react";
import { Plus, MoreHorizontal, Pencil, Trash2, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useMiscAccounts } from "@/features/miscellaneous/hooks/useMiscAccounts";
import { AccountDialog } from "./AccountDialog";
import type { Account, CreateAccountPayload } from "@/lib/miscellaneous/types";

function surchargeLabel(acc: Account): string {
  const pct = acc.surcharge_pct ?? 0;
  const flat = acc.surcharge_flat ?? 0;
  const parts: string[] = [];
  if (pct !== 0) parts.push(`${pct}%`);
  if (flat !== 0) parts.push(`$${flat}`);
  if (parts.length === 0) return "—";
  return `${parts.join(" + ")} (${acc.surcharge_target})`;
}

const ROUNDING_SHORT: Record<string, string> = {
  none: "—",
  nickel: "¢5",
  dime: "¢10",
  dollar: "$1",
};

export function AccountsTable() {
  const { accounts, create, update, remove, seedDefaults } = useMiscAccounts();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);

  const data = accounts.data ?? [];
  const parents = data.filter((a) => a.parent_account_id === null);
  const childrenOf = (parentNum: number) =>
    data.filter((a) => Number(a.parent_account_id) === Number(parentNum));

  const parentAccounts = parents; // used in dialog as selectable parents

  const handleSave = (payload: CreateAccountPayload & { id?: number }) => {
    if (payload.id) {
      const { id, ...rest } = payload;
      update.mutate({ id, payload: rest }, { onSuccess: () => setDialogOpen(false) });
    } else {
      create.mutate(payload, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const handleToggleActive = (acc: Account) => {
    update.mutate({ id: acc.id, payload: { is_active: !acc.is_active } });
  };

  const openEdit = (acc: Account) => {
    setEditing(acc);
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  if (accounts.isLoading) {
    return (
      <div className="mt-6 space-y-2">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-11 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* Toolbar */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {data.length} account{data.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          {/* {data.length === 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => seedDefaults.mutate()}
              disabled={seedDefaults.isPending}
            >
              <Database className="h-3.5 w-3.5" />
              {seedDefaults.isPending ? "Seeding…" : "Seed defaults"}
            </Button>
          )} */}
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" />
            New Account
          </Button>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 py-16 text-center">
          <p className="text-sm font-medium text-foreground">No accounts yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Seed the default chart of accounts or add one manually.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/50">
          {/* Table header */}
          <div className="grid grid-cols-[3rem_1fr_6rem_6rem_9rem_6rem_2.5rem] gap-0 border-b border-border/40 bg-muted/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            <span>#</span>
            <span>Description</span>
            <span className="text-center">Receipts</span>
            <span className="text-center">Payments</span>
            <span>Surcharge</span>
            <span>Active</span>
            <span />
          </div>

          {/* Rows */}
          {parents.map((parent) => (
            <div key={parent.id}>
              {/* Parent row */}
              <AccountRow
                account={parent}
                isParent
                onEdit={openEdit}
                onDelete={setDeleteTarget}
                onToggleActive={handleToggleActive}
                isUpdating={update.isPending}
              />

              {/* Child rows */}
              {childrenOf(parent.number).map((child) => (
                <AccountRow
                  key={child.id}
                  account={child}
                  isParent={false}
                  onEdit={openEdit}
                  onDelete={setDeleteTarget}
                  onToggleActive={handleToggleActive}
                  isUpdating={update.isPending}
                />
              ))}
            </div>
          ))}

          {/* Orphan children (parent_account_id set but parent not in list) */}
          {data
            .filter(
              (a) =>
                a.parent_account_id !== null &&
                !parents.find((p) => Number(p.number) === Number(a.parent_account_id))
            )
            .map((acc) => (
              <AccountRow
                key={acc.id}
                account={acc}
                isParent={false}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
                onToggleActive={handleToggleActive}
                isUpdating={update.isPending}
              />
            ))}
        </div>
      )}

      {/* Create / Edit dialog */}
      <AccountDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        account={editing}
        parentAccounts={parentAccounts}
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
            <AlertDialogTitle>Delete account?</AlertDialogTitle>
            <AlertDialogDescription>
              Account <strong>{deleteTarget?.number} — {deleteTarget?.description}</strong> will
              be permanently deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) {
                  remove.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
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

interface AccountRowProps {
  account: Account;
  isParent: boolean;
  onEdit: (a: Account) => void;
  onDelete: (a: Account) => void;
  onToggleActive: (a: Account) => void;
  isUpdating: boolean;
}

function AccountRow({ account, isParent, onEdit, onDelete, onToggleActive, isUpdating }: AccountRowProps) {
  return (
    <div
      className={`grid grid-cols-[3rem_1fr_6rem_6rem_9rem_6rem_2.5rem] items-center gap-0 border-b border-border/30 px-4 py-2.5 last:border-b-0 ${
        isParent ? "bg-muted/20" : "hover:bg-muted/10"
      } ${!account.is_active ? "opacity-50" : ""}`}
    >
      <span className={`tabular-nums text-sm ${isParent ? "font-semibold" : "pl-4 text-muted-foreground"}`}>
        {account.number}
      </span>
      <span className={`truncate text-sm ${isParent ? "font-medium" : ""}`}>
        {account.description}
      </span>
      <span className="text-center text-sm text-muted-foreground">
        {account.accepts_receipts ? (
          <span className="font-medium text-foreground">Yes</span>
        ) : "—"}
      </span>
      <span className="text-center text-sm text-muted-foreground">
        {account.accepts_payments ? (
          <span className="font-medium text-foreground">Yes</span>
        ) : "—"}
      </span>
      <span className="truncate text-xs text-muted-foreground">{surchargeLabel(account)}</span>
      <span>
        <Switch
          checked={account.is_active}
          onCheckedChange={() => onToggleActive(account)}
          disabled={isUpdating}
          aria-label={`Toggle ${account.description} active`}
        />
      </span>
      <span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(account)}>
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(account)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </span>
    </div>
  );
}
