import type { CreateAuctionPayload } from "@/features/auction/types";
import { detectUserTimezone } from "@/lib/timezones";

export type WizardTabId = "details" | "upload" | "lots" | "images" | "preview";
export type WizardTabStatus = "locked" | "invalid" | "complete" | "current";
export type AuctionWizardState = Omit<CreateAuctionPayload, "feature_images"> & {
  feature_images?: File[];
};

const toTimestamp = (value?: string) => {
  if (!value) return null;
  const ts = new Date(value).getTime();
  return Number.isNaN(ts) ? null : ts;
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
  if (tabId === "details") {
    const resolvedTimezone = state.timezone || detectUserTimezone();

    if (!state.name?.trim()) return { ok: false, message: "Auction name is required.", field: "name" };
    if (!state.auction_start_at) return { ok: false, message: "Auction start date is required.", field: "auction_start_at" };
    if (!state.auction_end_at) return { ok: false, message: "Auction end date is required.", field: "auction_end_at" };
    if (!resolvedTimezone) return { ok: false, message: "Timezone is required.", field: "timezone" };
    if (!state.currency) return { ok: false, message: "Currency is required.", field: "currency" };

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
        return { ok: false, message: `${field} must be in YYYY-MM-DDTHH:mm format.`, field: String(field) };
      }
    }

    const start = toTimestamp(state.auction_start_at);
    const end = toTimestamp(state.auction_end_at);
    const now = Date.now();

    if (start !== null && start <= now) {
      return { ok: false, message: "Auction start must be in the future.", field: "auction_start_at" };
    }
    if (start !== null && end !== null && end <= start) {
      return { ok: false, message: "Auction end date must be after start date.", field: "auction_end_at" };
    }

    const previewStart = toTimestamp(state.preview_start_at);
    const previewEnd = toTimestamp(state.preview_end_at);
    const checkoutStart = toTimestamp(state.checkout_start_at);
    const checkoutEnd = toTimestamp(state.checkout_end_at);
    const openBidding = toTimestamp(state.open_bidding_at);
    const closeBidding = toTimestamp(state.close_bidding_at);

    if (previewStart !== null && start !== null && previewStart > start) {
      return { ok: false, message: "Preview start must be before or equal to auction start.", field: "preview_start_at" };
    }

    if (previewEnd !== null && end !== null && previewEnd > end) {
      return { ok: false, message: "Preview end must be before or equal to auction end.", field: "preview_end_at" };
    }

    if (checkoutStart !== null && end !== null && checkoutStart < end) {
      return { ok: false, message: "Checkout start must be after or equal to auction end.", field: "checkout_start_at" };
    }

    if (checkoutEnd !== null && checkoutStart !== null && checkoutEnd < checkoutStart) {
      return { ok: false, message: "Checkout end must be after or equal to checkout start.", field: "checkout_end_at" };
    }

    if (openBidding !== null && closeBidding !== null && openBidding > closeBidding) {
      return { ok: false, message: "Open bidding must be before or equal to close bidding.", field: "open_bidding_at" };
    }

    if (closeBidding !== null && end !== null && closeBidding > end) {
      return { ok: false, message: "Close bidding cannot be after auction end.", field: "close_bidding_at" };
    }

    if (openBidding !== null) {
      const visibilityStart = previewStart ?? start;
      if (visibilityStart !== null && openBidding < visibilityStart) {
        return {
          ok: false,
          message: "Open bidding cannot be earlier than preview start (or auction start when no preview start).",
          field: "open_bidding_at",
        };
      }
    }
    return { ok: true };
  }

  if (tabId === "upload") {
    if (!state.feature_images?.length) return { ok: false, message: "At least one feature image is required.", field: "feature_images" };
    if (!state.bidding_type) return { ok: false, message: "Bidding type is required.", field: "bidding_type" };
    if (!state.bid_amount_type) return { ok: false, message: "Bid amount type is required.", field: "bid_amount_type" };
    if (typeof state.soft_close_seconds !== "number") {
      return { ok: false, message: "Soft close seconds is required.", field: "soft_close_seconds" };
    }
    if (typeof state.lot_stagger_seconds !== "number") {
      return { ok: false, message: "Lot stagger seconds is required.", field: "lot_stagger_seconds" };
    }

    const bidMechanism = state.bid_mechanism || "standard";
    if (bidMechanism === "standard" && state.bid_amount_type !== "fixed_flat") {
      return {
        ok: false,
        message: "When bid mechanism is standard, bid amount type must be fixed_flat.",
        field: "bid_amount_type",
      };
    }

    if (bidMechanism === "proxy" && !["fixed_flat", "maximum_up_to"].includes(state.bid_amount_type)) {
      return {
        ok: false,
        message: "When bid mechanism is proxy, bid amount type must be fixed_flat or maximum_up_to.",
        field: "bid_amount_type",
      };
    }

    if (state.add_handling_charges && !state.handling_charge_type) {
      return {
        ok: false,
        message: "Handling charge type is required when handling charges are enabled.",
        field: "handling_charge_type",
      };
    }

    if (state.successful_bidder_registration_option === "deposit") {
      const depositType = state.deposit_type || "fixed";
      if (typeof state.deposit_value !== "number") {
        return { ok: false, message: "Deposit value is required.", field: "deposit_value" };
      }
      if (typeof state.deposit_cap !== "number") return { ok: false, message: "Deposit cap is required.", field: "deposit_cap" };
      if (!state.deposit_policy) return { ok: false, message: "Deposit policy is required.", field: "deposit_policy" };

      if (depositType === "percentage" && (state.deposit_value <= 0 || state.deposit_value > 100)) {
        return {
          ok: false,
          message: "For percentage deposits, deposit value must be greater than 0 and at most 100.",
          field: "deposit_value",
        };
      }
    }

    const incrementValidation = validateBidIncrements(state);
    if (!incrementValidation.ok) return incrementValidation;

    return { ok: true };
  }

  if (tabId === "lots") {
    if (!state.lots || state.lots.length === 0) {
      return { ok: false, message: "At least one lot is required.", field: "lots" };
    }
    for (const lot of state.lots) {
      if (!lot.lot_number?.trim()) {
        return { ok: false, message: "Each lot needs a lot number.", field: "lot_number" };
      }
      if (!lot.title?.trim()) {
        return { ok: false, message: `Lot ${lot.lot_number} requires a title.`, field: "title" };
      }
      if (!lot.quantity || lot.quantity < 1) {
        return { ok: false, message: `Lot ${lot.lot_number} quantity must be at least 1.`, field: "quantity" };
      }
      if (typeof lot.starting_bid === "number" && lot.starting_bid < 0) {
        return { ok: false, message: `Lot ${lot.lot_number} starting bid must be >= 0.`, field: "starting_bid" };
      }
    }
    return { ok: true };
  }

  if (tabId === "images") {
    if (options?.strictImages) {
      const warnings = getLotImageWarnings(state);
      if (warnings.length > 0) {
        return { ok: false, message: "Some lots are missing images.", field: "lot_images" };
      }
    }
    return { ok: true };
  }

  return { ok: true };
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
