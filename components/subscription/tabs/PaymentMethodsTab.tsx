"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CreditCard, Plus, Star, Trash2, Loader2 } from "lucide-react";
import {
  usePaymentMethods,
  useAddPaymentMethod,
  useSetDefaultPaymentMethod,
  useDeletePaymentMethod,
} from "@/features/subscription/hooks/useSubscription";

// ─── Card type icon ────────────────────────────────────────────────────────────

function CardBrand({ type }: { type: string }) {
  const t = type.toLowerCase();
  return (
    <div className="flex h-9 w-14 items-center justify-center rounded border bg-muted text-xs font-bold uppercase tracking-wide text-muted-foreground">
      {t === "visa" ? "VISA" : t === "mastercard" ? "MC" : t === "verve" ? "VRV" : <CreditCard className="h-4 w-4" />}
    </div>
  );
}

// ─── Add card form ─────────────────────────────────────────────────────────────

const addCardSchema = z.object({
  card_number: z.string().min(13, "Invalid card number").max(19, "Invalid card number").regex(/^\d+$/, "Digits only"),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use MM/YY format"),
  cvv: z.string().min(3).max(4).regex(/^\d+$/, "Digits only"),
  card_holder_name: z.string().trim().min(2, "Name is required"),
  set_default: z.boolean(),
});

type AddCardFields = z.infer<typeof addCardSchema>;

function AddCardForm({ onClose }: { onClose: () => void }) {
  const addMethod = useAddPaymentMethod();

  const form = useForm<AddCardFields>({
    resolver: zodResolver(addCardSchema),
    defaultValues: {
      card_number: "",
      expiry: "",
      cvv: "",
      card_holder_name: "",
      set_default: false,
    },
  });

  const handleSubmit = async (values: AddCardFields) => {
    const [month, year] = values.expiry.split("/");
    await addMethod.mutateAsync(
      {
        card_number: values.card_number.replace(/\s/g, ""),
        cvv: values.cvv,
        expiry_month: month,
        expiry_year: year,
        card_holder_name: values.card_holder_name,
        provider: "",
        set_default: values.set_default,
      },
      { onSuccess: () => { onClose(); form.reset(); } }
    );
  };

  // Format card number as groups of 4
  const formatCardNumber = (val: string) =>
    val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  // Format expiry as MM/YY
  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const [cardNumber, expiryVal, cvv, name] = useWatch({
    control: form.control,
    name: ["card_number", "expiry", "cvv", "card_holder_name"],
  });
  const canSubmit = !addMethod.isPending && !!cardNumber && !!expiryVal && !!cvv && !!name;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="card_holder_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cardholder Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="card_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Card Number</FormLabel>
              <FormControl>
                <Input
                  placeholder="1234 5678 9012 3456"
                  inputMode="numeric"
                  value={formatCardNumber(field.value)}
                  onChange={(e) => field.onChange(e.target.value.replace(/\s/g, ""))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="expiry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expiry (MM/YY)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="MM/YY"
                    inputMode="numeric"
                    value={field.value}
                    onChange={(e) => field.onChange(formatExpiry(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cvv"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CVV</FormLabel>
                <FormControl>
                  <Input
                    placeholder="123"
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    {...field}
                    onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ""))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="set_default"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <Label className="cursor-pointer !mt-0">Set as default payment method</Label>
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={!canSubmit}>
            {addMethod.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Save Card"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// ─── Main tab ─────────────────────────────────────────────────────────────────

export function PaymentMethodsTab() {
  const { data: methods, isLoading } = usePaymentMethods();
  const setDefault = useSetDefaultPaymentMethod();
  const deleteMethod = useDeletePaymentMethod();
  const [addOpen, setAddOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Saved Cards</h3>
          <p className="text-sm text-muted-foreground">
            Cards saved for auto-renew and future payments.
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Card
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
            </DialogHeader>
            <AddCardForm onClose={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {!methods?.length ? (
        <Card className="py-10 text-center">
          <CardContent className="space-y-3">
            <CreditCard className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No saved payment methods.</p>
            <Button size="sm" variant="outline" onClick={() => setAddOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Add your first card
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {methods.map((method) => (
            <Card key={method.id} className={method.is_default ? "border-green-600 border-2" : ""}>
              <CardContent className="flex items-center gap-4 p-4">
                <CardBrand type={method.card_type} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{method.label}</p>
                    {method.is_default && (
                      <Badge className="bg-green-600 hover:bg-green-600 text-xs gap-1">
                        <Star className="h-2.5 w-2.5 fill-current" />Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {method.bank} · Added {new Date(method.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!method.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={setDefault.isPending}
                      onClick={() => setDefault.mutate(method.id)}
                    >
                      Set Default
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        disabled={deleteMethod.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove payment method?</AlertDialogTitle>
                        <AlertDialogDescription>
                          {method.label} will be removed. This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive hover:bg-destructive/90"
                          onClick={() => deleteMethod.mutate(method.id)}
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
