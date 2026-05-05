"use client";

/* eslint-disable react-hooks/set-state-in-effect */

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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import type { Location, LocationCapability, CreateLocationPayload } from "@/lib/miscellaneous/types";

// ── Meta ──────────────────────────────────────────────────────────────────────

export const CAPABILITY_LABELS: Record<LocationCapability, string> = {
  auction_site: "Auction site",
  pickup: "Pickup point",
  ship_from: "Ship from",
  storage: "Storage / warehouse",
};

const ALL_CAPABILITIES: LocationCapability[] = [
  "auction_site",
  "pickup",
  "ship_from",
  "storage",
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface LocationSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  location?: Location | null;
  onSave: (payload: CreateLocationPayload & { id?: string }) => void;
  isSaving: boolean;
}

const empty: CreateLocationPayload = {
  name: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  postal: "",
  country: "US",
  phone: "",
  email: "",
  capabilities: [],
  notes: "",
  is_active: true,
};

// ── Component ─────────────────────────────────────────────────────────────────

export function LocationSheet({
  open,
  onOpenChange,
  location,
  onSave,
  isSaving,
}: LocationSheetProps) {
  const [form, setForm] = useState<CreateLocationPayload>(empty);

  useEffect(() => {
    if (location) {
      setForm({
        name: location.name,
        address_line1: location.address_line1,
        address_line2: location.address_line2 ?? "",
        city: location.city,
        state: location.state ?? "",
        postal: location.postal ?? "",
        country: location.country,
        phone: location.phone ?? "",
        email: location.email ?? "",
        capabilities: location.capabilities,
        notes: location.notes ?? "",
        is_active: location.is_active,
      });
    } else {
      setForm(empty);
    }
  }, [location, open]);

  const set = <K extends keyof CreateLocationPayload>(key: K, value: CreateLocationPayload[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleCapability = (cap: LocationCapability) =>
    set(
      "capabilities",
      form.capabilities.includes(cap)
        ? form.capabilities.filter((c) => c !== cap)
        : [...form.capabilities, cap]
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(location ? { ...form, id: location.id } : form);
  };

  const isEdit = !!location;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0 pb-2">
          <DialogTitle>{isEdit ? "Edit Location" : "New Location"}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1 -mx-1">
          <form onSubmit={handleSubmit} id="location-form" className="space-y-5 py-1">
            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Location name</Label>
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Main Warehouse"
                maxLength={60}
                required
              />
            </div>

            {/* Capabilities */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Capabilities</Label>
              <div className="grid grid-cols-2 gap-2">
                {ALL_CAPABILITIES.map((cap) => (
                  <label
                    key={cap}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                      form.capabilities.includes(cap)
                        ? "border-primary/40 bg-primary/5 font-medium"
                        : "border-border/40 hover:border-border"
                    }`}
                  >
                    <Checkbox
                      checked={form.capabilities.includes(cap)}
                      onCheckedChange={() => toggleCapability(cap)}
                    />
                    {CAPABILITY_LABELS[cap]}
                  </label>
                ))}
              </div>
            </div>

            <Separator />

            {/* Address */}
            <div className="space-y-3">
              <Label className="text-xs text-muted-foreground">Address</Label>
              <Input
                value={form.address_line1}
                onChange={(e) => set("address_line1", e.target.value)}
                placeholder="Street address"
                required
              />
              <Input
                value={form.address_line2 ?? ""}
                onChange={(e) => set("address_line2", e.target.value)}
                placeholder="Suite, unit, etc. (optional)"
              />
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <Input
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    placeholder="City"
                    required
                  />
                </div>
                <Input
                  value={form.state ?? ""}
                  onChange={(e) => set("state", e.target.value)}
                  placeholder="State"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={form.postal ?? ""}
                  onChange={(e) => set("postal", e.target.value)}
                  placeholder="Postal code"
                />
                <Input
                  value={form.country}
                  onChange={(e) => set("country", e.target.value.toUpperCase().slice(0, 2))}
                  placeholder="US"
                  maxLength={2}
                />
              </div>
            </div>

            <Separator />

            {/* Contact */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Phone</Label>
                <Input
                  type="tel"
                  value={form.phone ?? ""}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Email</Label>
                <Input
                  type="email"
                  value={form.email ?? ""}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="location@example.com"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Notes (optional)</Label>
              <Textarea
                value={form.notes ?? ""}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Access instructions, parking info, etc."
                rows={2}
              />
            </div>

            {/* Active */}
            <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">
                  Inactive locations are hidden when creating auctions
                </p>
              </div>
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => set("is_active", v)}
              />
            </div>
          </form>
        </div>

        <div className="shrink-0 flex gap-2 border-t border-border/40 pt-4 mt-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" form="location-form" disabled={isSaving} className="flex-1">
            {isSaving ? "Saving…" : isEdit ? "Save changes" : "Create location"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
