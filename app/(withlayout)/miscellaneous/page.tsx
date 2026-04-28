"use client";

import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  Command,
  CreditCard,
  Building2,
  MapPin,
  Megaphone,
  Search,
  Users,
} from "lucide-react";
import { useMiscSearch } from "@/components/miscellaneous/misc-search";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface Section {
  eyebrow: string;
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  scope: "Tenant" | "Workspace";
}

const SECTIONS: Section[] = [
  {
    eyebrow: "Chart of Accounts",
    label: "Accounts",
    description:
      "Define every payment method and charge category your auction house uses. Every receipt, payment, and surcharge references an account here.",
    href: "/miscellaneous/accounts",
    icon: CreditCard,
    scope: "Workspace",
  },
  {
    eyebrow: "Rate Library",
    label: "Formulas",
    description:
      "Build your rate library once — buyer's premiums, taxes, commissions, and sliding scales. Reference them from any auction without redefining rates.",
    href: "/miscellaneous/formulas",
    icon: Calculator,
    scope: "Workspace",
  },
  {
    eyebrow: "Team & Access",
    label: "Users",
    description:
      "Manage your team, their roles, and per-auction access. From full admin rights to read-only clerks and catalogers.",
    href: "/miscellaneous/users",
    icon: Users,
    scope: "Workspace",
  },
  {
    eyebrow: "Identity & Branding",
    label: "Company",
    description:
      "Your auction house identity — logo, legal name, SMTP email, invoice defaults, and third-party integration connections.",
    href: "/miscellaneous/company",
    icon: Building2,
    scope: "Tenant",
  },
  {
    eyebrow: "Venues & Addresses",
    label: "Locations",
    description:
      "Reusable addresses for auction sites, pickup points, warehouses, and galleries. Auctions reference these by ID instead of re-entering addresses.",
    href: "/miscellaneous/locations",
    icon: MapPin,
    scope: "Workspace",
  },
  {
    eyebrow: "What's New",
    label: "Announcements",
    description:
      "Platform updates, new features, and the product changelog. Know what changed before your next auction.",
    href: "/miscellaneous/announcements",
    icon: Megaphone,
    scope: "Tenant",
  },
];

const SCOPE_STYLES = {
  Tenant: "border-warning/40 bg-warning/8 text-warning",
  Workspace: "border-green-700/30 bg-green-700/8 text-green-700",
};

function SearchTrigger() {
  const { open } = useMiscSearch();
  return (
    <button
      onClick={open}
      className="inline-flex items-center gap-2.5 rounded-lg border border-border/60 bg-background/80 px-4 py-2 text-sm text-muted-foreground shadow-sm backdrop-blur-sm transition-all hover:border-border hover:bg-background hover:text-foreground"
    >
      <Search className="h-3.5 w-3.5" />
      <span>Search all settings…</span>
      <span className="ml-2 flex items-center gap-0.5 rounded border border-border/50 bg-muted/40 px-1.5 py-0.5 font-mono text-[10px]">
        <Command className="h-2.5 w-2.5" />K
      </span>
    </button>
  );
}

export default function MiscellaneousPage() {
  return (
    <div className="px-4 py-8 sm:px-6 sm:py-4 lg:px-8">
      {/* Hero */}
      <div className="mb-8">
        {/* <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Bidooze · Configuration
        </p> */}
        <h1 className="mt-1.5 text-2xl font-semibold text-foreground">
          Miscellaneous
        </h1>
        <p className="mt-1.5 max-w-lg text-sm text-muted-foreground">
          Configure accounts, rate formulas, team access, company identity,
          locations, and stay current with product announcements.
        </p>
        <div className="mt-5">
          <SearchTrigger />
        </div>
      </div>

      {/* Section grid */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group flex flex-col rounded-xl border border-border/50 bg-card/60 p-5 transition-all hover:border-border hover:bg-card hover:shadow-sm"
          >
            {/* Icon + scope row */}
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/40 bg-muted/50 transition-colors group-hover:border-primary/30 group-hover:bg-primary/8">
                <section.icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
              </div>
              <span
                className={cn(
                  "rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest",
                  SCOPE_STYLES[section.scope]
                )}
              >
                {section.scope}
              </span>
            </div>

            {/* Content */}
            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              {section.eyebrow}
            </p>
            <h2 className="mt-0.5 text-base font-semibold text-foreground">
              {section.label}
            </h2>
            <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
              {section.description}
            </p>

            {/* CTA */}
            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
              <span>Configure</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>

      {/* Scope legend */}
      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <span className="font-semibold uppercase tracking-widest">Scope:</span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-green-700/60" />
          Workspace — applies to all auctions by default
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-warning/60" />
          Tenant — company-level identity settings
        </span>
      </div>
    </div>
  );
}
