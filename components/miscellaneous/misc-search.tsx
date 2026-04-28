"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calculator, CreditCard, Building2, MapPin, Megaphone, Users } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const SEARCH_ITEMS = [
  {
    label: "Accounts",
    href: "/miscellaneous/accounts",
    description: "Chart of accounts, payment methods, surcharges",
    keywords: "chart accounts payment cash visa mastercard stripe surcharge receipt",
    icon: CreditCard,
  },
  {
    label: "Formulas",
    href: "/miscellaneous/formulas",
    description: "Buyer's premium, taxes, commissions, sliding scale",
    keywords: "buyer premium tax commission sliding scale rate formula vat",
    icon: Calculator,
  },
  {
    label: "Users",
    href: "/miscellaneous/users",
    description: "Team members, roles, permissions, auction access",
    keywords: "users team roles permissions access owner admin clerk cataloger accountant invite",
    icon: Users,
  },
  {
    label: "Company",
    href: "/miscellaneous/company",
    description: "Identity, branding, SMTP, invoice defaults, integrations",
    keywords: "company logo branding smtp email invoice identity legal tax id stripe quickbooks",
    icon: Building2,
  },
  {
    label: "Locations",
    href: "/miscellaneous/locations",
    description: "Auction sites, pickup points, warehouses, galleries",
    keywords: "locations address venue warehouse pickup shipping gallery site",
    icon: MapPin,
  },
  {
    label: "Announcements",
    href: "/miscellaneous/announcements",
    description: "Product updates and platform changelog",
    keywords: "announcements changelog updates new features release notes",
    icon: Megaphone,
  },
] as const;

// ─── Context so MiscNav can open the dialog ───────────────────────────────────

interface MiscSearchContextValue {
  open: () => void;
}

const MiscSearchContext = createContext<MiscSearchContextValue>({ open: () => {} });

export function useMiscSearch() {
  return useContext(MiscSearchContext);
}

// ─── Provider + dialog ────────────────────────────────────────────────────────

export function MiscSearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const open = useCallback(() => setIsOpen(true), []);

  return (
    <MiscSearchContext.Provider value={{ open }}>
      {children}
      <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
        <CommandInput placeholder="Search Miscellaneous settings…" />
        <CommandList>
          <CommandEmpty>No settings found.</CommandEmpty>
          <CommandGroup heading="Sections">
            {SEARCH_ITEMS.map((item) => (
              <CommandItem
                key={item.href}
                value={`${item.label} ${item.description} ${item.keywords}`}
                onSelect={() => {
                  router.push(item.href);
                  setIsOpen(false);
                }}
                className="gap-3"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted/60">
                  <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </MiscSearchContext.Provider>
  );
}
