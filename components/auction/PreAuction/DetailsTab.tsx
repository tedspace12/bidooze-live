import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FormSection } from "../FormSection";
import { FormInput } from "../FormInput";
import { FormTextarea } from "../FormTextarea";
import { FormCheckbox } from "../FormCheckbox";
import { PremiumButton } from "../PremiumButton";
import { DateTimePicker } from "../DateTimePicker";
import { useAuctionForm } from "@/context/auction-form-context";
import type { CreateAuctionPayload } from "@/features/auction/types";
import { TimezoneSelect } from "@/components/ui/timezone-select";
import { CurrencySelect } from "@/components/ui/currency-select";
import { useDetectedTimezone } from "@/lib/timezones";
import {
  CountrySelect,
  StateSelect,
  getCitySuggestions,
  normalizeCountryToIso2,
  normalizeStateToIso31662,
} from "@/components/ui/country-select";
import type { WizardFieldErrors } from "@/utils/auctionWizardValidation";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCategories } from "@/features/auction/hooks/Usecategories";

interface DetailsTabProps {
  initialData?: Partial<CreateAuctionPayload>;
  fieldErrors?: WizardFieldErrors;
}

function CategoryPicker({
  selectedIds,
  onChange,
}: {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const { tree, categoryNameById, isLoading } = useCategories();

  const toggle = (id: number) =>
    onChange(
      selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]
    );

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors",
              "hover:border-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring",
              isLoading && "cursor-not-allowed opacity-60"
            )}
            disabled={isLoading}
          >
            <span className="text-muted-foreground">
              {isLoading
                ? "Loading categories…"
                : selectedIds.length === 0
                  ? "Select categories…"
                  : `${selectedIds.length} categor${selectedIds.length === 1 ? "y" : "ies"} selected`}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0"
          align="start"
          sideOffset={4}
        >
          <Command>
            <CommandInput placeholder="Search categories…" />
            <CommandList className="max-h-64">
              <CommandEmpty>No categories found.</CommandEmpty>
              {tree.map((parent) => (
                <CommandGroup key={parent.id} heading={parent.name}>
                  <CommandItem
                    value={parent.name}
                    onSelect={() => toggle(parent.id)}
                    className="gap-2"
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                        selectedIds.includes(parent.id)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/40"
                      )}
                    >
                      {selectedIds.includes(parent.id) && <Check className="h-2.5 w-2.5" />}
                    </span>
                    {parent.name}
                  </CommandItem>
                  {parent.subcategories.map((sub) => (
                    <CommandItem
                      key={sub.id}
                      value={sub.name}
                      onSelect={() => toggle(sub.id)}
                      className="gap-2 pl-6"
                    >
                      <span
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                          selectedIds.includes(sub.id)
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/40"
                        )}
                      >
                        {selectedIds.includes(sub.id) && <Check className="h-2.5 w-2.5" />}
                      </span>
                      {sub.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedIds.map((id) => (
            <span
              key={id}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-foreground"
            >
              {categoryNameById.get(id) ?? `Category ${id}`}
              <button
                type="button"
                onClick={() => toggle(id)}
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label={`Remove ${categoryNameById.get(id)}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function DetailsTab({ initialData, fieldErrors }: DetailsTabProps) {
  void initialData;
  const { formState, updateFormState } = useAuctionForm();
  const detectedTimezone = useDetectedTimezone();
  const errors = fieldErrors || {};
  const normalizedCountry = useMemo(
    () => normalizeCountryToIso2(formState.country),
    [formState.country]
  );
  const normalizedState = useMemo(
    () => normalizeStateToIso31662(formState.state, normalizedCountry),
    [formState.state, normalizedCountry]
  );
  const citySuggestions = useMemo(
    () => getCitySuggestions(normalizedCountry, normalizedState),
    [normalizedCountry, normalizedState]
  );
  const citySuggestionsListId = useMemo(
    () =>
      `auction-city-options-${normalizedCountry || "none"}-${(normalizedState || "none").replace(/[^A-Za-z0-9_-]/g, "-")}`,
    [normalizedCountry, normalizedState]
  );

  useEffect(() => {
    const defaults: Partial<CreateAuctionPayload> = {};

    if (!formState.currency) {
      defaults.currency = "USD";
    }

    if (!formState.timezone && detectedTimezone) {
      defaults.timezone = detectedTimezone;
    }

    if (Object.keys(defaults).length > 0) {
      updateFormState(defaults);
    }
  }, [formState.currency, formState.timezone, detectedTimezone, updateFormState]);

  const handleCountryChange = useCallback(
    (country: string | undefined) => {
      const nextCountry = normalizeCountryToIso2(country);
      const currentCountry = normalizeCountryToIso2(formState.country);

      if (nextCountry === currentCountry) {
        updateFormState({ country: nextCountry });
        return;
      }

      updateFormState({
        country: nextCountry,
        state: undefined,
        city: undefined,
      });
    },
    [formState.country, updateFormState]
  );

  const handleStateChange = useCallback(
    (state: string | undefined) => {
      const nextState = normalizeStateToIso31662(state, normalizedCountry);
      const currentState = normalizeStateToIso31662(formState.state, normalizedCountry);

      if (nextState === currentState) {
        updateFormState({ state: nextState });
        return;
      }

      updateFormState({
        state: nextState,
        city: undefined,
      });
    },
    [formState.state, normalizedCountry, updateFormState]
  );

  const handleGenerateCode = () => {
    const base = (formState.name || "auction")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
    const suffix = Date.now().toString().slice(-6);
    updateFormState({ code: `${base}_${suffix}` });
  };

  return (
    <div className="space-y-6">
      <FormSection title="Auction Identity" description="Required details used to identify this auction.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="Name *"
            name="name"
            placeholder="Premium Estate Auction 2026"
            value={formState.name || ""}
            onChange={(e) => updateFormState({ name: e.target.value })}
            error={errors.name}
          />
          <div className="space-y-2">
            <FormInput
              label="Code"
              name="code"
              placeholder="ESTATE_2026"
              value={formState.code || ""}
              onChange={(e) => updateFormState({ code: e.target.value })}
              hint="Unique code used in URLs and internal references."
            />
            <PremiumButton type="button" variant="outline" size="sm" onClick={handleGenerateCode}>
              Generate code
            </PremiumButton>
          </div>
        </div>
      </FormSection>

      <FormSection title="Public Listing" description="Information shown to bidders.">
        <div className="space-y-6">
          <FormTextarea
            label="Description"
            name="description"
            placeholder="Describe your auction..."
            rows={4}
            value={formState.description || ""}
            onChange={(e) => updateFormState({ description: e.target.value })}
          />
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Categories</label>
            <CategoryPicker
              selectedIds={formState.categories ?? []}
              onChange={(ids) => updateFormState({ categories: ids })}
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Auction Window" description="Define when the auction runs.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DateTimePicker
            label="Auction Start *"
            value={formState.auction_start_at || ""}
            onChange={(value) => updateFormState({ auction_start_at: value })}
            clearable={false}
            error={errors.auction_start_at}
          />
          <DateTimePicker
            label="Auction End *"
            value={formState.auction_end_at || ""}
            onChange={(value) => updateFormState({ auction_end_at: value })}
            clearable={false}
            error={errors.auction_end_at}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Timezone</label>
            <TimezoneSelect
              name="timezone"
              value={formState.timezone || detectedTimezone || ""}
              onChange={(value) => updateFormState({ timezone: value })}
              placeholder="Search timezone..."
              error={!!errors.timezone}
            />
            {errors.timezone ? (
              <p className="text-xs text-destructive">{errors.timezone}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Stored in IANA format (for example: Europe/Zurich).
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Currency</label>
            <CurrencySelect
              name="currency"
              value={formState.currency || "USD"}
              onChange={(value) =>
                updateFormState({
                  currency: (value || formState.currency || "USD") as CreateAuctionPayload["currency"],
                })
              }
              error={!!errors.currency}
            />
            {errors.currency ? (
              <p className="text-xs text-destructive">{errors.currency}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Stored as ISO-4217 currency code (for example: USD, EUR, CHF).
              </p>
            )}
          </div>
        </div>
        <div className="mt-6">
          <FormCheckbox
            label="Tax Exempt All"
            description="Apply tax exemption to all items."
            name="tax_exempt_all"
            checked={!!formState.tax_exempt_all}
            onChange={(e) => updateFormState({ tax_exempt_all: e.target.checked })}
          />
        </div>
      </FormSection>

      <FormSection title="Preview, Bidding & Checkout" description="Optional windows before and after the auction.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DateTimePicker
            label="Preview Start"
            value={formState.preview_start_at || ""}
            onChange={(value) => updateFormState({ preview_start_at: value || undefined })}
            error={errors.preview_start_at}
          />
          <DateTimePicker
            label="Preview End"
            value={formState.preview_end_at || ""}
            onChange={(value) => updateFormState({ preview_end_at: value || undefined })}
            error={errors.preview_end_at}
          />
          <DateTimePicker
            label="Checkout Start"
            value={formState.checkout_start_at || ""}
            onChange={(value) => updateFormState({ checkout_start_at: value || undefined })}
            error={errors.checkout_start_at}
          />
          <DateTimePicker
            label="Checkout End"
            value={formState.checkout_end_at || ""}
            onChange={(value) => updateFormState({ checkout_end_at: value || undefined })}
            error={errors.checkout_end_at}
          />
          <DateTimePicker
            label="Open Bidding At"
            value={formState.open_bidding_at || ""}
            onChange={(value) => updateFormState({ open_bidding_at: value || undefined })}
            error={errors.open_bidding_at}
          />
          <DateTimePicker
            label="Close Bidding At"
            value={formState.close_bidding_at || ""}
            onChange={(value) => updateFormState({ close_bidding_at: value || undefined })}
            error={errors.close_bidding_at}
          />
        </div>
      </FormSection>

      <FormSection title="Location" description="Auction location details.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="Address Line 1"
            name="address_line_1"
            placeholder="123 Main St"
            value={formState.address_line_1 || ""}
            onChange={(e) => updateFormState({ address_line_1: e.target.value })}
          />
          <FormInput
            label="Address Line 2"
            name="address_line_2"
            placeholder="Suite 200"
            value={formState.address_line_2 || ""}
            onChange={(e) => updateFormState({ address_line_2: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Country</label>
            <CountrySelect
              name="country"
              value={formState.country}
              onChange={handleCountryChange}
              placeholder="Search country..."
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">State / Province</label>
            <StateSelect
              name="state"
              countryIso2={normalizedCountry}
              value={formState.state}
              onChange={handleStateChange}
              placeholder="Search state..."
              isDisabled={!normalizedCountry}
            />
          </div>
          <div className="space-y-1.5">
            <FormInput
              label="City"
              name="city"
              placeholder={normalizedState ? "Type city name" : "Select state first"}
              value={formState.city || ""}
              onChange={(e) => updateFormState({ city: e.target.value })}
              disabled={!normalizedState}
              list={citySuggestions.length > 0 ? citySuggestionsListId : undefined}
              hint={
                !normalizedCountry
                  ? "Select a country first."
                  : !normalizedState
                    ? "Select a state first."
                    : citySuggestions.length > 0
                      ? "Start typing to see city suggestions."
                      : "Enter city name."
              }
            />
            {citySuggestions.length > 0 && (
              <datalist id={citySuggestionsListId}>
                {citySuggestions.slice(0, 250).map((cityName) => (
                  <option key={cityName} value={cityName} />
                ))}
              </datalist>
            )}
          </div>
          <FormInput
            label="Zip Code"
            name="zip_code"
            placeholder="Zip"
            value={formState.zip_code || ""}
            onChange={(e) => updateFormState({ zip_code: e.target.value })}
          />
        </div>
      </FormSection>
    </div>
  );
}
