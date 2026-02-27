import { useState } from "react";
import { useForm } from "react-hook-form";
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

const stepOneSchema = z.object({
  companyName: z.string().trim().min(1, "First name is required").max(50),
  registerationNumber: z.string().trim().min(1, "Registeration number is required").max(50),
  tin: z.string().trim().min(1, "Tax identification number is required").max(50),
  businessType: z.string().trim().min(10, "Invalid mobile number").max(15),
  specialization: z.array(z.string().trim().max(255)),
  yearsInBusiness: z.string().min(1, "Years in bussiness"),
});

export type StepOneData = z.infer<typeof stepOneSchema>;

interface StepOneProps {
  onNext: (data: StepOneData) => void;
  defaultValues?: StepOneData;
  isLoading?: boolean;
}

export const StepOne = ({ onNext, defaultValues, isLoading }: StepOneProps) => {
  const [specializationInput, setSpecializationInput] = useState("");

  const form = useForm<StepOneData>({
    resolver: zodResolver(stepOneSchema),
    defaultValues: defaultValues || {
      companyName: "",
      registerationNumber: "",
      tin: "",
      businessType: "",
      specialization: [],
      yearsInBusiness: "",
    },
  });

  return (
    <div className="max-w-3xl w-full">
      <div className="mb-8">
        <p className="text-muted-foreground text-sm mb-2">Step 1/5</p>
        <h2 className="text-3xl font-bold text-foreground mb-3">Company Info</h2>
        <p className="text-muted-foreground">
          Help us understand your company better to customize your experience.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input placeholder="Acme Corporation" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="registerationNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business registration number</FormLabel>
                  <FormControl>
                    <Input placeholder="123456789.." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax identification number (TIN)</FormLabel>
                  <FormControl>
                    <Input placeholder="123456789.." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="businessType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business type </FormLabel>
                <FormControl>
                  <Input placeholder="Corporation, LLC, Sole Proprietor, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="specialization"
              render={({ field }) => {
                const addValue = (value: string) => {
                  const trimmed = value.trim();
                  if (!trimmed) return;
                  if (field.value?.includes(trimmed)) return;

                  field.onChange([...(field.value || []), trimmed]);
                  setSpecializationInput("");
                };

                const removeValue = (index: number) => {
                  const updated = (field.value || []).filter((_, i) => i !== index);
                  field.onChange(updated);
                };

                return (
                  <FormItem>
                    <FormLabel>Industry / Specialization</FormLabel>

                    <FormControl>
                      <div className="flex flex-wrap gap-2 border rounded-md p-1">
                        {(field.value || []).map((item: string, index: number) => (
                          <span
                            key={`${item}-${index}`}
                            className="flex items-center gap-1 bg-muted py-0.5 px-2 rounded-md text-xs"
                          >
                            {item}
                            <button
                              type="button"
                              onClick={() => removeValue(index)}
                              className="text-xs text-red-500"
                            >
                              x
                            </button>
                          </span>
                        ))}

                        <Input
                          value={specializationInput}
                          placeholder="e.g Jewelry, Fashion, Tech"
                          className="border-none flex-1 focus-visible:ring-0 shadow-none"
                          onChange={(e) => setSpecializationInput(e.target.value)}
                          onBlur={() => addValue(specializationInput)}
                          onKeyDown={(e) => {
                            if (e.key === " " || e.key === "Enter") {
                              e.preventDefault();
                              addValue(specializationInput);
                            }
                          }}
                        />
                      </div>
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="yearsInBusiness"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years in business</FormLabel>
                  <FormControl>
                    <Input placeholder="4" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Next"}
          </Button>
        </form>
      </Form>
    </div>
  );
};
