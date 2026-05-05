import { useForm, useWatch, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";


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
  /** If true, accountNumber field is hidden (e.g. Mexico where CLABE replaces it) */
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
    flag: "🇺🇸",
    accountNumberPlaceholder: "4-17 digits",
    identifiers: [
      {
        key: "routing_number",
        label: "Routing Number",
        placeholder: "9 digits",
        maxLength: 9,
        helpText: "9-digit ABA routing number found on your cheque",
      },
    ],
    accountTypes: DEFAULT_ACCOUNT_TYPES,
  },
  GB: {
    label: "United Kingdom",
    flag: "🇬🇧",
    accountNumberPlaceholder: "8 digits",
    identifiers: [
      {
        key: "sort_code",
        label: "Sort Code",
        placeholder: "XX-XX-XX",
        maxLength: 8,
        helpText: "6-digit sort code, usually formatted as XX-XX-XX",
      },
    ],
    accountTypes: DEFAULT_ACCOUNT_TYPES,
  },
  EU: {
    label: "Europe (SEPA)",
    flag: "🇪🇺",
    accountNumberLabel: "IBAN",
    accountNumberPlaceholder: "DE89 3704 0044 0532 0130 00",
    identifiers: [
      {
        key: "bic",
        label: "BIC / SWIFT",
        placeholder: "COBADEFFXXX",
        maxLength: 11,
        transform: (val) => val.toUpperCase(),
        helpText: "8 or 11 character BIC/SWIFT code",
      },
    ],
    accountTypes: DEFAULT_ACCOUNT_TYPES,
  },
  NG: {
    label: "Nigeria",
    flag: "🇳🇬",
    accountNumberPlaceholder: "10-digit NUBAN",
    identifiers: [
      {
        key: "bank_code",
        label: "Bank Code",
        placeholder: "3 digits (e.g. 058)",
        maxLength: 3,
        helpText: "3-digit CBN bank code",
      },
    ],
    accountTypes: DEFAULT_ACCOUNT_TYPES,
  },
  CA: {
    label: "Canada",
    flag: "🇨🇦",
    accountNumberPlaceholder: "7-12 digits",
    identifiers: [
      {
        key: "transit_number",
        label: "Transit Number",
        placeholder: "5 digits",
        maxLength: 5,
      },
      {
        key: "institution_number",
        label: "Institution Number",
        placeholder: "3 digits",
        maxLength: 3,
      },
    ],
    accountTypes: DEFAULT_ACCOUNT_TYPES,
  },
  AU: {
    label: "Australia",
    flag: "🇦🇺",
    accountNumberPlaceholder: "6-10 digits",
    identifiers: [
      {
        key: "bsb_code",
        label: "BSB Code",
        placeholder: "XXX-XXX",
        maxLength: 7,
        helpText: "Bank State Branch code (6 digits)",
      },
    ],
    accountTypes: DEFAULT_ACCOUNT_TYPES,
  },
  IN: {
    label: "India",
    flag: "🇮🇳",
    accountNumberPlaceholder: "9-18 digits",
    identifiers: [
      {
        key: "ifsc_code",
        label: "IFSC Code",
        placeholder: "SBIN0001234",
        maxLength: 11,
        transform: (val) => val.toUpperCase(),
        helpText: "11-character code on your cheque book or bank passbook",
      },
    ],
    accountTypes: DEFAULT_ACCOUNT_TYPES,
  },
  MX: {
    label: "Mexico",
    flag: "🇲🇽",
    noAccountNumber: true,
    identifiers: [
      {
        key: "clabe",
        label: "CLABE",
        placeholder: "18-digit CLABE number",
        maxLength: 18,
        helpText: "CLABE replaces the account number for Mexican bank transfers",
      },
    ],
    accountTypes: DEFAULT_ACCOUNT_TYPES,
  },
  BR: {
    label: "Brazil",
    flag: "🇧🇷",
    accountNumberPlaceholder: "Account number",
    identifiers: [
      {
        key: "bank_code",
        label: "Bank Code (Código do Banco)",
        placeholder: "3 digits",
        maxLength: 3,
      },
      {
        key: "branch_code",
        label: "Branch Code (Agência)",
        placeholder: "4 digits",
        maxLength: 4,
      },
    ],
    accountTypes: DEFAULT_ACCOUNT_TYPES,
  },
  ZA: {
    label: "South Africa",
    flag: "🇿🇦",
    accountNumberPlaceholder: "Account number",
    identifiers: [
      {
        key: "branch_code",
        label: "Branch Code",
        placeholder: "6 digits (e.g. 632005)",
        maxLength: 6,
        helpText: "Most major banks use universal branch code 632005",
      },
    ],
    accountTypes: DEFAULT_ACCOUNT_TYPES,
  },
  SG: {
    label: "Singapore",
    flag: "🇸🇬",
    accountNumberPlaceholder: "Account number",
    identifiers: [
      {
        key: "bank_code",
        label: "Bank Code",
        placeholder: "4 digits",
        maxLength: 4,
      },
      {
        key: "branch_code",
        label: "Branch Code",
        placeholder: "3 digits",
        maxLength: 3,
      },
    ],
    accountTypes: DEFAULT_ACCOUNT_TYPES,
  },
};

const stepThreeSchema = z
  .object({
    country: z.string().min(1, "Please select your country"),
    bankName: z.string().trim().min(1, "Bank name is required"),
    accountHolderName: z.string().trim().min(1, "Account holder name is required"),
    accountNumber: z.string().optional(),
    accountType: z.string().min(1, "Please select an account type"),
    bankIdentifiers: z.record(z.string(), z.string()),
  })
  .superRefine((data, ctx) => {
    const config = COUNTRY_BANK_CONFIG[data.country];
    if (!config) return;

    const accountNumber = data.accountNumber?.trim() ?? "";
    if (!config.noAccountNumber && !accountNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${config.accountNumberLabel ?? "Account number"} is required`,
        path: ["accountNumber"],
      });
    }

    for (const identifier of config.identifiers) {
      const value = data.bankIdentifiers[identifier.key]?.trim() ?? "";
      if (!value) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${identifier.label} is required`,
          path: ["bankIdentifiers", identifier.key],
        });
      }
    }
  });

export type StepThreeData = z.infer<typeof stepThreeSchema>;

interface StepThreeProps {
  onNext: (data: StepThreeData) => void;
  onBack: () => void;
  defaultValues?: StepThreeData;
  isLoading?: boolean;
  registrationToken?: string | null;
}

interface BankIdentifierFieldsProps {
  country: string;
  control: Control<StepThreeData>;
}

const BankIdentifierFields = ({ country, control }: BankIdentifierFieldsProps) => {
  const config = COUNTRY_BANK_CONFIG[country];
  if (!config || config.identifiers.length === 0) return null;

  return (
    <>
      {config.identifiers.map((field) => (
        <FormField
          key={field.key}
          control={control}
          name={`bankIdentifiers.${field.key}`}
          render={({ field: rhfField }) => (
            <FormItem>
              <FormLabel>{field.label}</FormLabel>
              <FormControl>
                <Input
                  placeholder={field.placeholder}
                  maxLength={field.maxLength}
                  {...rhfField}
                  value={rhfField.value ?? ""}
                  onChange={(e) => {
                    const val = field.transform
                      ? field.transform(e.target.value)
                      : e.target.value;
                    rhfField.onChange(val);
                  }}
                />
              </FormControl>
              {field.helpText && (
                <p className="text-xs text-muted-foreground">{field.helpText}</p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </>
  );
};

export const StepThree = ({ onNext, onBack, defaultValues, isLoading }: StepThreeProps) => {
  const form = useForm<StepThreeData>({
    resolver: zodResolver(stepThreeSchema),
    defaultValues: defaultValues || {
      country: "",
      bankName: "",
      accountHolderName: "",
      accountNumber: "",
      accountType: "",
      bankIdentifiers: {},
    },
  });

    const selectedCountry = useWatch({ control: form.control, name: "country" });
  const countryConfig = COUNTRY_BANK_CONFIG[selectedCountry];

  const [bankName, accountHolderName, accountNumber, accountType, bankIdentifiers] = useWatch({
    control: form.control,
    name: ["bankName", "accountHolderName", "accountNumber", "accountType", "bankIdentifiers"],
  });

  const identifiersComplete = !selectedCountry || (countryConfig?.identifiers ?? []).every(
    (id) => !!bankIdentifiers?.[id.key]?.trim()
  );
  const accountNumberValid = !selectedCountry || countryConfig?.noAccountNumber || !!accountNumber?.trim();

  const canSubmit = !isLoading &&
    !!selectedCountry &&
    !!bankName?.trim() &&
    !!accountHolderName?.trim() &&
    !!accountType &&
    accountNumberValid &&
    identifiersComplete;

  const handleCountryChange = (value: string) => {
    const nextAccountTypes = COUNTRY_BANK_CONFIG[value]?.accountTypes ?? DEFAULT_ACCOUNT_TYPES;
    const defaultAccountType = nextAccountTypes[0]?.value ?? "";

    form.setValue("country", value);
    form.setValue("bankIdentifiers", {});
    form.setValue("accountNumber", "");
    form.setValue("accountType", defaultAccountType);
  };

  const accountTypes = countryConfig?.accountTypes ?? DEFAULT_ACCOUNT_TYPES;


  return (
    <div className="max-w-3xl w-full">
      <div className="mb-8">
        <p className="text-muted-foreground text-sm mb-2">Step 3/5</p>
        <h2 className="text-3xl font-bold text-foreground mb-3">Bank Information</h2>
        <p className="text-muted-foreground">
          Provide your bank details to enable secure and seamless payouts to your account.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Select onValueChange={handleCountryChange} value={field.value}>
                    <SelectTrigger className="text-base md:text-sm">
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(COUNTRY_BANK_CONFIG).map(([code, config]) => (
                        <SelectItem key={code} value={code}>
                          {config.flag} {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {selectedCountry && (
            <>
              {/* Row 1: Bank name + Account holder */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank name</FormLabel>
                      <FormControl>
                        <Input placeholder="Example Bank" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accountHolderName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account holder name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Row 2: Account number (if not replaced by identifier) + dynamic identifiers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {!countryConfig?.noAccountNumber && (
                  <FormField
                    control={form.control}
                    name="accountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{countryConfig?.accountNumberLabel ?? "Account number"}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={countryConfig?.accountNumberPlaceholder ?? "Account number"}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <BankIdentifierFields
                  country={selectedCountry}
                  control={form.control}
                />
              </div>

              {/* Row 3: Account type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="accountType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account type</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="text-base md:text-sm">
                            <SelectValue placeholder="Select account type" />
                          </SelectTrigger>
                          <SelectContent>
                            {accountTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </>
          )}

          <div className="flex flex-col-reverse md:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="w-full md:w-auto h-12 md:h-10 md:min-w-32 md:flex-none"
              size="lg"
              disabled={isLoading}
            >
              Back
            </Button>
            <Button type="submit" className="w-full h-12 md:h-10 md:flex-1" size="lg" disabled={!canSubmit}>
              {isLoading ? "Submitting..." : "Next"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
