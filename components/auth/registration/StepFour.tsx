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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { FileUploader } from "./FileUploader";

const stepFourSchema = z.object({
  licenseNumber: z.string().trim().optional(),
  licenseExpirationDate: z.string().optional(),
  certifications: z.string().optional(),
  associations: z.string().optional(),
});

type StepFourFields = z.infer<typeof stepFourSchema>;

export type StepFourData = StepFourFields & {
  licenseDocuments: string[]; // Cloudinary URLs
};

interface StepFourProps {
  onNext: (data: StepFourData) => void;
  onSkip: () => void;
  onBack: () => void;
  defaultValues?: StepFourData;
  isLoading?: boolean;
  registrationToken?: string | null;
}

export function StepFour({ defaultValues, onNext, onSkip, onBack, isLoading, registrationToken }: StepFourProps) {
  const [licenseUrls, setLicenseUrls] = useState<string[] | null>(
    defaultValues?.licenseDocuments?.length ? defaultValues.licenseDocuments : null
  );

  const form = useForm<StepFourFields>({
    resolver: zodResolver(stepFourSchema),
    defaultValues: {
      licenseNumber: defaultValues?.licenseNumber ?? "",
      licenseExpirationDate: defaultValues?.licenseExpirationDate ?? "",
      certifications: defaultValues?.certifications ?? "",
      associations: defaultValues?.associations ?? "",
    },
  });

  const handleSubmit = (fields: StepFourFields) => {
    onNext({ ...fields, licenseDocuments: licenseUrls ?? [] });
  };

  const canSubmit = !isLoading;

  const folder = `auctioneers/${registrationToken ?? "draft"}/licenses`;

  return (
    <div className="max-w-3xl w-full space-y-8">
      <header>
        <p className="text-muted-foreground text-sm mb-2">Step 4/5</p>
        <h2 className="text-3xl font-bold mb-1">Auctioneer Credentials (Optional)</h2>
        <p className="text-muted-foreground">
          This page is optional during registration. You can provide credentials now, or skip and add them later.
        </p>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

          <FormField
            control={form.control}
            name="licenseNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Auctioneer License Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your license number (optional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="licenseExpirationDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>License Expiration Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="certifications"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Professional Certifications</FormLabel>
                <FormControl>
                  <Textarea placeholder="List your certifications (optional)" rows={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="associations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industry Associations Membership</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="List any industry associations you belong to (optional)"
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FileUploader
            folder={folder}
            label="Upload License Documents (optional)"
            onChange={setLicenseUrls}
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
                Skip
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto h-12 md:h-10 md:min-w-32"
                size="lg"
                disabled={!canSubmit}
              >
                {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : "Next"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
