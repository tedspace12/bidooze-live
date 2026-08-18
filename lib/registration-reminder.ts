import type { RegistrationProgress } from "@/features/auth/types";

// Dispatched from the axios response interceptor when POST /auctions fails
// with the auctioneer_requirements validation error.
export const REGISTRATION_INCOMPLETE_EVENT = "registration-incomplete";

const STORAGE_KEY = "bidooze_registration_missing_requirements";
const DISMISS_KEY = "bidooze_registration_reminder_dismissed";

// Called right after a successful auctioneer login — stashes whatever's
// still missing so the reminder can show once the dashboard layout mounts
// (it can't show yet on /login, nothing is listening there).
export function saveRegistrationProgress(progress: RegistrationProgress | null | undefined) {
  if (typeof window === "undefined") return;
  try {
    if (!progress || progress.is_complete) {
      sessionStorage.removeItem(STORAGE_KEY);
      return;
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(progress.missing_requirements ?? []));
    // A fresh login gets a fresh chance to show the reminder, even if a
    // previous session on this tab had been dismissed.
    sessionStorage.removeItem(DISMISS_KEY);
  } catch {
    // ignore storage errors
  }
}

export function readStoredMissingRequirements(): string[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : null;
  } catch {
    return null;
  }
}

export function dismissRegistrationReminder() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(DISMISS_KEY, "1");
  } catch {
    // ignore
  }
}

export function wasRegistrationReminderDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearRegistrationReminderState() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(DISMISS_KEY);
  } catch {
    // ignore
  }
}

export function dispatchRegistrationIncomplete(missingRequirements: string[]) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(REGISTRATION_INCOMPLETE_EVENT, { detail: missingRequirements }));
}
