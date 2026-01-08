# Auction Creation Submission Example

This document shows how to submit auction data with file uploads using FormData.

## Implementation Example

```typescript
// types/auction.ts
export interface AuctionFormData {
  // Basic Information
  code: string;
  name: string;
  description: string;
  auction_start_at: string;
  auction_end_at: string;
  preview_start_at: string;
  preview_end_at: string;
  checkout_start_at: string;
  checkout_end_at: string;
  timezone: string;
  
  // Address
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  
  // Financial Settings
  currency: string;
  commission_percentage: number;
  buyer_premium_percentage: number;
  buyer_tax_percentage: number;
  seller_tax_percentage: number;
  buyer_lot_charge_1: number;
  buyer_lot_charge_2: number;
  minimum_bid_amount: number;
  tax_exempt_all: boolean;
  
  // Shipping
  shipping_availability: string;
  shipping_account?: string;
  add_handling_charges: boolean;
  handling_charge_type?: string;
  handling_charge_amount?: number;
  
  // Bidding Settings
  bidding_type: string;
  bid_type: string;
  bid_amount_type: string;
  soft_close_seconds: number;
  lot_stagger_seconds: number;
  show_immediate_bid_states: boolean;
  times_the_money_bidding: boolean;
  show_bid_reserve_states: boolean;
  
  // Registration
  require_credit_card_registration: boolean;
  bidder_authentication: string;
  authentication_required_hours?: number;
  successful_bidder_registration_option: string;
  starting_bid_card_number?: string;
  max_amount_per_item?: number;
  
  // Payment Cards
  accept_mastercard: boolean;
  accept_visa: boolean;
  accept_amex: boolean;
  accept_discover: boolean;
  
  // Text Content
  terms_and_conditions?: string;
  bp_explanation?: string;
  short_bp_explanation?: string;
  payment_information?: string;
  shipping_pickup_info?: string;
  bidding_notice?: string;
  auction_notice?: string;
  email_subject?: string;
  email_body?: string;
  
  // Links
  auction_links?: Array<{ url: string; description: string }>;
  
  // Lots
  lots: Array<{
    lot_number: string;
    title: string;
    description: string;
    quantity: number;
    starting_bid: number;
    reserve_price?: number;
    estimate_low?: number;
    estimate_high?: number;
    lot_stagger_seconds?: number;
    seller_id: number;
  }>;
  
  // Files (handled separately)
  feature_image?: File;
  lot_images?: Record<string, File[]>; // Key: lot_number, Value: array of files
}

// utils/submitAuction.ts
export async function submitAuction(data: AuctionFormData) {
  const formData = new FormData();
  
  // Add all scalar fields
  Object.entries(data).forEach(([key, value]) => {
    // Skip lots, auction_links, and files - handle separately
    if (key === 'lots' || key === 'auction_links' || key === 'feature_image' || key === 'lot_images') {
      return;
    }
    
    // Handle boolean values
    if (typeof value === 'boolean') {
      formData.append(key, value.toString());
    }
    // Handle number values
    else if (typeof value === 'number') {
      formData.append(key, value.toString());
    }
    // Handle string values
    else if (typeof value === 'string') {
      formData.append(key, value);
    }
    // Handle undefined/null - skip
    else if (value === null || value === undefined) {
      return;
    }
  });
  
  // Add auction_links as JSON
  if (data.auction_links && data.auction_links.length > 0) {
    formData.append('auction_links', JSON.stringify(data.auction_links));
  }
  
  // Add lots as JSON (without images)
  if (data.lots && data.lots.length > 0) {
    formData.append('lots', JSON.stringify(data.lots));
  }
  
  // Add feature_image file
  if (data.feature_image) {
    formData.append('feature_image', data.feature_image);
  }
  
  // Add lot images
  if (data.lot_images) {
    Object.entries(data.lot_images).forEach(([lotNumber, files]) => {
      files.forEach((file, index) => {
        formData.append(`lot_images_${lotNumber}[${index}]`, file);
        // OR alternative format:
        // formData.append(`lot_images[${lotNumber}][]`, file);
      });
    });
  }
  
  // Submit to API
  const response = await fetch('/api/auctions', {
    method: 'POST',
    body: formData,
    // Don't set Content-Type - browser will set it automatically with boundary
  });
  
  if (!response.ok) {
    throw new Error('Failed to create auction');
  }
  
  return response.json();
}

// File validation helper
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file format. Accepted: JPEG, PNG, WebP, JPG'
    };
  }
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File exceeds 10MB limit'
    };
  }
  
  return { valid: true };
}

// Example usage in component
import { submitAuction, validateImageFile } from '@/utils/submitAuction';
import { AuctionFormData } from '@/types/auction';

const handleSubmit = async () => {
  // Collect all form data
  const auctionData: AuctionFormData = {
    code: 'EST-2026-001',
    name: 'Premium Estate Auction 2026',
    // ... collect all other fields from form state
    lots: [
      {
        lot_number: '1',
        title: '19th Century Oil Painting',
        // ... other lot fields
        seller_id: 1,
      }
    ],
    feature_image: featureImageFile, // File object
    lot_images: {
      '1': [lot1Image1, lot1Image2], // Array of File objects
      '2': [lot2Image1],
    }
  };
  
  // Validate files before submission
  if (auctionData.feature_image) {
    const validation = validateImageFile(auctionData.feature_image);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }
  }
  
  // Validate lot images
  if (auctionData.lot_images) {
    for (const [lotNumber, files] of Object.entries(auctionData.lot_images)) {
      for (const file of files) {
        const validation = validateImageFile(file);
        if (!validation.valid) {
          toast.error(`Lot ${lotNumber}: ${validation.error}`);
          return;
        }
      }
    }
  }
  
  try {
    const result = await submitAuction(auctionData);
    toast.success('Auction created successfully!');
  } catch (error) {
    toast.error('Failed to create auction');
    console.error(error);
  }
};
```

## API Endpoint Expectations

Your backend should:

1. Accept `multipart/form-data` content type
2. Parse JSON strings for `auction_links` and `lots` arrays
3. Handle file uploads for `feature_image` and `lot_images_*` fields
4. Store/upload files to your storage service (e.g., Cloudinary, S3)
5. Return the created auction with file URLs

Example backend handler (Node.js/Express):
```javascript
// Using multer for file uploads
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.post('/api/auctions', upload.fields([
  { name: 'feature_image', maxCount: 1 },
  { name: 'lot_images_*', maxCount: 10 } // Dynamic field names
]), async (req, res) => {
  const formData = req.body;
  const files = req.files;
  
  // Parse JSON fields
  const auctionLinks = JSON.parse(formData.auction_links || '[]');
  const lots = JSON.parse(formData.lots || '[]');
  
  // Handle feature image
  const featureImage = files.feature_image?.[0];
  
  // Handle lot images (group by lot number)
  const lotImages = {};
  Object.keys(files).forEach(key => {
    if (key.startsWith('lot_images_')) {
      const lotNumber = key.replace('lot_images_', '');
      lotImages[lotNumber] = files[key];
    }
  });
  
  // Upload files to storage and get URLs
  // ... upload logic ...
  
  // Create auction record
  // ... database logic ...
  
  res.json({ success: true, auction: createdAuction });
});
```

