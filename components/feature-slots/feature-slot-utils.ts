import type {
  FeatureSlot,
  FeatureSlotResolvedSource,
  FeatureSlotStatus,
} from "@/features/feature-slots/types";

export type FeatureSlotResolvedView = {
  source: FeatureSlotResolvedSource;
  status: FeatureSlotStatus;
  statusLabel: string;
  starts_at?: string | null;
  ends_at?: string | null;
  title?: string | null;
  image_url?: string | null;
  countdown?: string;
};

const toDate = (value?: string | null) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const diffToCountdown = (ms: number) => {
  const clamped = Math.max(0, ms);
  const days = Math.floor(clamped / (1000 * 60 * 60 * 24));
  const hours = Math.floor((clamped % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((clamped % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((clamped % (1000 * 60)) / 1000);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

export const computeFeatureSlotStatus = (
  params: { starts_at?: string | null; ends_at?: string | null },
  nowMs: number = Date.now()
): { status: FeatureSlotStatus; statusLabel: string; countdown?: string } => {
  const startsAt = toDate(params.starts_at);
  const endsAt = toDate(params.ends_at);

  if (!startsAt) {
    return { status: "empty", statusLabel: "Empty" };
  }

  const startMs = startsAt.getTime();
  const endMs = endsAt?.getTime() ?? null;

  if (endMs !== null && nowMs > endMs) {
    return { status: "expired", statusLabel: "Expired" };
  }

  if (nowMs < startMs) {
    const countdown = diffToCountdown(startMs - nowMs);
    return { status: "scheduled", statusLabel: "Scheduled", countdown };
  }

  // If there's no end_at, we treat the slot as active once it starts.
  return {
    status: "active",
    statusLabel: "Active",
    countdown: endMs !== null ? diffToCountdown(endMs - nowMs) : undefined,
  };
};

export const resolveFeatureSlotForDisplay = (slot: FeatureSlot, nowMs: number = Date.now()): FeatureSlotResolvedView => {
  const win = slot.win ?? null;
  const assignment = slot.assignment ?? null;
  const fallback = slot.fallback ?? null;

  const winState =
    win && (win.starts_at || win.ends_at)
      ? computeFeatureSlotStatus({ starts_at: win.starts_at ?? null, ends_at: win.ends_at ?? null }, nowMs)
      : { status: "empty" as const, statusLabel: "Empty" };

  if (winState.status !== "expired" && winState.status !== "empty" && win?.auction) {
    const auction = win.auction ?? null;
    return {
      source: "win",
      status: winState.status,
      statusLabel: winState.statusLabel,
      starts_at: win.starts_at ?? null,
      ends_at: win.ends_at ?? null,
      title: auction?.name ?? null,
      image_url: auction?.feature_image_url ?? null,
      countdown: winState.countdown,
    };
  }

  const assignmentState =
    assignment && (assignment.starts_at || assignment.ends_at)
      ? computeFeatureSlotStatus(
        { starts_at: assignment.starts_at ?? null, ends_at: assignment.ends_at ?? null },
        nowMs
      )
      : { status: "empty" as const, statusLabel: "Empty" };

  if (assignmentState.status !== "expired" && assignmentState.status !== "empty" && assignment?.auction) {
    const auction = assignment.auction ?? null;
    return {
      source: "assignment",
      status: assignmentState.status,
      statusLabel: assignmentState.statusLabel,
      starts_at: assignment.starts_at ?? null,
      ends_at: assignment.ends_at ?? null,
      title: auction?.name ?? null,
      image_url: auction?.feature_image_url ?? null,
      countdown: assignmentState.countdown,
    };
  }

  // Fallback
  {
    const statusInput = {
      starts_at: fallback?.starts_at ?? null,
      ends_at: fallback?.ends_at ?? null,
    };

    const title = fallback?.title ?? null;
    const image_url = fallback?.image_url ?? null;
    const hasFallback = !!title || !!image_url;

    const statusInfo = hasFallback
      ? computeFeatureSlotStatus(statusInput, nowMs)
      : { status: "empty" as const, statusLabel: "Empty", countdown: undefined };

    return {
      source: "fallback",
      status: hasFallback ? statusInfo.status : "empty",
      statusLabel: hasFallback ? statusInfo.statusLabel : "Empty",
      starts_at: statusInput.starts_at ?? null,
      ends_at: statusInput.ends_at ?? null,
      title,
      image_url,
      countdown: statusInfo.countdown,
    };
  }
};

export const sourceBadgeLabel = (source: FeatureSlotResolvedSource) => {
  switch (source) {
    case "win":
      return "Win";
    case "assignment":
      return "Assignment";
    case "fallback":
      return "Fallback";
    default:
      return "Fallback";
  }
};

export const statusBadgeClassName = (status: FeatureSlotStatus) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-700 border-green-200";
    case "scheduled":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "expired":
      return "bg-red-100 text-red-700 border-red-200";
    case "empty":
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
};

