"use client";

import { useState } from "react";
import { TimezoneSelect } from "@/components/ui/timezone-select";
import { formatTimezoneLabel } from "@/lib/timezones";

interface TimezoneFieldProps {
  value: string;
  onChange: (value: string) => void;
  /** The browser's own IANA zone, if known — used only to label a match as "auto-detected". */
  detectedTimezone?: string;
  error?: boolean;
  errorMessage?: string;
}

/**
 * Collapsed-by-default timezone picker: shows the resolved zone as plain text
 * with a "Change" link, and only expands into the full searchable dropdown
 * when the auctioneer actually wants to override it. Keeps the auto-detected
 * default from feeling like a form field everyone has to fill in, while still
 * making the zone visible (unlike relying on it silently) and easy to correct.
 */
export function TimezoneField({ value, onChange, detectedTimezone, error, errorMessage }: TimezoneFieldProps) {
  const [expanded, setExpanded] = useState(!value);

  // Force the picker open the moment a validation error appears, so the
  // auctioneer isn't left staring at a collapsed row with no visible field
  // to fix. Adjusting state during render (rather than in an effect) is
  // React's documented pattern for this — see
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [lastError, setLastError] = useState(error);
  if (error !== lastError) {
    setLastError(error);
    if (error) setExpanded(true);
  }

  if (!expanded) {
    const isAutoDetected = !!value && value === detectedTimezone;
    return (
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Timezone</label>
        <div className="flex items-center justify-between gap-3 rounded-md border border-input bg-background px-3 py-2 text-sm">
          <span className="truncate">
            {value ? formatTimezoneLabel(value) : "Not set"}
            {isAutoDetected && <span className="ml-1.5 text-xs text-muted-foreground">(auto-detected)</span>}
          </span>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="shrink-0 text-xs font-medium text-primary hover:underline"
          >
            Change
          </button>
        </div>
        <p className="text-xs text-muted-foreground">Auction times are shown to bidders in this zone.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">Timezone</label>
      <TimezoneSelect
        name="timezone"
        value={value}
        onChange={(next) => {
          onChange(next || "");
          if (next) setExpanded(false);
        }}
        placeholder="Search timezone..."
        error={error}
      />
      {errorMessage ? (
        <p className="text-xs text-destructive">{errorMessage}</p>
      ) : (
        <p className="text-xs text-muted-foreground">Stored in IANA format (for example: Europe/Zurich).</p>
      )}
    </div>
  );
}
