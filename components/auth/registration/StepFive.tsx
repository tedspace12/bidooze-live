"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
  backgroundCheckConsent: z.boolean().optional(),
});

type StepFiveFields = z.infer<typeof stepFiveSchema>;

export type StepFiveData = StepFiveFields & {
  identityVerification?: string[];    // Cloudinary URLs
  businessVerification?: string[];
};

interface StepFiveProps {
  defaultValues?: StepFiveData;
  onSubmit: (data: StepFiveData) => void;
  onSkip: () => void;
  onBack: () => void;
  isLoading?: boolean;
  registrationToken?: string | null;
}

export function StepFive({ defaultValues, onSubmit, onSkip, onBack, isLoading, registrationToken }: StepFiveProps) {
  const [identityUrls, setIdentityUrls] = useState<string[] | null>(
    defaultValues?.identityVerification?.length ? defaultValues.identityVerification : null
  );
  const [businessUrls, setBusinessUrls] = useState<string[] | null>(
    defaultValues?.businessVerification?.length ? defaultValues.businessVerification : null
  );

  const form = useForm<StepFiveFields>({
    resolver: zodResolver(stepFiveSchema),
    defaultValues: {
      backgroundCheckConsent: defaultValues?.backgroundCheckConsent ?? false,
    },
  });

  const handleSubmit = (fields: StepFiveFields) => {
    onSubmit({
      ...fields,
      identityVerification: identityUrls ?? undefined,
      businessVerification: businessUrls ?? undefined,
    });
  };

  const canSubmit = !isLoading;

  const base = `auctioneers/${registrationToken ?? "draft"}`;

  return (
    <div className="max-w-3xl w-full space-y-8">
      <header>
        <p className="text-muted-foreground text-sm mb-2">Step 5/5</p>
        <h2 className="text-3xl font-bold mb-1">Verification (Optional)</h2>
        <p className="text-muted-foreground">
          This page is optional during registration. You can upload verification documents now, or skip and submit for review.
        </p>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            All fields and document uploads on this page are optional. These may be required later before account activity.
          </div>

          <FileUploader
            folder={`${base}/identity`}
            label="Identity Verification (Government ID)"
            onChange={setIdentityUrls}
          />

          <FileUploader
            folder={`${base}/business`}
            label="Business Verification (Registration Documents)"
            onChange={setBusinessUrls}
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

          <div className="flex flex-col-reverse gap-3 pt-4 md:flex-row md:items-center md:justify-between">
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
                Skip and submit
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto h-12 md:h-10 md:min-w-32"
                size="lg"
                disabled={!canSubmit}
              >
                {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : "Complete"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
