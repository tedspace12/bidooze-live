import { FormSection } from "../FormSection";
import { FormInput } from "../FormInput";
import { FormSelect } from "../FormSelect";
import { FormTextarea } from "../FormTextarea";
import { FormCheckbox } from "../FormCheckbox";
import { Upload, Plus, Link2, X } from "lucide-react";
import { PremiumButton } from "../PremiumButton";
import { useState } from "react";
import { toast } from "sonner";

export function DetailsTab() {
  const [auctionLinks, setAuctionLinks] = useState([{ url: "", description: "" }]);

  const addLink = () => {
    setAuctionLinks([...auctionLinks, { url: "", description: "" }]);
  };

  const removeLink = (index: number) => {
    setAuctionLinks(auctionLinks.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Auction Information */}
      <FormSection title="Auction Information" description="Basic details about your auction">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="Auction Code"
            name="code"
            placeholder="EST-2026-001"
          />
          <FormInput
            label="Name"
            name="name"
            placeholder="Enter auction name"
          />
        </div>
        
        <div className="mt-6">
          <FormTextarea 
            label="Description"
            name="description"
            placeholder="Describe your auction..." 
            rows={4}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <FormInput
            label="Auction Start Date"
            name="auction_start_at"
            type="datetime-local"
          />
          <FormInput
            label="Auction End Date"
            name="auction_end_at"
            type="datetime-local"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <FormCheckbox
            label="Tax Exempt All"
            description="Apply tax exemption to all items"
            name="tax_exempt_all"
          />
          <FormSelect 
            label="Currency" 
            name="currency"
            options={[
              { value: "USD", label: "USD - US Dollar" },
              { value: "NGN", label: "NGN - Naira" },
              { value: "EUR", label: "EUR - Euro" },
              { value: "GBP", label: "GBP - British Pound" },
            ]}
            defaultValue="USD"
          />
          <FormInput
            label="Live Starting Bid Card #"
            name="starting_bid_card_number"
            placeholder="000001"
          />
        </div>
        
        <div className="mt-6">
          <FormTextarea 
            label="Terms and Conditions"
            name="terms_and_conditions"
            placeholder="Enter terms and conditions..." 
            rows={4}
          />
        </div>

        <div className="mt-6">
          <FormInput
            label="Short BP Explanation"
            name="short_bp_explanation"
            placeholder="Brief buyer's premium explanation"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <FormInput
            label="Address Line 1"
            name="address_line_1"
            placeholder="Street address"
          />
          <FormInput
            label="Address Line 2"
            name="address_line_2"
            placeholder="Suite, unit, etc."
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <FormInput
            label="City"
            name="city"
            placeholder="City"
          />
          <FormInput
            label="State"
            name="state"
            placeholder="State"
          />
          <FormInput
            label="Zip Code"
            name="zip_code"
            placeholder="Zip"
          />
          <FormSelect 
            label="Country" 
            name="country"
            options={[
              { value: "US", label: "United States" },
              { value: "CA", label: "Canada" },
              { value: "UK", label: "United Kingdom" },
            ]}
            defaultValue="US"
          />
        </div>
      </FormSection>

      {/* Shipping/Buyer Charges */}
      <FormSection title="Shipping / Buyer Charges" description="Configure shipping options and handling fees">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormSelect 
            label="Availability" 
            name="shipping_availability"
            options={[
              { value: "available", label: "Available" },
              { value: "pickup-only", label: "Pickup Only" },
              { value: "not-available", label: "Not Available" },
            ]}
          />
          <FormInput
            label="Account"
            name="shipping_account"
            placeholder="Shipping account"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <FormCheckbox
            label="Add Handling Charges"
            name="add_handling_charges"
          />
          <FormSelect 
            label="Handling Charge Type" 
            name="handling_charge_type"
            options={[
              { value: "flat", label: "Flat Fee" },
              { value: "percentage", label: "Percentage" },
              { value: "per-item", label: "Per Item" },
            ]}
          />
          <FormInput
            label="Fixed Amount"
            name="handling_charge_amount"
            type="number"
            placeholder="0.00"
          />
        </div>
      </FormSection>

      {/* Feature Image */}
      <FormSection title="Feature Image" description="Upload a featured image for your auction">
        <input
          type="file"
          id="feature-image-upload"
          name="feature_image"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            
            const maxSize = 10 * 1024 * 1024; // 10MB
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            
            if (file.size > maxSize) {
              toast.error("File exceeds 10MB limit");
              e.target.value = "";
              return;
            }
            
            if (!allowedTypes.includes(file.type)) {
              toast.error("Invalid file format. Accepted: JPEG, PNG, WebP, JPG");
              e.target.value = "";
              return;
            }
            
            toast.success("Feature image selected");
          }}
        />
        <label
          htmlFor="feature-image-upload"
          className="border-2 border-dashed border-border-subtle rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer group block"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary-muted flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Upload className="h-6 w-6 text-green-700" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Drop image here or click to upload</p>
              <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WebP, JPG (max 10MB)</p>
            </div>
          </div>
        </label>
      </FormSection>

      {/* Auction Links */}
      <FormSection title="Auction Links" description="Add relevant URLs for bidders">
        <div className="space-y-4">
          {auctionLinks.map((link, index) => (
            <div key={index} className="flex gap-4 items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <input 
                    className="premium-input pl-10" 
                    placeholder="https://example.com"
                    value={link.url}
                    onChange={(e) => {
                      const newLinks = [...auctionLinks];
                      newLinks[index].url = e.target.value;
                      setAuctionLinks(newLinks);
                    }}
                  />
                </div>
                <FormInput 
                  label=""
                  placeholder="Link description"
                  value={link.description}
                  onChange={(e) => {
                    const newLinks = [...auctionLinks];
                    newLinks[index].description = e.target.value;
                    setAuctionLinks(newLinks);
                  }}
                />
              </div>
              {auctionLinks.length > 1 && (
                <button 
                  onClick={() => removeLink(index)}
                  className="mt-2 p-2 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <PremiumButton variant="ghost" size="sm" onClick={addLink} className="mt-2">
            <Plus className="h-4 w-4 mr-2" />
            Add Link
          </PremiumButton>
        </div>
      </FormSection>

      {/* New Lot Defaults */}
      <FormSection title="New Lot Defaults" description="Default values for new lots">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FormInput label="Commission %" type="number" placeholder="0" />
          <FormInput label="Buyer Tax %" type="number" placeholder="0" />
          <FormInput label="Buyer Premium %" type="number" placeholder="0" />
          <FormInput label="Seller Tax %" type="number" placeholder="0" />
          <FormInput label="Buyer Lot Charge 1" type="number" placeholder="0.00" />
          <FormInput label="Buyer Lot Charge 2" type="number" placeholder="0.00" />
        </div>
      </FormSection>

      {/* Ring Options */}
      <FormSection title="Ring Options" description="Configure auction ring settings" accentBorder={false}>
        <div className="p-4 bg-accent/30 rounded-lg text-center text-muted-foreground text-sm">
          Ring options will be available when live auction is enabled
        </div>
      </FormSection>
    </div>
  );
}
