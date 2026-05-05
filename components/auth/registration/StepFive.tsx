"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { FileUploader } from "./FileUploader";

const stepFiveSchema = z.object({
  backgroundCheckConsent: z.boolean().refine((v) => v === true, "Consent is required"),
});

type StepFiveFields = z.infer<typeof stepFiveSchema>;

export type StepFiveData = StepFiveFields & {
  identityVerification: string[];    // Cloudinary URLs
  businessVerification: string[];
  complianceDocumentation: string[];
};

interface StepFiveProps {
  defaultValues?: StepFiveData;
  onSubmit: (data: StepFiveData) => void;
  onBack: () => void;
  isLoading?: boolean;
  registrationToken?: string | null;
}

export function StepFive({ defaultValues, onSubmit, onBack, isLoading, registrationToken }: StepFiveProps) {
  const [identityUrls, setIdentityUrls] = useState<string[] | null>(
    defaultValues?.identityVerification?.length ? defaultValues.identityVerification : null
  );
  const [businessUrls, setBusinessUrls] = useState<string[] | null>(
    defaultValues?.businessVerification?.length ? defaultValues.businessVerification : null
  );
  const [complianceUrls, setComplianceUrls] = useState<string[] | null>(
    defaultValues?.complianceDocumentation?.length ? defaultValues.complianceDocumentation : null
  );
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const form = useForm<StepFiveFields>({
    resolver: zodResolver(stepFiveSchema),
    defaultValues: {
      backgroundCheckConsent: defaultValues?.backgroundCheckConsent ?? false,
    },
  });

  const handleSubmit = (fields: StepFiveFields) => {
    setSubmitAttempted(true);
    if (!identityUrls || !businessUrls || !complianceUrls) return;
    onSubmit({
      ...fields,
      identityVerification: identityUrls,
      businessVerification: businessUrls,
      complianceDocumentation: complianceUrls,
    });
  };

  const backgroundCheckConsent = useWatch({
    control: form.control,
    name: "backgroundCheckConsent",
  });
  const canSubmit = !!backgroundCheckConsent && !!identityUrls && !!businessUrls && !!complianceUrls && !isLoading;

  const base = `auctioneers/${registrationToken ?? "draft"}`;

  return (
    <div className="max-w-3xl w-full space-y-8">
      <header>
        <p className="text-muted-foreground text-sm mb-2">Step 5/5</p>
        <h2 className="text-3xl font-bold mb-1">Verification</h2>
        <p className="text-muted-foreground">
          Upload your verification documents and consent to a background check.
        </p>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

          <FileUploader
            folder={`${base}/identity`}
            label="Identity Verification (Government ID)"
            required
            onChange={setIdentityUrls}
            error={submitAttempted && !identityUrls ? "Please upload your government ID" : undefined}
          />

          <FileUploader
            folder={`${base}/business`}
            label="Business Verification (Registration Documents)"
            required
            onChange={setBusinessUrls}
            error={submitAttempted && !businessUrls ? "Please upload your registration documents" : undefined}
          />

          <FileUploader
            folder={`${base}/compliance`}
            label="Compliance Documentation"
            required
            onChange={setComplianceUrls}
            error={submitAttempted && !complianceUrls ? "Please upload compliance documentation" : undefined}
          />

          <FormField
            control={form.control}
            name="backgroundCheckConsent"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-green-700 focus:ring-primary"
                  />
                </FormControl>
                <FormLabel className="flex-1 cursor-pointer !mt-0">
                  I consent to a background check
                </FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col-reverse md:flex-row gap-3 pt-4">
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
            <Button
              type="submit"
              className="w-full h-12 md:h-10 md:flex-1"
              size="lg"
              disabled={!canSubmit}
            >
              {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : "Complete"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
