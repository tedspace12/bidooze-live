'use client';
import { useRef, useState } from "react";
import { FilePlus, Copy, ArrowLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LinearTabs } from "@/components/auction/LinearTabs";
import { SelectionCard } from "@/components/auction/SelectionCard";
import { FormInput } from "@/components/auction/FormInput";
import { FormSelect } from "@/components/auction/FormSelect";
import { CopyOptionsAccordion } from "@/components/auction/CopyOptionsAccordion";
import { PremiumButton } from "@/components/auction/PremiumButton";
import { DetailsTab } from "@/components/auction/PreAuction/DetailsTab";
import { UploadSettingsTab } from "@/components/auction/PreAuction/UploadSettingsTab";
import { PreviewTab } from "@/components/auction/PreAuction/PreviewTab";
import { LotsTab } from "@/components/auction/PreAuction/LotsTab";
import { LotImagesTab } from "@/components/auction/PreAuction/LotImagesTab";
import Link from "next/link";
import { useAuction } from "@/features/auction/hooks/useAuction";
import type { CreateAuctionLotInput, CreateAuctionPayload } from "@/features/auction/types";

type CreationType = "scratch" | "copy" | null;
type WizardStep = "pre-auction";
type PreAuctionTab = "details" | "upload" | "preview" | "lots" | "images";

const wizardSteps = [
  { id: "pre-auction", label: "PRE-AUCTION" },

];

const preAuctionTabs = [
  { id: "details", label: "Details" },
  { id: "upload", label: "Upload Settings" },
  { id: "lots", label: "Lots" },
  { id: "images", label: "Lot Images" },
  { id: "preview", label: "Preview" },
  
];

const mockAuctions = [
  { value: "auc-001", label: "Premium Estate Auction - Dec 2024" },
  { value: "auc-002", label: "Fine Art & Collectibles - Nov 2024" },
  { value: "auc-003", label: "Luxury Watches & Jewelry - Oct 2024" },
];

export default function CreateAuction() {
  const router = useRouter();
  const { createAuction } = useAuction();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [creationType, setCreationType] = useState<CreationType>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [activeWizardStep, setActiveWizardStep] = useState<WizardStep>("pre-auction");
  const [activePreAuctionTab, setActivePreAuctionTab] = useState<PreAuctionTab>("details");
  const [isSaving, setIsSaving] = useState(false);
  const [lotsPayload, setLotsPayload] = useState<CreateAuctionLotInput[]>([]);
  const [lotImages, setLotImages] = useState<Record<string, File[]>>({});
  
  const [copyOptions, setCopyOptions] = useState([
    { id: "commission", label: "Commission", checked: true },
    { id: "buyer-premium", label: "Buyer Premium", checked: true },
    { id: "tax", label: "Tax Settings", checked: true },
    { id: "terms", label: "Terms & Conditions", checked: true },
    { id: "bid-increments", label: "Bid Increments", checked: true },
    { id: "registration", label: "Registration Options", checked: true },
  ]);

  const handleCopyOptionChange = (id: string, checked: boolean) => {
    setCopyOptions(opts => opts.map(o => o.id === id ? { ...o, checked } : o));
  };

  const handleProceed = () => {
    if (creationType === "scratch") {
      // Validate scratch form if needed
      setShowWizard(true);
      toast.success("Starting auction setup", {
        description: "You can now configure your auction details.",
      });
    } else if (creationType === "copy") {
      // Validate copy form if needed
      setShowWizard(true);
      toast.success("Copying auction settings", {
        description: "Settings from the selected auction will be applied.",
      });
    }
  };

  const handleSaveAndContinue = async () => {
    if (!formRef.current) return;

    const fd = new FormData(formRef.current);

    const featureImage = fd.get("feature_image") as File | null;
    if (!featureImage) {
      toast.error("Please select a feature image for the auction.");
      return;
    }

    const num = (name: string): number | undefined => {
      const v = fd.get(name) as string | null;
      if (!v) return undefined;
      const parsed = parseFloat(v);
      return isNaN(parsed) ? undefined : parsed;
    };

    const bool = (name: string): boolean | undefined => {
      const v = fd.get(name);
      if (v === null) return undefined;
      // For checkboxes, presence means true
      return true;
    };

    const text = (name: string): string | undefined => {
      const v = fd.get(name) as string | null;
      return v || undefined;
    };

    const code = text("code");
    const name = text("name");
    const auction_start_at = text("auction_start_at");
    const auction_end_at = text("auction_end_at");
    const timezone = text("timezone") || "America/New_York";
    const currency = text("currency") || "USD";

    if (!code || !name || !auction_start_at || !auction_end_at) {
      toast.error("Please fill in the required fields: code, name, auction dates.");
      return;
    }

    const payload: CreateAuctionPayload = {
      code,
      name,
      description: text("description"),
      auction_start_at,
      auction_end_at,
      preview_start_at: text("preview_start_at"),
      preview_end_at: text("preview_end_at"),
      checkout_start_at: text("checkout_start_at"),
      checkout_end_at: text("checkout_end_at"),
      timezone,

      address_line_1: text("address_line_1"),
      address_line_2: text("address_line_2"),
      city: text("city"),
      state: text("state"),
      zip_code: text("zip_code"),
      country: text("country"),

      currency,
      commission_percentage: num("commission_percentage"),
      buyer_premium_percentage: num("buyer_premium_percentage"),
      buyer_tax_percentage: num("buyer_tax_percentage"),
      seller_tax_percentage: num("seller_tax_percentage"),
      buyer_lot_charge_1: num("buyer_lot_charge_1"),
      buyer_lot_charge_2: num("buyer_lot_charge_2"),
      minimum_bid_amount: num("minimum_bid_amount"),
      tax_exempt_all: bool("tax_exempt_all"),

      shipping_availability: text("shipping_availability"),
      shipping_account: text("shipping_account"),
      add_handling_charges: bool("add_handling_charges"),
      handling_charge_type: text("handling_charge_type"),
      handling_charge_amount: num("handling_charge_amount"),

      bidding_type: text("bidding_type") || "timed",
      bid_type: text("bid_type") || "standard",
      bid_amount_type: text("bid_amount_type") || "increment",
      soft_close_seconds: num("soft_close_seconds"),
      lot_stagger_seconds: num("lot_stagger_seconds"),
      show_immediate_bid_states: bool("show_immediate_bid_states"),
      times_the_money_bidding: bool("times_the_money_bidding"),
      show_bid_reserve_states: bool("show_bid_reserve_states"),

      require_credit_card_registration: bool("require_credit_card_registration"),
      bidder_authentication: text("bidder_authentication"),
      authentication_required_hours: num("authentication_required_hours"),
      successful_bidder_registration_option: text("successful_bidder_registration_option"),
      starting_bid_card_number: text("starting_bid_card_number"),
      max_amount_per_item: num("max_amount_per_item"),

      terms_and_conditions: text("terms_and_conditions"),
      bp_explanation: text("bp_explanation"),
      payment_information: text("payment_information"),
      shipping_pickup_info: text("shipping_pickup_info"),
      bidding_notice: text("bidding_notice"),
      auction_notice: text("auction_notice"),
      short_bp_explanation: text("short_bp_explanation"),

      accept_mastercard: bool("accept_mastercard"),
      accept_visa: bool("accept_visa"),
      accept_amex: bool("accept_amex"),
      accept_discover: bool("accept_discover"),

      auction_links: [], // Could be added from DetailsTab state if needed

      email_subject: text("email_subject"),
      email_body: text("email_body"),

      lots: lotsPayload,
      feature_image: featureImage,
      lot_images: Object.keys(lotImages).length > 0 ? lotImages : undefined,
    };

    try {
      setIsSaving(true);
      const created = await createAuction.mutateAsync(payload);
      if (created && created.id) {
        toast.success("Auction created successfully");
        router.push("/dashboard");
      } else {
        toast.error("Auction creation failed");
      }
    } catch (error: any) {
      const message =
        error?.message || error?.response?.data?.message || "Failed to create auction";
      if (error?.errors) {
        Object.values(error.errors)
          .flat()
          .forEach((msg: any) => toast.error(String(msg)));
      } else {
        toast.error(message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const renderPreAuctionContent = () => {
    switch (activePreAuctionTab) {
      case "details": return <DetailsTab />;
      case "upload": return <UploadSettingsTab />;
      case "preview": return <PreviewTab />;
      case "lots": return <LotsTab />;
      case "images": return <LotImagesTab />;

      default: return <DetailsTab />;
    }
  };

  if (!showWizard) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="p-2 -ml-2 hover:bg-accent rounded-lg transition-colors">
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Create New Auction</h1>
                <p className="text-sm text-muted-foreground">Set up your auction from scratch or copy from existing</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Create from Scratch */}
            <SelectionCard
              icon={FilePlus}
              title="Create Auction From Scratch"
              subtitle="Full manual setup with fresh configuration"
              isActive={creationType === "scratch"}
              onClick={() => setCreationType("scratch")}
            >
              <div className="space-y-4">
                <FormInput label="Auction Name" placeholder="Enter auction name" />
                <div className="grid grid-cols-2 gap-4">
                  <FormInput label="Start Date" type="datetime-local" />
                  <FormInput label="End Date" type="datetime-local" />
                </div>
              </div>
            </SelectionCard>

            {/* Copy Auction */}
            <SelectionCard
              icon={Copy}
              title="Copy an Existing Auction"
              subtitle="Duplicate settings from previous auctions"
              isActive={creationType === "copy"}
              onClick={() => setCreationType("copy")}
            >
              <div className="space-y-4">
                <FormSelect
                  label="Select Auction to Copy"
                  options={mockAuctions}
                  placeholder="Choose an auction..."
                />
                <CopyOptionsAccordion
                  options={copyOptions}
                  onOptionChange={handleCopyOptionChange}
                />
                <p className="text-xs text-muted-foreground italic">
                  * All other auction settings will be copied to the new Auction
                </p>
              </div>
            </SelectionCard>
          </div>

          {/* Proceed Button */}
          {creationType && (
            <div className="mt-10 flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
              <PremiumButton size="lg" onClick={handleProceed}>
                Continue to Setup
                <ChevronRight className="ml-2 h-5 w-5" />
              </PremiumButton>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Wizard */}
      <header className="sticky top-0 z-50 bg-background">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowWizard(false)}
                className="p-2 -ml-2 hover:bg-accent rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">New Auction Setup</h1>
                <p className="text-sm text-muted-foreground">Pre-Auction Setup: Configure your auction settings</p>
              </div>
            </div>
            <PremiumButton onClick={handleSaveAndContinue} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save & Continue"}
            </PremiumButton>
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <form ref={formRef} className="space-y-8">
          {activeWizardStep === "pre-auction" && (
            <>
              <LinearTabs
                tabs={preAuctionTabs}
                activeTab={activePreAuctionTab}
                onTabChange={(id) => setActivePreAuctionTab(id as PreAuctionTab)}
                className="mb-8"
              />
              {activePreAuctionTab === "details" && <DetailsTab />}
              {activePreAuctionTab === "upload" && <UploadSettingsTab />}
              {activePreAuctionTab === "lots" && (
                <LotsTab
                  onLotsChange={(lots) => setLotsPayload(lots)}
                  onLotImagesChange={(index, files) => {
                    setLotImages((prev) => ({
                      ...prev,
                      [index]: files,
                    }));
                  }}
                />
              )}
              {activePreAuctionTab === "images" && <LotImagesTab />}
              {activePreAuctionTab === "preview" && <PreviewTab />}
            </>
          )}
        </form>


      </main>
    </div>
  );
}
