"use client";

import { useEffect, useState } from "react";
import { Check, CheckCircle2, ChevronLeft, ChevronsUpDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { registrationService } from "@/features/auth/services/registrationService";
import type { PaystackBank } from "@/features/auth/types";

type PaystackCountryConfig = {
  code: string;
  label: string;
  apiCountry: string;
  currency: string;
};

export const PAYSTACK_COUNTRIES: PaystackCountryConfig[] = [
  { code: "NG", label: "Nigeria", apiCountry: "nigeria", currency: "NGN" },
  { code: "GH", label: "Ghana", apiCountry: "ghana", currency: "GHS" },
  { code: "ZA", label: "South Africa", apiCountry: "south africa", currency: "ZAR" },
  { code: "KE", label: "Kenya", apiCountry: "kenya", currency: "KES" },
  { code: "CI", label: "Côte d'Ivoire", apiCountry: "ivory coast", currency: "XOF" },
  { code: "EG", label: "Egypt", apiCountry: "egypt", currency: "EGP" },
  { code: "RW", label: "Rwanda", apiCountry: "rwanda", currency: "RWF" },
];

export type PaystackAccountValues = {
  country: string;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  businessName: string;
  resolvedAccountName: string;
};

export interface PaystackConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: PaystackAccountValues;
  onSave: (values: PaystackAccountValues) => void;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object") {
    const directMessage = (error as { message?: unknown }).message;
    if (typeof directMessage === "string" && directMessage.trim()) return directMessage;
  }
  return fallback;
};

// Step-by-step: country → bank → account number (auto-resolved) + business name.
export function PaystackConnectDialog({ open, onOpenChange, initialValues, onSave }: PaystackConnectDialogProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [country, setCountry] = useState(initialValues.country);
  const [bankCode, setBankCode] = useState(initialValues.bankCode);
  const [bankName, setBankName] = useState(initialValues.bankName);
  const [accountNumber, setAccountNumber] = useState(initialValues.accountNumber);
  const [businessName, setBusinessName] = useState(initialValues.businessName);
  const [resolvedName, setResolvedName] = useState(initialValues.resolvedAccountName);

  const [banks, setBanks] = useState<PaystackBank[]>([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [banksError, setBanksError] = useState<string | null>(null);
  const [bankPopoverOpen, setBankPopoverOpen] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);

  // Reset the draft to the saved values (or a fresh start) each time the dialog opens.
  useEffect(() => {
    if (!open) return;
    setStep(initialValues.bankCode ? 3 : initialValues.country ? 2 : 1);
    setCountry(initialValues.country);
    setBankCode(initialValues.bankCode);
    setBankName(initialValues.bankName);
    setAccountNumber(initialValues.accountNumber);
    setBusinessName(initialValues.businessName);
    setResolvedName(initialValues.resolvedAccountName);
    setResolveError(null);
    setBanksError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open || step < 2) return;

    const config = PAYSTACK_COUNTRIES.find((c) => c.code === country) || PAYSTACK_COUNTRIES[0];
    let isMounted = true;
    setBanksLoading(true);
    setBanksError(null);

    registrationService
      .getPaystackBanks(config.apiCountry, config.currency)
      .then((items) => {
        if (isMounted) setBanks(items);
      })
      .catch((error) => {
        if (isMounted) setBanksError(getErrorMessage(error, "Could not load banks."));
      })
      .finally(() => {
        if (isMounted) setBanksLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [open, step, country]);

  // Auto-resolve the account name shortly after the user stops typing.
  useEffect(() => {
    if (!open || step !== 3 || !bankCode || accountNumber.trim().length < 6) return;

    setResolvedName("");
    setResolveError(null);
    const timer = setTimeout(() => {
      setIsResolving(true);
      registrationService
        .resolvePaystackAccount({ bank_code: bankCode, account_number: accountNumber.trim() })
        .then((result) => setResolvedName(result.data.account_name))
        .catch((error) => setResolveError(getErrorMessage(error, "Could not resolve this account.")))
        .finally(() => setIsResolving(false));
    }, 600);

    return () => clearTimeout(timer);
  }, [accountNumber, bankCode, step, open]);

  const selectedCountry = PAYSTACK_COUNTRIES.find((c) => c.code === country);
  const selectedBank = banks.find((b) => b.code === bankCode) || (bankName ? { name: bankName } : undefined);

  const handleSelectCountry = (code: string) => {
    setCountry(code);
    setBankCode("");
    setBankName("");
    setResolvedName("");
    setStep(2);
  };

  const handleSelectBank = (code: string) => {
    const bank = banks.find((b) => b.code === code);
    setBankCode(code);
    setBankName(bank?.name || "");
    setResolvedName("");
    setBankPopoverOpen(false);
    setStep(3);
  };

  const handleAccountNumberChange = (value: string) => {
    setAccountNumber(value);
    setResolvedName("");
    setResolveError(null);
  };

  const canSave =
    !!bankCode && !!accountNumber.trim() && !!businessName.trim() && !!resolvedName.trim() && !isResolving;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      country,
      bankCode,
      bankName,
      accountNumber: accountNumber.trim(),
      businessName: businessName.trim(),
      resolvedAccountName: resolvedName.trim(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add payout details</DialogTitle>
          <DialogDescription>Step {step} of 3 — where should Paystack send your payouts?</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={cn("h-1.5 flex-1 rounded-full transition-colors", n <= step ? "bg-[#3F6B2D]" : "bg-muted")}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Which country is your bank account in?</p>
            <div className="grid grid-cols-2 gap-2">
              {PAYSTACK_COUNTRIES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleSelectCountry(c.code)}
                  className={cn(
                    "rounded-lg border p-3 text-left text-sm transition-colors hover:border-[#3F6B2D]",
                    c.code === country ? "border-[#3F6B2D] bg-[#3F6B2D]/5 font-medium" : "border-border"
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> {selectedCountry?.label}
            </button>
            <p className="text-sm text-muted-foreground">Select your bank</p>
            <Popover open={bankPopoverOpen} onOpenChange={setBankPopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  disabled={banksLoading}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors",
                    "hover:border-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring",
                    banksLoading && "cursor-not-allowed opacity-60"
                  )}
                >
                  <span className={cn(!selectedBank && "text-muted-foreground")}>
                    {banksLoading ? "Loading banks..." : selectedBank?.name || "Select bank"}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                side="bottom"
                align="start"
                avoidCollisions={false}
                className="w-[380px] max-w-[90vw] p-0"
              >
                <Command>
                  <CommandInput placeholder="Search banks..." />
                  <CommandList className="max-h-64">
                    <CommandEmpty>No bank found.</CommandEmpty>
                    {banks.map((bank) => (
                      <CommandItem
                        key={`${bank.code}-${bank.slug}`}
                        value={bank.name}
                        onSelect={() => handleSelectBank(bank.code)}
                        className="gap-2"
                      >
                        <Check
                          className={cn("h-4 w-4", bank.code === bankCode ? "opacity-100" : "opacity-0")}
                        />
                        {bank.name}
                      </CommandItem>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {banksError && <p className="text-sm text-destructive">{banksError}</p>}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> {selectedBank?.name || "Change bank"}
            </button>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Account number</label>
              <Input
                value={accountNumber}
                maxLength={20}
                placeholder="Enter account number"
                onChange={(event) => handleAccountNumberChange(event.target.value)}
              />
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                {isResolving ? (
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Resolving account...
                  </span>
                ) : resolvedName ? (
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-[#3F6B2D]" /> {resolvedName}
                  </span>
                ) : resolveError ? (
                  <span className="text-destructive">{resolveError}</span>
                ) : (
                  <span className="text-muted-foreground">
                    Enter your account number — we will verify the account name automatically.
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Business name</label>
              <Input
                value={businessName}
                placeholder="Acme Auctions LLC"
                onChange={(event) => setBusinessName(event.target.value)}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {step === 3 && (
            <Button type="button" onClick={handleSave} disabled={!canSave}>
              Confirm &amp; save
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
