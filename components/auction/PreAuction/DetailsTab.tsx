import { useCallback, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { FormSection } from "../FormSection";
import { FormInput } from "../FormInput";
import { FormTextarea } from "../FormTextarea";
import { FormCheckbox } from "../FormCheckbox";
import { PremiumButton } from "../PremiumButton";
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

interface DetailsTabProps {
  initialData?: Partial<CreateAuctionPayload>;
}

export function DetailsTab({ initialData }: DetailsTabProps) {
  void initialData;
  const { formState, updateFormState } = useAuctionForm();
  const detectedTimezone = useDetectedTimezone();
  const [categoryInput, setCategoryInput] = useState("");
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

  const addCategory = (value: string) => {
    const next = value.trim();
    if (!next) return;
    const existing = formState.categories || [];
    if (existing.some((item) => item.toLowerCase() === next.toLowerCase())) {
      setCategoryInput("");
      return;
    }
    updateFormState({ categories: [...existing, next] });
    setCategoryInput("");
  };

  const removeCategory = (value: string) => {
    const existing = formState.categories || [];
    updateFormState({ categories: existing.filter((item) => item !== value) });
  };

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
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Categories</label>
            <div className="flex flex-wrap gap-2">
              {(formState.categories || []).map((category) => (
                <span
                  key={category}
                  className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs text-foreground"
                >
                  {category}
                  <button
                    type="button"
                    onClick={() => removeCategory(category)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label={`Remove ${category}`}
                  >
                    <Plus className="h-3 w-3 rotate-45" />
                  </button>
                </span>
              ))}
            </div>
            <FormInput
              label=""
              name="categories_input"
              placeholder="Type a category and press Enter"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addCategory(categoryInput.replace(/,$/, ""));
                }
              }}
              onBlur={() => addCategory(categoryInput)}
            />
            <p className="text-xs text-muted-foreground">Press Enter or comma to add multiple categories.</p>
          </div>
        </div>
      </FormSection>

      <FormSection title="Auction Window" description="Define when the auction runs.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="Auction Start *"
            name="auction_start_at"
            type="datetime-local"
            value={formState.auction_start_at || ""}
            onChange={(e) => updateFormState({ auction_start_at: e.target.value })}
          />
          <FormInput
            label="Auction End *"
            name="auction_end_at"
            type="datetime-local"
            value={formState.auction_end_at || ""}
            onChange={(e) => updateFormState({ auction_end_at: e.target.value })}
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
            />
            <p className="text-xs text-muted-foreground">
              Stored in IANA format (for example: Europe/Zurich).
            </p>
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
            />
            <p className="text-xs text-muted-foreground">
              Stored as ISO-4217 currency code (for example: USD, EUR, CHF).
            </p>
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
          <FormInput
            label="Preview Start"
            name="preview_start_at"
            type="datetime-local"
            value={formState.preview_start_at || ""}
            onChange={(e) => updateFormState({ preview_start_at: e.target.value || undefined })}
          />
          <FormInput
            label="Preview End"
            name="preview_end_at"
            type="datetime-local"
            value={formState.preview_end_at || ""}
            onChange={(e) => updateFormState({ preview_end_at: e.target.value || undefined })}
          />
          <FormInput
            label="Checkout Start"
            name="checkout_start_at"
            type="datetime-local"
            value={formState.checkout_start_at || ""}
            onChange={(e) => updateFormState({ checkout_start_at: e.target.value || undefined })}
          />
          <FormInput
            label="Checkout End"
            name="checkout_end_at"
            type="datetime-local"
            value={formState.checkout_end_at || ""}
            onChange={(e) => updateFormState({ checkout_end_at: e.target.value || undefined })}
          />
          <FormInput
            label="Open Bidding At"
            name="open_bidding_at"
            type="datetime-local"
            value={formState.open_bidding_at || ""}
            onChange={(e) => updateFormState({ open_bidding_at: e.target.value || undefined })}
          />
          <FormInput
            label="Close Bidding At"
            name="close_bidding_at"
            type="datetime-local"
            value={formState.close_bidding_at || ""}
            onChange={(e) => updateFormState({ close_bidding_at: e.target.value || undefined })}
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
