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

import { Button } from "@/components/ui/button";

import { useState } from "react";
import { Upload } from "lucide-react";

const stepFiveSchema = z.object({
    identityVerification: z
        .any()
        .refine((files) => files?.length > 0, "Please upload government ID"),
    businessVerification: z
        .any()
        .refine((files) => files?.length > 0, "Please upload registration documents"),
    backgroundCheckConsent: z.boolean().refine((v) => v === true, "Consent is required"),
    complianceDocumentation: z
        .any()
        .refine((files) => files?.length > 0, "Please upload compliance documentation"),
});

export type StepFiveData = z.infer<typeof stepFiveSchema>;

interface StepFiveProps {
    defaultValues?: StepFiveData;
    onSubmit: (data: StepFiveData) => void;
    onBack: () => void;
    isLoading?: boolean;
    registrationToken?: string | null;
}

export function StepFive({ defaultValues, onSubmit, onBack, isLoading }: StepFiveProps) {
    const [identityFiles, setIdentityFiles] = useState<string[]>([]);
    const [businessFiles, setBusinessFiles] = useState<string[]>([]);
    const [complianceFiles, setComplianceFiles] = useState<string[]>([]);

    const form = useForm<StepFiveData>({
        resolver: zodResolver(stepFiveSchema),
        defaultValues: defaultValues || {
            identityVerification: null,
            businessVerification: null,
            backgroundCheckConsent: false,
            complianceDocumentation: null,
        },
    });

    function handleFilesChange(
        e: React.ChangeEvent<HTMLInputElement>,
        setFiles: React.Dispatch<React.SetStateAction<string[]>>,
        onChange: (files: FileList | null) => void
    ) {
        const files = e.target.files;
        if (files) {
            setFiles(Array.from(files).map((f) => f.name));
            onChange(files);
        }
    }

    return (
        <div className="max-w-3xl w-full space-y-8">
            <header>
                <p className="text-muted-foreground text-sm mb-2">Step 5/5</p>
                <h2 className="text-3xl font-bold mb-1">Verification</h2>
                <p className="text-muted-foreground">
                    Upload necessary verification documents and provide your consent for background checks.
                </p>
            </header>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" encType="multipart/form-data">

                    <FormField
                        control={form.control}
                        name="identityVerification"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel>Identity Verification (Government ID)</FormLabel>
                                <FormControl>
                                    <div
                                        className="
                                            border border-dashed rounded-xl p-6
                                            flex flex-col items-center justify-center
                                            hover:bg-muted/50 transition cursor-pointer
                                            text-center
                                        "
                                        onClick={() => document.getElementById("identity-upload")?.click()}
                                    >
                                        <Upload className="w-8 h-8 text-muted-foreground mb-3" />
                                        <p className="text-sm text-muted-foreground">
                                            <span className="font-medium text-green-700">Click to upload</span> or drag files here
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            PDF, JPG, JPEG, PNG — Max 10MB
                                        </p>

                                        <input
                                            id="identity-upload"
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            multiple
                                            onChange={(e) => handleFilesChange(e, setIdentityFiles, field.onChange)}
                                            className="hidden"
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                                {identityFiles.length > 0 && (
                                    <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground">
                                        {identityFiles.map((name, i) => (
                                            <li key={i}>{name}</li>
                                        ))}
                                    </ul>
                                )}
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="businessVerification"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel>Business Verification (Registration Documents)</FormLabel>

                                <FormControl>
                                    <div
                                        className="
                                            border border-dashed rounded-xl p-6
                                            flex flex-col items-center justify-center
                                            hover:bg-muted/50 transition cursor-pointer
                                            text-center
                                        "
                                        onClick={() => document.getElementById("business-upload")?.click()}
                                    >
                                        <Upload className="w-8 h-8 text-muted-foreground mb-3" />
                                        <p className="text-sm text-muted-foreground">
                                            <span className="font-medium text-green-700">Click to upload</span> or drag files here
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            PDF, JPG, JPEG, PNG — Max 10MB
                                        </p>

                                        {/* Hidden input */}
                                        <input
                                            id="business-upload"
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            multiple
                                            className="hidden"
                                            onChange={(e) => handleFilesChange(e, setBusinessFiles, field.onChange)}
                                        />
                                    </div>
                                </FormControl>

                                <FormMessage />

                                {/* File list */}
                                {businessFiles.length > 0 && (
                                    <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground">
                                        {businessFiles.map((name, i) => (
                                            <li key={i}>{name}</li>
                                        ))}
                                    </ul>
                                )}
                            </FormItem>
                        )}
                    />


                    <FormField
                        control={form.control}
                        name="complianceDocumentation"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Compliance Documentation (Optional)</FormLabel>
                                <FormControl>
                                    <div
                                        className="
                                            border border-dashed rounded-xl p-6
                                            flex flex-col items-center justify-center
                                            hover:bg-muted/50 transition cursor-pointer
                                            text-center
                                        "
                                        onClick={() => document.getElementById("compliance-upload")?.click()}
                                    >
                                        <Upload className="w-8 h-8 text-muted-foreground mb-3" />
                                        <p className="text-sm text-muted-foreground">
                                            <span className="font-medium text-green-700">Click to upload</span> or drag files here
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            PDF, JPG, JPEG, PNG — Max 10MB
                                        </p>
                                        <input
                                            id="compliance-upload"
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            multiple
                                            onChange={(e) => handleFilesChange(e, setComplianceFiles, field.onChange)}
                                            className="hidden"
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                                {complianceFiles.length > 0 && (
                                    <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground">
                                        {complianceFiles.map((name, i) => (
                                            <li key={i}>{name}</li>
                                        ))}
                                    </ul>
                                )}
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="backgroundCheckConsent"
                        render={({ field }) => (
                            <FormItem className="flex items-center space-x-3">
                                <FormControl>
                                    <input
                                        type="checkbox"
                                        checked={field.value}
                                        onChange={(e) => field.onChange(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-green-700 focus:ring-primary"
                                    />
                                </FormControl>
                                <FormLabel className="flex-1 cursor-pointer">
                                    I consent to a background check
                                </FormLabel>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onBack} className="flex-1" size="lg" disabled={isLoading}>
                            Back
                        </Button>
                        <Button type="submit" className="flex-1" size="lg" disabled={isLoading}>
                            {isLoading ? "Submitting..." : "Complete"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
