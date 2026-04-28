"use client";

import { useState } from "react";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
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
import { cn } from "@/lib/utils";
import { useMiscLocations } from "@/features/miscellaneous/hooks/useMiscLocations";
import { LocationSheet, CAPABILITY_LABELS } from "./LocationSheet";
import type { Location, CreateLocationPayload } from "@/lib/miscellaneous/types";

// ── Component ─────────────────────────────────────────────────────────────────

export function LocationsList() {
  const { locations, create, update, remove } = useMiscLocations();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Location | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Location | null>(null);

  const data = locations.data ?? [];

  const openCreate = () => {
    setEditing(null);
    setSheetOpen(true);
  };

  const openEdit = (loc: Location) => {
    setEditing(loc);
    setSheetOpen(true);
  };

  const handleSave = (payload: CreateLocationPayload & { id?: string }) => {
    if (payload.id) {
      const { id, ...rest } = payload;
      update.mutate({ id, payload: rest }, { onSuccess: () => setSheetOpen(false) });
    } else {
      create.mutate(payload, { onSuccess: () => setSheetOpen(false) });
    }
  };

  const handleToggleActive = (loc: Location) => {
    update.mutate({ id: loc.id, payload: { is_active: !loc.is_active } });
  };

  if (locations.isLoading) {
    return (
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-44 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* Toolbar */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {data.length} location{data.length !== 1 ? "s" : ""}
        </p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-3.5 w-3.5" />
          New Location
        </Button>
      </div>

      {/* Empty state */}
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 py-16 text-center">
          <MapPin className="h-8 w-8 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium">No locations yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Save reusable addresses for auction sites, pickup points, and warehouses.
          </p>
          <Button size="sm" className="mt-4" onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" />
            New Location
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.map((loc) => (
            <LocationCard
              key={loc.id}
              location={loc}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
              onToggleActive={handleToggleActive}
              isUpdating={update.isPending}
            />
          ))}
        </div>
      )}

      {/* Sheet */}
      <LocationSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        location={editing}
        onSave={handleSave}
        isSaving={create.isPending || update.isPending}
      />

      {/* Delete confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete location?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.name}</strong> will be permanently deleted. Auctions
              that reference this location will retain the address text but lose the link.
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

// ── Card ──────────────────────────────────────────────────────────────────────

function LocationCard({
  location,
  onEdit,
  onDelete,
  onToggleActive,
  isUpdating,
}: {
  location: Location;
  onEdit: (l: Location) => void;
  onDelete: (l: Location) => void;
  onToggleActive: (l: Location) => void;
  isUpdating: boolean;
}) {
  const addressLine = [location.city, location.state, location.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border/50 bg-card/60 p-4",
        !location.is_active && "opacity-60"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/40 bg-muted/50">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">{location.name}</p>
            {addressLine && (
              <p className="text-xs text-muted-foreground">{addressLine}</p>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(location)}>
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(location)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Address detail */}
      <p className="text-xs text-muted-foreground leading-relaxed">
        {[location.address_line1, location.address_line2].filter(Boolean).join(", ")}
        {location.postal && ` ${location.postal}`}
      </p>

      {/* Capabilities */}
      {location.capabilities.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {location.capabilities.map((cap) => (
            <span
              key={cap}
              className="rounded border border-border/40 bg-muted/40 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              {CAPABILITY_LABELS[cap]}
            </span>
          ))}
        </div>
      )}

      {/* Contact + active toggle */}
      <div className="mt-auto flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {location.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {location.phone}
            </span>
          )}
          {location.email && (
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {location.email}
            </span>
          )}
        </div>
        <Switch
          checked={location.is_active}
          onCheckedChange={() => onToggleActive(location)}
          disabled={isUpdating}
          aria-label={`Toggle ${location.name} active`}
        />
      </div>
    </div>
  );
}
