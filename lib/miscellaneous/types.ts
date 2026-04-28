import { z } from "zod";

// ─── Shared enums ─────────────────────────────────────────────────────────────

export type SettingScope = "per_auction" | "workspace" | "tenant";

export type AccountRounding = "none" | "nickel" | "dime" | "dollar";
export type SurchargeTarget = "buyer" | "seller";

export type FormulaType =
  | "buyer_premium"
  | "buyer_tax"
  | "seller_tax"
  | "buyer_lot_charge"
  | "commission_flat"
  | "commission_sliding"
  | "salesperson_comm"
  | "vat";

export type CommissionQualifier =
  | "each"
  | "invoice_line"
  | "consignment_order"
  | "each_over_reserve"
  | "invoice_line_over_reserve";

export type UserRole =
  | "owner"
  | "admin"
  | "clerk"
  | "cataloger"
  | "accountant"
  | "custom";

export type AuthMethod = "password" | "sso";
export type UserStatus = "active" | "invited" | "inactive";
export type LocationCapability = "auction_site" | "pickup" | "ship_from" | "storage";
export type InvoiceStatus = "unpaid" | "invoiced" | "paid" | "locked";

// ─── Account ──────────────────────────────────────────────────────────────────

export const AccountSchema = z.object({
  id: z.number().int().positive(),
  tenant_id: z.string().uuid(),
  parent_account_id: z.number().int().positive().nullable(),
  number: z.number().int().min(1000).max(9999),
  description: z.string().min(1).max(80),
  accepts_receipts: z.boolean().default(true),
  accepts_payments: z.boolean().default(false),
  surcharge_pct: z.number().min(-100).max(100).default(0),
  surcharge_flat: z.number().min(-999999).max(999999).default(0),
  surcharge_target: z.enum(["buyer", "seller"]).default("buyer"),
  rounding: z.enum(["none", "nickel", "dime", "dollar"]).default("none"),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Account = z.infer<typeof AccountSchema>;

export const CreateAccountSchema = AccountSchema.omit({
  id: true,
  tenant_id: true,
  created_at: true,
  updated_at: true,
});

export type CreateAccountPayload = z.infer<typeof CreateAccountSchema>;

// ─── Formulas ─────────────────────────────────────────────────────────────────

const FormulaBaseSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string().min(1).max(60),
  is_default: z.boolean().default(false),
  notes: z.string().optional(),
  auction_reference_count: z.number().int().min(0).default(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const BuyerPremiumFormulaSchema = FormulaBaseSchema.extend({
  type: z.literal("buyer_premium"),
  rate_pct: z.number().min(0).max(100),
  qualifier: z.enum([
    "each",
    "invoice_line",
    "consignment_order",
    "each_over_reserve",
    "invoice_line_over_reserve",
  ]),
});

export const BuyerTaxFormulaSchema = FormulaBaseSchema.extend({
  type: z.literal("buyer_tax"),
  rate_pct: z.number().min(0).max(100),
  qualifier: z.enum([
    "each",
    "invoice_line",
    "consignment_order",
    "each_over_reserve",
    "invoice_line_over_reserve",
  ]),
});

export const SellerTaxFormulaSchema = FormulaBaseSchema.extend({
  type: z.literal("seller_tax"),
  rate_pct: z.number().min(0).max(100),
  qualifier: z.enum([
    "each",
    "invoice_line",
    "consignment_order",
    "each_over_reserve",
    "invoice_line_over_reserve",
  ]),
});

export const CommissionFlatFormulaSchema = FormulaBaseSchema.extend({
  type: z.literal("commission_flat"),
  rate_pct: z.number().min(0).max(100),
  qualifier: z.enum([
    "each",
    "invoice_line",
    "consignment_order",
    "each_over_reserve",
    "invoice_line_over_reserve",
  ]),
});

export const SlidingTierSchema = z.object({
  upper_bound: z.number().positive(),
  rate_pct: z.number().min(0).max(100),
});

export const CommissionSlidingFormulaSchema = FormulaBaseSchema.extend({
  type: z.literal("commission_sliding"),
  tiers: z
    .array(SlidingTierSchema)
    .min(1)
    .refine(
      (tiers) => tiers.every((t, i) => i === 0 || t.upper_bound > tiers[i - 1].upper_bound),
      { message: "Tiers must be sorted ascending with no overlapping bounds" }
    ),
});

export const BuyerLotChargeFormulaSchema = FormulaBaseSchema.extend({
  type: z.literal("buyer_lot_charge"),
  flat_amount: z.number().min(0).nullable(),
  rate_pct: z.number().min(0).max(100).nullable(),
  applies_to: z.enum(["per_lot", "per_invoice"]),
}).refine(
  (d) => (d.flat_amount !== null) !== (d.rate_pct !== null),
  { message: "Specify either flat_amount or rate_pct, not both" }
);

export const SalespersonCommFormulaSchema = FormulaBaseSchema.extend({
  type: z.literal("salesperson_comm"),
  rate_pct: z.number().min(0).max(100),
  qualifier: z.enum([
    "each",
    "invoice_line",
    "consignment_order",
    "each_over_reserve",
    "invoice_line_over_reserve",
  ]),
});

export const VatFormulaSchema = FormulaBaseSchema.extend({
  type: z.literal("vat"),
  rate_pct: z.number().min(0).max(100),
  included_in_hammer: z.boolean().default(false),
});

export const FormulaSchema = z.discriminatedUnion("type", [
  BuyerPremiumFormulaSchema,
  BuyerTaxFormulaSchema,
  SellerTaxFormulaSchema,
  CommissionFlatFormulaSchema,
  CommissionSlidingFormulaSchema,
  BuyerLotChargeFormulaSchema,
  SalespersonCommFormulaSchema,
  VatFormulaSchema,
]);

export type Formula = z.infer<typeof FormulaSchema>;
export type SlidingTier = z.infer<typeof SlidingTierSchema>;
export const MAX_LOT_AMOUNT = 9_999_999.99;

// ─── User ─────────────────────────────────────────────────────────────────────

export const PermissionSchema = z.object({
  edit_miscellaneous: z.boolean(),
  create_edit_auctions: z.boolean(),
  run_live_auction: z.boolean(),
  process_payments: z.boolean(),
  view_reports: z.boolean(),
  export_financials: z.boolean(),
  manage_users: z.boolean(),
  transfer_ownership: z.boolean(),
  manage_billing: z.boolean(),
});

export type Permission = z.infer<typeof PermissionSchema>;

export const UserSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  email: z.string().email(),
  display_name: z.string().min(1).max(100),
  role: z.enum(["owner", "admin", "clerk", "cataloger", "accountant", "custom"]),
  custom_permissions: PermissionSchema.optional(),
  auth_method: z.enum(["password", "sso"]),
  auction_access: z.union([z.literal("all"), z.array(z.string())]),
  is_active: z.boolean().default(true),
  status: z.enum(["active", "invited", "inactive"]).default("active"),
  last_login_at: z.string().datetime().nullable(),
  invited_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;

export const InviteUserSchema = z.object({
  email: z.string().email(),
  display_name: z.string().min(1).max(100),
  role: z.enum(["admin", "clerk", "cataloger", "accountant", "custom"]),
  auction_access: z.union([z.literal("all"), z.array(z.string())]).default("all"),
});

export type InviteUserPayload = z.infer<typeof InviteUserSchema>;

// ─── Company ──────────────────────────────────────────────────────────────────

export const SmtpConfigSchema = z.object({
  host: z.string().min(1),
  port: z.number().int().min(1).max(65535),
  encryption: z.enum(["tls", "ssl", "none"]),
  username: z.string().min(1),
  password: z.string().min(1),
  from_address: z.string().email(),
  from_name: z.string().min(1).max(100),
});

export type SmtpConfig = z.infer<typeof SmtpConfigSchema>;

export const CompanySchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string().min(1).max(120),
  legal_name: z.string().max(200).optional(),
  tax_id: z.string().max(50).optional(),
  phone: z.string().max(30).optional(),
  primary_email: z.string().email().optional(),
  website: z.string().url().optional(),
  address_line1: z.string().max(200).optional(),
  address_line2: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postal: z.string().max(20).optional(),
  country: z.string().max(2).optional(),
  timezone: z.string().min(1).default("America/New_York"),
  logo_url: z.string().url().nullable().optional(),
  logo_mono_url: z.string().url().nullable().optional(),
  accent_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional(),
  smtp: SmtpConfigSchema.nullable().optional(),
  invoice_header: z.string().optional(),
  invoice_footer: z.string().optional(),
  invoice_payment_instructions: z.string().optional(),
  invoice_thank_you: z.string().optional(),
  default_permission_cap: z.number().positive().default(9_999_999.99),
  default_registration_mode: z
    .enum(["no_cc", "verification", "authentication", "contact_only"])
    .default("verification"),
  card_tester_threshold: z.number().int().min(1).default(10),
  lockout_window_hours: z.number().int().min(1).default(24),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Company = z.infer<typeof CompanySchema>;

// ─── Location ─────────────────────────────────────────────────────────────────

export const LocationSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string().min(1).max(60),
  address_line1: z.string().min(1).max(200),
  address_line2: z.string().max(200).optional(),
  city: z.string().min(1).max(100),
  state: z.string().max(100).optional(),
  postal: z.string().max(20).optional(),
  country: z.string().length(2),
  phone: z.string().max(30).optional(),
  email: z.string().email().optional(),
  coordinates: z.object({ lat: z.number(), lng: z.number() }).nullable().optional(),
  capabilities: z.array(
    z.enum(["auction_site", "pickup", "ship_from", "storage"])
  ),
  notes: z.string().optional(),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Location = z.infer<typeof LocationSchema>;

export const CreateLocationSchema = LocationSchema.omit({
  id: true,
  tenant_id: true,
  coordinates: true,
  created_at: true,
  updated_at: true,
});

export type CreateLocationPayload = z.infer<typeof CreateLocationSchema>;

// ─── Announcement ─────────────────────────────────────────────────────────────

export const AnnouncementSchema = z.object({
  id: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  version: z.string(),
  title: z.string().min(1),
  body_md: z.string(),
  tags: z.array(z.string()),
});

export type Announcement = z.infer<typeof AnnouncementSchema>;
