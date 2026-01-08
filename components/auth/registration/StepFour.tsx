"use client";

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

import { useState } from "react";
import { Upload } from "lucide-react";

const stepFourSchema = z.object({
    licenseNumber: z.string().trim().min(1, "License number is required"),
    licenseExpirationDate: z.string().min(1, "Expiration date is required"),
    certifications: z.string().optional(),
    associations: z.string().optional(),
    licenseDocuments: z
        .any()
        .refine((files) => files?.length > 0, "Please upload at least one document"),
});

export type StepFourData = z.infer<typeof stepFourSchema>;

interface StepFourProps {
    onNext: (data: StepFourData) => void;
    onBack: () => void;
    defaultValues?: StepFourData;
    isLoading?: boolean;
    registrationToken?: string | null;
}

export function StepFour({
    defaultValues,
    onNext,
    onBack,
    isLoading,
    registrationToken,
}: StepFourProps) {
    const [fileNames, setFileNames] = useState<string[]>([]);

    const form = useForm<StepFourData>({
        resolver: zodResolver(stepFourSchema),
        defaultValues: defaultValues || {
            licenseNumber: "",
            licenseExpirationDate: "",
            certifications: "",
            associations: "",
            licenseDocuments: null,
        },
    });

    // Handle file input change to display file names
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            setFileNames(Array.from(files).map((file) => file.name));
            form.setValue("licenseDocuments", files);
        }
    };

    return (
        <div className="max-w-3xl w-full space-y-8">
            <header>
                <p className="text-muted-foreground text-sm mb-2">Step 4/5</p>
                <h2 className="text-3xl font-bold mb-1">Auctioneer Credentials</h2>
                <p className="text-muted-foreground">
                    Please provide your professional credentials and upload your license documents.
                </p>
            </header>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onNext)}
                    className="space-y-6"
                    encType="multipart/form-data"
                >
                    {/* License Number */}
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

                    {/* License Expiration Date */}
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

                    {/* Professional Certifications */}
                    <FormField
                        control={form.control}
                        name="certifications"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Professional Certifications</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="List your certifications (optional)"
                                        rows={4}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Industry Associations Membership */}
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

                    {/* Upload License Documents */}
                    <FormField
                        control={form.control}
                        name="licenseDocuments"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Upload License Documents</FormLabel>
                                <FormControl>
                                    <div
                                        className="
                                            border border-dashed rounded-xl p-6
                                            flex flex-col items-center justify-center
                                            hover:bg-muted/50 transition cursor-pointer
                                            text-center
                                        "
                                        onClick={() => document.getElementById("license-upload")?.click()}
                                    >
                                        <Upload className="w-8 h-8 text-muted-foreground mb-3" />
                                        <p className="text-sm text-muted-foreground">
                                            <span className="font-medium text-green-700">Click to upload</span> or drag files here
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            PDF, JPG, JPEG, PNG — Max 10MB
                                        </p>
                                        <input
                                            id="license-upload"
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            multiple
                                            onChange={(e) => {
                                                handleFileChange(e);
                                                field.onChange(e.target.files);
                                            }}
                                            className="hidden"
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                                {fileNames.length > 0 && (
                                    <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground">
                                        {fileNames.map((name, i) => (
                                            <li key={i}>{name}</li>
                                        ))}
                                    </ul>
                                )}
                            </FormItem>
                        )}
                    />

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onBack}
                            className="flex-1"
                            size="lg"
                            disabled={isLoading}
                        >
                            Back
                        </Button>
                        <Button type="submit" className="flex-1" size="lg" disabled={isLoading}>
                            {isLoading ? "Submitting..." : "Next"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
