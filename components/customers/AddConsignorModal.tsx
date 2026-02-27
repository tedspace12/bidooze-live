import { useRef, useState } from "react";
import { Consignor, KYCDocument } from "@/data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

interface AddConsignorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddConsignor: (consignor: Consignor) => void;
}

export function AddConsignorModal({
  open,
  onOpenChange,
  onAddConsignor,
}: AddConsignorModalProps) {
  const [step, setStep] = useState<"basic" | "kyc" | "review">("basic");
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    commission: "15",
  });
  const [kycDocuments, setKycDocuments] = useState<KYCDocument[]>([]);
  const idCounterRef = useRef(0);

  const nextId = (prefix: string) => {
    idCounterRef.current += 1;
    return `${prefix}-${idCounterRef.current}`;
  };

  const handleBasicInfoChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    docType: KYCDocument["type"]
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    const doc: KYCDocument = {
      id: nextId("kyc"),
      type: docType,
      fileName: file.name,
      uploadedAt: new Date(),
      status: "pending",
    };

    setKycDocuments((prev) => [...prev, doc]);
    toast.success(`${file.name} uploaded successfully`);
  };

  const handleRemoveDocument = (docId: string) => {
    setKycDocuments((prev) => prev.filter((doc) => doc.id !== docId));
  };

  const handleValidateBasicInfo = () => {
    if (
      !formData.companyName ||
      !formData.contactName ||
      !formData.email ||
      !formData.phone
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!formData.email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setStep("kyc");
  };

  const handleValidateKYC = () => {
    if (kycDocuments.length === 0) {
      toast.error("Please upload at least one KYC document");
      return;
    }
    setStep("review");
  };

  const handleSubmit = () => {
    const newConsignor: Consignor = {
      id: nextId("csg"),
      companyName: formData.companyName,
      contactName: formData.contactName,
      email: formData.email,
      phone: formData.phone,
      avatar: undefined,
      status: "pending",
      tags: ["new"],
      itemsCount: 0,
      totalValue: 0,
      commission: `${formData.commission}%`,
      joinDate: new Date(),
      kycStatus: "pending",
      kycDocuments: kycDocuments,
      currentBalance: 0,
      outstandingPayments: 0,
      items: [],
      payments: [],
      notes: [
        {
          id: nextId("note"),
          text: `Consignor added by auctioneer. KYC documents submitted for review.`,
          createdAt: new Date(),
          createdBy: "Auctioneer",
        },
      ],
    };

    onAddConsignor(newConsignor);
    toast.success(
      `${formData.companyName} added successfully! Awaiting KYC verification.`
    );

    // Reset form
    setFormData({
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      commission: "15",
    });
    setKycDocuments([]);
    setStep("basic");
    onOpenChange(false);
  };

  const docTypes: Array<{ value: KYCDocument["type"]; label: string }> = [
    { value: "id", label: "Government ID" },
    { value: "proof-of-address", label: "Proof of Address" },
    { value: "business-license", label: "Business License" },
    { value: "tax-id", label: "Tax ID / EIN" },
  ];

  const handleStepChange = (value: string) => {
    if (value === "basic" || value === "kyc" || value === "review") {
      setStep(value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Consignor</DialogTitle>
          <DialogDescription>
            Register a new seller and collect KYC verification documents
          </DialogDescription>
        </DialogHeader>

        <Tabs value={step} onValueChange={handleStepChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="kyc" disabled={step === "basic"}>
              KYC Documents
            </TabsTrigger>
            <TabsTrigger value="review" disabled={step !== "review"}>
              Review
            </TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="company" className="text-foreground font-medium">
                  Company Name *
                </Label>
                <Input
                  id="company"
                  placeholder="e.g., Vintage Collectibles Co."
                  value={formData.companyName}
                  onChange={(e) =>
                    handleBasicInfoChange("companyName", e.target.value)
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="contact" className="text-foreground font-medium">
                  Contact Name *
                </Label>
                <Input
                  id="contact"
                  placeholder="e.g., Sarah Mitchell"
                  value={formData.contactName}
                  onChange={(e) =>
                    handleBasicInfoChange("contactName", e.target.value)
                  }
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-foreground font-medium">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="sarah@company.com"
                    value={formData.email}
                    onChange={(e) =>
                      handleBasicInfoChange("email", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-foreground font-medium">
                    Phone *
                  </Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) =>
                      handleBasicInfoChange("phone", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="commission" className="text-foreground font-medium">
                  Commission Rate (%) *
                </Label>
                <Input
                  id="commission"
                  type="number"
                  min="0"
                  max="50"
                  placeholder="15"
                  value={formData.commission}
                  onChange={(e) =>
                    handleBasicInfoChange("commission", e.target.value)
                  }
                  className="mt-1"
                />
              </div>

              <Button onClick={handleValidateBasicInfo} className="w-full">
                Continue to KYC Documents
              </Button>
            </div>
          </TabsContent>

          {/* KYC Documents Tab */}
          <TabsContent value="kyc" className="space-y-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Upload KYC verification documents. All documents must be clear
                and legible.
              </p>

              {docTypes.map((docType) => (
                <Card key={docType.value}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{docType.label}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {kycDocuments.find((d) => d.type === docType.value) ? (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <div>
                            <p className="text-sm font-medium">
                              {
                                kycDocuments.find((d) => d.type === docType.value)
                                  ?.fileName
                              }
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Status: Pending Review
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const doc = kycDocuments.find(
                              (d) => d.type === docType.value
                            );
                            if (doc) handleRemoveDocument(doc.id);
                          }}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/30 transition-colors">
                        <Upload className="w-5 h-5 text-muted-foreground mb-2" />
                        <span className="text-sm font-medium text-foreground">
                          Click to upload
                        </span>
                        <span className="text-xs text-muted-foreground">
                          PDF, JPG, or PNG (max 5MB)
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e, docType.value)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </CardContent>
                </Card>
              ))}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep("basic")}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button onClick={handleValidateKYC} className="flex-1">
                  Review Submission
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Review Tab */}
          <TabsContent value="review" className="space-y-4">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Consignor Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground">Company Name</p>
                      <p className="font-medium">{formData.companyName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Contact Name</p>
                      <p className="font-medium">{formData.contactName}</p>
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
                      <p className="font-medium">{formData.commission}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className="font-medium text-yellow-600">Pending</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">KYC Documents</CardTitle>
                  <CardDescription>
                    {kycDocuments.length} document(s) submitted for review
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {kycDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2 bg-muted/30 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-yellow-600" />
                          <div>
                            <p className="text-sm font-medium">{doc.fileName}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.type.replace("-", " ")} • Pending Review
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Next Steps:</strong> Once submitted, our team will
                  review the KYC documents. The consignor will receive an email
                  notification upon approval or if additional documents are
                  needed.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep("kyc")}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button onClick={handleSubmit} className="flex-1">
                  Submit & Create Consignor
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
