import {
  Activity,
  AlertTriangle,
  BarChart3,
  Clock,
  CreditCard,
  DollarSign,
  Gavel,
  Layers,
  Map,
  Package,
  Percent,
  Shield,
  TrendingUp,
  Trophy,
  Users,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type {
  CategoryMeta,
  ExportRow,
  Insight,
  KpiCard,
  ReportCategory,
  ReportPack,
  ReportTemplate,
  SavedPreset,
} from "./report-types";

export const CATEGORY_META: Record<ReportCategory, CategoryMeta> = {
  financial: {
    label: "Financial",
    icon: DollarSign as LucideIcon,
    color: "text-primary",
  },
  auctionsLots: {
    label: "Auctions & Lots",
    icon: Gavel as LucideIcon,
    color: "text-foreground",
  },
  consignors: {
    label: "Consignors",
    icon: Users as LucideIcon,
    color: "text-muted-foreground",
  },
  buyersBidders: {
    label: "Buyers & Bidders",
    icon: Trophy as LucideIcon,
    color: "text-[hsl(var(--chart-4))]",
  },
  riskCompliance: {
    label: "Risk & Compliance",
    icon: Shield as LucideIcon,
    color: "text-destructive",
  },
};

export const REPORTS: ReportTemplate[] = [
  {
    id: "rev-summary",
    name: "My Revenue Summary",
    description:
      "Hammer totals, buyer premiums, platform fees charged and refunds issued across your auctions for the selected period.",
    category: "financial",
    icon: DollarSign,
    featured: true,
    priority: "high",
    exports: ["csv", "excel", "pdf"],
  },
  {
    id: "fees-breakdown",
    name: "Fees & Premiums Breakdown",
    description:
      "Itemised breakdown of every buyer premium and platform fee charged across your lots.",
    category: "financial",
    icon: Percent,
    priority: "high",
    exports: ["csv", "excel", "pdf"],
  },
  {
    id: "payouts-summary",
    name: "My Payouts & Settlement",
    description:
      "Your payout history, pending settlement amounts and upcoming disbursement schedule.",
    category: "financial",
    icon: CreditCard,
    priority: "high",
    exports: ["csv", "excel", "pdf"],
  },
  {
    id: "payment-methods",
    name: "Buyer Payment Methods",
    description:
      "Payment method breakdown (card, bank transfer, escrow) for buyers in your auctions only - not platform-wide.",
    category: "financial",
    icon: CreditCard,
    priority: "medium",
    exports: ["csv", "excel"],
  },
  {
    id: "outstanding-payments",
    name: "Outstanding Payments",
    description:
      "Won lots that remain unpaid. Essential for daily settlement operations - check this after every auction closes.",
    category: "financial",
    icon: AlertTriangle,
    featured: true,
    priority: "high",
    exports: ["csv", "excel"],
  },
  {
    id: "settlement-aging",
    name: "Settlement Aging",
    description:
      "Outstanding payments bucketed by age: 0-7 days, 8-14 days, 15-30 days. Identifies overdue accounts.",
    category: "financial",
    icon: Clock,
    priority: "high",
    exports: ["csv", "excel", "pdf"],
  },
  {
    id: "refund-chargebacks",
    name: "Refund & Chargeback Summary",
    description:
      "All refunds issued and chargebacks raised against your auctions. Pulled out of Disputes for clearer financial visibility.",
    category: "financial",
    icon: AlertTriangle,
    priority: "medium",
    exports: ["csv", "excel", "pdf"],
  },
  {
    id: "auction-performance",
    name: "Auction Performance Overview",
    description:
      "Headline metrics per auction: lots offered, lots sold, sell-through rate, total hammer, buyer premium collected.",
    category: "auctionsLots",
    icon: BarChart3,
    featured: true,
    priority: "high",
    exports: ["csv", "excel", "pdf"],
  },
  {
    id: "bid-activity",
    name: "Bid Activity Report",
    description:
      "Bid count, unique bidder count, average bids per lot and bid timeline across your auctions.",
    category: "auctionsLots",
    icon: Activity,
    priority: "high",
    exports: ["csv", "excel"],
  },
  {
    id: "closing-prices",
    name: "Closing Price Analysis",
    description:
      "Lot-level closing prices with reserve vs hammer delta column. Add to any post-auction review.",
    category: "auctionsLots",
    icon: DollarSign,
    priority: "medium",
    exports: ["csv", "excel", "pdf"],
  },
  {
    id: "unsold-lots",
    name: "Unsold Lots Report",
    description:
      "All lots that did not sell: reserve not met, no bids, or withdrawn. The most-checked report after every auction.",
    category: "auctionsLots",
    icon: AlertTriangle,
    featured: true,
    priority: "high",
    exports: ["csv", "excel"],
  },
  {
    id: "failed-auctions",
    name: "Cancelled / Failed Auctions",
    description:
      "Auctions cancelled before or during sale. Separated from unsold lots as a distinct operational event.",
    category: "auctionsLots",
    icon: X,
    priority: "low",
    exports: ["csv", "pdf"],
  },
  {
    id: "lots-performance",
    name: "Lots Performance Report",
    description:
      "Per-lot detail: page views, watchers, bid count, reserve met Y/N, sold/unsold, final price. The core lot-level insight missing from most setups.",
    category: "auctionsLots",
    icon: Layers,
    featured: true,
    priority: "high",
    exports: ["csv", "excel"],
  },
  {
    id: "sell-through-breakdown",
    name: "Sell-Through by Category / Consignor",
    description:
      "Sell-through rate broken down by lot category and consignor. Identifies underperforming segments.",
    category: "auctionsLots",
    icon: BarChart3,
    priority: "high",
    exports: ["csv", "excel"],
  },
  {
    id: "reserve-hammer",
    name: "Reserve vs Hammer Analysis",
    description:
      "How far above or below reserve each lot sold. Pricing intelligence for future estimate-setting.",
    category: "auctionsLots",
    icon: TrendingUp,
    priority: "medium",
    exports: ["csv", "excel"],
  },
  {
    id: "estimate-accuracy",
    name: "Price Estimate Accuracy",
    description:
      "Pre-sale low/high estimate vs actual hammer price per lot. Improves consignor trust and catalogue credibility.",
    category: "auctionsLots",
    icon: BarChart3,
    priority: "medium",
    exports: ["csv", "excel"],
  },
  {
    id: "pending-fulfillment",
    name: "Items Pending Fulfillment / Pickup",
    description:
      "Sold lots not yet collected or shipped. Operational gap - surfaces items stuck in the post-sale process.",
    category: "auctionsLots",
    icon: Package,
    priority: "medium",
    exports: ["csv", "excel"],
  },
  {
    id: "seller-activity",
    name: "Consignor Activity Report",
    description:
      "Per-consignor breakdown of lots submitted, lots sold, sell-through rate and total hammer achieved.",
    category: "consignors",
    icon: Users,
    priority: "high",
    exports: ["csv", "excel", "pdf"],
  },
  {
    id: "seller-lifecycle",
    name: "Consignor Lifecycle Report",
    description:
      "Consignor tenure, auction participation history and activity trend. Identifies at-risk or lapsing consignors.",
    category: "consignors",
    icon: Activity,
    priority: "medium",
    exports: ["csv", "excel"],
  },
  {
    id: "top-sellers",
    name: "Top Consignors Report",
    description:
      "Ranked consignors by hammer total, lots sold and sell-through rate. Add as a column to every consignor review.",
    category: "consignors",
    icon: Trophy,
    priority: "medium",
    exports: ["csv", "excel", "pdf"],
  },
  {
    id: "consignor-onboarding",
    name: "Consignor Onboarding Funnel",
    description:
      "Where consignors drop off during verification and onboarding. Helps identify friction in the intake process.",
    category: "consignors",
    icon: Layers,
    priority: "low",
    exports: ["csv", "excel"],
  },
  {
    id: "buyer-activity",
    name: "Buyer Activity Report",
    description:
      "Bidder count, bid count, win rate and spend per buyer across your auctions in the selected period.",
    category: "buyersBidders",
    icon: Users,
    featured: true,
    priority: "high",
    exports: ["csv", "excel"],
  },
  {
    id: "top-bidders",
    name: "Top Bidders by Spend",
    description:
      "Ranked buyers by total spend and lots won. VIP identification - know your highest-value buyers.",
    category: "buyersBidders",
    icon: Trophy,
    priority: "high",
    exports: ["csv", "excel"],
  },
  {
    id: "bidder-participation",
    name: "Bidder Participation (New vs Returning)",
    description:
      "New vs returning bidder split over time. Core retention health metric - track monthly.",
    category: "buyersBidders",
    icon: TrendingUp,
    priority: "high",
    exports: ["csv", "excel"],
  },
  {
    id: "bidder-geography",
    name: "Bidder Geography",
    description:
      "Country and region breakdown of registered bidders. Useful for shipping policy and marketing targeting.",
    category: "buyersBidders",
    icon: Map,
    priority: "medium",
    exports: ["csv", "excel"],
  },
  {
    id: "bid-velocity",
    name: "Bid Velocity / Last-Minute Bidding",
    description:
      "Bids placed in the final X minutes per lot. Informs auction extension rules and timing strategy.",
    category: "buyersBidders",
    icon: Zap,
    priority: "low",
    exports: ["csv", "excel"],
  },
  {
    id: "disputes-refunds",
    name: "Disputes & Refunds Report",
    description:
      "All disputes raised and refunds processed across your auctions. Scoped to your buyers only.",
    category: "riskCompliance",
    icon: Shield,
    priority: "high",
    exports: ["csv", "excel", "pdf"],
  },
  {
    id: "suspended-accounts",
    name: "Suspended & Flagged Accounts",
    description:
      "Bidders flagged or suspended within your auction pool. Does not include platform-wide suspensions unrelated to your auctions.",
    category: "riskCompliance",
    icon: Shield,
    priority: "medium",
    exports: ["csv", "pdf"],
  },
  {
    id: "failed-transactions",
    name: "Payments Failed / Chargebacks",
    description:
      "Failed payment attempts and chargebacks raised by buyers in your auctions. Moved from Buyers into Risk for correct classification.",
    category: "riskCompliance",
    icon: AlertTriangle,
    priority: "high",
    exports: ["csv", "excel"],
  },
  {
    id: "flagged-bidders",
    name: "Flagged Bidders (Risk Score)",
    description:
      "Bidders with elevated risk scores or a history of non-payment in your auctions. Review before sale opens.",
    category: "riskCompliance",
    icon: AlertTriangle,
    priority: "medium",
    exports: ["csv", "excel"],
  },
];

export const REPORT_PACKS: ReportPack[] = [
  {
    id: "weekly-settlement",
    name: "Weekly Settlement Pack",
    description: "Everything needed to close out a sale.",
    useCase: "Run after every auction closes",
    reportIds: [
      "rev-summary",
      "outstanding-payments",
      "payouts-summary",
      "disputes-refunds",
      "settlement-aging",
    ],
    icon: CreditCard,
  },
  {
    id: "auction-performance-pack",
    name: "Auction Performance Pack",
    description: "Full post-auction review.",
    useCase: "Run after every auction",
    reportIds: [
      "auction-performance",
      "lots-performance",
      "unsold-lots",
      "bid-activity",
      "reserve-hammer",
    ],
    icon: BarChart3,
  },
  {
    id: "consignor-pack",
    name: "Consignor Pack",
    description: "Shareable performance summary for consignors.",
    useCase: "Share with consignors post-sale",
    reportIds: [
      "seller-activity",
      "top-sellers",
      "sell-through-breakdown",
      "estimate-accuracy",
    ],
    icon: Users,
  },
  {
    id: "bidder-insights-pack",
    name: "Bidder Insights Pack",
    description: "Understand your buyer base. Run monthly.",
    useCase: "Monthly buyer review",
    reportIds: [
      "top-bidders",
      "bidder-participation",
      "bidder-geography",
      "buyer-activity",
    ],
    icon: Trophy,
  },
  {
    id: "monthly-performance-pack",
    name: "Monthly Performance Pack",
    description: "End-of-month full review. Management-ready.",
    useCase: "End of month",
    reportIds: [
      "rev-summary",
      "fees-breakdown",
      "auction-performance",
      "sell-through-breakdown",
      "top-sellers",
    ],
    icon: Activity,
  },
  {
    id: "risk-review-pack",
    name: "Risk Review Pack",
    description: "Compliance and risk snapshot before settlement.",
    useCase: "Before settlement day",
    reportIds: [
      "disputes-refunds",
      "failed-transactions",
      "flagged-bidders",
      "suspended-accounts",
    ],
    icon: Shield,
  },
];

export const KPI_CARDS: KpiCard[] = [
  {
    title: "Revenue",
    value: "$84.2k",
    sub: "Across selected period",
    tooltip: "Total revenue across the current report scope.",
    trend: null,
    delta: null,
    icon: DollarSign,
    accent: true,
  },
  {
    title: "Lots Sold / Total",
    value: "312 / 410",
    sub: "Across selected period",
    trend: null,
    delta: null,
    icon: Gavel,
    accent: false,
  },
  {
    title: "Sell-Through Rate",
    value: "76%",
    sub: "Lots sold vs offered",
    trend: null,
    delta: null,
    icon: Percent,
    accent: false,
  },
  {
    title: "Unique Bidders",
    value: "1,204",
    sub: "Across selected scope",
    trend: null,
    delta: null,
    icon: Users,
    accent: false,
  },
  {
    title: "Total Bids",
    value: "920",
    sub: "Submitted in period",
    trend: null,
    delta: null,
    icon: Activity,
    accent: false,
  },
  {
    title: "Auctions / Live",
    value: "5 / 1",
    sub: "Total vs currently live",
    trend: null,
    delta: null,
    icon: Layers,
    accent: false,
  },
];

export const INSIGHTS: Insight[] = [
  {
    id: "ins-1",
    message: "Sell-through down 12% vs previous period",
    severity: "warning",
    reportId: "unsold-lots",
    delta: "-12%",
    trend: "down",
  },
  {
    id: "ins-2",
    message: "12 winners still unpaid - settlement at risk",
    severity: "error",
    reportId: "outstanding-payments",
  },
  {
    id: "ins-3",
    message: "3 auctions above 60% unsold rate",
    severity: "warning",
    reportId: "auction-performance",
  },
  {
    id: "ins-4",
    message: "Returning bidder rate dropped to 38% (was 52%)",
    severity: "warning",
    reportId: "bidder-participation",
    delta: "-14%",
    trend: "down",
  },
];

export const SEED_PRESETS: SavedPreset[] = [
  {
    id: "pre-1",
    name: "Month-End Settlement",
    reportId: "payouts-summary",
    dateRange: "Last 30 days",
    auctionScope: "All auctions",
    lastRun: "2026-03-01",
  },
  {
    id: "pre-2",
    name: "High-Value Lots Review",
    reportId: "lots-performance",
    dateRange: "Last 14 days",
    auctionScope: "Spring Premium Sale",
    lastRun: "2026-02-28",
  },
  {
    id: "pre-3",
    name: "Bidder Retention Check",
    reportId: "bidder-participation",
    dateRange: "Last 90 days",
    auctionScope: "All auctions",
    lastRun: "2026-02-15",
  },
];

export const SEED_EXPORTS: ExportRow[] = [
  {
    id: "exp-1",
    reportName: "My Revenue Summary",
    format: "excel",
    status: "done",
    generatedAt: "2026-03-04 14:12",
    generatedBy: "James Whitfield",
    filters: "All auctions - Last 30 days",
  },
  {
    id: "exp-2",
    reportName: "Auction Performance Pack",
    format: "pdf",
    status: "processing",
    generatedAt: "2026-03-04 11:40",
    generatedBy: "James Whitfield",
    filters: "Spring Premium Sale - Last 14 days",
  },
  {
    id: "exp-3",
    reportName: "Outstanding Payments",
    format: "csv",
    status: "queued",
    generatedAt: "2026-03-03 18:05",
    generatedBy: "James Whitfield",
    filters: "All auctions - Last 7 days",
  },
];

export const MOCK_AUCTIONS = [
  { id: "all", label: "All Auctions" },
  { id: "spring-premium", label: "Spring Premium Sale" },
  { id: "modern-arts", label: "Modern Arts Evening" },
  { id: "victorian-estate", label: "Victorian Estate Collection" },
];
