import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { CreateAuctionPayload, CreateAuctionLotInput } from '@/features/auction/types';

interface AuctionFormState extends Omit<CreateAuctionPayload, "feature_images"> {
  feature_images?: File[];
}

interface AuctionFormContextType {
  formState: AuctionFormState;
  updateFormState: (updates: Partial<AuctionFormState>) => void;
  resetFormState: () => void;
  setLotsPayload: (lots: CreateAuctionLotInput[]) => void;
  setLotImages: (lotKey: string, files: File[]) => void;
  removeLotImage: (lotKey: string, fileIndex: number) => void;
  clearLotImages: (lotKey: string) => void;
}

const AuctionFormContext = createContext<AuctionFormContextType | undefined>(undefined);

const initialFormState: AuctionFormState = {
  code: '',
  name: '',
  description: undefined,
  auction_start_at: '',
  auction_end_at: '',
  preview_start_at: undefined,
  preview_end_at: undefined,
  checkout_start_at: undefined,
  checkout_end_at: undefined,
  open_bidding_at: undefined,
  close_bidding_at: undefined,
  timezone: '',
  address_line_1: undefined,
  address_line_2: undefined,
  city: undefined,
  state: undefined,
  zip_code: undefined,
  country: undefined,
  categories: [],
  currency: 'USD',
  commission_percentage: undefined,
  buyer_premium_percentage: undefined,
  buyer_tax_percentage: undefined,
  seller_tax_percentage: undefined,
  buyer_lot_charge_1: undefined,
  buyer_lot_charge_2: undefined,
  minimum_bid_amount: undefined,
  tax_exempt_all: undefined,
  shipping_availability: undefined,
  shipping_account: undefined,
  add_handling_charges: undefined,
  handling_charge_type: undefined,
  handling_charge_amount: undefined,
  bidding_type: 'timed',
  auction_format: 'internet_only',
  bid_visibility: 'public',
  bid_mechanism: 'standard',
  bid_amount_type: 'fixed_flat',
  soft_close_seconds: 180,
  lot_stagger_seconds: 30,
  default_lot_duration_seconds: undefined,
  show_immediate_bid_states: undefined,
  times_the_money_bidding: undefined,
  show_bid_reserve_states: undefined,
  force_bid_increment_schedule: true,
  apply_bid_increment_per_item: false,
  bid_increments: [
    { up_to_amount: 1000, increment: 50 },
    { up_to_amount: 10000, increment: 100 },
    { up_to_amount: 1000000, increment: 500 },
  ],
  require_credit_card_registration: undefined,
  authentication_required_hours: undefined,
  authentication_required_days: undefined,
  successful_bidder_registration_option: undefined,
  deposit_type: undefined,
  deposit_value: undefined,
  deposit_cap: undefined,
  deposit_policy: undefined,
  starting_bid_card_number: 1,
  live_starting_bid_card_number: 1,
  max_amount_per_item: undefined,
  terms_and_conditions: undefined,
  payment_information: undefined,
  shipping_pickup_info: undefined,
  bidding_notice: undefined,
  auction_notice: undefined,
  short_bp_explanation: undefined,
  auction_links: [],
  email_subject: undefined,
  email_body: undefined,
  lots: [],
  feature_images: undefined,
  lot_images: undefined,
};

export const AuctionFormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [formState, setFormState] = useState<AuctionFormState>(initialFormState);

  const updateFormState = useCallback((updates: Partial<AuctionFormState>) => {
    setFormState(prevState => ({
      ...prevState,
      ...updates,
    }));
  }, []);

  const resetFormState = useCallback(() => {
    setFormState(initialFormState);
  }, []);

  const setLotsPayload = useCallback((lots: CreateAuctionLotInput[]) => {
    updateFormState({ lots });
  }, [updateFormState]);

  const setLotImages = useCallback((lotKey: string, files: File[]) => {
    updateFormState({
      lot_images: {
        ...(formState.lot_images || {}),
        [lotKey]: files,
      },
    });
  }, [formState.lot_images, updateFormState]);

  const removeLotImage = useCallback((lotKey: string, fileIndex: number) => {
    const current = formState.lot_images || {};
    const nextFiles = (current[lotKey] || []).filter((_, index) => index !== fileIndex);
    updateFormState({
      lot_images: {
        ...current,
        [lotKey]: nextFiles,
      },
    });
  }, [formState.lot_images, updateFormState]);

  const clearLotImages = useCallback((lotKey: string) => {
    const current = formState.lot_images || {};
    if (!current[lotKey]) return;
    const next = { ...current };
    delete next[lotKey];
    updateFormState({ lot_images: next });
  }, [formState.lot_images, updateFormState]);

  const value = useMemo(() => ({
    formState,
    updateFormState,
    resetFormState,
    setLotsPayload,
    setLotImages,
    removeLotImage,
    clearLotImages,
  }), [formState, updateFormState, resetFormState, setLotsPayload, setLotImages, removeLotImage, clearLotImages]);

  return (
    <AuctionFormContext.Provider value={value}>
      {children}
    </AuctionFormContext.Provider>
  );
};

export const useAuctionForm = () => {
  const context = useContext(AuctionFormContext);
  if (context === undefined) {
    throw new Error('useAuctionForm must be used within an AuctionFormProvider');
  }
  return context;
};
