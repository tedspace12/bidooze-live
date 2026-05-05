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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { FileUploader } from "./FileUploader";

const stepFourSchema = z.object({
  licenseNumber: z.string().trim().min(1, "License number is required"),
  licenseExpirationDate: z.string().min(1, "Expiration date is required"),
  certifications: z.string().optional(),
  associations: z.string().optional(),
});

type StepFourFields = z.infer<typeof stepFourSchema>;

export type StepFourData = StepFourFields & {
  licenseDocuments: string[]; // Cloudinary URLs
};

interface StepFourProps {
  onNext: (data: StepFourData) => void;
  onBack: () => void;
  defaultValues?: StepFourData;
  isLoading?: boolean;
  registrationToken?: string | null;
}

export function StepFour({ defaultValues, onNext, onBack, isLoading, registrationToken }: StepFourProps) {
  const [licenseUrls, setLicenseUrls] = useState<string[] | null>(
    defaultValues?.licenseDocuments?.length ? defaultValues.licenseDocuments : null
  );
  const [submitAttempted, setSubmitAttempted] = useState(false);

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
    setSubmitAttempted(true);
    if (!licenseUrls) return; // upload not complete
    onNext({ ...fields, licenseDocuments: licenseUrls });
  };

  const [licenseNumber, licenseExpirationDate] = useWatch({
    control: form.control,
    name: ["licenseNumber", "licenseExpirationDate"],
  });
  const canSubmit = !!licenseNumber?.trim() && !!licenseExpirationDate && !!licenseUrls && !isLoading;

  const folder = `auctioneers/${registrationToken ?? "draft"}/licenses`;
  const uploadMissing = submitAttempted && !licenseUrls;

  return (
    <div className="max-w-3xl w-full space-y-8">
      <header>
        <p className="text-muted-foreground text-sm mb-2">Step 4/5</p>
        <h2 className="text-3xl font-bold mb-1">Auctioneer Credentials</h2>
        <p className="text-muted-foreground">
          Provide your professional credentials and upload your license documents.
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
                  <Input placeholder="Enter your license number" {...field} />
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
            label="Upload License Documents"
            required
            onChange={setLicenseUrls}
            error={uploadMissing ? "Please upload at least one document" : undefined}
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
              {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : "Next"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
