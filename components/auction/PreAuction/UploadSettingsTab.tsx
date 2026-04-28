import { useEffect, useMemo } from "react";
import Image from "next/image";
import { Plus, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { FormSection } from "../FormSection";
import { FormInput } from "../FormInput";
import { FormSelect } from "../FormSelect";
import { FormCheckbox } from "../FormCheckbox";
import { FormTextarea } from "../FormTextarea";
import { PremiumButton } from "../PremiumButton";
import { useAuctionForm } from "@/context/auction-form-context";
import type {
  AuctionFormat,
  BidAmountType,
  BidIncrementInput,
  BidMechanism,
  BidVisibility,
  BiddingType,
  DepositPolicy,
  DepositType,
  HandlingChargeType,
  ShippingAvailability,
  SuccessfulBidderRegistrationOption,
  CreateAuctionPayload,
} from "@/features/auction/types";
import type { WizardFieldErrors } from "@/utils/auctionWizardValidation";
import { getObjectUrlsForFiles, revokeObjectUrlForFile } from "@/lib/file-previews";

interface UploadSettingsTabProps {
  initialData?: Partial<CreateAuctionPayload>;
  fieldErrors?: WizardFieldErrors;
}

export function UploadSettingsTab({ initialData, fieldErrors }: UploadSettingsTabProps) {
  void initialData;
  const { formState, updateFormState } = useAuctionForm();
  const errors = fieldErrors || {};
  const showDepositFields = formState.successful_bidder_registration_option === "deposit";
  const parseOptionalNumber = (value: string): number | undefined => {
    if (value.trim() === "") return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };
  const featurePreviews = useMemo(
    () => getObjectUrlsForFiles(formState.feature_images),
    [formState.feature_images]
  );

  useEffect(() => {
    const nextDefaults: Partial<CreateAuctionPayload> = {};
    const bidMechanism = formState.bid_mechanism || "standard";

    if (!formState.bidding_type) {
      nextDefaults.bidding_type = "timed";
    }
    if (!formState.auction_format) {
      nextDefaults.auction_format = "internet_only";
    }
    if (!formState.bid_visibility) {
      nextDefaults.bid_visibility = "public";
    }
    if (!formState.bid_mechanism) {
      nextDefaults.bid_mechanism = "standard";
    }
    if (!formState.bid_amount_type) {
      nextDefaults.bid_amount_type = bidMechanism === "proxy" ? "maximum_up_to" : "fixed_flat";
    }
    if (!formState.successful_bidder_registration_option) {
      nextDefaults.successful_bidder_registration_option = "immediate";
    }

    if (Object.keys(nextDefaults).length > 0) {
      updateFormState(nextDefaults);
    }
  }, [
    formState.auction_format,
    formState.bid_amount_type,
    formState.bid_mechanism,
    formState.bid_visibility,
    formState.bidding_type,
    formState.successful_bidder_registration_option,
    updateFormState,
  ]);

  useEffect(() => {
    if (showDepositFields && !formState.deposit_type) {
      updateFormState({ deposit_type: "fixed" });
    }
  }, [showDepositFields, formState.deposit_type, updateFormState]);

  const handleFeatureImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const maxSize = 10 * 1024 * 1024;
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const validFiles: File[] = [];

    files.forEach((file) => {
      if (file.size > maxSize) {
        toast.error(`${file.name} exceeds 10MB limit`);
        return;
      }
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name} has an invalid format. Accepted: JPEG, PNG, WebP, JPG`);
        return;
      }
      validFiles.push(file);
    });

    if (!validFiles.length) {
      e.target.value = "";
      return;
    }

    updateFormState({ feature_images: [...(formState.feature_images || []), ...validFiles] });
    e.target.value = "";
  };

  const removeFeatureImage = (index: number) => {
    const next = [...(formState.feature_images || [])];
    const [removedFile] = next.splice(index, 1);
    revokeObjectUrlForFile(removedFile);
    updateFormState({ feature_images: next.length ? next : undefined });
  };

  const setBidIncrementRows = (rows: BidIncrementInput[]) => {
    updateFormState({ bid_increments: rows });
  };

  const updateBidIncrementRow = (
    index: number,
    key: keyof BidIncrementInput,
    value: number
  ) => {
    const next = [...(formState.bid_increments || [])];
    next[index] = { ...next[index], [key]: value };
    setBidIncrementRows(next);
  };

  const addBidIncrementRow = () => {
    const next = [...(formState.bid_increments || [])];
    next.push({ up_to_amount: 0, increment: 0 });
    setBidIncrementRows(next);
  };

  const removeBidIncrementRow = (index: number) => {
    const next = [...(formState.bid_increments || [])];
    next.splice(index, 1);
    setBidIncrementRows(next);
  };

  const applyDefaultIncrementSchedule = () => {
    setBidIncrementRows([
      { up_to_amount: 1000, increment: 50 },
      { up_to_amount: 10000, increment: 100 },
      { up_to_amount: 1000000, increment: 500 },
    ]);
  };

  return (
    <div className="space-y-6">
      <FormSection title="Feature Images *" description="At least one image is required before publishing.">
        {errors.feature_images && (
          <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {errors.feature_images}
          </div>
        )}
        <input
          type="file"
          id="feature-image-upload"
          name="feature_images"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          multiple
          onChange={handleFeatureImageChange}
        />
        {featurePreviews.length > 0 ? (
          <div className="relative">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featurePreviews.map((preview, index) => (
                <div key={preview} className="relative group">
                  <Image
                    src={preview}
                    alt={`Feature preview ${index + 1}`}
                    width={320}
                    height={128}
                    unoptimized
                    className="w-full h-32 object-cover rounded-xl border border-border"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeatureImage(index)}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove feature image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <PremiumButton
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => document.getElementById("feature-image-upload")?.click()}
            >
              Add More Images
            </PremiumButton>
          </div>
        ) : (
          <label
            htmlFor="feature-image-upload"
            className="border-2 border-dashed border-border-subtle rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer group block"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary-muted flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Upload className="h-6 w-6 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Drop image(s) here or click to upload</p>
                <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WebP, JPG (max 10MB each)</p>
              </div>
            </div>
          </label>
        )}
      </FormSection>

      <FormSection title="Shipping & Handling" description="Configure shipping options and handling fees.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormSelect
            label="Availability"
            name="shipping_availability"
            options={[
              { value: "available", label: "Available" },
              { value: "pickup-only", label: "Pickup Only" },
              { value: "not-available", label: "Not Available" },
            ]}
            value={formState.shipping_availability || ""}
            onValueChange={(value) => updateFormState({ shipping_availability: value as ShippingAvailability })}
          />
          <FormInput
            label="Shipping Account"
            name="shipping_account"
            placeholder="UPS / FedEx account"
            value={formState.shipping_account || ""}
            onChange={(e) => updateFormState({ shipping_account: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <FormCheckbox
            label="Add Handling Charges"
            name="add_handling_charges"
            checked={!!formState.add_handling_charges}
            onChange={(e) => updateFormState({ add_handling_charges: e.target.checked })}
          />
          <FormSelect
            label="Handling Charge Type"
            name="handling_charge_type"
            options={[
              { value: "flat", label: "Flat Fee" },
              { value: "percentage", label: "Percentage" },
              { value: "per-item", label: "Per Item" },
            ]}
            value={formState.handling_charge_type || ""}
            onValueChange={(value) => updateFormState({ handling_charge_type: value as HandlingChargeType })}
            disabled={!formState.add_handling_charges}
            error={errors.handling_charge_type}
          />
          <FormInput
            label="Handling Charge Amount"
            name="handling_charge_amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formState.handling_charge_amount || ""}
            onChange={(e) =>
              updateFormState({ handling_charge_amount: parseFloat(e.target.value) || undefined })
            }
            disabled={!formState.add_handling_charges}
            error={errors.handling_charge_amount}
          />
        </div>
      </FormSection>

      <FormSection title="Fees & Taxes" description="Commission, premium, and tax settings.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="Commission Percentage (%)"
            name="commission_percentage"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formState.commission_percentage || ""}
            onChange={(e) => updateFormState({ commission_percentage: parseFloat(e.target.value) || undefined })}
          />
          <FormInput
            label="Buyer Premium Percentage (%)"
            name="buyer_premium_percentage"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formState.buyer_premium_percentage || ""}
            onChange={(e) => updateFormState({ buyer_premium_percentage: parseFloat(e.target.value) || undefined })}
          />
        </div>
        <div className="mt-6">
          <FormInput
            label="Short BP Explanation"
            name="short_bp_explanation"
            placeholder="12.5% buyer premium"
            value={formState.short_bp_explanation || ""}
            onChange={(e) => updateFormState({ short_bp_explanation: e.target.value || undefined })}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <FormInput
            label="Buyer Tax Percentage (%)"
            name="buyer_tax_percentage"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formState.buyer_tax_percentage || ""}
            onChange={(e) => updateFormState({ buyer_tax_percentage: parseFloat(e.target.value) || undefined })}
          />
          <FormInput
            label="Seller Tax Percentage (%)"
            name="seller_tax_percentage"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formState.seller_tax_percentage || ""}
            onChange={(e) => updateFormState({ seller_tax_percentage: parseFloat(e.target.value) || undefined })}
          />
          <FormInput
            label="Minimum Bid Amount"
            name="minimum_bid_amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formState.minimum_bid_amount || ""}
            onChange={(e) => updateFormState({ minimum_bid_amount: parseFloat(e.target.value) || undefined })}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <FormInput
            label="Buyer Lot Charge 1"
            name="buyer_lot_charge_1"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formState.buyer_lot_charge_1 || ""}
            onChange={(e) => updateFormState({ buyer_lot_charge_1: parseFloat(e.target.value) || undefined })}
          />
          <FormInput
            label="Buyer Lot Charge 2"
            name="buyer_lot_charge_2"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formState.buyer_lot_charge_2 || ""}
            onChange={(e) => updateFormState({ buyer_lot_charge_2: parseFloat(e.target.value) || undefined })}
          />
        </div>
      </FormSection>

      <FormSection title="Bidding Rules" description="Configure bidding mechanics and visibility.">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <FormSelect
            label="Bidding Type"
            name="bidding_type"
            options={[
              { value: "timed", label: "Timed" },
              { value: "live", label: "Live" },
              { value: "hybrid", label: "Hybrid" },
            ]}
            value={formState.bidding_type || "timed"}
            onValueChange={(value) => updateFormState({ bidding_type: value as BiddingType })}
            error={errors.bidding_type}
          />
          <FormSelect
            label="Auction Format"
            name="auction_format"
            options={[
              { value: "internet_only", label: "Internet Only" },
              { value: "webcast", label: "Webcast" },
              { value: "floor_only", label: "Floor Only" },
              { value: "absentee", label: "Absentee" },
            ]}
            value={formState.auction_format || "internet_only"}
            onValueChange={(value) => updateFormState({ auction_format: value as AuctionFormat })}
          />
          <FormSelect
            label="Bid Visibility"
            name="bid_visibility"
            options={[
              { value: "public", label: "Public" },
              { value: "sealed", label: "Sealed" },
            ]}
            value={formState.bid_visibility || "public"}
            onValueChange={(value) => updateFormState({ bid_visibility: value as BidVisibility })}
          />
          <FormSelect
            label="Bid Mechanism"
            name="bid_mechanism"
            options={[
              { value: "standard", label: "Standard" },
              { value: "proxy", label: "Proxy" },
            ]}
            value={formState.bid_mechanism || "standard"}
            onValueChange={(value) => {
              const mechanism = value as BidMechanism;
              updateFormState({
                bid_mechanism: mechanism,
                bid_amount_type: mechanism === "standard" ? "fixed_flat" : (formState.bid_amount_type || "maximum_up_to"),
              });
            }}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <FormSelect
            label="Bid Amount Type"
            name="bid_amount_type"
            options={[
              { value: "fixed_flat", label: "Fixed Flat" },
              { value: "maximum_up_to", label: "Maximum Up To" },
            ]}
            value={formState.bid_amount_type || "fixed_flat"}
            onValueChange={(value) => updateFormState({ bid_amount_type: value as BidAmountType })}
            disabled={formState.bid_mechanism === "standard"}
            error={errors.bid_amount_type}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <FormInput
            label="Soft Close (seconds)"
            name="soft_close_seconds"
            type="number"
            placeholder="0"
            value={formState.soft_close_seconds || ""}
            onChange={(e) => updateFormState({ soft_close_seconds: parseInt(e.target.value) || undefined })}
            error={errors.soft_close_seconds}
          />
          <FormInput
            label="Lot Stagger (seconds)"
            name="lot_stagger_seconds"
            type="number"
            placeholder="0"
            value={formState.lot_stagger_seconds || ""}
            onChange={(e) => updateFormState({ lot_stagger_seconds: parseInt(e.target.value) || undefined })}
            error={errors.lot_stagger_seconds}
          />
          <FormInput
            label="Default Lot Duration (seconds)"
            name="default_lot_duration_seconds"
            type="number"
            placeholder="0"
            value={formState.default_lot_duration_seconds || ""}
            onChange={(e) =>
              updateFormState({ default_lot_duration_seconds: parseInt(e.target.value) || undefined })
            }
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <FormCheckbox
            label="Show Immediate Bid States"
            name="show_immediate_bid_states"
            checked={!!formState.show_immediate_bid_states}
            onChange={(e) => updateFormState({ show_immediate_bid_states: e.target.checked })}
          />
          <FormCheckbox
            label="Times the Money Bidding"
            name="times_the_money_bidding"
            checked={!!formState.times_the_money_bidding}
            onChange={(e) => updateFormState({ times_the_money_bidding: e.target.checked })}
          />
          <FormCheckbox
            label="Show Bid Reserve States"
            name="show_bid_reserve_states"
            checked={!!formState.show_bid_reserve_states}
            onChange={(e) => updateFormState({ show_bid_reserve_states: e.target.checked })}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <FormCheckbox
            label="Force Bid Increment Schedule"
            name="force_bid_increment_schedule"
            checked={!!formState.force_bid_increment_schedule}
            onChange={(e) => updateFormState({ force_bid_increment_schedule: e.target.checked })}
          />
          <FormCheckbox
            label="Apply Bid Increment Per Item"
            name="apply_bid_increment_per_item"
            checked={!!formState.apply_bid_increment_per_item}
            onChange={(e) => updateFormState({ apply_bid_increment_per_item: e.target.checked })}
          />
        </div>
        {formState.force_bid_increment_schedule && (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap gap-3">
              <PremiumButton type="button" variant="outline" size="sm" onClick={addBidIncrementRow}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Increment Row
              </PremiumButton>
              <PremiumButton type="button" variant="ghost" size="sm" onClick={applyDefaultIncrementSchedule}>
                Apply Default Schedule
              </PremiumButton>
            </div>
            {(formState.bid_increments || []).length > 0 ? (
              <div className="space-y-3">
                {(formState.bid_increments || []).map((row, index) => (
                  <div key={`${row.up_to_amount}-${index}`} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end">
                    <FormInput
                      label={index === 0 ? "Up To Amount" : ""}
                      type="number"
                      placeholder="1000"
                      value={row.up_to_amount || ""}
                      onChange={(e) =>
                        updateBidIncrementRow(index, "up_to_amount", parseFloat(e.target.value) || 0)
                      }
                    />
                    <FormInput
                      label={index === 0 ? "Increment" : ""}
                      type="number"
                      placeholder="50"
                      value={row.increment || ""}
                      onChange={(e) =>
                        updateBidIncrementRow(index, "increment", parseFloat(e.target.value) || 0)
                      }
                    />
                    <PremiumButton type="button" variant="outline" size="sm" onClick={() => removeBidIncrementRow(index)}>
                      Remove
                    </PremiumButton>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Add increment rows in ascending order. Final cap must be at least 1,000,000.
              </p>
            )}
            {errors.bid_increments && (
              <p className="text-xs text-destructive">{errors.bid_increments}</p>
            )}
          </div>
        )}
      </FormSection>

      <FormSection title="Registration & Deposit" description="Rules for bidder registration and deposits.">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <FormCheckbox
            label="Require Credit Card Registration"
            name="require_credit_card_registration"
            checked={!!formState.require_credit_card_registration}
            onChange={(e) => updateFormState({ require_credit_card_registration: e.target.checked })}
          />
          <FormSelect
            label="Successful Bidder Registration Option"
            name="successful_bidder_registration_option"
            options={[
              { value: "immediate", label: "Automatic" },
              { value: "approval", label: "Manual" },
              { value: "deposit", label: "Deposit" },
            ]}
            value={formState.successful_bidder_registration_option || "immediate"}
            onValueChange={(value) => {
              const registrationOption = value as SuccessfulBidderRegistrationOption;
              updateFormState({
                successful_bidder_registration_option: registrationOption,
                ...(registrationOption === "deposit" && !formState.deposit_type
                  ? { deposit_type: "fixed" as DepositType }
                  : {}),
              });
            }}
          />
          <FormInput
            label="Authentication Required (Hours)"
            name="authentication_required_hours"
            type="number"
            placeholder="48"
            value={formState.authentication_required_hours || ""}
            onChange={(e) =>
              updateFormState({ authentication_required_hours: parseInt(e.target.value) || undefined })
            }
          />
          <FormInput
            label="Authentication Required (Days)"
            name="authentication_required_days"
            type="number"
            placeholder="2"
            value={formState.authentication_required_days || ""}
            onChange={(e) =>
              updateFormState({ authentication_required_days: parseInt(e.target.value) || undefined })
            }
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <FormInput
            label="Max Amount Per Item"
            name="max_amount_per_item"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formState.max_amount_per_item || ""}
            onChange={(e) => updateFormState({ max_amount_per_item: parseFloat(e.target.value) || undefined })}
          />
        </div>
        {showDepositFields && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <FormSelect
              label="Deposit Type"
              name="deposit_type"
              options={[
                { value: "fixed", label: "Fixed" },
                { value: "percentage", label: "Percentage" },
              ]}
              value={formState.deposit_type || "fixed"}
              onValueChange={(value) => {
                const nextType = value as DepositType;
                const shouldResetValue =
                  nextType === "percentage" &&
                  typeof formState.deposit_value === "number" &&
                  formState.deposit_value > 100;
                updateFormState({
                  deposit_type: nextType,
                  ...(shouldResetValue ? { deposit_value: undefined } : {}),
                });
                if (shouldResetValue) {
                  toast.error("Percentage deposit value must be between 0 and 100.");
                }
              }}
              error={errors.deposit_type}
            />
            <FormInput
              label="Deposit Value"
              name="deposit_value"
              type="number"
              step="0.01"
              min={0}
              max={formState.deposit_type === "percentage" ? 100 : undefined}
              placeholder="0.00"
              value={formState.deposit_value || ""}
              hint={formState.deposit_type === "percentage" ? "Enter a percentage between 0 and 100." : undefined}
              onChange={(e) => updateFormState({ deposit_value: parseOptionalNumber(e.target.value) })}
              error={errors.deposit_value}
            />
            <FormInput
              label="Deposit Cap"
              name="deposit_cap"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formState.deposit_cap || ""}
              onChange={(e) => updateFormState({ deposit_cap: parseOptionalNumber(e.target.value) })}
              error={errors.deposit_cap}
            />
            <FormSelect
              label="Deposit Policy"
              name="deposit_policy"
              options={[
                { value: "refund_losers", label: "Refund Losers" },
                { value: "apply_to_winner_invoice", label: "Apply to Winner Invoice" },
                { value: "non_refundable", label: "Non-refundable" },
                { value: "hold_only", label: "Hold Only" },
                { value: "manual", label: "Manual (maps to hold_only)" },
              ]}
              value={formState.deposit_policy || ""}
              onValueChange={(value) => updateFormState({ deposit_policy: value as DepositPolicy })}
              error={errors.deposit_policy}
            />
          </div>
        )}
      </FormSection>

      <FormSection title="Payment Methods" description="Accepted cards and live card settings.">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <FormCheckbox
            label="Accept Mastercard"
            name="accept_mastercard"
            checked={!!formState.accept_mastercard}
            onChange={(e) => updateFormState({ accept_mastercard: e.target.checked })}
          />
          <FormCheckbox
            label="Accept Visa"
            name="accept_visa"
            checked={!!formState.accept_visa}
            onChange={(e) => updateFormState({ accept_visa: e.target.checked })}
          />
          <FormCheckbox
            label="Accept American Express"
            name="accept_amex"
            checked={!!formState.accept_amex}
            onChange={(e) => updateFormState({ accept_amex: e.target.checked })}
          />
          <FormCheckbox
            label="Accept Discover"
            name="accept_discover"
            checked={!!formState.accept_discover}
            onChange={(e) => updateFormState({ accept_discover: e.target.checked })}
          />
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="Starting Bid Card #"
            name="starting_bid_card_number"
            type="number"
            placeholder="1"
            value={formState.starting_bid_card_number || ""}
            onChange={(e) => updateFormState({ starting_bid_card_number: parseInt(e.target.value) || undefined })}
          />
          <FormInput
            label="Live Starting Bid Card #"
            name="live_starting_bid_card_number"
            type="number"
            placeholder="1"
            value={formState.live_starting_bid_card_number || ""}
            onChange={(e) =>
              updateFormState({ live_starting_bid_card_number: parseInt(e.target.value) || undefined })
            }
          />
        </div>
      </FormSection>

      <FormSection title="Email Notifications" description="Templates used to notify bidders on their registeration.">
        <div className="space-y-6">
          <FormInput
            label="Email Subject"
            name="email_subject"
            placeholder="Auction notification subject"
            value={formState.email_subject || ""}
            onChange={(e) => updateFormState({ email_subject: e.target.value || undefined })}
          />
          <FormTextarea
            label="Email Body"
            name="email_body"
            placeholder="Email notification body"
            rows={6}
            value={formState.email_body || ""}
            onChange={(e) => updateFormState({ email_body: e.target.value || undefined })}
          />
        </div>
      </FormSection>

      <FormSection title="Terms & Notices" description="Legal and bidder-facing notices.">
        <div className="space-y-6">
          <FormTextarea
            label="Terms and Conditions"
            name="terms_and_conditions"
            placeholder="Enter terms and conditions..."
            rows={4}
            value={formState.terms_and_conditions || ""}
            onChange={(e) => updateFormState({ terms_and_conditions: e.target.value || undefined })}
          />
          <FormTextarea
            label="Payment Information"
            name="payment_information"
            placeholder="Payment details and instructions..."
            rows={4}
            value={formState.payment_information || ""}
            onChange={(e) => updateFormState({ payment_information: e.target.value || undefined })}
          />
          <FormTextarea
            label="Shipping & Pickup Info"
            name="shipping_pickup_info"
            placeholder="Shipping and pickup information..."
            rows={4}
            value={formState.shipping_pickup_info || ""}
            onChange={(e) => updateFormState({ shipping_pickup_info: e.target.value || undefined })}
          />
          <FormTextarea
            label="Bidding Notice"
            name="bidding_notice"
            placeholder="Important bidding notice..."
            rows={4}
            value={formState.bidding_notice || ""}
            onChange={(e) => updateFormState({ bidding_notice: e.target.value || undefined })}
          />
          <FormTextarea
            label="Auction Notice"
            name="auction_notice"
            placeholder="General auction notice..."
            rows={4}
            value={formState.auction_notice || ""}
            onChange={(e) => updateFormState({ auction_notice: e.target.value || undefined })}
          />
        </div>
      </FormSection>

      <FormSection title="Auction Links" description="Optional URLs for terms, preview, or external info.">
        <div className="space-y-4">
          {(formState.auction_links || [{ url: "", description: "" }]).map((link, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end">
              <FormInput
                label={index === 0 ? "URL" : ""}
                placeholder="https://example.com"
                value={link.url}
                onChange={(e) => {
                  const next = [...(formState.auction_links || [])];
                  next[index] = { ...next[index], url: e.target.value };
                  updateFormState({ auction_links: next });
                }}
              />
              <FormInput
                label={index === 0 ? "Description" : ""}
                placeholder="Link description"
                value={link.description}
                onChange={(e) => {
                  const next = [...(formState.auction_links || [])];
                  next[index] = { ...next[index], description: e.target.value };
                  updateFormState({ auction_links: next });
                }}
              />
              <PremiumButton
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const next = [...(formState.auction_links || [])];
                  next.splice(index, 1);
                  updateFormState({ auction_links: next.length ? next : [{ url: "", description: "" }] });
                }}
              >
                Remove
              </PremiumButton>
            </div>
          ))}
          <PremiumButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              const next = [...(formState.auction_links || [])];
              next.push({ url: "", description: "" });
              updateFormState({ auction_links: next });
            }}
          >
            Add Link
          </PremiumButton>
        </div>
      </FormSection>
    </div>
  );
}
