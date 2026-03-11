"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, Loader2, Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { DateTimePicker } from "@/components/auction/DateTimePicker";
import { FormInput } from "@/components/auction/FormInput";
import { FormSection } from "@/components/auction/FormSection";
import { FormTextarea } from "@/components/auction/FormTextarea";
import { PremiumButton } from "@/components/auction/PremiumButton";
import { Button } from "@/components/ui/button";
import { CurrencySelect } from "@/components/ui/currency-select";
import {
  CountrySelect,
  StateSelect,
  getCitySuggestions,
  normalizeCountryToIso2,
  normalizeStateToIso31662,
} from "@/components/ui/country-select";
import { TimezoneSelect } from "@/components/ui/timezone-select";
import { useAuction } from "@/features/auction/hooks/useAuction";
import type { AuctionEditResponse, AuctionStatus, UpdateAuctionPayload } from "@/features/auction/types";

type AuctionEditFormState = {
  code: string;
  name: string;
  description: string;
  categories: string[];
  auction_start_at: string;
  auction_end_at: string;
  timezone: string;
  currency: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
};

const isEditableStatus = (status?: AuctionStatus | null) => status === "draft" || status === "scheduled";

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return fallback;
};

const createFormatter = (timezone?: string | null) => {
  const baseOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    hourCycle: "h23",
  };

  try {
    return new Intl.DateTimeFormat("en-GB", {
      ...baseOptions,
      timeZone: timezone || "UTC",
    });
  } catch {
    return new Intl.DateTimeFormat("en-GB", baseOptions);
  }
};

const toAuctionDateTimeValue = (value?: string | null, timezone?: string | null) => {
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  const parts = createFormatter(timezone).formatToParts(parsed);
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const year = lookup.year;
  const month = lookup.month;
  const day = lookup.day;
  const hour = lookup.hour;
  const minute = lookup.minute;

  if (!year || !month || !day || !hour || !minute) return "";

  return `${year}-${month}-${day}T${hour}:${minute}`;
};

const normalizeEditDateTimeValue = (value?: string | null, timezone?: string | null) => {
  if (!value) return "";

  const trimmedValue = value.trim();
  if (!trimmedValue) return "";

  if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2})?$/.test(trimmedValue)) {
    return trimmedValue.replace(" ", "T").slice(0, 16);
  }

  return toAuctionDateTimeValue(trimmedValue, timezone);
};

const normalizeCategoryNames = (categories?: AuctionEditResponse["categories"]) => {
  if (!Array.isArray(categories)) return [];

  return categories
    .map((category) => {
      if (typeof category === "string") return category;
      if (category && typeof category === "object" && typeof category.name === "string") {
        return category.name;
      }
      return "";
    })
    .filter(Boolean);
};

const mapAuctionToFormState = (auction: AuctionEditResponse): AuctionEditFormState => {
  const timezone = auction.timezone || "UTC";
  const country = normalizeCountryToIso2(auction.country) || auction.country || "";
  const state = normalizeStateToIso31662(auction.state, country) || auction.state || "";

  return {
    code: auction.code || "",
    name: auction.name || "",
    description: auction.description || "",
    categories: normalizeCategoryNames(auction.categories),
    auction_start_at: normalizeEditDateTimeValue(auction.auction_start_at, timezone),
    auction_end_at: normalizeEditDateTimeValue(auction.auction_end_at, timezone),
    timezone,
    currency: auction.currency || "",
    address_line_1: auction.address_line_1 || "",
    address_line_2: auction.address_line_2 || "",
    city: auction.city || "",
    state,
    zip_code: auction.zip_code || "",
    country,
  };
};

const sanitizeFormState = (formState: AuctionEditFormState): AuctionEditFormState => {
  const country = normalizeCountryToIso2(formState.country) || formState.country.trim();
  const state =
    normalizeStateToIso31662(formState.state, country) || formState.state.trim();

  return {
    code: formState.code.trim(),
    name: formState.name.trim(),
    description: formState.description.trim(),
    categories: formState.categories
      .map((item) => item.trim())
      .filter(Boolean)
      .filter((item, index, items) => items.findIndex((entry) => entry.toLowerCase() === item.toLowerCase()) === index),
    auction_start_at: formState.auction_start_at,
    auction_end_at: formState.auction_end_at,
    timezone: formState.timezone.trim(),
    currency: formState.currency.trim().toUpperCase(),
    address_line_1: formState.address_line_1.trim(),
    address_line_2: formState.address_line_2.trim(),
    city: formState.city.trim(),
    state,
    zip_code: formState.zip_code.trim(),
    country,
  };
};

const buildUpdatePayload = (
  currentState: AuctionEditFormState,
  initialState: AuctionEditFormState
): UpdateAuctionPayload => {
  const payload: UpdateAuctionPayload = {};

  if (currentState.code !== initialState.code) payload.code = currentState.code;
  if (currentState.name !== initialState.name) payload.name = currentState.name;
  if (currentState.description !== initialState.description) payload.description = currentState.description;
  if (currentState.auction_start_at !== initialState.auction_start_at) {
    payload.auction_start_at = currentState.auction_start_at;
  }
  if (currentState.auction_end_at !== initialState.auction_end_at) {
    payload.auction_end_at = currentState.auction_end_at;
  }
  if (currentState.timezone !== initialState.timezone) payload.timezone = currentState.timezone;
  if (currentState.currency !== initialState.currency) payload.currency = currentState.currency;
  if (currentState.address_line_1 !== initialState.address_line_1) {
    payload.address_line_1 = currentState.address_line_1;
  }
  if (currentState.address_line_2 !== initialState.address_line_2) {
    payload.address_line_2 = currentState.address_line_2;
  }
  if (currentState.city !== initialState.city) payload.city = currentState.city;
  if (currentState.state !== initialState.state) payload.state = currentState.state;
  if (currentState.zip_code !== initialState.zip_code) payload.zip_code = currentState.zip_code;
  if (currentState.country !== initialState.country) payload.country = currentState.country;

  if (JSON.stringify(currentState.categories) !== JSON.stringify(initialState.categories)) {
    payload.categories = currentState.categories;
  }

  return payload;
};

const validateFormState = (formState: AuctionEditFormState) => {
  if (!formState.name) return "Auction name is required.";
  if (!formState.auction_start_at) return "Auction start date is required.";
  if (!formState.auction_end_at) return "Auction end date is required.";
  if (!formState.timezone) return "Timezone is required.";
  if (!formState.currency) return "Currency is required.";

  if (formState.code && !/^[A-Za-z0-9_-]+$/.test(formState.code)) {
    return "Auction code can only contain letters, numbers, hyphens, and underscores.";
  }

  const startsAt = new Date(formState.auction_start_at);
  const endsAt = new Date(formState.auction_end_at);
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    return "Auction start and end dates must be valid.";
  }

  if (endsAt <= startsAt) {
    return "Auction end date must be after the auction start date.";
  }

  return null;
};

export default function AuctionEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { useAuctionEditById, updateAuction } = useAuction();
  const [categoryInput, setCategoryInput] = useState("");
  const auctionId = Number(id);
  const { data: auction, isLoading, error, refetch, isRefetching } = useAuctionEditById(auctionId);

  const initialFormState = useMemo(
    () => (auction ? mapAuctionToFormState(auction) : null),
    [auction]
  );
  const [formState, setFormState] = useState<AuctionEditFormState | null>(initialFormState);

  useEffect(() => {
    setFormState(initialFormState);
  }, [initialFormState]);

  const isEditable = auction ? (auction.status ? isEditableStatus(auction.status) : true) : false;
  const normalizedCountry = useMemo(
    () => normalizeCountryToIso2(formState?.country) || "",
    [formState?.country]
  );
  const normalizedState = useMemo(
    () => normalizeStateToIso31662(formState?.state, normalizedCountry) || "",
    [formState?.state, normalizedCountry]
  );
  const citySuggestions = useMemo(
    () => getCitySuggestions(normalizedCountry, normalizedState),
    [normalizedCountry, normalizedState]
  );
  const citySuggestionsListId = useMemo(
    () =>
      `auction-edit-city-options-${normalizedCountry || "none"}-${(normalizedState || "none").replace(/[^A-Za-z0-9_-]/g, "-")}`,
    [normalizedCountry, normalizedState]
  );

  const handleCountryChange = useCallback((country: string | undefined) => {
    const nextCountry = normalizeCountryToIso2(country) || "";

    setFormState((current) => {
      if (!current) return current;
      const currentCountry = normalizeCountryToIso2(current.country) || "";

      return {
        ...current,
        country: nextCountry,
        state: nextCountry === currentCountry ? current.state : "",
        city: nextCountry === currentCountry ? current.city : "",
      };
    });
  }, []);

  const handleStateChange = useCallback(
    (state: string | undefined) => {
      const nextState = normalizeStateToIso31662(state, normalizedCountry) || "";

      setFormState((current) => {
        if (!current) return current;
        const currentState = normalizeStateToIso31662(current.state, normalizedCountry) || "";

        return {
          ...current,
          state: nextState,
          city: nextState === currentState ? current.city : "",
        };
      });
    },
    [normalizedCountry]
  );

  const addCategory = useCallback((value: string) => {
    const nextCategory = value.trim();
    if (!nextCategory) return;

    setFormState((current) => {
      if (!current) return current;
      if (current.categories.some((item) => item.toLowerCase() === nextCategory.toLowerCase())) {
        return current;
      }

      return {
        ...current,
        categories: [...current.categories, nextCategory],
      };
    });
    setCategoryInput("");
  }, []);

  const removeCategory = useCallback((value: string) => {
    setFormState((current) => {
      if (!current) return current;

      return {
        ...current,
        categories: current.categories.filter((item) => item !== value),
      };
    });
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState || !initialFormState || !auction) return;
    if (!isEditable) {
      toast.error("Only draft or scheduled auctions can be edited.");
      return;
    }

    const sanitizedFormState = sanitizeFormState(formState);
    const validationError = validateFormState(sanitizedFormState);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const payload = buildUpdatePayload(sanitizedFormState, sanitizeFormState(initialFormState));
    if (Object.keys(payload).length === 0) {
      toast("No changes to save.");
      return;
    }

    try {
      await updateAuction.mutateAsync({
        auctionId,
        payload,
      });
      toast.success("Auction updated successfully.");
      router.push(`/dashboard/auction/${auctionId}`);
    } catch (updateError: unknown) {
      toast.error("Unable to update auction.", {
        description: getErrorMessage(updateError, "Please review your changes and try again."),
      });
    }
  };

  if (!Number.isFinite(auctionId)) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <h1 className="text-2xl font-semibold text-foreground">Invalid auction</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              The requested auction identifier is not valid.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading auction editor...
          </div>
        </div>
      </main>
    );
  }

  if (error || !auction) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <h1 className="text-2xl font-semibold text-foreground">Unable to load auction</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {getErrorMessage(error, "The auction details could not be loaded right now.")}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <PremiumButton type="button" variant="outline" onClick={() => refetch()}>
                {isRefetching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  "Retry"
                )}
              </PremiumButton>
              <PremiumButton type="button" variant="ghost" onClick={() => router.push(`/dashboard/auction/${auctionId}`)}>
                Back to auction
              </PremiumButton>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!formState || !initialFormState) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <h1 className="text-2xl font-semibold text-foreground">Unable to prepare editor</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              The auction loaded, but its editable fields could not be initialized.
            </p>
            <div className="mt-6">
              <PremiumButton type="button" variant="outline" onClick={() => refetch()}>
                Refresh editor
              </PremiumButton>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!isEditable) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mb-6">
            <Link
              href={`/dashboard/auction/${auctionId}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to auction
            </Link>
          </div>
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <h1 className="text-2xl font-semibold text-foreground">Auction can no longer be edited</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Only draft and scheduled auctions can be updated.
              {auction.status ? (
                <>
                  {" "}This auction is currently{" "}
                  <span className="font-medium text-foreground">{auction.status}</span>.
                </>
              ) : null}
            </p>
            <div className="mt-6">
              <PremiumButton type="button" variant="outline" onClick={() => router.push(`/dashboard/auction/${auctionId}`)}>
                Return to auction details
              </PremiumButton>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <Link
              href={`/dashboard/auction/${auctionId}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to auction
            </Link>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Edit Auction
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                Update the core listing details for {auction.name}. Advanced financial,
                bidding, and notification controls remain in the dedicated settings tabs.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {auction.status ? "Editable status" : "Auction"}
            </p>
            <p className="mt-1 text-sm font-semibold capitalize text-foreground">
              {auction.status || "Editable"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{auction.code || `#${auction.id}`}</p>
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <FormSection
            title="Auction Identity"
            description="Core public details bidders and staff use to identify this auction."
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormInput
                label="Auction name *"
                name="name"
                placeholder="Spring Antiques Auction"
                value={formState.name}
                onChange={(event) =>
                  setFormState((current) =>
                    current
                      ? {
                          ...current,
                          name: event.target.value,
                        }
                      : current
                  )
                }
              />
              <FormInput
                label="Code"
                name="code"
                placeholder="SPRING_2026"
                value={formState.code}
                onChange={(event) =>
                  setFormState((current) =>
                    current
                      ? {
                          ...current,
                          code: event.target.value,
                        }
                      : current
                  )
                }
                hint="Letters, numbers, hyphens, and underscores only."
              />
            </div>

            <div className="mt-6">
              <FormTextarea
                label="Description"
                name="description"
                placeholder="Summarize the auction, catalogue highlights, and bidder expectations."
                rows={5}
                value={formState.description}
                onChange={(event) =>
                  setFormState((current) =>
                    current
                      ? {
                          ...current,
                          description: event.target.value,
                        }
                      : current
                  )
                }
              />
            </div>

            <div className="mt-6 space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Categories</label>
              <div className="flex flex-wrap gap-2">
                {formState.categories.length > 0 ? (
                  formState.categories.map((category) => (
                    <span
                      key={category}
                      className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs text-foreground"
                    >
                      {category}
                      <button
                        type="button"
                        onClick={() => removeCategory(category)}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                        aria-label={`Remove ${category}`}
                      >
                        <Plus className="h-3 w-3 rotate-45" />
                      </button>
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No categories added yet.</p>
                )}
              </div>
              <FormInput
                label=""
                name="categories_input"
                placeholder="Type a category and press Enter"
                value={categoryInput}
                onChange={(event) => setCategoryInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === ",") {
                    event.preventDefault();
                    addCategory(categoryInput.replace(/,$/, ""));
                  }
                }}
                onBlur={() => addCategory(categoryInput)}
              />
              <p className="text-xs text-muted-foreground">
                Press Enter or comma to add multiple categories.
              </p>
            </div>
          </FormSection>

          <FormSection
            title="Auction Window"
            description="Control when the auction starts and closes for bidders."
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <DateTimePicker
                label="Auction Start *"
                value={formState.auction_start_at}
                onChange={(value) =>
                  setFormState((current) =>
                    current
                      ? {
                          ...current,
                          auction_start_at: value,
                        }
                      : current
                  )
                }
                clearable={false}
              />
              <DateTimePicker
                label="Auction End *"
                value={formState.auction_end_at}
                onChange={(value) =>
                  setFormState((current) =>
                    current
                      ? {
                          ...current,
                          auction_end_at: value,
                        }
                      : current
                  )
                }
                clearable={false}
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Timezone</label>
                <TimezoneSelect
                  name="timezone"
                  value={formState.timezone}
                  onChange={(value) =>
                    setFormState((current) =>
                      current
                        ? {
                            ...current,
                            timezone: value || "",
                          }
                        : current
                    )
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Stored and validated as an IANA timezone.
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Currency</label>
                <CurrencySelect
                  name="currency"
                  value={formState.currency}
                  onChange={(value) =>
                    setFormState((current) =>
                      current
                        ? {
                            ...current,
                            currency: value || "",
                          }
                        : current
                    )
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Stored as an ISO currency code such as USD or NGN.
                </p>
              </div>
            </div>
          </FormSection>

          <FormSection
            title="Location"
            description="Split address fields are kept consistent with the create-auction experience."
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormInput
                label="Address line 1"
                name="address_line_1"
                placeholder="123 Main Street"
                value={formState.address_line_1}
                onChange={(event) =>
                  setFormState((current) =>
                    current
                      ? {
                          ...current,
                          address_line_1: event.target.value,
                        }
                      : current
                  )
                }
              />
              <FormInput
                label="Address line 2"
                name="address_line_2"
                placeholder="Suite 200"
                value={formState.address_line_2}
                onChange={(event) =>
                  setFormState((current) =>
                    current
                      ? {
                          ...current,
                          address_line_2: event.target.value,
                        }
                      : current
                  )
                }
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Country</label>
                <CountrySelect
                  name="country"
                  value={formState.country || undefined}
                  onChange={handleCountryChange}
                  placeholder="Search country..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">State / Province</label>
                <StateSelect
                  name="state"
                  countryIso2={normalizedCountry}
                  value={formState.state || undefined}
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
                  value={formState.city}
                  onChange={(event) =>
                    setFormState((current) =>
                      current
                        ? {
                            ...current,
                            city: event.target.value,
                          }
                        : current
                    )
                  }
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
                {citySuggestions.length > 0 ? (
                  <datalist id={citySuggestionsListId}>
                    {citySuggestions.slice(0, 250).map((cityName) => (
                      <option key={cityName} value={cityName} />
                    ))}
                  </datalist>
                ) : null}
              </div>
              <FormInput
                label="Zip code"
                name="zip_code"
                placeholder="200001"
                value={formState.zip_code}
                onChange={(event) =>
                  setFormState((current) =>
                    current
                      ? {
                          ...current,
                          zip_code: event.target.value,
                        }
                      : current
                  )
                }
              />
            </div>
          </FormSection>

          <div className="flex flex-col-reverse gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="text-sm text-muted-foreground">
              Only changed fields are sent to the auction update endpoint.
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => router.push(`/dashboard/auction/${auctionId}`)}
                disabled={updateAuction.isPending}
              >
                Cancel
              </Button>
              <PremiumButton
                type="submit"
                className="w-full sm:w-auto"
                isLoading={updateAuction.isPending}
                disabled={updateAuction.isPending}
              >
                {!updateAuction.isPending && <Save className="mr-2 h-4 w-4" />}
                Save changes
              </PremiumButton>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
