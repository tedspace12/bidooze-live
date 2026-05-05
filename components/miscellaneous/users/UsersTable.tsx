"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  UserPlus,
  Pencil,
  UserX,
  UserCheck,
  ShieldCheck,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { useMiscUsers } from "@/features/miscellaneous/hooks/useMiscUsers";
import { UserSheet } from "./UserSheet";
import { UserRoleBadge } from "./UserRoleBadge";
import type { User, InviteUserPayload } from "@/lib/miscellaneous/types";
import { cn } from "@/lib/utils";

// ── Helpers ───────────────────────────────────────────────────────────────────

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(iso: string | null): string {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const STATUS_STYLES = {
  active: "bg-green-700/10 text-green-700 border-green-700/25",
  invited: "bg-yellow-500/10 text-yellow-700 border-yellow-500/25",
  inactive: "bg-muted text-muted-foreground border-border/40",
};

// ── Component ─────────────────────────────────────────────────────────────────

export function UsersTable() {
  const { users, invite, update, transferOwnership, remove } = useMiscUsers();
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"invite" | "edit">("invite");
  const [editing, setEditing] = useState<User | null>(null);
  const [transferTarget, setTransferTarget] = useState<User | null>(null);
  const [removeTarget, setRemoveTarget] = useState<User | null>(null);

  const data = users.data ?? [];

  const filtered = data.filter(
    (u) =>
      u.display_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const openInvite = () => {
    setEditing(null);
    setSheetMode("invite");
    setSheetOpen(true);
  };

  const openEdit = (u: User) => {
    setEditing(u);
    setSheetMode("edit");
    setSheetOpen(true);
  };

  const handleInvite = (payload: InviteUserPayload) => {
    invite.mutate(payload, { onSuccess: () => setSheetOpen(false) });
  };

  const handleUpdate = (
    payload: Partial<Pick<User, "role" | "custom_permissions" | "auction_access" | "is_active">>
  ) => {
    if (!editing) return;
    update.mutate({ id: editing.id, payload }, { onSuccess: () => setSheetOpen(false) });
  };

  const handleToggleActive = (u: User) => {
    update.mutate({ id: u.id, payload: { is_active: !u.is_active } });
  };

  if (users.isLoading) {
    return (
      <div className="mt-6 space-y-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8 text-sm"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button size="sm" onClick={openInvite}>
          <UserPlus className="h-3.5 w-3.5" />
          Invite member
        </Button>
      </div>

      {/* Table */}
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 py-16 text-center">
          <p className="text-sm font-medium">No team members yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Invite colleagues to collaborate on auctions.
          </p>
          <Button size="sm" className="mt-4" onClick={openInvite}>
            <UserPlus className="h-3.5 w-3.5" />
            Invite member
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/50">
          {/* Header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto_2.5rem] items-center gap-4 border-b border-border/40 bg-muted/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            <span>Member</span>
            <span>Role</span>
            <span>Status</span>
            <span className="hidden sm:block">Last login</span>
            <span />
          </div>

          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No users match &ldquo;{search}&rdquo;
            </div>
          ) : (
            filtered.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onEdit={openEdit}
                onToggleActive={handleToggleActive}
                onTransfer={setTransferTarget}
                onRemove={setRemoveTarget}
                isUpdating={update.isPending}
              />
            ))
          )}
        </div>
      )}

      {/* Sheet */}
      <UserSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode={sheetMode}
        user={editing}
        onInvite={handleInvite}
        onUpdate={handleUpdate}
        isSaving={invite.isPending || update.isPending}
      />

      {/* Transfer ownership confirm */}
      <AlertDialog open={!!transferTarget} onOpenChange={(v) => !v && setTransferTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Transfer ownership?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{transferTarget?.display_name}</strong> will become the new Owner. You
              will be downgraded to Admin. This action cannot be undone without their
              cooperation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (transferTarget) {
                  transferOwnership.mutate(transferTarget.id, {
                    onSuccess: () => setTransferTarget(null),
                  });
                }
              }}
            >
              {transferOwnership.isPending ? "Transferring…" : "Transfer ownership"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove confirm */}
      <AlertDialog open={!!removeTarget} onOpenChange={(v) => !v && setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove user?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{removeTarget?.display_name}</strong> will lose access immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (removeTarget) {
                  remove.mutate(removeTarget.id, { onSuccess: () => setRemoveTarget(null) });
                }
              }}
            >
              {remove.isPending ? "Removing…" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────────

function UserRow({
  user,
  onEdit,
  onToggleActive,
  onTransfer,
  onRemove,
  isUpdating,
}: {
  user: User;
  onEdit: (u: User) => void;
  onToggleActive: (u: User) => void;
  onTransfer: (u: User) => void;
  onRemove: (u: User) => void;
  isUpdating: boolean;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-[1fr_auto_auto_auto_2.5rem] items-center gap-4 border-b border-border/30 px-4 py-3 last:border-b-0 hover:bg-muted/10",
        !user.is_active && "opacity-60"
      )}
    >
      {/* Avatar + name */}
      <div className="flex min-w-0 items-center gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="text-xs font-medium">
            {initials(user.display_name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{user.display_name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>

      {/* Role */}
      <UserRoleBadge role={user.role} />

      {/* Status */}
      <span
        className={cn(
          "rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
          STATUS_STYLES[user.status]
        )}
      >
        {user.status}
      </span>

      {/* Last login */}
      <span className="hidden whitespace-nowrap text-xs text-muted-foreground sm:block">
        {formatDate(user.last_login_at)}
      </span>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {user.role !== "owner" && (
            <DropdownMenuItem onClick={() => onEdit(user)}>
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => onToggleActive(user)}
            disabled={user.role === "owner" || isUpdating}
          >
            {user.is_active ? (
              <>
                <UserX className="h-3.5 w-3.5" />
                Deactivate
              </>
            ) : (
              <>
                <UserCheck className="h-3.5 w-3.5" />
                Reactivate
              </>
            )}
          </DropdownMenuItem>
          {user.role !== "owner" && (
            <DropdownMenuItem onClick={() => onTransfer(user)}>
              <ShieldCheck className="h-3.5 w-3.5" />
              Transfer ownership
            </DropdownMenuItem>
          )}
          {user.role !== "owner" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onRemove(user)}
              >
                Remove
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
