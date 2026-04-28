"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Calculator,
  Users,
  Building2,
  MapPin,
  Megaphone,
  CreditCard,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMiscSearch } from "./misc-search";

const NAV_ITEMS = [
  {
    num: "01",
    label: "Accounts",
    eyebrow: "Chart of Accounts",
    href: "/miscellaneous/accounts",
    icon: CreditCard,
  },
  {
    num: "02",
    label: "Formulas",
    eyebrow: "Rate Library",
    href: "/miscellaneous/formulas",
    icon: Calculator,
  },
  {
    num: "03",
    label: "Users",
    eyebrow: "Team & Access",
    href: "/miscellaneous/users",
    icon: Users,
  },
  {
    num: "04",
    label: "Company",
    eyebrow: "Identity & Branding",
    href: "/miscellaneous/company",
    icon: Building2,
  },
  {
    num: "05",
    label: "Locations",
    eyebrow: "Venues & Addresses",
    href: "/miscellaneous/locations",
    icon: MapPin,
  },
  {
    num: "06",
    label: "Announcements",
    eyebrow: "What's New",
    href: "/miscellaneous/announcements",
    icon: Megaphone,
  },
] as const;

export function MiscNav() {
  const pathname = usePathname();
  const { open: openSearch } = useMiscSearch();

  return (
    <div className="flex h-full flex-col">
      {/* Section title / back link */}
      <div className="px-4 pb-3 pt-4">
        <Link
          href="/miscellaneous"
          className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          Miscellaneous
        </Link>
      </div>

      {/* Search trigger */}
      <div className="px-3 pb-3">
        <button
          onClick={openSearch}
          className="flex w-full items-center gap-2 rounded-md border border-border/50 bg-background/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-border hover:bg-background"
        >
          <Search className="h-3 w-3 shrink-0" />
          <span className="flex-1 text-left">Search settings</span>
          <kbd className="hidden rounded border border-border/50 bg-muted/40 px-1 py-0.5 font-mono text-[10px] sm:inline-block">
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="mx-3 border-t border-border/40" />

      {/* Nav items */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "w-6 shrink-0 font-serif text-[11px] font-light tabular-nums",
                  isActive ? "text-green-700" : "text-muted-foreground/50"
                )}
              >
                {item.num}
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export { NAV_ITEMS };
