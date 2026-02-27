import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { FormSection } from "../FormSection";
import { PremiumButton } from "../PremiumButton";
import { useAuctionForm } from "@/context/auction-form-context";
import { validateTab, getLotImageWarnings } from "@/utils/auctionWizardValidation";

interface PreviewTabProps {
  onGoToTab?: (tabId: "details" | "upload" | "lots" | "images") => void;
}

type PreviewChecklistItem = {
  label: string;
  ok: boolean;
  tab: "details" | "upload" | "lots" | "images";
  warning?: boolean;
};

export function PreviewTab({ onGoToTab }: PreviewTabProps) {
  const { formState } = useAuctionForm();

  const detailsStatus = validateTab("details", formState);
  const uploadStatus = validateTab("upload", formState);
  const lotsStatus = validateTab("lots", formState);
  const imageWarnings = getLotImageWarnings(formState);
  const needsDeposit = formState.successful_bidder_registration_option === "deposit";

  const checklist: PreviewChecklistItem[] = [
    { label: "Details complete", ok: detailsStatus.ok, tab: "details" as const },
    { label: "Upload settings complete", ok: uploadStatus.ok, tab: "upload" as const },
    { label: "Lots complete", ok: lotsStatus.ok, tab: "lots" as const },
    {
      label: "Lot images complete",
      ok: imageWarnings.length === 0,
      tab: "images" as const,
    },
    {
      label: "Deposit details (if required)",
      ok: !needsDeposit || (!!formState.deposit_type && !!formState.deposit_value && !!formState.deposit_cap && !!formState.deposit_policy),
      tab: "upload" as const,
    },
  ];

  const renderStatus = (ok: boolean, warning?: boolean) => {
    if (ok) return <CheckCircle className="h-4 w-4 text-primary" />;
    if (warning) return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    return <XCircle className="h-4 w-4 text-destructive" />;
  };

  return (
    <div className="space-y-6">
      <FormSection title="Readiness Checklist" description="Complete required items before publishing.">
        <div className="space-y-3">
          {checklist.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm">
                {renderStatus(item.ok, item.warning)}
                <span className={item.ok ? "text-foreground" : item.warning ? "text-muted-foreground" : "text-destructive"}>
                  {item.label}
                </span>
              </div>
              {!item.ok && onGoToTab && !item.warning && (
                <PremiumButton type="button" variant="outline" size="sm" onClick={() => onGoToTab(item.tab)}>
                  Go to tab
                </PremiumButton>
              )}
            </div>
          ))}
          {imageWarnings.length > 0 && (
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              {imageWarnings.join(" ")}
            </div>
          )}
        </div>
      </FormSection>

      <FormSection title="Auction Summary" description="Core auction settings.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <p className="font-medium">Name</p>
            <p className="text-muted-foreground">{formState.name || "-"}</p>
          </div>
          <div>
            <p className="font-medium">Code</p>
            <p className="text-muted-foreground">{formState.code || "-"}</p>
          </div>
          <div>
            <p className="font-medium">Timezone</p>
            <p className="text-muted-foreground">{formState.timezone || "-"}</p>
          </div>
          <div>
            <p className="font-medium">Currency</p>
            <p className="text-muted-foreground">{formState.currency || "-"}</p>
          </div>
          <div>
            <p className="font-medium">Auction Window</p>
            <p className="text-muted-foreground">
              {formState.auction_start_at || "-"} {"->"} {formState.auction_end_at || "-"}
            </p>
          </div>
          <div>
            <p className="font-medium">Preview Window</p>
            <p className="text-muted-foreground">
              {formState.preview_start_at || "-"} {"->"} {formState.preview_end_at || "-"}
            </p>
          </div>
          <div>
            <p className="font-medium">Checkout Window</p>
            <p className="text-muted-foreground">
              {formState.checkout_start_at || "-"} {"->"} {formState.checkout_end_at || "-"}
            </p>
          </div>
          <div>
            <p className="font-medium">Bidding Window</p>
            <p className="text-muted-foreground">
              {formState.open_bidding_at || "-"} {"->"} {formState.close_bidding_at || "-"}
            </p>
          </div>
        </div>
      </FormSection>

      <FormSection title="Fees Summary" description="Commission, premium, and taxes.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="font-medium">Commission %</p>
            <p className="text-muted-foreground">{formState.commission_percentage ?? "-"}</p>
          </div>
          <div>
            <p className="font-medium">Buyer Premium %</p>
            <p className="text-muted-foreground">{formState.buyer_premium_percentage ?? "-"}</p>
          </div>
          <div>
            <p className="font-medium">Minimum Bid</p>
            <p className="text-muted-foreground">{formState.minimum_bid_amount ?? "-"}</p>
          </div>
          <div>
            <p className="font-medium">Buyer Tax %</p>
            <p className="text-muted-foreground">{formState.buyer_tax_percentage ?? "-"}</p>
          </div>
          <div>
            <p className="font-medium">Seller Tax %</p>
            <p className="text-muted-foreground">{formState.seller_tax_percentage ?? "-"}</p>
          </div>
          <div>
            <p className="font-medium">Buyer Charges</p>
            <p className="text-muted-foreground">
              {formState.buyer_lot_charge_1 ?? "-"} / {formState.buyer_lot_charge_2 ?? "-"}
            </p>
          </div>
        </div>
      </FormSection>

      <FormSection title="Bidding Summary" description="Bidding rules and timing.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="font-medium">Bidding Type</p>
            <p className="text-muted-foreground">{formState.bidding_type || "-"}</p>
          </div>
          <div>
            <p className="font-medium">Auction Format</p>
            <p className="text-muted-foreground">{formState.auction_format || "-"}</p>
          </div>
          <div>
            <p className="font-medium">Bid Visibility</p>
            <p className="text-muted-foreground">{formState.bid_visibility || "-"}</p>
          </div>
          <div>
            <p className="font-medium">Bid Mechanism</p>
            <p className="text-muted-foreground">{formState.bid_mechanism || "-"}</p>
          </div>
          <div>
            <p className="font-medium">Bid Amount Type</p>
            <p className="text-muted-foreground">{formState.bid_amount_type || "-"}</p>
          </div>
          <div>
            <p className="font-medium">Soft Close (s)</p>
            <p className="text-muted-foreground">{formState.soft_close_seconds ?? "-"}</p>
          </div>
          <div>
            <p className="font-medium">Lot Stagger (s)</p>
            <p className="text-muted-foreground">{formState.lot_stagger_seconds ?? "-"}</p>
          </div>
          <div>
            <p className="font-medium">Default Lot Duration (s)</p>
            <p className="text-muted-foreground">{formState.default_lot_duration_seconds ?? "-"}</p>
          </div>
        </div>
      </FormSection>

      <FormSection title="Registration & Payments" description="Bidder rules and accepted cards.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="font-medium">Require Credit Card</p>
            <p className="text-muted-foreground">
              {formState.require_credit_card_registration ? "Yes" : "No"}
            </p>
          </div>
          <div>
            <p className="font-medium">Successful Bidder Option</p>
            <p className="text-muted-foreground">{formState.successful_bidder_registration_option || "-"}</p>
          </div>
          <div>
            <p className="font-medium">Deposit Required</p>
            <p className="text-muted-foreground">{needsDeposit ? "Yes" : "No"}</p>
          </div>
          {needsDeposit && (
            <>
              <div>
                <p className="font-medium">Deposit Type</p>
                <p className="text-muted-foreground">{formState.deposit_type || "-"}</p>
              </div>
              <div>
                <p className="font-medium">Deposit Value</p>
                <p className="text-muted-foreground">{formState.deposit_value ?? "-"}</p>
              </div>
              <div>
                <p className="font-medium">Deposit Cap</p>
                <p className="text-muted-foreground">{formState.deposit_cap ?? "-"}</p>
              </div>
              <div>
                <p className="font-medium">Deposit Policy</p>
                <p className="text-muted-foreground">{formState.deposit_policy || "-"}</p>
              </div>
            </>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm mt-6">
          <div>
            <p className="font-medium">Mastercard</p>
            <p className="text-muted-foreground">{formState.accept_mastercard ? "Yes" : "No"}</p>
          </div>
          <div>
            <p className="font-medium">Visa</p>
            <p className="text-muted-foreground">{formState.accept_visa ? "Yes" : "No"}</p>
          </div>
          <div>
            <p className="font-medium">American Express</p>
            <p className="text-muted-foreground">{formState.accept_amex ? "Yes" : "No"}</p>
          </div>
          <div>
            <p className="font-medium">Discover</p>
            <p className="text-muted-foreground">{formState.accept_discover ? "Yes" : "No"}</p>
          </div>
        </div>
      </FormSection>

      <FormSection title="Lots Summary" description="Lot inventory summary.">
        {formState.lots && formState.lots.length > 0 ? (
          <div className="space-y-3">
            {formState.lots.map((lot) => (
              <div key={lot.lot_number} className="border rounded-xl p-3 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-medium">
                    Lot {lot.lot_number}: {lot.title || "Untitled"}
                  </p>
                  <p className="text-muted-foreground">Qty {lot.quantity || 1}</p>
                </div>
                <p className="text-muted-foreground mt-1">
                  Starting Bid: {lot.starting_bid || 0} - Reserve: {lot.reserve_price ?? "-"} - Estimates:{" "}
                  {lot.estimate_low ?? "-"} - {lot.estimate_high ?? "-"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No lots added.</p>
        )}
      </FormSection>

      <FormSection title="Media Summary" description="Review image coverage.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <p className="font-medium">Feature Images</p>
            <p className="text-muted-foreground">{formState.feature_images?.length ? `${formState.feature_images.length} uploaded` : "Missing"}</p>
          </div>
          <div>
            <p className="font-medium">Lot Images</p>
            <p className="text-muted-foreground">
              {(formState.lot_images && Object.keys(formState.lot_images).length) || 0} lot(s) with images
            </p>
          </div>
        </div>
        {formState.lots && formState.lots.length > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {formState.lots.map((lot, index) => {
              const countByLotNumber = formState.lot_images?.[lot.lot_number]?.length || 0;
              const countByIndex = formState.lot_images?.[String(index)]?.length || 0;
              const count = Math.max(countByLotNumber, countByIndex);
              return (
                <div key={lot.lot_number} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <span className="text-foreground">Lot {lot.lot_number}</span>
                  <span className="text-muted-foreground">{count} image(s)</span>
                </div>
              );
            })}
          </div>
        )}
      </FormSection>
    </div>
  );
}
