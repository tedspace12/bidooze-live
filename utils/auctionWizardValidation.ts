import type { CreateAuctionPayload } from "@/features/auction/types";
import { detectUserTimezone } from "@/lib/timezones";

export type WizardTabId = "details" | "upload" | "lots" | "images" | "preview";
export type WizardTabStatus = "locked" | "invalid" | "complete" | "current";
export type AuctionWizardState = Omit<CreateAuctionPayload, "feature_images"> & {
  feature_images?: File[];
};
export type WizardFieldErrors = Partial<Record<string, string>>;

const toTimestamp = (value?: string) => {
  if (!value) return null;
  const ts = new Date(value).getTime();
  return Number.isNaN(ts) ? null : ts;
};

const getCurrentMinuteTimestamp = () => {
  const now = new Date();
  now.setSeconds(0, 0);
  return now.getTime();
};

const isDateTimeLocal = (value?: string) => {
  if (!value) return true;
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value);
};

const getLotImageCount = (state: AuctionWizardState, lotNumber: string, lotIndex: number) => {
  const indexCount = state.lot_images?.[String(lotIndex)]?.length || 0;
  const lotNumberCount = state.lot_images?.[lotNumber]?.length || 0;
  return Math.max(indexCount, lotNumberCount);
};

const addFieldError = (errors: WizardFieldErrors, field: string, message: string) => {
  if (!errors[field]) {
    errors[field] = message;
  }
};

const validateBidIncrements = (
  state: AuctionWizardState
): { ok: boolean; message?: string; field?: string } => {
  if (!state.force_bid_increment_schedule) return { ok: true };

  if (!Array.isArray(state.bid_increments) || state.bid_increments.length === 0) {
    return {
      ok: false,
      message: "Bid increments are required when increment schedule is enabled.",
      field: "bid_increments",
    };
  }

  const seen = new Set<number>();
  let previous = 0;

  for (const row of state.bid_increments) {
    if (typeof row.up_to_amount !== "number" || row.up_to_amount <= 0) {
      return { ok: false, message: "Each increment row needs a valid up_to_amount.", field: "bid_increments" };
    }
    if (typeof row.increment !== "number" || row.increment <= 0) {
      return { ok: false, message: "Each increment row needs a valid increment value.", field: "bid_increments" };
    }
    if (seen.has(row.up_to_amount)) {
      return { ok: false, message: "Increment caps must be unique.", field: "bid_increments" };
    }
    if (row.up_to_amount <= previous) {
      return { ok: false, message: "Increment caps must be strictly ascending.", field: "bid_increments" };
    }
    seen.add(row.up_to_amount);
    previous = row.up_to_amount;
  }

  if (previous < 1000000) {
    return {
      ok: false,
      message: "Final increment cap must be at least 1,000,000.",
      field: "bid_increments",
    };
  }

  return { ok: true };
};

export const validateTab = (
  tabId: WizardTabId,
  state: AuctionWizardState,
  options?: { strictImages?: boolean }
): { ok: boolean; message?: string; field?: string } => {
  const fieldErrors = getTabFieldErrors(tabId, state, options);
  const firstError = Object.entries(fieldErrors)[0];

  if (firstError) {
    const [field, message] = firstError;
    return { ok: false, field, message };
  }

  return { ok: true };
};

export const getTabFieldErrors = (
  tabId: WizardTabId,
  state: AuctionWizardState,
  options?: { strictImages?: boolean }
): WizardFieldErrors => {
  const errors: WizardFieldErrors = {};

  if (tabId === "details") {
    const resolvedTimezone = state.timezone || detectUserTimezone();

    if (!state.name?.trim()) addFieldError(errors, "name", "Auction name is required.");
    if (!state.auction_start_at) addFieldError(errors, "auction_start_at", "Auction start date is required.");
    if (!state.auction_end_at) addFieldError(errors, "auction_end_at", "Auction end date is required.");
    if (!resolvedTimezone) addFieldError(errors, "timezone", "Timezone is required.");
    if (!state.currency) addFieldError(errors, "currency", "Currency is required.");

    const dateFields: Array<keyof AuctionWizardState> = [
      "auction_start_at",
      "auction_end_at",
      "preview_start_at",
      "preview_end_at",
      "checkout_start_at",
      "checkout_end_at",
      "open_bidding_at",
      "close_bidding_at",
    ];

    for (const field of dateFields) {
      const value = state[field] as string | undefined;
      if (!isDateTimeLocal(value)) {
        addFieldError(errors, String(field), `${field} must be in YYYY-MM-DDTHH:mm format.`);
      }
    }

    const start = toTimestamp(state.auction_start_at);
    const end = toTimestamp(state.auction_end_at);
    const now = getCurrentMinuteTimestamp();

    if (start !== null && start < now) {
      addFieldError(errors, "auction_start_at", "Auction start cannot be in the past.");
    }
    if (start !== null && end !== null && end <= start) {
      addFieldError(errors, "auction_end_at", "Auction end date must be after start date.");
    }

    const previewStart = toTimestamp(state.preview_start_at);
    const previewEnd = toTimestamp(state.preview_end_at);
    const checkoutStart = toTimestamp(state.checkout_start_at);
    const checkoutEnd = toTimestamp(state.checkout_end_at);
    const openBidding = toTimestamp(state.open_bidding_at);
    const closeBidding = toTimestamp(state.close_bidding_at);

    if (previewStart !== null && start !== null && previewStart > start) {
      addFieldError(errors, "preview_start_at", "Preview start must be before or equal to auction start.");
    }

    if (previewEnd !== null && end !== null && previewEnd > end) {
      addFieldError(errors, "preview_end_at", "Preview end must be before or equal to auction end.");
    }

    if (checkoutStart !== null && end !== null && checkoutStart < end) {
      addFieldError(errors, "checkout_start_at", "Checkout start must be after or equal to auction end.");
    }

    if (checkoutEnd !== null && checkoutStart !== null && checkoutEnd < checkoutStart) {
      addFieldError(errors, "checkout_end_at", "Checkout end must be after or equal to checkout start.");
    }

    if (openBidding !== null && closeBidding !== null && openBidding > closeBidding) {
      addFieldError(errors, "open_bidding_at", "Open bidding must be before or equal to close bidding.");
    }

    if (closeBidding !== null && end !== null && closeBidding > end) {
      addFieldError(errors, "close_bidding_at", "Close bidding cannot be after auction end.");
    }

    if (openBidding !== null) {
      const visibilityStart = previewStart ?? start;
      if (visibilityStart !== null && openBidding < visibilityStart) {
        addFieldError(
          errors,
          "open_bidding_at",
          "Open bidding cannot be earlier than preview start (or auction start when no preview start)."
        );
      }
    }
    return errors;
  }

  if (tabId === "upload") {
    if (!state.bidding_type) addFieldError(errors, "bidding_type", "Bidding type is required.");
    if (!state.bid_amount_type) addFieldError(errors, "bid_amount_type", "Bid amount type is required.");
    if (typeof state.soft_close_seconds !== "number") {
      addFieldError(errors, "soft_close_seconds", "Soft close seconds is required.");
    }
    if (typeof state.lot_stagger_seconds !== "number") {
      addFieldError(errors, "lot_stagger_seconds", "Lot stagger seconds is required.");
    }

    const bidMechanism = state.bid_mechanism || "standard";
    if (bidMechanism === "standard" && state.bid_amount_type !== "fixed_flat") {
      addFieldError(errors, "bid_amount_type", "When bid mechanism is standard, bid amount type must be fixed_flat.");
    }

    if (bidMechanism === "proxy" && !["fixed_flat", "maximum_up_to"].includes(state.bid_amount_type)) {
      addFieldError(
        errors,
        "bid_amount_type",
        "When bid mechanism is proxy, bid amount type must be fixed_flat or maximum_up_to."
      );
    }

    if (state.add_handling_charges && !state.handling_charge_type) {
      addFieldError(
        errors,
        "handling_charge_type",
        "Handling charge type is required when handling charges are enabled."
      );
    }
    if (state.add_handling_charges && typeof state.handling_charge_amount !== "number") {
      addFieldError(
        errors,
        "handling_charge_amount",
        "Handling charge amount is required when handling charges are enabled."
      );
    }

    if (state.successful_bidder_registration_option === "deposit") {
      const depositType = state.deposit_type || "fixed";
      if (typeof state.deposit_value !== "number") {
        addFieldError(errors, "deposit_value", "Deposit value is required.");
      }
      if (!state.deposit_type) addFieldError(errors, "deposit_type", "Deposit type is required.");
      if (typeof state.deposit_cap !== "number") addFieldError(errors, "deposit_cap", "Deposit cap is required.");
      if (!state.deposit_policy) addFieldError(errors, "deposit_policy", "Deposit policy is required.");

      if (depositType === "percentage" && (state.deposit_value == null || state.deposit_value <= 0 || state.deposit_value > 100)) {
        addFieldError(
          errors,
          "deposit_value",
          "For percentage deposits, deposit value must be greater than 0 and at most 100."
        );
      }
    }

    const incrementValidation = validateBidIncrements(state);
    if (!incrementValidation.ok && incrementValidation.field && incrementValidation.message) {
      addFieldError(errors, incrementValidation.field, incrementValidation.message);
    }

    return errors;
  }

  if (tabId === "lots") {
    if (!state.lots || state.lots.length === 0) {
      addFieldError(errors, "lots", "At least one lot is required.");
      return errors;
    }
    for (const lot of state.lots) {
      if (!lot.lot_number?.trim()) {
        addFieldError(errors, "lots", "Each lot needs a lot number.");
        break;
      }
      if (!lot.title?.trim()) {
        addFieldError(errors, "lots", `Lot ${lot.lot_number} requires a title.`);
        break;
      }
      if (!lot.quantity || lot.quantity < 1) {
        addFieldError(errors, "lots", `Lot ${lot.lot_number} quantity must be at least 1.`);
        break;
      }
      if (typeof lot.starting_bid === "number" && lot.starting_bid < 0) {
        addFieldError(errors, "lots", `Lot ${lot.lot_number} starting bid must be >= 0.`);
        break;
      }
    }
    return errors;
  }

  if (tabId === "images") {
    if (options?.strictImages) {
      const warnings = getLotImageWarnings(state);
      if (warnings.length > 0) {
        addFieldError(errors, "lot_images", "Some lots are missing images.");
      }
    }
    return errors;
  }

  return errors;
};

export const getLotImageWarnings = (state: AuctionWizardState): string[] => {
  const warnings: string[] = [];
  if (!state.lots || state.lots.length === 0) return warnings;
  state.lots.forEach((lot, index) => {
    const count = getLotImageCount(state, lot.lot_number, index);
    if (count === 0) {
      warnings.push(`Lot ${lot.lot_number} has no images.`);
    }
  });
  return warnings;
};

export const getTabStatus = (
  tabId: WizardTabId,
  state: AuctionWizardState,
  options?: { currentTab?: WizardTabId; locked?: boolean; strictImages?: boolean }
): WizardTabStatus => {
  if (options?.currentTab === tabId) return "current";
  if (options?.locked) return "locked";
  const result = validateTab(tabId, state, { strictImages: options?.strictImages });
  return result.ok ? "complete" : "invalid";
};
