"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type {
  User,
  UserRole,
  Permission,
  InviteUserPayload,
} from "@/lib/miscellaneous/types";
import { ROLE_PERMISSIONS, ROLE_DESCRIPTIONS } from "@/lib/miscellaneous/defaults";
import { ROLE_LABELS } from "./UserRoleBadge";

// ── Types ─────────────────────────────────────────────────────────────────────

type Mode = "invite" | "edit";

interface UserSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: Mode;
  user?: User | null;
  onInvite?: (payload: InviteUserPayload) => void;
  onUpdate?: (payload: Partial<Pick<User, "role" | "custom_permissions" | "auction_access" | "is_active">>) => void;
  isSaving: boolean;
}

// ── Permission labels ─────────────────────────────────────────────────────────

const PERMISSION_LABELS: Record<keyof Permission, string> = {
  edit_miscellaneous: "Edit Miscellaneous",
  create_edit_auctions: "Create & Edit Auctions",
  run_live_auction: "Run Live Auction",
  process_payments: "Process Payments",
  view_reports: "View Reports",
  export_financials: "Export Financials",
  manage_users: "Manage Users",
  transfer_ownership: "Transfer Ownership",
  manage_billing: "Manage Billing",
};

const INVITABLE_ROLES: Exclude<UserRole, "owner">[] = [
  "admin",
  "clerk",
  "cataloger",
  "accountant",
  "custom",
];

// ── Component ─────────────────────────────────────────────────────────────────

export function UserSheet({
  open,
  onOpenChange,
  mode,
  user,
  onInvite,
  onUpdate,
  isSaving,
}: UserSheetProps) {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<Exclude<UserRole, "owner">>("admin");
  const [permissions, setPermissions] = useState<Permission>(ROLE_PERMISSIONS.admin);
  const [auctionAccess, setAuctionAccess] = useState<"all" | "restricted">("all");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (mode === "edit" && user) {
      setRole((user.role === "owner" ? "admin" : user.role) as Exclude<UserRole, "owner">);
      const rolePerms =
        (ROLE_PERMISSIONS as Partial<Record<UserRole, typeof ROLE_PERMISSIONS.admin>>)[user.role];
      setPermissions(user.custom_permissions ?? rolePerms ?? ROLE_PERMISSIONS.admin);
      setAuctionAccess(user.auction_access === "all" ? "all" : "restricted");
      setIsActive(user.is_active);
    } else {
      setEmail("");
      setDisplayName("");
      setRole("admin");
      setPermissions(ROLE_PERMISSIONS.admin);
      setAuctionAccess("all");
      setIsActive(true);
    }
  }, [mode, user, open]);

  const handleRoleChange = (r: Exclude<UserRole, "owner">) => {
    setRole(r);
    if (r !== "custom") {
      setPermissions(ROLE_PERMISSIONS[r]);
    }
  };

  const togglePermission = (key: keyof Permission) =>
    setPermissions((p) => ({ ...p, [key]: !p[key] }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const auction_access = auctionAccess === "all" ? ("all" as const) : [];

    if (mode === "invite") {
      onInvite?.({
        email,
        display_name: displayName,
        role,
        auction_access,
      });
    } else {
      onUpdate?.({
        role,
        custom_permissions: role === "custom" ? permissions : undefined,
        auction_access,
        is_active: isActive,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0 pb-2">
          <DialogTitle>{mode === "invite" ? "Invite Team Member" : "Edit User"}</DialogTitle>
          {mode === "invite" && (
            <DialogDescription>
              An invitation email will be sent to the address you enter.
            </DialogDescription>
          )}
          {mode === "edit" && user && (
            <DialogDescription>
              {user.display_name} · {user.email}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1 -mx-1">
          <form onSubmit={handleSubmit} id="user-form" className="space-y-5 py-1">
            {/* Invite-only fields */}
            {mode === "invite" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Email address</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Display name</Label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Jane Smith"
                    maxLength={100}
                    required
                  />
                </div>
              </>
            )}

            {/* Role */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Role</Label>
              <div className="grid gap-1.5">
                {INVITABLE_ROLES.map((r) => (
                  <label
                    key={r}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                      role === r
                        ? "border-primary/40 bg-primary/5"
                        : "border-border/40 hover:border-border hover:bg-muted/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r}
                      checked={role === r}
                      onChange={() => handleRoleChange(r)}
                      className="sr-only"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{ROLE_LABELS[r]}</p>
                      <p className="text-xs text-muted-foreground">
                        {ROLE_DESCRIPTIONS[r as Exclude<UserRole, "custom">] ??
                          "Compose any combination of permissions."}
                      </p>
                    </div>
                    <div
                      className={`mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 ${
                        role === r ? "border-primary bg-primary" : "border-muted-foreground/40"
                      }`}
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Custom permissions */}
            {role === "custom" && (
              <div className="space-y-2 rounded-xl border border-border/40 bg-muted/20 p-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Permissions
                </p>
                <div className="grid gap-2">
                  {(Object.keys(PERMISSION_LABELS) as (keyof Permission)[]).map((key) => (
                    <label key={key} className="flex items-center gap-2.5 text-sm">
                      <Checkbox
                        checked={permissions[key]}
                        onCheckedChange={() => togglePermission(key)}
                      />
                      {PERMISSION_LABELS[key]}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Auction access */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Auction access</Label>
              <RadioGroup
                value={auctionAccess}
                onValueChange={(v) => setAuctionAccess(v as "all" | "restricted")}
                className="gap-2"
              >
                <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                  <RadioGroupItem value="all" />
                  All auctions (current and future)
                </label>
                <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                  <RadioGroupItem value="restricted" />
                  Restricted to specific auctions
                </label>
              </RadioGroup>
              {auctionAccess === "restricted" && (
                <p className="text-xs text-muted-foreground mt-1">
                  Per-auction access is assigned from each auction&apos;s settings page.
                </p>
              )}
            </div>

            {/* Active toggle — edit only */}
            {mode === "edit" && (
              <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium">Active</p>
                  <p className="text-xs text-muted-foreground">
                    Inactive users cannot log in
                  </p>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
            )}
          </form>
        </div>

        <div className="shrink-0 flex gap-2 border-t border-border/40 pt-4 mt-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" form="user-form" disabled={isSaving} className="flex-1">
            {isSaving
              ? "Saving…"
              : mode === "invite"
              ? "Send invitation"
              : "Save changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
