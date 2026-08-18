import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CheckCircle2, CreditCard, Landmark, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { registrationService } from "@/features/auth/services/registrationService";
import {
  PaystackConnectDialog,
  PAYSTACK_COUNTRIES,
  type PaystackAccountValues,
} from "@/components/payments/PaystackConnectDialog";
import type { PaymentProvider } from "@/features/auth/types";

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
