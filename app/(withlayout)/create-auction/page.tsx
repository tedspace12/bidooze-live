'use client';

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Copy, FilePlus, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LinearTabs } from "@/components/auction/LinearTabs";
import { SelectionCard } from "@/components/auction/SelectionCard";
import { FormInput } from "@/components/auction/FormInput";
import { FormSelect } from "@/components/auction/FormSelect";
import { CopyOptionsAccordion } from "@/components/auction/CopyOptionsAccordion";
import { PremiumButton } from "@/components/auction/PremiumButton";
import { DateTimePicker } from "@/components/auction/DateTimePicker";
import { DetailsTab } from "@/components/auction/PreAuction/DetailsTab";
import { UploadSettingsTab } from "@/components/auction/PreAuction/UploadSettingsTab";
import { LotsTab } from "@/components/auction/PreAuction/LotsTab";
import { LotImagesTab } from "@/components/auction/PreAuction/LotImagesTab";
import { PreviewTab } from "@/components/auction/PreAuction/PreviewTab";
import { WizardShell } from "@/components/auction/WizardShell";
import { useAuction } from "@/features/auction/hooks/useAuction";
import { AuctionFormProvider, useAuctionForm } from "@/context/auction-form-context";
import type { CreateAuctionPayload, Auction } from "@/features/auction/types";
import { detectUserTimezone } from "@/lib/timezones";
import { validateTab, getTabFieldErrors, getTabStatus, type WizardTabId } from "@/utils/auctionWizardValidation";

type CreationType = "scratch" | "copy" | null;
type WizardStepId = WizardTabId;

type CopyableAuctionSource = {
  name?: string;
  code?: string;
  commission_percentage?: number;
  buyer_premium_percentage?: number;
  short_bp_explanation?: string;
  buyer_tax_percentage?: number;
  seller_tax_percentage?: number;
  tax_exempt_all?: boolean;
  terms_and_conditions?: string;
  payment_information?: string;
  shipping_pickup_info?: string;
  bidding_notice?: string;
  auction_notice?: string;
  soft_close_seconds?: number;
  lot_stagger_seconds?: number;
  bid_mechanism?: CreateAuctionPayload["bid_mechanism"];
  bid_amount_type?: CreateAuctionPayload["bid_amount_type"];
  force_bid_increment_schedule?: boolean;
  apply_bid_increment_per_item?: boolean;
  bid_increments?: CreateAuctionPayload["bid_increments"];
  require_credit_card_registration?: boolean;
  successful_bidder_registration_option?: CreateAuctionPayload["successful_bidder_registration_option"];
  deposit_type?: CreateAuctionPayload["deposit_type"];
  deposit_value?: number;
  deposit_cap?: number;
  deposit_policy?: CreateAuctionPayload["deposit_policy"];
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object") {
    const directMessage = (error as { message?: unknown }).message;
    if (typeof directMessage === "string" && directMessage.trim()) return directMessage;
    const responseMessage = (error as { response?: { data?: { message?: unknown } } }).response?.data?.message;
    if (typeof responseMessage === "string" && responseMessage.trim()) return responseMessage;
  }
  return fallback;
};

const getValidationMessages = (error: unknown): string[] => {
  if (!error || typeof error !== "object") return [];
  const errors = (error as { errors?: unknown }).errors;
  if (!errors || typeof errors !== "object") return [];

  return Object.values(errors as Record<string, unknown>).flatMap((value) => {
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === "string");
    }
    if (typeof value === "string") {
      return [value];
    }
    return [];
  });
};

const wizardSteps: { id: WizardStepId; label: string; description: string }[] = [
  { id: "details", label: "Details", description: "Basics, schedule, location" },
  { id: "upload", label: "Upload Settings", description: "Bidding, fees, registration" },
  { id: "lots", label: "Lots", description: "Create lots and pricing" },
  { id: "images", label: "Lot Images", description: "Upload lot images" },
  { id: "preview", label: "Preview", description: "Review & publish" },
];

interface CopyOption {
  id: string;
  label: string;
  checked: boolean;
}

const createInitialAttemptedSteps = (): Record<WizardStepId, boolean> => ({
  details: false,
  upload: false,
  lots: false,
  images: false,
  preview: false,
});

const formatAuctionOptionDate = (auction: Auction) => {
  const sourceDate = auction.auction_start_at || auction.auction_end_at || auction.created_at;
  const parsed = sourceDate ? new Date(sourceDate) : null;

  if (!parsed || Number.isNaN(parsed.getTime())) {
    return "No schedule";
  }

  return parsed.toLocaleDateString();
};

export default function CreateAuctionWrapper() {
  return (
    <AuctionFormProvider>
      <CreateAuction />
    </AuctionFormProvider>
  );
}

function CreateAuction() {
  const router = useRouter();
  const { createAuction, useMyAuctions, useAuctionById } = useAuction();
  const { formState, initializeFormState, resetFormState } = useAuctionForm();

  const [creationType, setCreationType] = useState<CreationType>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [activeStep, setActiveStep] = useState<WizardStepId>("details");
  const [attemptedSteps, setAttemptedSteps] = useState<Record<WizardStepId, boolean>>(createInitialAttemptedSteps);

  const [selectedAuctionId, setSelectedAuctionId] = useState<string>("");
  const [auctionOptions, setAuctionOptions] = useState<{ value: string; label: string }[]>([]);
  const [pendingCopy, setPendingCopy] = useState(false);

  const [setupWizardData, setSetupWizardData] = useState({
    auctionName: "",
    startDate: "",
    endDate: "",
  });

  const [copyOptions, setCopyOptions] = useState<CopyOption[]>([
    { id: "commission", label: "Commission", checked: true },
    { id: "buyer-premium", label: "Buyer Premium", checked: true },
    { id: "tax", label: "Tax Settings", checked: true },
    { id: "terms", label: "Terms & Conditions", checked: true },
    { id: "bid-increments", label: "Bid Increments", checked: true },
    { id: "registration", label: "Registration Options", checked: true },
  ]);

  const { data: myAuctions, isLoading: auctionsLoading } = useMyAuctions();
  const auctionByIdQuery = useAuctionById(selectedAuctionId);

  const activeIndex = wizardSteps.findIndex((step) => step.id === activeStep);
  const stepLabel = `Step ${activeIndex + 1} of ${wizardSteps.length}`;
  const isFinalStep = activeStep === "preview";

  useEffect(() => {
    if (myAuctions && myAuctions.length > 0) {
      const options = myAuctions.map((auction: Auction) => ({
        value: String(auction.id),
        label: `${auction.name} - ${formatAuctionOptionDate(auction)}`,
      }));
      setAuctionOptions(options);
    }
  }, [myAuctions]);

  useEffect(() => {
    if (!pendingCopy) return;
    if (auctionByIdQuery.isError) {
      toast.error("Failed to load auction details.");
      setPendingCopy(false);
      return;
    }
    if (!auctionByIdQuery.data) return;

    const queryData = auctionByIdQuery.data as unknown;
    const source: CopyableAuctionSource =
      queryData && typeof queryData === "object" && "auction" in queryData
        ? ((queryData as { auction?: CopyableAuctionSource }).auction || {})
        : ((queryData as CopyableAuctionSource) || {});
    const selectedOptions = copyOptions.filter((o) => o.checked).map((o) => o.id);
    const timestamp = Date.now();

    const preFilledState: Partial<CreateAuctionPayload> = {
      name: `${source.name} - Copy`,
      code: `${source.code}-COPY-${timestamp}`,
    };

    if (selectedOptions.includes("commission")) {
      preFilledState.commission_percentage = source.commission_percentage;
    }
    if (selectedOptions.includes("buyer-premium")) {
      preFilledState.buyer_premium_percentage = source.buyer_premium_percentage;
      preFilledState.short_bp_explanation = source.short_bp_explanation;
    }
    if (selectedOptions.includes("tax")) {
      preFilledState.buyer_tax_percentage = source.buyer_tax_percentage;
      preFilledState.seller_tax_percentage = source.seller_tax_percentage;
      preFilledState.tax_exempt_all = source.tax_exempt_all;
    }
    if (selectedOptions.includes("terms")) {
      preFilledState.terms_and_conditions = source.terms_and_conditions;
      preFilledState.payment_information = source.payment_information;
      preFilledState.shipping_pickup_info = source.shipping_pickup_info;
      preFilledState.bidding_notice = source.bidding_notice;
      preFilledState.auction_notice = source.auction_notice;
    }
    if (selectedOptions.includes("bid-increments")) {
      preFilledState.soft_close_seconds = source.soft_close_seconds;
      preFilledState.lot_stagger_seconds = source.lot_stagger_seconds;
      preFilledState.bid_mechanism = source.bid_mechanism;
      preFilledState.bid_amount_type = source.bid_amount_type;
      preFilledState.force_bid_increment_schedule = source.force_bid_increment_schedule;
      preFilledState.apply_bid_increment_per_item = source.apply_bid_increment_per_item;
      preFilledState.bid_increments = source.bid_increments;
    }
    if (selectedOptions.includes("registration")) {
      preFilledState.require_credit_card_registration = source.require_credit_card_registration;
      preFilledState.successful_bidder_registration_option = source.successful_bidder_registration_option;
      preFilledState.deposit_type = source.deposit_type;
      preFilledState.deposit_value = source.deposit_value;
      preFilledState.deposit_cap = source.deposit_cap;
      preFilledState.deposit_policy = source.deposit_policy;
    }

    initializeFormState({
      timezone: detectUserTimezone() || "",
      ...preFilledState,
    });
    setShowWizard(true);
    setActiveStep("details");
    setAttemptedSteps(createInitialAttemptedSteps());
    setPendingCopy(false);
  }, [pendingCopy, auctionByIdQuery.data, auctionByIdQuery.isError, copyOptions, initializeFormState]);

  const handleCopyOptionChange = (id: string, checked: boolean) => {
    setCopyOptions((opts) => opts.map((o) => (o.id === id ? { ...o, checked } : o)));
  };

  const currentStepResult = validateTab(activeStep, formState);
  const currentStepFieldErrors = useMemo(
    () => (attemptedSteps[activeStep] ? getTabFieldErrors(activeStep, formState) : {}),
    [activeStep, attemptedSteps, formState]
  );

  const furthestValidIndex = useMemo(() => {
    let idx = -1;
    for (let i = 0; i < wizardSteps.length; i += 1) {
      const result = validateTab(wizardSteps[i].id, formState);
      if (!result.ok) break;
      idx = i;
    }
    return idx;
  }, [formState]);

  const stepMeta = useMemo(() => {
    return wizardSteps.map((step) => {
      const index = wizardSteps.findIndex((s) => s.id === step.id);
      const locked = index > furthestValidIndex + 1;
      const status = getTabStatus(step.id, formState, {
        currentTab: activeStep,
        locked,
      });
      if (status === "invalid" && !attemptedSteps[step.id]) {
        return { ...step, status: undefined };
      }
      if (step.id === "images") {
        const hasImages = !!formState.lot_images && Object.keys(formState.lot_images).length > 0;
        if (!hasImages && !attemptedSteps.images) {
          return { ...step, status: undefined };
        }
      }
      return { ...step, status };
    });
  }, [formState, attemptedSteps, furthestValidIndex, activeStep]);

  const handleProceed = () => {
    if (creationType === "scratch") {
      if (!setupWizardData.auctionName || !setupWizardData.startDate || !setupWizardData.endDate) {
        toast.error("Please fill in all required fields.");
        return;
      }
      initializeFormState({
        name: setupWizardData.auctionName,
        auction_start_at: setupWizardData.startDate,
        auction_end_at: setupWizardData.endDate,
        timezone: detectUserTimezone() || "",
      });
      setShowWizard(true);
      setActiveStep("details");
      setAttemptedSteps(createInitialAttemptedSteps());
      toast.success("Starting auction setup.");
      return;
    }

    if (creationType === "copy") {
      if (!selectedAuctionId) {
        toast.error("Please select an auction to copy.");
        return;
      }
      setPendingCopy(true);
    }
  };

  const handleStepClick = (nextId: WizardStepId) => {
    const targetIndex = wizardSteps.findIndex((step) => step.id === nextId);
    if (targetIndex <= activeIndex) {
      setActiveStep(nextId);
      return;
    }
    for (let i = 0; i < targetIndex; i += 1) {
      const stepId = wizardSteps[i].id;
      const result = validateTab(stepId, formState);
      if (!result.ok) {
        setAttemptedSteps((prev) => ({ ...prev, [stepId]: true }));
        toast.error(result.message || "Complete required fields before proceeding.");
        setActiveStep(stepId);
        return;
      }
    }
    setActiveStep(nextId);
  };

  const handleNext = async () => {
    if (isFinalStep) {
      const requiredTabs: WizardStepId[] = ["details", "upload", "lots"];
      for (const tab of requiredTabs) {
        const result = validateTab(tab, formState);
        if (!result.ok) {
          setAttemptedSteps((prev) => ({ ...prev, [tab]: true }));
          toast.error(result.message || "Please resolve the errors before publishing.");
          setActiveStep(tab);
          return;
        }
      }
      const imagesResult = validateTab("images", formState, { strictImages: true });
      if (!imagesResult.ok) {
        setAttemptedSteps((prev) => ({ ...prev, images: true }));
        toast.error(imagesResult.message || "Each lot needs at least one image.");
        setActiveStep("images");
        return;
      }
      if (!formState.feature_images?.length) {
        toast.error("At least one feature image is required.");
        setActiveStep("upload");
        return;
      }

      const bidMechanism = formState.bid_mechanism || "standard";
      const bidAmountType =
        formState.bid_amount_type || (bidMechanism === "proxy" ? "maximum_up_to" : "fixed_flat");

      const payload: CreateAuctionPayload = {
        ...formState,
        timezone: formState.timezone || detectUserTimezone() || "",
        categories: formState.categories || [],
        bid_mechanism: bidMechanism,
        bid_amount_type: bidAmountType,
        deposit_type:
          formState.successful_bidder_registration_option === "deposit"
            ? (formState.deposit_type || "fixed")
            : formState.deposit_type,
        feature_images: formState.feature_images,
        lot_images: formState.lot_images,
      };

      try {
        const idempotencyKey =
          typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `${formState.code || "auction"}-${new Date().getTime()}`;
        await createAuction.mutateAsync({ payload, idempotencyKey });
        toast.success("Auction created successfully.");
        resetFormState();
        router.push("/dashboard");
      } catch (error: unknown) {
        const message = getErrorMessage(error, "Failed to create auction");
        const validationMessages = getValidationMessages(error);
        if (validationMessages.length > 0) {
          validationMessages.forEach((msg) => toast.error(msg));
        } else {
          toast.error(message);
        }
      }
      return;
    }

    const result = validateTab(activeStep, formState);
    if (!result.ok) {
      setAttemptedSteps((prev) => ({ ...prev, [activeStep]: true }));
      toast.error(result.message || "Please fill in required fields.");
      return;
    }
    setActiveStep(wizardSteps[activeIndex + 1].id);
  };

  const handleBack = () => {
    if (activeIndex === 0) return;
    setActiveStep(wizardSteps[activeIndex - 1].id);
  };

  if (!showWizard) {
      return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="p-2 -ml-2 hover:bg-accent rounded-lg transition-colors">
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">Create New Auction</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Launch a new auction from scratch or copy an existing auction to reuse pricing,
                  bidder registration, lot, and publishing settings.
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 sm:space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectionCard
              icon={FilePlus}
              title="Start a New Auction"
              subtitle="Build a fresh timed or live auction with custom schedule, lots, and bidder rules"
              isActive={creationType === "scratch"}
              onClick={() => setCreationType("scratch")}
            >
              <div className="space-y-4">
                <FormInput
                  label="Auction Name"
                  placeholder="Enter auction name"
                  value={setupWizardData.auctionName}
                  onChange={(e) =>
                    setSetupWizardData((prev) => ({ ...prev, auctionName: e.target.value }))
                  }
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DateTimePicker
                    label="Start Date"
                    value={setupWizardData.startDate}
                    onChange={(value) =>
                      setSetupWizardData((prev) => ({ ...prev, startDate: value }))
                    }
                    clearable={false}
                  />
                  <DateTimePicker
                    label="End Date"
                    value={setupWizardData.endDate}
                    onChange={(value) =>
                      setSetupWizardData((prev) => ({ ...prev, endDate: value }))
                    }
                    clearable={false}
                  />
                </div>
              </div>
            </SelectionCard>

            <SelectionCard
              icon={Copy}
              title="Copy an Existing Auction"
              subtitle="Reuse proven auction settings, pricing rules, and bidder registration options"
              isActive={creationType === "copy"}
              onClick={() => setCreationType("copy")}
            >
              <div className="space-y-4">
                <div className="relative">
                  {auctionsLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-md z-10">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                  <FormSelect
                    label="Select Auction"
                    options={auctionOptions}
                    placeholder={
                      auctionsLoading
                        ? "Loading auctions..."
                        : !auctionOptions.length
                          ? "No auctions available"
                          : "Choose an auction..."
                    }
                    value={selectedAuctionId}
                    onValueChange={setSelectedAuctionId}
                    disabled={auctionsLoading || !auctionOptions.length}
                    hint={
                      !auctionsLoading && !auctionOptions.length
                        ? "You don't have any auctions yet. Create one first."
                        : undefined
                    }
                  />
                </div>
                <CopyOptionsAccordion options={copyOptions} onOptionChange={handleCopyOptionChange} />
                <p className="text-xs text-muted-foreground italic">
                  * Feature images and lot images are not copied.
                </p>
              </div>
            </SelectionCard>
          </div>

          {creationType && (
            <div className="flex justify-end">
              <PremiumButton
                size="lg"
                onClick={handleProceed}
                disabled={pendingCopy || (creationType === "copy" && !auctionOptions.length)}
                className="w-full sm:w-auto"
              >
                {pendingCopy || auctionByIdQuery.isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Continue to Setup
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </PremiumButton>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <WizardShell
      title="Auction Creation Workflow"
      description="Configure auction details, bidder settings, lots, images, and preview everything before publishing."
      stepLabel={stepLabel}
      leading={
        <button
          type="button"
          onClick={handleBack}
          className="h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors"
          aria-label="Go back"
          disabled={activeIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 text-foreground" />
        </button>
      }
      headerCenter={
        <LinearTabs
          tabs={stepMeta.map((step) => ({
            id: step.id,
            label: step.label,
            status: step.status,
          }))}
          activeTab={activeStep}
          onTabChange={(id) => handleStepClick(id as WizardStepId)}
        />
      }
      actions={
        <>
          <PremiumButton
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={activeIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </PremiumButton>
          <PremiumButton
            type="button"
            onClick={handleNext}
            disabled={createAuction.isPending}
          >
            {createAuction.isPending ? "Publishing..." : isFinalStep ? "Publish Auction" : "Next"}
            {!isFinalStep && <ChevronRight className="h-4 w-4 ml-2" />}
          </PremiumButton>
        </>
      }
    >
      <div className="space-y-8">
        {activeStep === "details" && <DetailsTab initialData={formState} fieldErrors={currentStepFieldErrors} />}
        {activeStep === "upload" && <UploadSettingsTab initialData={formState} fieldErrors={currentStepFieldErrors} />}
        {activeStep === "lots" && <LotsTab fieldErrors={currentStepFieldErrors} />}
        {activeStep === "images" && <LotImagesTab initialData={formState} fieldErrors={currentStepFieldErrors} />}
        {activeStep === "preview" && <PreviewTab onGoToTab={handleStepClick} />}

        {!isFinalStep && !currentStepResult.ok && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {currentStepResult.message}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur p-4 flex items-center justify-between gap-3 lg:hidden">
        <PremiumButton type="button" variant="outline" onClick={handleBack} disabled={activeIndex === 0}>
          Back
        </PremiumButton>
        <PremiumButton
          type="button"
          onClick={handleNext}
          disabled={createAuction.isPending}
        >
          {isFinalStep ? "Publish" : "Next"}
        </PremiumButton>
      </div>
    </WizardShell>
  );
}
