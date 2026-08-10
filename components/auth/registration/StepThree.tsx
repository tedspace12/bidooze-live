import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronsUpDown,
  CreditCard,
  Landmark,
  Loader2,
  Pencil,
} from "lucide-react";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { registrationService } from "@/features/auth/services/registrationService";
import type { PaystackBank, PaymentProvider } from "@/features/auth/types";

type IdentifierField = {
  key: string;
  label: string;
  placeholder: string;
  maxLength?: number;
  helpText?: string;
  transform?: (val: string) => string;
};

type CountryConfig = {
  label: string;
  flag: string;
  accountNumberLabel?: string;
  accountNumberPlaceholder?: string;
  noAccountNumber?: boolean;
  identifiers: IdentifierField[];
  accountTypes?: { value: string; label: string }[];
};

export const DEFAULT_ACCOUNT_TYPES = [
  { value: "business_checking", label: "Business Checking" },
  { value: "business_savings", label: "Business Savings" },
];

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

export const COUNTRY_BANK_CONFIG: Record<string, CountryConfig> = {
  US: {
    label: "United States",
    flag: "US",
    accountNumberPlaceholder: "4-17 digits",
    identifiers: [{ key: "routing_number", label: "Routing Number", placeholder: "9 digits", maxLength: 9 }],
    accountTypes: DEFAULT_ACCOUNT_TYPES,
  },
  GB: {
    label: "United Kingdom",
    flag: "GB",
    accountNumberPlaceholder: "8 digits",
    identifiers: [{ key: "sort_code", label: "Sort Code", placeholder: "XX-XX-XX", maxLength: 8 }],
    accountTypes: DEFAULT_ACCOUNT_TYPES,
  },
  EU: {
    label: "Europe (SEPA)",
    flag: "EU",
    accountNumberLabel: "IBAN",
    accountNumberPlaceholder: "DE89 3704 0044 0532 0130 00",
    identifiers: [{ key: "bic", label: "BIC / SWIFT", placeholder: "COBADEFFXXX", maxLength: 11 }],
    accountTypes: DEFAULT_ACCOUNT_TYPES,
  },
  NG: {
    label: "Nigeria",
    flag: "NG",
    accountNumberPlaceholder: "10-digit NUBAN",
    identifiers: [{ key: "bank_code", label: "Bank Code", placeholder: "3 digits (e.g. 058)", maxLength: 3 }],
    accountTypes: DEFAULT_ACCOUNT_TYPES,
  },
  CA: {
    label: "Canada",
    flag: "CA",
    accountNumberPlaceholder: "7-12 digits",
    identifiers: [
      { key: "transit_number", label: "Transit Number", placeholder: "5 digits", maxLength: 5 },
      { key: "institution_number", label: "Institution Number", placeholder: "3 digits", maxLength: 3 },
    ],
    accountTypes: DEFAULT_ACCOUNT_TYPES,
  },
  AU: {
    label: "Australia",
    flag: "AU",
    accountNumberPlaceholder: "6-10 digits",
    identifiers: [{ key: "bsb_code", label: "BSB Code", placeholder: "XXX-XXX", maxLength: 7 }],
    accountTypes: DEFAULT_ACCOUNT_TYPES,
  },
  IN: {
    label: "India",
    flag: "IN",
    accountNumberPlaceholder: "9-18 digits",
    identifiers: [{ key: "ifsc_code", label: "IFSC Code", placeholder: "SBIN0001234", maxLength: 11 }],
    accountTypes: DEFAULT_ACCOUNT_TYPES,
  },
  MX: {
    label: "Mexico",
    flag: "MX",
    noAccountNumber: true,
    identifiers: [{ key: "clabe", label: "CLABE", placeholder: "18-digit CLABE number", maxLength: 18 }],
    accountTypes: DEFAULT_ACCOUNT_TYPES,
  },
  BR: {
    label: "Brazil",
    flag: "BR",
    accountNumberPlaceholder: "Account number",
    identifiers: [
      { key: "bank_code", label: "Bank Code", placeholder: "3 digits", maxLength: 3 },
      { key: "branch_code", label: "Branch Code", placeholder: "4 digits", maxLength: 4 },
    ],
    accountTypes: DEFAULT_ACCOUNT_TYPES,
  },
  ZA: {
    label: "South Africa",
    flag: "ZA",
    accountNumberPlaceholder: "Account number",
    identifiers: [{ key: "branch_code", label: "Branch Code", placeholder: "6 digits (e.g. 632005)", maxLength: 6 }],
    accountTypes: DEFAULT_ACCOUNT_TYPES,
  },
  SG: {
    label: "Singapore",
    flag: "SG",
    accountNumberPlaceholder: "Account number",
    identifiers: [
      { key: "bank_code", label: "Bank Code", placeholder: "4 digits", maxLength: 4 },
      { key: "branch_code", label: "Branch Code", placeholder: "3 digits", maxLength: 3 },
    ],
    accountTypes: DEFAULT_ACCOUNT_TYPES,
  },
};

const stepThreeSchema = z
  .object({
    paymentProvider: z.enum(["stripe", "paystack"]).optional(),
    paystackCountry: z.string().optional(),
    bankCode: z.string().optional(),
    bankName: z.string().optional(),
    accountNumber: z.string().optional(),
    businessName: z.string().optional(),
    resolvedAccountName: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.paymentProvider) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select a payment provider",
        path: ["paymentProvider"],
      });
      return;
    }

    if (data.paymentProvider !== "paystack") return;

    if (!data.bankCode) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please select a bank", path: ["bankCode"] });
    }
    if (!data.accountNumber?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Account number is required", path: ["accountNumber"] });
    }
    if (!data.businessName?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Business name is required", path: ["businessName"] });
    }
    if (!data.resolvedAccountName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Resolve the account before continuing",
        path: ["accountNumber"],
      });
    }
  });

export type StepThreeData = z.infer<typeof stepThreeSchema>;

interface StepThreeProps {
  onNext: (data: StepThreeData) => void;
  onSkip: () => void;
  onBack: () => void;
  defaultValues?: StepThreeData;
  isLoading?: boolean;
  registrationToken?: string | null;
  businessName?: string;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object") {
    const directMessage = (error as { message?: unknown }).message;
    if (typeof directMessage === "string" && directMessage.trim()) return directMessage;
  }
  return fallback;
};

// ─── Paystack connect dialog (step-by-step: country → bank → account) ────────

type PaystackAccountValues = {
  country: string;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  businessName: string;
  resolvedAccountName: string;
};

interface PaystackConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: PaystackAccountValues;
  onSave: (values: PaystackAccountValues) => void;
}

function PaystackConnectDialog({ open, onOpenChange, initialValues, onSave }: PaystackConnectDialogProps) {
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

export const StepThree = ({
  onNext,
  onSkip,
  onBack,
  defaultValues,
  isLoading,
  registrationToken,
  businessName,
}: StepThreeProps) => {
  const [paystackDialogOpen, setPaystackDialogOpen] = useState(false);
  const [stripeStatus, setStripeStatus] = useState<"unknown" | "connected" | "not_connected">("unknown");

  const form = useForm<StepThreeData>({
    resolver: zodResolver(stepThreeSchema),
    defaultValues: defaultValues || {
      paymentProvider: undefined,
      paystackCountry: "",
      bankCode: "",
      bankName: "",
      accountNumber: "",
      businessName: businessName || "",
      resolvedAccountName: "",
    },
  });

  const [paymentProvider, paystackCountry, bankCode, bankName, accountNumber, resolvedAccountName] = useWatch({
    control: form.control,
    name: ["paymentProvider", "paystackCountry", "bankCode", "bankName", "accountNumber", "resolvedAccountName"],
  });

  const selectedPaystackCountry = PAYSTACK_COUNTRIES.find((c) => c.code === paystackCountry);
  const isPaystackConnected = !!bankCode && !!resolvedAccountName;
  const maskedAccountNumber = accountNumber ? `••••${accountNumber.slice(-4)}` : "";

  useEffect(() => {
    if (paymentProvider !== "stripe" || !registrationToken || stripeStatus !== "unknown") return;

    let isMounted = true;

    registrationService
      .getPaymentAccountStatus(registrationToken)
      .then((result) => {
        if (!isMounted) return;
        setStripeStatus(
          result.data?.payment_provider_connected || result.data?.onboarding_completed
            ? "connected"
            : "not_connected"
        );
      })
      .catch(() => {
        if (isMounted) setStripeStatus("not_connected");
      });

    return () => {
      isMounted = false;
    };
  }, [paymentProvider, registrationToken, stripeStatus]);

  // Without a token we can't check status yet — treat as unconnected rather than spinning forever.
  const effectiveStripeStatus = registrationToken ? stripeStatus : "not_connected";

  const handleProviderChange = (value: string) => {
    form.setValue("paymentProvider", value as PaymentProvider);
  };

  const handleConnectStripe = () => {
    form.handleSubmit(onNext)();
  };

  const handlePaystackSave = (values: PaystackAccountValues) => {
    form.setValue("paystackCountry", values.country, { shouldValidate: true });
    form.setValue("bankCode", values.bankCode, { shouldValidate: true });
    form.setValue("bankName", values.bankName);
    form.setValue("accountNumber", values.accountNumber, { shouldValidate: true });
    form.setValue("businessName", values.businessName, { shouldValidate: true });
    form.setValue("resolvedAccountName", values.resolvedAccountName, { shouldValidate: true });
  };

  const canSubmit =
    !isLoading &&
    !!paymentProvider &&
    (paymentProvider === "stripe" ? effectiveStripeStatus === "connected" : isPaystackConnected);

  return (
    <div className="max-w-3xl w-full">
      <div className="mb-8">
        <p className="text-muted-foreground text-sm mb-2">Step 3/5</p>
        <h2 className="text-3xl font-bold text-foreground mb-3">Payment Account Setup (Optional)</h2>
        <p className="text-muted-foreground">
          Connect where auction proceeds will go automatically when buyers pay. This page is optional during registration.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            This step is optional — you can register and get approved without it. But you will not be able to
            receive any payouts until you connect a Payout account.
          </div>

          <FormField
            control={form.control}
            name="paymentProvider"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment provider</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={handleProviderChange}
                    className="grid grid-cols-1 gap-3 md:grid-cols-2"
                  >
                    {[
                      {
                        value: "stripe",
                        label: "Stripe",
                        description: "Use Stripe Connect for supported countries.",
                        icon: CreditCard,
                      },
                      {
                        value: "paystack",
                        label: "Paystack",
                        description: "Use a bank account from a supported African country through Paystack.",
                        icon: Landmark,
                      },
                    ].map((option) => {
                      const Icon = option.icon;
                      const selected = field.value === option.value;

                      return (
                        <label
                          key={option.value}
                          className={cn(
                            "flex cursor-pointer gap-3 rounded-lg border p-4 transition-colors",
                            selected ? "border-[#3F6B2D] bg-[#3F6B2D]/5" : "border-border bg-card"
                          )}
                        >
                          <RadioGroupItem value={option.value} className="mt-1" />
                          <Icon className="mt-0.5 h-5 w-5 text-muted-foreground" />
                          <span className="space-y-1">
                            <span className="block font-medium text-foreground">{option.label}</span>
                            <span className="block text-sm text-muted-foreground">{option.description}</span>
                          </span>
                        </label>
                      );
                    })}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {paymentProvider === "stripe" && (
            <div className="space-y-3">
              {effectiveStripeStatus === "connected" ? (
                <div className="flex items-start gap-3 rounded-lg border border-[#3F6B2D]/25 bg-[#3F6B2D]/5 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#3F6B2D]" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Stripe account connected</p>
                    <p className="text-xs text-muted-foreground">Click Next to continue.</p>
                  </div>
                </div>
              ) : effectiveStripeStatus === "unknown" ? (
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> Checking Stripe connection...
                </div>
              ) : (
                <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Payouts via Stripe</p>
                      <p className="text-xs text-muted-foreground">
                        You will finish a short setup on Stripe&apos;s site, then come back here.
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={handleConnectStripe}
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                  >
                    {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Connecting...</> : "Connect with Stripe"}
                  </Button>
                </div>
              )}
            </div>
          )}

          {paymentProvider === "paystack" && (
            <div className="space-y-3">
              {isPaystackConnected ? (
                <div className="flex flex-col gap-3 rounded-lg border border-[#3F6B2D]/25 bg-[#3F6B2D]/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#3F6B2D]" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{resolvedAccountName}</p>
                      <p className="text-xs text-muted-foreground">
                        {bankName} · {maskedAccountNumber} · {selectedPaystackCountry?.label}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPaystackDialogOpen(true)}
                    className="w-full gap-2 sm:w-auto"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Change
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Payout details not added yet</p>
                    <p className="text-xs text-muted-foreground">
                      Add the bank account you would like your Paystack payouts sent to.
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setPaystackDialogOpen(true)}
                    className="w-full sm:w-auto"
                  >
                    Add payout details
                  </Button>
                </div>
              )}
              <FormField
                control={form.control}
                name="bankCode"
                render={() => (
                  <FormItem>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 md:flex-row md:items-center md:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="w-full md:w-auto h-12 md:h-10 md:min-w-32"
              size="lg"
              disabled={isLoading}
            >
              Back
            </Button>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
              <Button
                type="button"
                variant="ghost"
                onClick={onSkip}
                className="w-full sm:w-auto"
                size="lg"
                disabled={isLoading}
              >
                Skip
              </Button>
              <Button type="submit" className="w-full sm:w-auto h-12 md:h-10 md:min-w-32" size="lg" disabled={!canSubmit}>
                {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : "Next"}
              </Button>
            </div>
          </div>
        </form>
      </Form>

      <PaystackConnectDialog
        open={paystackDialogOpen}
        onOpenChange={setPaystackDialogOpen}
        initialValues={{
          country: paystackCountry || "",
          bankCode: bankCode || "",
          bankName: bankName || "",
          accountNumber: accountNumber || "",
          businessName: form.getValues("businessName") || businessName || "",
          resolvedAccountName: resolvedAccountName || "",
        }}
        onSave={handlePaystackSave}
      />
    </div>
  );
};
