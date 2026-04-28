import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { LegalNotice } from "@/components/legal/legal-notice";
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
import { getSocialToken, type SocialProvider } from "@/lib/social-auth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const socialsField = z.array(
  z.object({
    platform: z.string().min(1, "Select a platform"),
    url: z.string().url("Enter a valid URL"),
  })
);

const stepTwoSchema = z.object({
  contactName: z.string().trim().min(1, "Contact name is required").max(100),
  businessAddress: z.string().trim().min(1, "Business address is required"),
  phoneNumber: z.string().trim().min(1, "Phone number is required").max(15),
  email: z.string().trim().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").trim(),
  password_confirmation: z.string().trim(),
  website: z.string().trim().url("Invalid website URL").optional().or(z.literal("")),
  socials: socialsField,
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords do not match",
  path: ["password_confirmation"],
});

const socialStepTwoSchema = z.object({
  contactName: z.string().trim().min(1, "Contact name is required").max(100),
  businessAddress: z.string().trim().min(1, "Business address is required"),
  phoneNumber: z.string().trim().min(1, "Phone number is required").max(15),
  website: z.string().trim().url("Invalid website URL").optional().or(z.literal("")),
  socials: socialsField,
});

export type StepTwoData = z.infer<typeof stepTwoSchema>;
export type SocialStepTwoData = z.infer<typeof socialStepTwoSchema> & {
  provider: SocialProvider;
  provider_token: string;
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface StepTwoProps {
  onNext: (data: StepTwoData) => void;
  onSocialNext?: (data: SocialStepTwoData) => void;
  onBack: () => void;
  defaultValues?: StepTwoData;
  isLoading?: boolean;
  isSocialLoading?: boolean;
  registrationToken?: string | null;
}

// ─── Social auth bar ──────────────────────────────────────────────────────────

function SocialBar({
  onSuccess,
}: {
  onSuccess: (provider: SocialProvider, token: string) => void;
}) {
  const [loading, setLoading] = useState<SocialProvider | null>(null);

  const handleClick = async (provider: SocialProvider) => {
    setLoading(provider);
    try {
      const token = await getSocialToken(provider);
      onSuccess(provider, token);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Social sign-in failed";
      if (!msg.toLowerCase().includes("cancel")) toast.error(msg);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full gap-2"
        disabled={!!loading}
        onClick={() => handleClick("google")}
      >
        {loading === "google" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              fill="currentColor"
            />
          </svg>
        )}
        Continue with Google
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full gap-2"
        disabled={!!loading}
        onClick={() => handleClick("facebook")}
      >
        {loading === "facebook" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z"
              fill="currentColor"
            />
          </svg>
        )}
        Continue with Meta
      </Button>
    </div>
  );
}

// ─── Social contact form (no email/password) ──────────────────────────────────

function SocialContactForm({
  provider,
  providerToken,
  onSubmit,
  onCancel,
  onSwitch,
  isLoading,
}: {
  provider: SocialProvider;
  providerToken: string;
  onSubmit: (data: SocialStepTwoData) => void;
  onCancel: () => void;
  onSwitch: () => void;
  isLoading?: boolean;
}) {
  const form = useForm<z.infer<typeof socialStepTwoSchema>>({
    resolver: zodResolver(socialStepTwoSchema),
    defaultValues: {
      contactName: "",
      businessAddress: "",
      phoneNumber: "",
      website: "",
      socials: [{ platform: "", url: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "socials",
  });

  const handleSubmit = (data: z.infer<typeof socialStepTwoSchema>) => {
    onSubmit({ ...data, provider, provider_token: providerToken });
  };

  const [socialContactName, socialBusinessAddress, socialPhoneNumber] = form.watch([
    "contactName", "businessAddress", "phoneNumber",
  ]);
  const canSubmitSocial = !isLoading &&
    !!socialContactName?.trim() &&
    !!socialBusinessAddress?.trim() &&
    !!socialPhoneNumber?.trim();

  const providerLabel = provider === "google" ? "Google" : "Meta";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="flex items-center justify-between gap-3 rounded-lg bg-secondary/60 px-4 py-2.5 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">{providerLabel} account linked.</span>
            <span className="text-muted-foreground hidden sm:inline">Complete your contact info below.</span>
          </div>
          <button
            type="button"
            onClick={onSwitch}
            disabled={isLoading}
            className="shrink-0 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground disabled:opacity-50"
          >
            Use a different account
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="contactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone number</FormLabel>
                <FormControl>
                  <Input placeholder="+1 234 567 8901" type="tel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="businessAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business address</FormLabel>
              <FormControl>
                <Input placeholder="Apt 5, Auction street, Oklahoma" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website (optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel className="text-lg font-semibold">Social Media Profiles</FormLabel>
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end border rounded-lg p-4">
              <FormField
                control={form.control}
                name={`socials.${index}.platform`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="text-base md:text-sm">
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="twitter">X (Twitter)</SelectItem>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                          <SelectItem value="youtube">YouTube</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`socials.${index}.url`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="button" variant="destructive" onClick={() => remove(index)}>
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ platform: "", url: "" })}
          >
            + Add another social platform
          </Button>
        </div>

        <div className="flex flex-col-reverse md:flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="w-full md:w-auto h-12 md:h-10 md:min-w-32 md:flex-none"
            size="lg"
            disabled={isLoading}
          >
            Use email instead
          </Button>
          <Button type="submit" className="w-full h-12 md:h-10 md:flex-1" size="lg" disabled={!canSubmitSocial}>
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
            ) : "Next"}
          </Button>
        </div>
        <LegalNotice />
      </form>
    </Form>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export const StepTwo = ({
  onNext,
  onSocialNext,
  onBack,
  defaultValues,
  isLoading,
  isSocialLoading,
}: StepTwoProps) => {
  const [pendingSocial, setPendingSocial] = useState<{
    provider: SocialProvider;
    token: string;
  } | null>(null);

  const form = useForm<StepTwoData>({
    resolver: zodResolver(stepTwoSchema),
    defaultValues: defaultValues || {
      contactName: "",
      businessAddress: "",
      phoneNumber: "",
      email: "",
      password: "",
      password_confirmation: "",
      website: "",
      socials: [{ platform: "", url: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "socials",
  });

  const [contactName, businessAddress, phoneNumber, email, password, password_confirmation] = form.watch([
    "contactName", "businessAddress", "phoneNumber", "email", "password", "password_confirmation",
  ]);
  const canSubmit = !isLoading &&
    !!contactName?.trim() &&
    !!businessAddress?.trim() &&
    !!phoneNumber?.trim() &&
    !!email?.trim() &&
    !!password &&
    !!password_confirmation &&
    password === password_confirmation;

  return (
    <div className="max-w-3xl w-full">
      <div className="mb-8">
        <p className="text-muted-foreground text-sm mb-2">Step 2/5</p>
        <h2 className="text-3xl font-bold text-foreground mb-3">Contact Info and Account Setup</h2>
        <p className="text-muted-foreground">
          Provide your contact information and set up your account credentials.
        </p>
      </div>

      {pendingSocial ? (
        <SocialContactForm
          provider={pendingSocial.provider}
          providerToken={pendingSocial.token}
          onSubmit={(data) => onSocialNext?.(data)}
          onCancel={() => setPendingSocial(null)}
          onSwitch={async () => {
            try {
              const token = await getSocialToken(pendingSocial.provider);
              setPendingSocial({ provider: pendingSocial.provider, token });
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : "";
              if (!msg.toLowerCase().includes("cancel")) {
                toast.error("Could not switch account. Please try again.");
              }
            }
          }}
          isLoading={isSocialLoading}
        />
      ) : (
        <>
          {/* Social auth options */}
          {onSocialNext && (
            <div className="mb-6 space-y-3">
              <SocialBar
                onSuccess={(provider, token) => setPendingSocial({ provider, token })}
              />
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or fill in manually</span>
                </div>
              </div>
            </div>
          )}

          {/* Standard form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jhone Deo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone number</FormLabel>
                      <FormControl>
                        <Input placeholder="+234 123 456 78901" type="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input placeholder="email@email.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter a strong password" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password_confirmation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input placeholder="Confirm your password" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="businessAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business address</FormLabel>
                    <FormControl>
                      <Input placeholder="Apt 5, Auction street, Oklahoma" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel className="text-lg font-semibold">Social Media Profiles</FormLabel>
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end border rounded-lg p-4">
                    <FormField
                      control={form.control}
                      name={`socials.${index}.platform`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Platform</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange}>
                              <SelectTrigger className="text-base md:text-sm">
                                <SelectValue placeholder="Select platform" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="facebook">Facebook</SelectItem>
                                <SelectItem value="instagram">Instagram</SelectItem>
                                <SelectItem value="twitter">X (Twitter)</SelectItem>
                                <SelectItem value="linkedin">LinkedIn</SelectItem>
                                <SelectItem value="youtube">YouTube</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`socials.${index}.url`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profile URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="destructive" onClick={() => remove(index)}>
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ platform: "", url: "" })}
                >
                  + Add another social platform
                </Button>
              </div>

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
              <LegalNotice />
            </form>
          </Form>
        </>
      )}
    </div>
  );
};
