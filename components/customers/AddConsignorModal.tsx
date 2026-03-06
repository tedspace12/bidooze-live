import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import type { ConsignorCreatePayload } from "@/features/customers/services/customerService";

const getErrorMessage = (error: unknown): string => {
  if (!error || typeof error !== "object") return "Failed to create consignor.";
  const message = (error as { message?: unknown }).message;
  if (typeof message === "string" && message.trim()) return message;
  const nested = (error as { error?: { message?: unknown } }).error?.message;
  if (typeof nested === "string" && nested.trim()) return nested;
  return "Failed to create consignor.";
};

interface AddConsignorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddConsignor: (payload: ConsignorCreatePayload) => void | Promise<void>;
}

export function AddConsignorModal({
  open,
  onOpenChange,
  onAddConsignor,
}: AddConsignorModalProps) {
  const [step, setStep] = useState<"basic" | "review">("basic");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    avatar_url: "",
    commissionPercent: "15",
    account_holder: "",
    account_number: "",
    routing_number: "",
    bank_name: "",
  });

  const handleBasicInfoChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toOptional = (value: string) => {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  };

  const handleValidateBasicInfo = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.commissionPercent) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!formData.email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    const commissionPercent = Number(formData.commissionPercent);
    if (!Number.isFinite(commissionPercent) || commissionPercent < 0 || commissionPercent > 100) {
      toast.error("Commission rate must be between 0 and 100");
      return;
    }
    setStep("review");
  };

  const handleSubmit = async () => {
    const commissionPercent = Number(formData.commissionPercent);
    const payload: ConsignorCreatePayload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      commission_rate: Math.max(0, Math.min(1, commissionPercent / 100)),
      address: toOptional(formData.address),
      avatar_url: toOptional(formData.avatar_url),
      account_holder: toOptional(formData.account_holder),
      account_number: toOptional(formData.account_number),
      routing_number: toOptional(formData.routing_number),
      bank_name: toOptional(formData.bank_name),
    };

    try {
      await onAddConsignor(payload);
      toast.success(`${formData.name} created successfully.`);

      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        avatar_url: "",
        commissionPercent: "15",
        account_holder: "",
        account_number: "",
        routing_number: "",
        bank_name: "",
      });
      setStep("basic");
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleStepChange = (value: string) => {
    if (value === "basic" || value === "review") {
      setStep(value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Consignor</DialogTitle>
          <DialogDescription>Register a new seller profile.</DialogDescription>
        </DialogHeader>

        <Tabs value={step} onValueChange={handleStepChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="review" disabled={step !== "review"}>
              Review
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="company" className="font-medium text-foreground">
                  Name *
                </Label>
                <Input
                  id="company"
                  placeholder="e.g., Estate Seller LLC"
                  value={formData.name}
                  onChange={(e) => handleBasicInfoChange("name", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="email" className="font-medium text-foreground">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="sarah@company.com"
                    value={formData.email}
                    onChange={(e) => handleBasicInfoChange("email", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="font-medium text-foreground">
                    Phone *
                  </Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => handleBasicInfoChange("phone", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="commission" className="font-medium text-foreground">
                  Commission Rate (%) *
                </Label>
                <Input
                  id="commission"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="15"
                  value={formData.commissionPercent}
                  onChange={(e) => handleBasicInfoChange("commissionPercent", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="address" className="font-medium text-foreground">
                  Address (Optional)
                </Label>
                <Input
                  id="address"
                  placeholder="123 Main St, Austin, TX"
                  value={formData.address}
                  onChange={(e) => handleBasicInfoChange("address", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="avatar-url" className="font-medium text-foreground">
                  Avatar URL (Optional)
                </Label>
                <Input
                  id="avatar-url"
                  placeholder="https://cdn.example.com/avatar.jpg"
                  value={formData.avatar_url}
                  onChange={(e) => handleBasicInfoChange("avatar_url", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="space-y-3 rounded-lg border border-border p-3">
                <p className="text-sm font-medium text-foreground">Bank Account (Optional at Create)</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="account-holder" className="font-medium text-foreground">
                      Account Holder
                    </Label>
                    <Input
                      id="account-holder"
                      value={formData.account_holder}
                      onChange={(e) => handleBasicInfoChange("account_holder", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bank-name" className="font-medium text-foreground">
                      Bank Name
                    </Label>
                    <Input
                      id="bank-name"
                      value={formData.bank_name}
                      onChange={(e) => handleBasicInfoChange("bank_name", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="account-number" className="font-medium text-foreground">
                      Account Number
                    </Label>
                    <Input
                      id="account-number"
                      value={formData.account_number}
                      onChange={(e) => handleBasicInfoChange("account_number", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="routing-number" className="font-medium text-foreground">
                      Routing Number
                    </Label>
                    <Input
                      id="routing-number"
                      value={formData.routing_number}
                      onChange={(e) => handleBasicInfoChange("routing_number", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleValidateBasicInfo} className="w-full">
                Review and Create
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="review" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Consignor Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium">{formData.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{formData.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium">{formData.phone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Commission Rate</p>
                    <p className="font-medium">{formData.commissionPercent}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Address</p>
                    <p className="font-medium">{formData.address || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avatar URL</p>
                    <p className="font-medium truncate">{formData.avatar_url || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Account Holder</p>
                    <p className="font-medium">{formData.account_holder || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Bank Name</p>
                    <p className="font-medium">{formData.bank_name || "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("basic")} className="flex-1">
                Back
              </Button>
              <Button onClick={handleSubmit} className="flex-1">
                Submit and Create Consignor
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
