export type MfaSession = {
  email: string;
  expires_at?: number | null;
  mfa_channel?: string | null;
};

const MFA_STORAGE_KEY = "bidooze_mfa_session";

export function saveMfaSession(payload: MfaSession) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(MFA_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore storage errors
  }
}

export function readMfaSession(): MfaSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(MFA_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      email?: unknown;
      expires_at?: unknown;
      mfa_channel?: unknown;
    };

    if (typeof parsed.email !== "string" || !parsed.email.trim()) {
      return null;
    }

    const expiresAt =
      typeof parsed.expires_at === "number" && Number.isFinite(parsed.expires_at)
        ? parsed.expires_at
        : null;
    const mfaChannel =
      typeof parsed.mfa_channel === "string" || parsed.mfa_channel === null
        ? parsed.mfa_channel
        : undefined;

    return {
      email: parsed.email.trim(),
      expires_at: expiresAt,
      mfa_channel: mfaChannel,
    };
  } catch {
    return null;
  }
}

export function clearMfaSession() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(MFA_STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
}
