/**
 * Three-scope settings precedence resolver.
 *
 * Resolution order (narrowest wins):
 *   1. per_auction  — overrides for a specific auction
 *   2. workspace    — tenant-wide defaults for all auctions
 *   3. tenant       — company-level baseline
 *
 * The Miscellaneous section owns scopes 2 (workspace) and 3 (tenant).
 * Per-auction overrides live on the auction record itself.
 */

export type SettingScope = "per_auction" | "workspace" | "tenant";

export interface ResolvedValue<T> {
  value: T;
  scope: SettingScope;
  /** true when value differs from the system default */
  modified: boolean;
}

export interface SettingsContext {
  /** System defaults (hardcoded in defaults.ts) */
  defaults?: Record<string, unknown>;
  /** Tenant/company baseline (§ 2.1 scope 1) */
  tenant?: Record<string, unknown>;
  /** Workspace defaults — applies to all auctions unless overridden (§ 2.1 scope 2) */
  workspace?: Record<string, unknown>;
  /** Per-auction override (§ 2.1 scope 3) — most specific */
  perAuction?: Record<string, unknown>;
}

/**
 * Resolve a single setting key across all scopes.
 *
 * @example
 * const bp = resolveSettings("buyer_premium_formula_id", ctx, null);
 * // bp.scope tells you where the value came from
 * // bp.modified tells you whether to show the "modified" indicator
 */
export function resolveSettings<T>(
  key: string,
  context: SettingsContext,
  defaultValue: T,
): ResolvedValue<T> {
  if (context.perAuction?.[key] !== undefined) {
    return {
      value: context.perAuction[key] as T,
      scope: "per_auction",
      modified: true,
    };
  }

  if (context.workspace?.[key] !== undefined) {
    return {
      value: context.workspace[key] as T,
      scope: "workspace",
      modified: context.workspace[key] !== (context.defaults?.[key] ?? defaultValue),
    };
  }

  if (context.tenant?.[key] !== undefined) {
    return {
      value: context.tenant[key] as T,
      scope: "tenant",
      modified: context.tenant[key] !== (context.defaults?.[key] ?? defaultValue),
    };
  }

  return {
    value: defaultValue,
    scope: "tenant",
    modified: false,
  };
}

/**
 * Resolve a batch of settings in one call.
 *
 * @example
 * const resolved = resolveSettingsBatch(
 *   { buyer_premium_id: null, tax_formula_id: null },
 *   context
 * );
 */
export function resolveSettingsBatch<T extends Record<string, unknown>>(
  defaults: T,
  context: SettingsContext,
): { [K in keyof T]: ResolvedValue<T[K]> } {
  return Object.fromEntries(
    Object.entries(defaults).map(([key, defaultValue]) => [
      key,
      resolveSettings(key, context, defaultValue),
    ]),
  ) as { [K in keyof T]: ResolvedValue<T[K]> };
}

/**
 * Check whether a setting has been customised away from its system default.
 * Used to decide whether to show the "modified" dot indicator.
 */
export function isModified(resolved: ResolvedValue<unknown>): boolean {
  return resolved.modified;
}

/**
 * Badge label for the scope origin.
 */
export const SCOPE_LABELS: Record<SettingScope, string> = {
  per_auction: "Per-Auction",
  workspace: "Workspace",
  tenant: "Tenant",
};
