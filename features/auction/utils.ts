import type { Auction, AuctionOverviewAuction } from "./types";

type AuctionRecord =
  | Partial<Auction>
  | Partial<AuctionOverviewAuction>
  | Record<string, unknown>;

const normalizeCategoryKey = (value: string) => value.trim().toLowerCase();

const uniqueCategories = (items: string[]) => {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = normalizeCategoryKey(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const flattenCategoryValue = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap(flattenCategoryValue);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;

    if (typeof record.name === "string") return flattenCategoryValue(record.name);
    if (typeof record.label === "string") return flattenCategoryValue(record.label);
    if (typeof record.title === "string") return flattenCategoryValue(record.title);
  }

  return [];
};

export const getAuctionCategories = (auction: AuctionRecord): string[] => {
  const record = auction as Record<string, unknown>;

  return uniqueCategories([
    ...flattenCategoryValue(record.categories),
    ...flattenCategoryValue(record.category),
    ...flattenCategoryValue(record.auction_categories),
  ]);
};

export const getAuctionCategoryOptions = (auctions: AuctionRecord[]): string[] =>
  uniqueCategories(auctions.flatMap(getAuctionCategories)).sort((left, right) =>
    left.localeCompare(right)
  );

export const auctionMatchesCategory = (auction: AuctionRecord, category?: string) => {
  if (!category?.trim()) return true;

  const expected = normalizeCategoryKey(category);
  return getAuctionCategories(auction).some(
    (item) => normalizeCategoryKey(item) === expected
  );
};

export const getAuctionLotCount = (auction: AuctionRecord) => {
  const record = auction as Record<string, unknown>;
  const lotCount = toNumber(record.lot_count);

  if (lotCount !== null) return lotCount;
  if (Array.isArray(record.lots)) return record.lots.length;

  return 0;
};

export const getAuctionBidderCount = (auction: AuctionRecord) => {
  const record = auction as Record<string, unknown>;

  return (
    toNumber(record.totalBidder) ??
    toNumber(record.total_bidder) ??
    toNumber(record.bidders_total) ??
    0
  );
};

export const getVisibleAuctionCategories = (
  auction: AuctionRecord,
  limit = 2
) => {
  const categories = getAuctionCategories(auction);

  return {
    categories: categories.slice(0, limit),
    remainingCount: Math.max(0, categories.length - limit),
  };
};
