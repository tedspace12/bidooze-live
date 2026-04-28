"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ChevronLeft, RotateCcw, Trash2, PlusCircle } from "lucide-react";
import { useNavigation } from "@/context/nav-context";
import { useFeatureSlots } from "@/features/feature-slots/hooks/useFeatureSlots";
import type { FeatureSlot } from "@/features/feature-slots/types";
import { resolveFeatureSlotForDisplay, statusBadgeClassName, computeFeatureSlotStatus, sourceBadgeLabel } from "@/components/feature-slots/feature-slot-utils";
import { AssignAuctionModal } from "@/components/feature-slots/AssignAuctionModal";
import { FeatureSlotHistory } from "@/components/feature-slots/FeatureSlotHistory";

const formatDateTime = (value?: string | null) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function FeatureSlotDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { setTitle } = useNavigation();
  const slotId = params.id;

  useEffect(() => {
    setTitle("Feature Slots");
  }, [setTitle]);

  const { useFeatureSlotDetail, removeSlotAssignment } = useFeatureSlots();
  const { data: slot, isLoading, error } = useFeatureSlotDetail(slotId);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"assign" | "replace">("assign");

  const [removeOpen, setRemoveOpen] = useState(false);

  const resolved = useMemo(() => {
    if (!slot) return null;
    return resolveFeatureSlotForDisplay(slot as FeatureSlot, Date.now());
  }, [slot]);

  const winInEffect = useMemo(() => {
    if (!slot?.win) return false;
    const info = computeFeatureSlotStatus(
      { starts_at: slot.win.starts_at ?? null, ends_at: slot.win.ends_at ?? null },
      Date.now()
    );
    return info.status !== "expired" && info.status !== "empty";
  }, [slot]);

  const openAssign = () => {
    setModalMode("assign");
    setModalOpen(true);
  };

  const openReplace = () => {
    setModalMode("replace");
    setModalOpen(true);
  };

  const confirmRemove = async () => {
    if (!slot?.assignment?.id) return;
    await removeSlotAssignment.mutateAsync(slot.assignment.id);
    setRemoveOpen(false);
  };

  if (isLoading || !slot) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.push("/admin/feature-slots")}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-56 w-full rounded-xl" />
          <Skeleton className="h-56 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-card p-6 text-sm text-destructive">
        Failed to load slot details.
      </div>
    );
  }

  const hasAdminAssignment = !!slot.assignment;
  const canAdminEdit = !winInEffect;

  const currentResolved = resolved ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push("/admin/feature-slots")}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Slot {slot.position}</h1>
            <p className="text-sm text-slate-600">
              Placement: {slot.placement ?? "—"} · Scope: {slot.scope ?? "—"}
            </p>
          </div>
        </div>

        {currentResolved ? (
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={statusBadgeClassName(currentResolved.status)}>
              {currentResolved.statusLabel}
            </Badge>
            <Badge variant="outline" className="bg-background/60">
              Source: {sourceBadgeLabel(currentResolved.source)}
            </Badge>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">Current content</div>
              <div className="mt-1 truncate text-base font-bold">
                {currentResolved?.title ?? "No content configured"}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {currentResolved?.starts_at ? formatDateTime(currentResolved.starts_at) : "—"} →{" "}
                {currentResolved?.ends_at ? formatDateTime(currentResolved.ends_at) : "—"}
              </div>
            </div>

            {winInEffect ? (
              <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">
                Controlled by Auctioneer Win
              </Badge>
            ) : null}
          </div>

          <div className="flex items-center gap-4">
            {currentResolved?.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentResolved.image_url}
                alt={currentResolved.title ?? "Auction image"}
                className="h-20 w-20 rounded-xl border bg-slate-50 object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-xl border bg-slate-50 text-xs text-muted-foreground">
                No image
              </div>
            )}

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {currentResolved ? (
                  <Badge variant="outline" className={statusBadgeClassName(currentResolved.status)}>
                    {currentResolved.statusLabel}
                  </Badge>
                ) : null}
                {currentResolved?.countdown ? (
                  <Badge variant="outline" className="bg-background/60">
                    Countdown: {currentResolved.countdown}
                  </Badge>
                ) : null}
              </div>
              <div className="text-xs text-muted-foreground">
                Priority: Win &gt; Assignment &gt; Fallback.
              </div>
            </div>
          </div>
        </Card>

        <Card className="space-y-4 p-4">
          <div className="text-sm font-semibold text-slate-900">Actions</div>

          {!hasAdminAssignment ? (
            <div className="rounded-lg border bg-background/60 p-3 text-sm text-muted-foreground">
              No admin assignment set yet. Use Assign to create one. Auctioneer win will override it automatically.
            </div>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {!hasAdminAssignment ? (
              <Button
                className="flex-1"
                onClick={openAssign}
                disabled={!canAdminEdit}
                title={!canAdminEdit ? "Disabled while a win is in effect" : undefined}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Assign auction
              </Button>
            ) : (
              <Button
                className="flex-1"
                onClick={openReplace}
                disabled={!canAdminEdit}
                title={!canAdminEdit ? "Disabled while a win is in effect" : undefined}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Replace assignment
              </Button>
            )}

            {slot.assignment?.id ? (
              <Button
                className="flex-1"
                variant="outline"
                disabled={!slot.assignment}
                onClick={() => setRemoveOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove assignment
              </Button>
            ) : null}
          </div>

          {!canAdminEdit ? (
            <div className="rounded-lg border border-red-200 bg-red-50/60 p-3 text-xs text-red-800">
              Admin assignments are disabled while an auctioneer win is active.
              Removing the admin assignment will only take effect once the win expires.
            </div>
          ) : null}
        </Card>
      </div>

      <FeatureSlotHistory history={slot.history} />

      {slot ? (
        <AssignAuctionModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          slot={slot}
          mode={modalMode}
        />
      ) : null}

      <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove slot assignment?</AlertDialogTitle>
            <AlertDialogDescription>
              The slot will fall back automatically once the auctioneer win (if any) stops overriding it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemove}
              disabled={removeSlotAssignment.isPending}
            >
              {removeSlotAssignment.isPending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

