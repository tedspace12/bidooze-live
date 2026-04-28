"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  Calculator,
  Users,
  Building2,
  MapPin,
  Megaphone,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface Tab {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
}

const TABS: Tab[] = [
  { label: "Overview", href: "/miscellaneous", icon: LayoutGrid, exact: true },
  { label: "Accounts", href: "/miscellaneous/accounts", icon: CreditCard },
  { label: "Formulas", href: "/miscellaneous/formulas", icon: Calculator },
  { label: "Users", href: "/miscellaneous/users", icon: Users },
  { label: "Company", href: "/miscellaneous/company", icon: Building2 },
  { label: "Locations", href: "/miscellaneous/locations", icon: MapPin },
  { label: "Announcements", href: "/miscellaneous/announcements", icon: Megaphone },
];

export function MiscTabNav() {
  const pathname = usePathname();

  return (
    <nav
      className="border-b border-border/40 bg-background px-3 py-2.5 sm:px-4 md:px-6"
      aria-label="Miscellaneous sections"
    >
      <div className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((tab) => {
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
