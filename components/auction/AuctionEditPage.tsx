"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  DollarSign,
  Globe,
  Loader2,
  Plus,
  Save,
  Tag,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DateTimePicker } from "@/components/auction/DateTimePicker";
import { FormInput } from "@/components/auction/FormInput";
import { FormSection } from "@/components/auction/FormSection";
import { FormTextarea } from "@/components/auction/FormTextarea";
import { PremiumButton } from "@/components/auction/PremiumButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CurrencySelect } from "@/components/ui/currency-select";
import {
  CountrySelect,
  StateSelect,
  getCitySuggestions,
  normalizeCountryToIso2,
  normalizeStateToIso31662,
} from "@/components/ui/country-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimezoneSelect } from "@/components/ui/timezone-select";
import { useAuction } from "@/features/auction/hooks/useAuction";
import { useCategories } from "@/features/auction/hooks/Usecategories";
import type { AuctionEditResponse, AuctionStatus, BidAmountType, BidMechanism, UpdateAuctionPayload } from "@/features/auction/types";
interface BidIncrement {
  up_to_amount: number | "";
  increment: number | "";
}

interface AuctionLink {
  url: string;
  description: string;
}

type FeatureImage =
  | { kind: "existing"; url: string }
  | { kind: "new"; file: File; previewUrl: string };

type AuctionEditFormState = {
  code: string;
  name: string;
  description: string;
  category_ids: number[];
  auction_start_at: string;
  auction_end_at: string;
  checkout_start_at: string;
  checkout_end_at: string;
  timezone: string;
  currency: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  commission_percentage: number | "";
  buyer_premium_percentage: number | "";
  bid_mechanism: string;
  bid_amount_type: string;
  force_bid_increment_schedule: boolean;
  bid_increments: BidIncrement[];
  auction_links: AuctionLink[];
  feature_images: FeatureImage[];
};

const BID_MECHANISMS: Array<{ value: string; label: string; description: string }> = [
  {
    value: "proxy",
    label: "Proxy",
    description: "Bidders set a max — the system bids on their behalf up to that amount.",
  },
  {
    value: "standard",
    label: "Standard",
    description: "Bidders place individual bids; highest bid at close wins.",
  },
];

const BID_AMOUNT_TYPES: Array<{ value: string; label: string; description: string }> = [
  {
    value: "maximum_up_to",
    label: "Maximum (Up To)",
    description: "The amount entered is a ceiling — the system bids the minimum needed to win.",
  },
  {
    value: "exact",
    label: "Exact Amount",
    description: "The amount entered is placed as-is, with no automatic incrementing.",
  },
];

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_SIZE_MB = 5;

const isEditableStatus = (status?: AuctionStatus | null) =>
  status === "draft" || status === "scheduled";

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object") {
    const err = error as { message?: unknown; errors?: Record<string, string[]> };

    // Collect field-level validation messages if present
    if (err.errors && typeof err.errors === "object") {
      const messages = Object.values(err.errors).flat();
      if (messages.length) return messages.join(" ");
    }

    if (typeof err.message === "string" && err.message.trim()) {
      return err.message;
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
    return new Intl.DateTimeFormat("en-GB", { ...baseOptions, timeZone: timezone || "UTC" });
  } catch {
    return new Intl.DateTimeFormat("en-GB", baseOptions);
  }
};

const toAuctionDateTimeValue = (value?: string | null, timezone?: string | null) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  const parts = createFormatter(timezone).formatToParts(parsed);
  const lookup = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  const { year, month, day, hour, minute } = lookup;
  if (!year || !month || !day || !hour || !minute) return "";
  return `${year}-${month}-${day}T${hour}:${minute}`;
};

const normalizeEditDateTimeValue = (value?: string | null, timezone?: string | null) => {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) {
    return trimmed.replace(" ", "T").slice(0, 16);
  }
  return toAuctionDateTimeValue(trimmed, timezone);
};

const mapAuctionToFormState = (auction: AuctionEditResponse): AuctionEditFormState => {
  const timezone = auction.timezone || "UTC";
  const country = normalizeCountryToIso2(auction.country) || auction.country || "";
  const state = normalizeStateToIso31662(auction.state, country) || auction.state || "";

  return {
    code: auction.code || "",
    name: auction.name || "",
    description: auction.description || "",
    category_ids: Array.isArray(auction.categories) ? auction.categories : [],
    auction_start_at: normalizeEditDateTimeValue(auction.auction_start_at, timezone),
    auction_end_at: normalizeEditDateTimeValue(auction.auction_end_at, timezone),
    checkout_start_at: normalizeEditDateTimeValue(auction.checkout_start_at, timezone),
    checkout_end_at: normalizeEditDateTimeValue(auction.checkout_end_at, timezone),
    timezone,
    currency: auction.currency || "",
    address_line_1: auction.address_line_1 || "",
    address_line_2: auction.address_line_2 || "",
    city: auction.city || "",
    state,
    zip_code: auction.zip_code || "",
    country,
    commission_percentage: auction.commission_percentage ?? "",
    buyer_premium_percentage: auction.buyer_premium_percentage ?? "",
    bid_mechanism: auction.bid_mechanism || "",
    bid_amount_type: auction.bid_amount_type || "",
    force_bid_increment_schedule: auction.force_bid_increment_schedule ?? false,
    bid_increments: auction.bid_increments?.length
      ? auction.bid_increments.map((inc) => ({
        up_to_amount: inc.up_to_amount ?? "",
        increment: inc.increment ?? "",
      }))
      : [{ up_to_amount: "", increment: "" }],
    auction_links: auction.auction_links ?? [],
    feature_images: (auction.feature_images ?? []).map((url) => ({
      kind: "existing" as const,
      url,
    })),
  };
};

const sanitizeFormState = (formState: AuctionEditFormState): AuctionEditFormState => {
  const country = normalizeCountryToIso2(formState.country) || formState.country.trim();
  const state = normalizeStateToIso31662(formState.state, country) || formState.state.trim();

  return {
    ...formState,
    code: formState.code.trim(),
    name: formState.name.trim(),
    description: formState.description.trim(),
    category_ids: [...new Set(formState.category_ids)],
    timezone: formState.timezone.trim(),
    currency: formState.currency.trim().toUpperCase(),
    address_line_1: formState.address_line_1.trim(),
    address_line_2: formState.address_line_2.trim(),
    city: formState.city.trim(),
    state,
    zip_code: formState.zip_code.trim(),
    country,
    bid_mechanism: formState.bid_mechanism.trim(),
    bid_amount_type: formState.bid_amount_type.trim(),
    bid_increments: formState.bid_increments.filter(
      (inc) => inc.up_to_amount !== "" && inc.increment !== ""
    ),
    auction_links: formState.auction_links
      .map((l) => ({ url: l.url.trim(), description: l.description.trim() }))
      .filter((l) => l.url),
    feature_images: formState.feature_images.filter((img) =>
      img.kind === "existing" ? img.url.trim() : img.file.size > 0
    ),
  };
};

// For diffing, we compare the serialisable shape of feature_images — File
// objects can't be JSON.stringify'd meaningfully, so we compare by filename+size.
const serializeImages = (images: FeatureImage[]) =>
  images.map((img) =>
    img.kind === "existing" ? img.url : `new::${img.file.name}::${img.file.size}`
  );

const buildUpdatePayload = (
  current: AuctionEditFormState,
  initial: AuctionEditFormState
): UpdateAuctionPayload => {
  const payload: UpdateAuctionPayload = {};

  const diff = <K extends keyof AuctionEditFormState>(key: K) =>
    JSON.stringify(current[key]) !== JSON.stringify(initial[key]);

  if (diff("code")) payload.code = current.code;
  if (diff("name")) payload.name = current.name;
  if (diff("description")) payload.description = current.description;
  if (diff("category_ids")) payload.categories = current.category_ids;
  if (diff("auction_start_at")) payload.auction_start_at = current.auction_start_at;
  if (diff("auction_end_at")) payload.auction_end_at = current.auction_end_at;
  if (diff("checkout_start_at")) payload.checkout_start_at = current.checkout_start_at;
  if (diff("checkout_end_at")) payload.checkout_end_at = current.checkout_end_at;
  if (diff("timezone")) payload.timezone = current.timezone;
  if (diff("currency")) payload.currency = current.currency;
  if (diff("address_line_1")) payload.address_line_1 = current.address_line_1;
  if (diff("address_line_2")) payload.address_line_2 = current.address_line_2;
  if (diff("city")) payload.city = current.city;
  if (diff("state")) payload.state = current.state;
  if (diff("zip_code")) payload.zip_code = current.zip_code;
  if (diff("country")) payload.country = current.country;
  if (diff("commission_percentage"))
    payload.commission_percentage =
      current.commission_percentage === "" ? null : current.commission_percentage;
  if (diff("buyer_premium_percentage"))
    payload.buyer_premium_percentage =
      current.buyer_premium_percentage === "" ? null : current.buyer_premium_percentage;
  if (diff("bid_mechanism") && current.bid_mechanism)
    payload.bid_mechanism = current.bid_mechanism as BidMechanism;
  if (diff("bid_amount_type") && current.bid_amount_type)
    payload.bid_amount_type = current.bid_amount_type as BidAmountType;
  if (diff("force_bid_increment_schedule"))
    payload.force_bid_increment_schedule = current.force_bid_increment_schedule;
  if (diff("bid_increments"))
    payload.bid_increments = current.bid_increments as Array<{
      up_to_amount: number;
      increment: number;
    }>;
  if (diff("auction_links")) payload.auction_links = current.auction_links;

  // Images: diff by serialized representation, then split into URLs + new Files.
  const imagesDiffer =
    JSON.stringify(serializeImages(current.feature_images)) !==
    JSON.stringify(serializeImages(initial.feature_images));

  if (imagesDiffer) {
    payload.feature_image_urls = current.feature_images
      .filter((img): img is Extract<FeatureImage, { kind: "existing" }> => img.kind === "existing")
      .map((img) => img.url);
    payload.feature_image_files = current.feature_images
      .filter((img): img is Extract<FeatureImage, { kind: "new" }> => img.kind === "new")
      .map((img) => img.file);
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

  if (formState.checkout_start_at && formState.checkout_end_at) {
    const cs = new Date(formState.checkout_start_at);
    const ce = new Date(formState.checkout_end_at);
    if (!Number.isNaN(cs.getTime()) && !Number.isNaN(ce.getTime()) && ce <= cs) {
      return "Checkout end date must be after the checkout start date.";
    }
  }

  for (const inc of formState.bid_increments) {
    if (inc.up_to_amount !== "" || inc.increment !== "") {
      if (inc.up_to_amount === "" || inc.increment === "") {
        return "Each bid increment row must have both an amount and an increment value.";
      }
      if (Number(inc.up_to_amount) <= 0 || Number(inc.increment) <= 0) {
        return "Bid increment amounts and values must be greater than zero.";
      }
    }
  }

  return null;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

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
                  <CommandItem value={parent.name} onSelect={() => toggle(parent.id)} className="gap-2">
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

function EditSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            {icon}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function AuctionEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { useAuctionEditById, updateAuction } = useAuction();

  const auctionId = Number(id);
  const { data: auction, isLoading, error, refetch, isRefetching } = useAuctionEditById(auctionId);

  const initialFormState = useMemo(
    () => (auction ? mapAuctionToFormState(auction) : null),
    [auction]
  );
  const [formState, setFormState] = useState<AuctionEditFormState | null>(initialFormState);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setFormState(initialFormState);
  }, [initialFormState]);

  useEffect(() => {
    const images = formState?.feature_images ?? [];
    return () => {
      images.forEach((img) => {
        if (img.kind === "new") URL.revokeObjectURL(img.previewUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // ── Location ───────────────────────────────────────────────────────────────

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

  const addIncrement = useCallback(() => {
    setFormState((prev) =>
      prev
        ? { ...prev, bid_increments: [...prev.bid_increments, { up_to_amount: "", increment: "" }] }
        : prev
    );
  }, []);

  const removeIncrement = useCallback((i: number) => {
    setFormState((prev) => {
      if (!prev || prev.bid_increments.length <= 1) return prev;
      return { ...prev, bid_increments: prev.bid_increments.filter((_, idx) => idx !== i) };
    });
  }, []);

  const updateIncrement = useCallback((i: number, key: keyof BidIncrement, raw: string) => {
    const value = raw === "" ? "" : Number(raw);
    setFormState((prev) => {
      if (!prev) return prev;
      const updated = [...prev.bid_increments];
      updated[i] = { ...updated[i], [key]: value };
      return { ...prev, bid_increments: updated };
    });
  }, []);


  const addLink = useCallback(() => {
    setFormState((prev) =>
      prev
        ? { ...prev, auction_links: [...prev.auction_links, { url: "", description: "" }] }
        : prev
    );
  }, []);

  const removeLink = useCallback((i: number) => {
    setFormState((prev) =>
      prev ? { ...prev, auction_links: prev.auction_links.filter((_, idx) => idx !== i) } : prev
    );
  }, []);

  const updateLink = useCallback((i: number, key: keyof AuctionLink, value: string) => {
    setFormState((prev) => {
      if (!prev) return prev;
      const updated = [...prev.auction_links];
      updated[i] = { ...updated[i], [key]: value };
      return { ...prev, auction_links: updated };
    });
  }, []);

  const addImageFiles = useCallback((files: FileList | File[]) => {
    const valid: FeatureImage[] = [];
    const errors: string[] = [];

    for (const file of Array.from(files)) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        errors.push(`"${file.name}" is not a supported image type.`);
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        errors.push(`"${file.name}" exceeds the ${MAX_IMAGE_SIZE_MB}MB limit.`);
        continue;
      }
      valid.push({ kind: "new", file, previewUrl: URL.createObjectURL(file) });
    }

    if (errors.length) toast.error(errors.join(" "));
    if (valid.length) {
      setFormState((prev) =>
        prev ? { ...prev, feature_images: [...prev.feature_images, ...valid] } : prev
      );
    }
  }, []);

  const removeImage = useCallback((index: number) => {
    setFormState((prev) => {
      if (!prev) return prev;
      const img = prev.feature_images[index];
      if (img?.kind === "new") URL.revokeObjectURL(img.previewUrl);
      return { ...prev, feature_images: prev.feature_images.filter((_, i) => i !== index) };
    });
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState || !initialFormState || !auction) return;

    if (!isEditable) {
      toast.error("Only draft or scheduled auctions can be edited.");
      return;
    }

    const sanitizedCurrent = sanitizeFormState(formState);
    const validationError = validateFormState(sanitizedCurrent);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const payload = buildUpdatePayload(sanitizedCurrent, sanitizeFormState(initialFormState));
    if (Object.keys(payload).length === 0) {
      toast("No changes to save.");
      return;
    }

    try {
      await updateAuction.mutateAsync({ auctionId, payload });
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
              <PremiumButton
                type="button"
                variant="ghost"
                onClick={() => router.push(`/dashboard/auction/${auctionId}`)}
              >
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
            <h1 className="text-2xl font-semibold text-foreground">
              Auction can no longer be edited
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Only draft and scheduled auctions can be updated.
              {auction.status && (
                <>
                  {" "}This auction is currently{" "}
                  <span className="font-medium text-foreground">{auction.status}</span>.
                </>
              )}
            </p>
            <div className="mt-6">
              <PremiumButton
                type="button"
                variant="outline"
                onClick={() => router.push(`/dashboard/auction/${auctionId}`)}
              >
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

        {/* Page header */}
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
                Update the listing details for {auction.name}.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</p>
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
                onChange={(e) => setFormState((s) => s && { ...s, name: e.target.value })}
              />
              <FormInput
                label="Code"
                name="code"
                placeholder="SPRING_2026"
                value={formState.code}
                onChange={(e) => setFormState((s) => s && { ...s, code: e.target.value })}
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
                onChange={(e) => setFormState((s) => s && { ...s, description: e.target.value })}
              />
            </div>

            <div className="mt-6 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Categories</label>
              <CategoryPicker
                selectedIds={formState.category_ids}
                onChange={(ids) => setFormState((s) => s && { ...s, category_ids: ids })}
              />
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
                onChange={(value) => setFormState((s) => s && { ...s, auction_start_at: value })}
                clearable={false}
              />
              <DateTimePicker
                label="Auction End *"
                value={formState.auction_end_at}
                onChange={(value) => setFormState((s) => s && { ...s, auction_end_at: value })}
                clearable={false}
              />
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <DateTimePicker
                label="Checkout Opens"
                value={formState.checkout_start_at}
                onChange={(value) => setFormState((s) => s && { ...s, checkout_start_at: value })}
                clearable
              />
              <DateTimePicker
                label="Checkout Closes"
                value={formState.checkout_end_at}
                onChange={(value) => setFormState((s) => s && { ...s, checkout_end_at: value })}
                clearable
              />
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Timezone</label>
                <TimezoneSelect
                  name="timezone"
                  value={formState.timezone}
                  onChange={(value) => setFormState((s) => s && { ...s, timezone: value || "" })}
                />
                <p className="text-xs text-muted-foreground">Stored as an IANA timezone.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Currency</label>
                <CurrencySelect
                  name="currency"
                  value={formState.currency}
                  onChange={(value) => setFormState((s) => s && { ...s, currency: value || "" })}
                />
                <p className="text-xs text-muted-foreground">Stored as ISO code e.g. NGN, USD.</p>
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
                onChange={(e) => setFormState((s) => s && { ...s, address_line_1: e.target.value })}
              />
              <FormInput
                label="Address line 2"
                name="address_line_2"
                placeholder="Suite 200"
                value={formState.address_line_2}
                onChange={(e) => setFormState((s) => s && { ...s, address_line_2: e.target.value })}
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
                  onChange={(e) => setFormState((s) => s && { ...s, city: e.target.value })}
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
                label="Zip code"
                name="zip_code"
                placeholder="200001"
                value={formState.zip_code}
                onChange={(e) => setFormState((s) => s && { ...s, zip_code: e.target.value })}
              />
            </div>
          </FormSection>

          <EditSection
            icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
            title="Bidding Configuration"
            description="How bids are placed, fees charged, and increments enforced"
          >
            <div className="space-y-8">

              {/* Bid Mechanism */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Bid Mechanism</Label>
                <Select
                  value={formState.bid_mechanism}
                  onValueChange={(v) => setFormState((s) => s && { ...s, bid_mechanism: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select mechanism…" />
                  </SelectTrigger>
                  <SelectContent>
                    {BID_MECHANISMS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formState.bid_mechanism && (
                  <p className="text-xs text-muted-foreground">
                    {BID_MECHANISMS.find((m) => m.value === formState.bid_mechanism)?.description}
                  </p>
                )}
              </div>

              {/* Bid Amount Type */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Bid Amount Type</Label>
                <Select
                  value={formState.bid_amount_type}
                  onValueChange={(v) => setFormState((s) => s && { ...s, bid_amount_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select amount type…" />
                  </SelectTrigger>
                  <SelectContent>
                    {BID_AMOUNT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formState.bid_amount_type && (
                  <p className="text-xs text-muted-foreground">
                    {BID_AMOUNT_TYPES.find((t) => t.value === formState.bid_amount_type)?.description}
                  </p>
                )}
              </div>

              <Separator />

              {/* Fees */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Commission (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={formState.commission_percentage}
                    onChange={(e) =>
                      setFormState((s) =>
                        s && {
                          ...s,
                          commission_percentage:
                            e.target.value === "" ? "" : Number(e.target.value),
                        }
                      )
                    }
                    placeholder="e.g. 12.5"
                  />
                  <p className="text-xs text-muted-foreground">
                    Charged to the seller as a percentage of the hammer price.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Buyer Premium (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={formState.buyer_premium_percentage}
                    onChange={(e) =>
                      setFormState((s) =>
                        s && {
                          ...s,
                          buyer_premium_percentage:
                            e.target.value === "" ? "" : Number(e.target.value),
                        }
                      )
                    }
                    placeholder="e.g. 7.5"
                  />
                  <p className="text-xs text-muted-foreground">
                    Added on top of the hammer price and charged to the buyer.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Bid Increments */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Bid Increments</p>
                    <p className="text-xs text-muted-foreground">
                      Define minimum raise tiers based on current lot value
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor="force_increments" className="text-xs text-muted-foreground">
                      Force schedule
                    </label>
                    <Switch
                      id="force_increments"
                      checked={formState.force_bid_increment_schedule}
                      onCheckedChange={(v) =>
                        setFormState((s) => s && { ...s, force_bid_increment_schedule: v })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_1fr_2rem] gap-2 px-1">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Up To Amount
                    </span>
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Increment
                    </span>
                    <span />
                  </div>
                  {formState.bid_increments.map((inc, i) => (
                    <div key={i} className="grid grid-cols-[1fr_1fr_2rem] items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        value={inc.up_to_amount}
                        onChange={(e) => updateIncrement(i, "up_to_amount", e.target.value)}
                        placeholder="1 000"
                        className="text-sm"
                      />
                      <Input
                        type="number"
                        min={0}
                        value={inc.increment}
                        onChange={(e) => updateIncrement(i, "increment", e.target.value)}
                        placeholder="25"
                        className="text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeIncrement(i)}
                        disabled={formState.bid_increments.length === 1}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label="Remove increment row"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addIncrement}
                  className="gap-2 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Tier
                </Button>
              </div>
            </div>
          </EditSection>

          {/* ── 5. Links & Feature Images ─────────────────────────────────── */}
          <EditSection
            icon={<Tag className="h-4 w-4 text-muted-foreground" />}
            title="Links & Feature Images"
            description="External resources and images displayed on the auction listing"
          >
            <div className="space-y-6">

              {/* Auction links */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Auction Links</p>
                    <p className="text-xs text-muted-foreground">
                      Catalogue, preview, or any related external URLs
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addLink}
                    className="gap-1.5 text-xs text-muted-foreground"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Link
                  </Button>
                </div>

                {formState.auction_links.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No links yet.{" "}
                    <button
                      type="button"
                      onClick={addLink}
                      className="text-foreground underline underline-offset-2"
                    >
                      Add one
                    </button>
                  </p>
                ) : (
                  <div className="space-y-2">
                    {formState.auction_links.map((link, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
                          <div className="relative">
                            <Globe className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                              type="url"
                              value={link.url}
                              onChange={(e) => updateLink(i, "url", e.target.value)}
                              placeholder="https://…"
                              className="pl-8 text-sm"
                            />
                          </div>
                          <Input
                            value={link.description}
                            onChange={(e) => updateLink(i, "description", e.target.value)}
                            placeholder="Description (e.g. Catalogue)"
                            className="text-sm"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLink(i)}
                          className="mt-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          aria-label="Remove link"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Feature images */}
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Feature Images</p>
                  <p className="text-xs text-muted-foreground">
                    JPEG, PNG, WebP or GIF · max {MAX_IMAGE_SIZE_MB}MB each
                  </p>
                </div>

                {formState.feature_images.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {formState.feature_images.map((img, index) => {
                      const src = img.kind === "existing" ? img.url : img.previewUrl;
                      return (
                        <div
                          key={index}
                          className="group relative aspect-video overflow-hidden rounded-lg border border-border bg-muted"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={src}
                            alt=""
                            className="h-full w-full object-cover transition-opacity group-hover:opacity-60"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                          {img.kind === "new" && (
                            <span className="absolute bottom-1.5 left-1.5 rounded bg-background/80 px-1.5 py-0.5 text-[10px] font-medium text-foreground">
                              New
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive hover:text-white"
                            aria-label="Remove image"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Drop zone / file picker */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files.length) addImageFiles(e.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 transition-colors",
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/40 hover:bg-muted/30"
                  )}
                >
                  <UploadCloud
                    className={cn(
                      "h-8 w-8 transition-colors",
                      isDragging ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">
                      Drop images here, or{" "}
                      <span className="text-primary underline underline-offset-2">browse</span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      JPEG, PNG, WebP, GIF · max {MAX_IMAGE_SIZE_MB}MB
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES.join(",")}
                    multiple
                    className="sr-only"
                    onChange={(e) => {
                      if (e.target.files?.length) addImageFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </div>
              </div>
            </div>
          </EditSection>

          {/* ── Footer ──────────────────────────────────────────────────── */}
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
