"use client";

import { useEffect, useState, useCallback } from "react";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { TimezoneSelect } from "@/components/ui/timezone-select";
import { useMiscCompany } from "@/features/miscellaneous/hooks/useMiscCompany";
import type { Company } from "@/lib/miscellaneous/types";

type CompanyDraft = Partial<Omit<Company, "id" | "tenant_id" | "created_at" | "updated_at">>;

const REGISTRATION_MODES = [
  { value: "no_cc", label: "No card required" },
  { value: "verification", label: "Card verification (default)" },
  { value: "authentication", label: "Card authentication" },
  { value: "contact_only", label: "Contact info only" },
];

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-6 md:grid-cols-[16rem_1fr]">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function CompanyForm() {
  const { company, update } = useMiscCompany();
  const [draft, setDraft] = useState<CompanyDraft>({});
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (company.data) {
      const { id: _id, tenant_id: _tid, created_at: _ca, updated_at: _ua, ...rest } = company.data;
      setDraft(rest);
      setDirty(false);
    }
  }, [company.data]);

  const set = useCallback(<K extends keyof CompanyDraft>(key: K, value: CompanyDraft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setDirty(true);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    update.mutate(draft, { onSuccess: () => setDirty(false) });
  };

  if (company.isLoading) {
    return (
      <div className="mt-6 space-y-8">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSave}>
      {/* Sticky save bar */}
      {dirty && (
        <div className="sticky top-0 z-10 -mx-0 mb-6 flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
          <p className="text-sm text-foreground">You have unsaved changes</p>
          <Button type="submit" size="sm" disabled={update.isPending}>
            {update.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {update.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      )}

      <div className="space-y-10 pt-10">
        {/* Identity */}
        <Section
          title="Identity"
          description="Your auction house's display name and legal registration details."
        >
          <FieldRow>
            <Field label="Display name *">
              <Input
                value={draft.name ?? ""}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Riverside Auction House"
                required
              />
            </Field>
            <Field label="Legal name">
              <Input
                value={draft.legal_name ?? ""}
                onChange={(e) => set("legal_name", e.target.value)}
                placeholder="Full legal entity name"
              />
            </Field>
          </FieldRow>
          <Field label="Tax ID / EIN">
            <Input
              value={draft.tax_id ?? ""}
              onChange={(e) => set("tax_id", e.target.value)}
              placeholder="XX-XXXXXXX"
              className="max-w-xs"
            />
          </Field>
        </Section>

        <Separator />

        {/* Contact */}
        <Section
          title="Contact"
          description="Public contact details shown on invoices and bidder-facing pages."
        >
          <FieldRow>
            <Field label="Phone">
              <Input
                value={draft.phone ?? ""}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+1 (555) 000-0000"
                type="tel"
              />
            </Field>
            <Field label="Email">
              <Input
                value={draft.primary_email ?? ""}
                onChange={(e) => set("primary_email", e.target.value)}
                placeholder="info@example.com"
                type="email"
              />
            </Field>
          </FieldRow>
          <Field label="Website">
            <Input
              value={draft.website ?? ""}
              onChange={(e) => set("website", e.target.value)}
              placeholder="https://example.com"
              type="url"
            />
          </Field>
        </Section>

        <Separator />

        {/* Address */}
        <Section
          title="Address"
          description="Primary business address used on invoices and shipping forms."
        >
          <Field label="Address line 1">
            <Input
              value={draft.address_line1 ?? ""}
              onChange={(e) => set("address_line1", e.target.value)}
              placeholder="123 Main Street"
            />
          </Field>
          <Field label="Address line 2">
            <Input
              value={draft.address_line2 ?? ""}
              onChange={(e) => set("address_line2", e.target.value)}
              placeholder="Suite 400"
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="City">
              <Input value={draft.city ?? ""} onChange={(e) => set("city", e.target.value)} />
            </Field>
            <Field label="State / Region">
              <Input value={draft.state ?? ""} onChange={(e) => set("state", e.target.value)} />
            </Field>
            <Field label="Postal code">
              <Input value={draft.postal ?? ""} onChange={(e) => set("postal", e.target.value)} />
            </Field>
          </div>
          <FieldRow>
            <Field label="Country (2-letter ISO)">
              <Input
                value={draft.country ?? ""}
                onChange={(e) => set("country", e.target.value.toUpperCase().slice(0, 2))}
                placeholder="US"
                maxLength={2}
              />
            </Field>
            <Field label="Timezone">
              <TimezoneSelect
                value={draft.timezone}
                onChange={(tz) => set("timezone", tz ?? "America/New_York")}
              />
            </Field>
          </FieldRow>
        </Section>

        <Separator />

        {/* Invoice defaults */}
        <Section
          title="Invoice Defaults"
          description="Text that appears on every invoice. Supports plain text."
        >
          <Field label="Invoice header">
            <Textarea
              value={draft.invoice_header ?? ""}
              onChange={(e) => set("invoice_header", e.target.value)}
              placeholder="Header text above invoice items…"
              rows={2}
            />
          </Field>
          <Field label="Payment instructions">
            <Textarea
              value={draft.invoice_payment_instructions ?? ""}
              onChange={(e) => set("invoice_payment_instructions", e.target.value)}
              placeholder="e.g. Payment due within 48 hours. We accept cash, check, and major credit cards."
              rows={3}
            />
          </Field>
          <FieldRow>
            <Field label="Footer">
              <Textarea
                value={draft.invoice_footer ?? ""}
                onChange={(e) => set("invoice_footer", e.target.value)}
                placeholder="Footer text below totals…"
                rows={2}
              />
            </Field>
            <Field label="Thank you note">
              <Textarea
                value={draft.invoice_thank_you ?? ""}
                onChange={(e) => set("invoice_thank_you", e.target.value)}
                placeholder="Thank you for bidding!"
                rows={2}
              />
            </Field>
          </FieldRow>
        </Section>

        <Separator />

        {/* Security & Policies */}
        <Section
          title="Security & Policies"
          description="Defaults applied to all auctions unless overridden on each auction record."
        >
          <FieldRow>
            <Field
              label="Default permission cap ($)"
              hint="Maximum bid amount allowed without explicit approval"
            >
              <Input
                type="number"
                step="0.01"
                min={0}
                value={draft.default_permission_cap ?? ""}
                onChange={(e) => set("default_permission_cap", Number(e.target.value))}
              />
            </Field>
            <Field
              label="Default registration mode"
              hint="Card requirement for bidder registration"
            >
              <Select
                value={draft.default_registration_mode ?? "verification"}
                onValueChange={(v) =>
                  set("default_registration_mode", v as Company["default_registration_mode"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REGISTRATION_MODES.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </FieldRow>

          {/* Card-tester lockout */}
          <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
            <p className="text-sm font-medium">Card-tester lockout</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Automatically lock bidders who fail card verification too many times.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Failed attempts before lockout">
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={draft.card_tester_threshold ?? 10}
                  onChange={(e) => set("card_tester_threshold", Number(e.target.value))}
                />
              </Field>
              <Field label="Lockout window (hours)">
                <Input
                  type="number"
                  min={1}
                  max={720}
                  value={draft.lockout_window_hours ?? 24}
                  onChange={(e) => set("lockout_window_hours", Number(e.target.value))}
                />
              </Field>
            </div>
          </div>
        </Section>
      </div>

      {/* Bottom save button */}
      <div className="mt-10 flex justify-end border-t border-border/40 pt-6">
        <Button type="submit" disabled={!dirty || update.isPending}>
          {update.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          {update.isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
