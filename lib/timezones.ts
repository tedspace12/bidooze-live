import { useSyncExternalStore } from "react";

export type TimezoneOption = {
  value: string;
  label: string;
  searchTokens: string[];
};

let cachedTimezones: string[] | null = null;
let cachedTimezoneOptions: TimezoneOption[] | null = null;

const formatSegment = (value: string) => value.replace(/_/g, " ");

export const formatTimezoneLabel = (timezone: string): string => {
  const segments = timezone.split("/");
  if (segments.length < 2) {
    return formatSegment(timezone);
  }

  const region = formatSegment(segments[0]);
  const location = formatSegment(segments.slice(1).join(" / "));
  return `${location} — ${region}`;
};

export const getIanaTimezones = (): string[] => {
  if (cachedTimezones) return cachedTimezones;

  const supportedValuesOf =
    typeof Intl === "undefined"
      ? undefined
      : (Intl as typeof Intl & { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf;

  if (typeof supportedValuesOf !== "function") {
    cachedTimezones = [];
    return cachedTimezones;
  }

  try {
    const values = supportedValuesOf("timeZone");
    cachedTimezones = Array.from(
      new Set(values.filter((value) => typeof value === "string" && value.trim().length > 0))
    ).sort((a, b) => a.localeCompare(b));
  } catch {
    cachedTimezones = [];
  }

  return cachedTimezones;
};

export const getTimezoneOptions = (): TimezoneOption[] => {
  if (cachedTimezoneOptions) return cachedTimezoneOptions;

  cachedTimezoneOptions = getIanaTimezones().map((timezone) => {
    const label = formatTimezoneLabel(timezone);
    return {
      value: timezone,
      label,
      searchTokens: [timezone.toLowerCase(), label.toLowerCase()],
    };
  });

  return cachedTimezoneOptions;
};

export const detectUserTimezone = (): string | undefined => {
  if (typeof Intl === "undefined") return undefined;

  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (typeof timezone !== "string") return undefined;

    const normalized = timezone.trim();
    return normalized.length > 0 ? normalized : undefined;
  } catch {
    return undefined;
  }
};

const subscribeToTimezone = () => () => undefined;
const getServerTimezoneSnapshot = () => undefined;
const getClientTimezoneSnapshot = () => detectUserTimezone();

export const useDetectedTimezone = (): string | undefined =>
  useSyncExternalStore(
    subscribeToTimezone,
    getClientTimezoneSnapshot,
    getServerTimezoneSnapshot
  );
