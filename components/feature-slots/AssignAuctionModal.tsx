"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAdmin } from "@/features/admin/hooks/useAdmin";
import { useFeatureSlots } from "@/features/feature-slots/hooks/useFeatureSlots";
import type { FeatureSlot } from "@/features/feature-slots/types";
import type { Auction } from "@/features/auction/types";
import { computeFeatureSlotStatus } from "./feature-slot-utils";
import { AuctionPicker, type AuctionPickerOption } from "./AuctionPicker";

const toLocalDatetimeInputValue = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  const pad = (n: number) => n.toString().padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

const localDatetimeInputToIso = (value: string) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
};

const rangesOverlap = (
  aStartMs: number,
  aEndMs: number | null,
  bStartMs: number,
  bEndMs: number | null
) => {
  const aEnd = aEndMs ?? Number.POSITIVE_INFINITY;
  const bEnd = bEndMs ?? Number.POSITIVE_INFINITY;
  return aStartMs < bEnd && bStartMs < aEnd;
};

export function AssignAuctionModal({
  open,
  onOpenChange,
  slot,
  mode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slot: FeatureSlot;
  mode: "assign" | "replace";
}) {
  const { useAuctioneers } = useAdmin();
  const { assignAuctionToSlot } = useFeatureSlots();

  const { data: auctioneersData } = useAuctioneers({
    page: 1,
    per_page: 200,
    status: undefined,
    search: undefined,
  });

  const auctioneerOptions: AuctionPickerOption[] = useMemo(() => {
    const list = auctioneersData?.data ?? [];
    return list.map((a) => ({
      value: a.id,
      label: a.company_name ?? `Auctioneer ${a.id}`,
    }));
  }, [auctioneersData]);

  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [startsAtValue, setStartsAtValue] = useState("");
  const [endsAtValue, setEndsAtValue] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setFormError(null);

    // If replacing, prefill with the current admin assignment.
    if (mode === "replace" && slot.assignment?.auction) {
      // The API might return only auction fields; we treat it as an Auction-like object.
      setSelectedAuction(slot.assignment.auction as Auction);
      setStartsAtValue(toLocalDatetimeInputValue(slot.assignment.starts_at ?? null));
      setEndsAtValue(toLocalDatetimeInputValue(slot.assignment.ends_at ?? null));
      return;
    }

    setSelectedAuction(null);
    setStartsAtValue("");
    setEndsAtValue("");
  }, [open, mode, slot.assignment?.auction, slot.assignment?.starts_at, slot.assignment?.ends_at]);

  const winControl = useMemo(() => {
    if (!slot.win) return { isInEffect: false };
    const info = computeFeatureSlotStatus(
      { starts_at: slot.win.starts_at ?? null, ends_at: slot.win.ends_at ?? null },
      Date.now()
    );
    return { isInEffect: info.status !== "expired" && info.status !== "empty" };
  }, [slot.win]);

  const validate = (): string | null => {
    if (!selectedAuction) return "Select an auction to place in the slot.";
    if (!startsAtValue.trim()) return "starts_at is required.";
    if (!selectedAuction.auction_end_at) return "Selected auction has no end time.";

    const auctionEndIso = selectedAuction.auction_end_at;
    const auctionEndMs = new Date(auctionEndIso).getTime();
    if (Number.isNaN(auctionEndMs) || Date.now() > auctionEndMs) return "Cannot assign an expired auction.";

    const startsIso = localDatetimeInputToIso(startsAtValue);
    const endsIso = endsAtValue.trim() ? localDatetimeInputToIso(endsAtValue) : null;
    if (!startsIso) return "Invalid starts_at value.";
    if (endsAtValue.trim() && !endsIso) return "Invalid ends_at value.";

    const startsMs = new Date(startsIso).getTime();
    const endsMs = endsIso ? new Date(endsIso).getTime() : null;

    if (endsMs != null && endsMs <= startsMs) return "ends_at must be after starts_at.";

    // Ensure the slot display window fits within the auction window.
    const auctionStartMs = new Date(selectedAuction.auction_start_at).getTime();
    const auctionEndMs2 = new Date(selectedAuction.auction_end_at).getTime();

    if (Number.isNaN(auctionStartMs) || Number.isNaN(auctionEndMs2)) return "Auction dates are missing or invalid.";
    if (startsMs < auctionStartMs) return "starts_at cannot be earlier than the auction start time.";
    if (endsMs != null && endsMs > auctionEndMs2) return "ends_at cannot be later than the auction end time.";

    if (winControl.isInEffect) {
      return "This slot is currently controlled by an active auctioneer win. Admin assignment is disabled.";
    }

    // Prevent overlapping invalid schedules (MVP policy).
    // - "assign" blocks overlaps with any existing win/assignment window.
    // - "replace" skips overlap blocking because it is expected to override.
    if (mode === "assign") {
      const existing = [slot.win, slot.assignment].filter(Boolean) as Array<NonNullable<typeof slot.win>>;

      for (const content of existing) {
        const s = content.starts_at ?? null;
        if (!s) continue;

        const existingState = computeFeatureSlotStatus(
          { starts_at: s, ends_at: content.ends_at ?? null },
          Date.now()
        );
        if (existingState.status === "expired" || existingState.status === "empty") continue;

        const contentStartsMs = new Date(s).getTime();
        const contentEndsMs = content.ends_at ? new Date(content.ends_at).getTime() : null;
        if (rangesOverlap(startsMs, endsMs, contentStartsMs, contentEndsMs)) {
          return "The selected schedule overlaps an existing slot window. Use Replace or adjust the dates.";
        }
      }
    }

    return null;
  };

  const submit = async () => {
    const err = validate();
    if (err) {
      setFormError(err);
      toast.error(err);
      return;
    }

    if (!selectedAuction) return;
    const startsIso = localDatetimeInputToIso(startsAtValue);
    const endsIso = endsAtValue.trim() ? localDatetimeInputToIso(endsAtValue) : null;
    if (!startsIso) return;

    await assignAuctionToSlot.mutateAsync({
      feature_slot_id: slot.slot_id,
      auction_id: selectedAuction.id,
      starts_at: startsIso,
      ends_at: endsIso ?? null,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "replace" ? "Replace slot assignment" : "Assign auction to slot"} (Slot {slot.position})
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="bg-background/60">
                  Source priority: Win &gt; Assignment &gt; Fallback
                </Badge>
                {winControl.isInEffect ? (
                  <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">
                    Controlled by Auctioneer Win
                  </Badge>
                ) : null}
              </div>
            </div>

            <AuctionPicker
              auctioneerOptions={auctioneerOptions}
              selectedAuctionId={selectedAuction?.id}
              disabled={winControl.isInEffect}
              onSelectAuction={(auction) => {
                setSelectedAuction(auction);
                setFormError(null);
                // Default to auction's own window.
                setStartsAtValue(toLocalDatetimeInputValue(auction.auction_start_at));
                setEndsAtValue(toLocalDatetimeInputValue(auction.auction_end_at));
              }}
            />
          </div>

          <div className="space-y-4 rounded-xl border bg-card p-4">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-900">Schedule</h4>
              <p className="text-xs text-muted-foreground">
                The slot will display this auction within the selected time window. If no <code>ends_at</code> is provided,
                it will remain active until overridden.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-medium text-muted-foreground">Selected auction</div>
                  <div className="mt-1 truncate text-sm font-semibold">{selectedAuction?.name ?? "None"}</div>
                </div>
                <Badge variant="outline" className="bg-background/60">
                  {selectedAuction ? "Ready" : "Pick an auction"}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slot-starts-at">starts_at *</Label>
              <Input
                id="slot-starts-at"
                type="datetime-local"
                value={startsAtValue}
                disabled={winControl.isInEffect}
                onChange={(e) => setStartsAtValue(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="slot-ends-at">ends_at</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={winControl.isInEffect}
                  onClick={() => setEndsAtValue("")}
                >
                  Clear
                </Button>
              </div>
              <Input
                id="slot-ends-at"
                type="datetime-local"
                value={endsAtValue}
                disabled={winControl.isInEffect}
                onChange={(e) => setEndsAtValue(e.target.value)}
              />
            </div>

            {formError ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{formError}</div>
            ) : null}

            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                className="w-full sm:w-auto"
                onClick={submit}
                disabled={assignAuctionToSlot.isPending || winControl.isInEffect}
              >
                {assignAuctionToSlot.isPending ? "Saving..." : mode === "replace" ? "Replace assignment" : "Assign to slot"}
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

