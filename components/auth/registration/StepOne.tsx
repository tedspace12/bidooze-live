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

  const [companyName, registerationNumber, tin, businessType, yearsInBusiness] = form.watch([
    "companyName", "registerationNumber", "tin", "businessType", "yearsInBusiness",
  ]);
  const canSubmit = !isLoading &&
    !!companyName?.trim() &&
    !!registerationNumber?.trim() &&
    !!tin?.trim() &&
    !!businessType?.trim() &&
    !!yearsInBusiness?.trim();

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                const addMultiple = (raw: string) => {
                  const items = raw
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  const existing: string[] = field.value || [];
                  const next = [
                    ...existing,
                    ...items.filter((s) => !existing.includes(s)),
                  ];
                  if (next.length !== existing.length) field.onChange(next);
                  setSpecializationInput("");
                };

                return (
                  <FormItem>
                    <FormLabel>Industry / Specialization</FormLabel>

                    <FormControl>
                      <div
                        className="flex flex-wrap gap-1.5 border rounded-md p-2 min-h-[42px] cursor-text"
                        onClick={(e) => {
                          const input = (e.currentTarget as HTMLElement).querySelector("input");
                          input?.focus();
                        }}
                      >
                        {(field.value || []).map((item: string, index: number) => (
                          <span
                            key={`${item}-${index}`}
                            className="flex items-center gap-1 bg-secondary text-secondary-foreground py-0.5 px-2 rounded text-xs font-medium"
                          >
                            {item}
                            <button
                              type="button"
                              onClick={() => removeValue(index)}
                              className="text-muted-foreground hover:text-foreground leading-none ml-0.5"
                              aria-label={`Remove ${item}`}
                            >
                              x
                            </button>
                          </span>
                        ))}

                        <input
                          value={specializationInput}
                          placeholder={(field.value || []).length === 0 ? "e.g. Real Estate, Jewelry, Tech" : ""}
                          className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                          onChange={(e) => {
                            const val = e.target.value;
                            // Auto-confirm when user types a comma
                            if (val.endsWith(",")) {
                              addMultiple(val);
                            } else {
                              setSpecializationInput(val);
                            }
                          }}
                          onBlur={() => {
                            if (specializationInput.trim()) addMultiple(specializationInput);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (specializationInput.trim()) addMultiple(specializationInput);
                            }
                            if (e.key === "Backspace" && !specializationInput && (field.value || []).length > 0) {
                              removeValue((field.value || []).length - 1);
                            }
                          }}
                          onPaste={(e) => {
                            const pasted = e.clipboardData.getData("text");
                            if (pasted.includes(",")) {
                              e.preventDefault();
                              addMultiple(specializationInput + pasted);
                            }
                          }}
                        />
                      </div>
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Press <kbd className="px-1 py-0.5 rounded bg-muted text-[10px]">Enter</kbd> or type a comma to add each specialization
                    </p>
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

          <Button type="submit" className="w-full h-12 md:h-10" size="lg" disabled={!canSubmit}>
            {isLoading ? "Submitting..." : "Next"}
          </Button>
        </form>
      </Form>
    </div>
  );
};
