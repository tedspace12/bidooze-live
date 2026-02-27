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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const stepThreeSchema = z.object({
  bankName: z.string().trim().min(1, "Bank name is required"),
  accountHolderName: z.string().trim().min(1, "Account holder name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  routingNumber: z.string().min(1, "Routing number is required"),
  accountType: z.string().min(1, "Please select an account type"),
});

export type StepThreeData = z.infer<typeof stepThreeSchema>;

interface StepThreeProps {
  onNext: (data: StepThreeData) => void;
  onBack: () => void;
  defaultValues?: StepThreeData;
  isLoading?: boolean;
  registrationToken?: string | null;
}

export const StepThree = ({ onNext, onBack, defaultValues, isLoading }: StepThreeProps) => {
  const form = useForm<StepThreeData>({
    resolver: zodResolver(stepThreeSchema),
    defaultValues: defaultValues || {
      bankName: "",
      accountHolderName: "",
      accountNumber: "",
      routingNumber: "",
      accountType: "",
    },
  });

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

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="accountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account number</FormLabel>
                  <FormControl>
                    <Input placeholder="0123456789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="routingNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Routing number</FormLabel>
                  <FormControl>
                    <Input placeholder="110000000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="accountType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account type</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="business_checking">Business Checking</SelectItem>
                        <SelectItem value="business_savings">Business Savings</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1" size="lg" disabled={isLoading}>
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
};
