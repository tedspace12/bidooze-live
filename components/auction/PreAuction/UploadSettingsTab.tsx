import { FormSection } from "../FormSection";
import { FormInput } from "../FormInput";
import { FormSelect } from "../FormSelect";
import { FormTextarea } from "../FormTextarea";
import { FormCheckbox } from "../FormCheckbox";

export function UploadSettingsTab() {
  return (
    <div className="space-y-6">
      {/* Dates */}
      <FormSection title="Dates" description="Set preview, auction, and checkout schedules">
        <div className="space-y-6">
          <div>
            <p className="micro-label mb-3">Preview Date/Times</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Start"
                name="preview_start_at"
                type="datetime-local"
              />
              <FormInput
                label="End"
                name="preview_end_at"
                type="datetime-local"
              />
            </div>
          </div>
          
          <div>
            <p className="micro-label mb-3">Auction Date/Times</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Start"
                name="auction_start_at_upload"
                type="datetime-local"
              />
              <FormInput
                label="End"
                name="auction_end_at_upload"
                type="datetime-local"
              />
            </div>
          </div>
          
          <div>
            <p className="micro-label mb-3">Checkout Date/Times</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Start"
                name="checkout_start_at"
                type="datetime-local"
              />
              <FormInput
                label="End"
                name="checkout_end_at"
                type="datetime-local"
              />
            </div>
          </div>
        </div>
      </FormSection>

      {/* Payment/Shipping/Pickup */}
      <FormSection title="Payment / Shipping / Pickup" description="Payment and delivery information">
        <div className="space-y-6">
          <FormTextarea 
            label="Payment Information" 
            name="payment_information"
            placeholder="Enter payment instructions and accepted methods..."
            rows={3}
          />
          <FormTextarea 
            label="Shipping / Pick Up" 
            name="shipping_pickup_info"
            placeholder="Enter shipping and pickup details..."
            rows={3}
          />
        </div>
      </FormSection>

      {/* Registration */}
      <FormSection title="Registration" description="Bidder registration requirements">
        <div className="space-y-6">
          <FormCheckbox 
            label="Bidder Credit Card Registration" 
            description="Require credit card on file for registration"
            name="require_credit_card_registration"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormSelect 
              label="Bidder Authentication" 
              name="bidder_authentication"
              options={[
                { value: "none", label: "None Required" },
                { value: "email", label: "Email Verification" },
                { value: "phone", label: "Phone Verification" },
                { value: "both", label: "Email & Phone" },
              ]}
            />
            <FormInput
              label="Authentication Required Within (hours)"
              name="authentication_required_hours"
              type="number"
              placeholder="24"
            />
          </div>
          
          <div>
            <p className="micro-label mb-3">Accepted Credit Cards</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormCheckbox label="Mastercard" name="accept_mastercard" />
              <FormCheckbox label="Visa" name="accept_visa" />
              <FormCheckbox label="American Express" name="accept_amex" />
              <FormCheckbox label="Discover" name="accept_discover" />
            </div>
          </div>
          
          <FormSelect 
            label="Successful Bidder Registration Option" 
            name="successful_bidder_registration_option"
            options={[
              { value: "immediate", label: "Immediate Registration" },
              { value: "approval", label: "Requires Approval" },
              { value: "deposit", label: "Requires Deposit" },
            ]}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Starting Bid Card Number"
              name="starting_bid_card_number"
              placeholder="000001"
            />
            <FormInput
              label="Maximum Amount Per Item"
              name="max_amount_per_item"
              type="number"
              placeholder="0.00"
            />
          </div>
        </div>
      </FormSection>

      {/* Notice */}
      <FormSection title="Notice" description="Important notices for bidders">
        <div className="space-y-6">
          <FormTextarea 
            label="Bidding Notice" 
            name="bidding_notice"
            placeholder="Enter any important bidding notices..."
            rows={3}
          />
          <FormTextarea 
            label="Auction Notice (Optional)" 
            name="auction_notice"
            placeholder="Enter optional auction notice..."
            rows={3}
          />
        </div>
      </FormSection>

      {/* Bidding */}
      <FormSection title="Bidding" description="Configure bidding rules and settings">
        <div className="space-y-6">
          <FormSelect 
            label="Bidding Type" 
            name="bidding_type"
            options={[
              { value: "timed", label: "Timed Online" },
              { value: "live", label: "Live Auction" },
              { value: "hybrid", label: "Hybrid" },
            ]}
          />
          
          <div>
            <p className="micro-label mb-3">Settings</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormSelect 
                label="Bid Type" 
                name="bid_type"
                options={[
                  { value: "standard", label: "Standard" },
                  { value: "proxy", label: "Proxy Bidding" },
                ]}
              />
              <FormSelect 
                label="Bid Amount Type" 
                name="bid_amount_type"
                options={[
                  { value: "increment", label: "Increment Based" },
                  { value: "free", label: "Free Form" },
                ]}
              />
              <FormSelect 
                label="Timezone" 
                name="timezone"
                options={[
                  { value: "EST", label: "Eastern Time (EST)" },
                  { value: "CST", label: "Central Time (CST)" },
                  { value: "PST", label: "Pacific Time (PST)" },
                  { value: "UTC", label: "UTC" },
                ]}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormInput
              label="Open Bidding"
              name="open_bidding_at"
              type="datetime-local"
            />
            <FormInput
              label="Close Bidding"
              name="close_bidding_at"
              type="datetime-local"
            />
            <FormInput
              label="Soft Close Seconds"
              name="soft_close_seconds"
              type="number"
              placeholder="180"
            />
          </div>
          
          <FormInput
            label="Auto Sync Grouped Lot Stagger Time (seconds)"
            name="lot_stagger_seconds"
            type="number"
            placeholder="0"
          />
          
          <div>
            <p className="micro-label mb-3">Options</p>
            <div className="space-y-3">
              <FormCheckbox 
                label="Show immediate bid states" 
                description="Show Won/Lost and winning amount on closed lots"
                name="show_immediate_bid_states"
              />
              <FormCheckbox 
                label="Times the money bidding" 
                description="Apply to lots with quantity greater than one"
                name="times_the_money_bidding"
              />
              <FormCheckbox 
                label="Show bid reserve states" 
                description="Display Reserve Met or Reserve Not Met"
                name="show_bid_reserve_states"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Email Subject"
              name="email_subject"
              placeholder="Auction notification subject"
            />
            <FormTextarea
              label="Email Body"
              name="email_body"
              placeholder="Email body content..."
              rows={3}
            />
          </div>
        </div>
      </FormSection>

      {/* Bid Increments */}
      <FormSection title="Bid Increments" description="Set minimum bid increment rules">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormCheckbox 
              label="Force Min Bid to Bid Increment Schedule" 
              name="force_min_bid_to_increment"
            />
            <FormCheckbox 
              label="Apply Bid Increments by Each" 
              name="apply_bid_increments_by_each"
            />
          </div>
          <FormInput
            label="Minimum Bid Amount"
            name="minimum_bid_amount"
            type="number"
            placeholder="0.00"
          />
          
          <div className="p-4 bg-accent/30 rounded-lg">
            <p className="micro-label mb-2">Increment Schedule</p>
            <p className="text-sm text-muted-foreground">Configure bid increment tiers based on current bid amount</p>
          </div>
        </div>
      </FormSection>
    </div>
  );
}
