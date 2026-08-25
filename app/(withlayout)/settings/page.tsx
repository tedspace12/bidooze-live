"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Bell,
  Building2,
  CheckCircle2,
  Clock3,
  CreditCard,
  Hammer,
  Landmark,
  Loader2,
  Pencil,
  Save,
  Shield,
  User,
  Wallet,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CurrencySelect } from "@/components/ui/currency-select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUploader } from "@/components/auth/registration/FileUploader";
import {
  PaystackConnectDialog,
  PAYSTACK_COUNTRIES,
  type PaystackAccountValues,
} from "@/components/payments/PaystackConnectDialog";
import { cn } from "@/lib/utils";
import { withAuctioneerAuth } from "@/services/api";
import type { PaymentProvider } from "@/features/auth/types";

type TabKey = "profile" | "business" | "payouts" | "auctions" | "notifications" | "security";
const TAB_KEYS: TabKey[] = ["profile", "business", "payouts", "auctions", "notifications", "security"];
type BusinessDocType = "government_id" | "business_doc" | "license";
const BUSINESS_DOCUMENT_TYPES: { type: BusinessDocType; label: string }[] = [
  { type: "government_id", label: "Government ID" },
  { type: "business_doc", label: "Business Document" },
  { type: "license", label: "License" },
];
type VerificationStatus = "verified" | "pending" | "rejected";

type SettingsState = {
  profile: {
    displayName: string;
    bio: string;
    phone: string;
    website: string;
    fullAddress: string;
    subdomain: string;
    wantsSubdomain: boolean;
  };
  business: {
    companyName: string;
    businessRegNo: string;
    taxId: string;
    businessType: string;
    specialization: string;
    yearsInBusiness: string;
    licenseNumber: string;
    licenseExpirationDate: string;
    certifications: string;
    associations: string;
    verificationStatus: VerificationStatus;
    documents: Array<{ id: string; name: string; url: string; uploadedAt: string }>;
  };
  payouts: {
    paymentGateway: PaymentProvider | null;
    gatewayAccountStatus: string | null;
    businessName: string | null;
    accountName: string | null;
    bankName: string | null;
    accountNumberLast4: string | null;
    country: string | null;
    currency: string | null;
    onboardingCompleted: boolean;
    onboardingCompletedAt: string | null;
    paymentAccountConnected: boolean;
  };
  auctions: {
    defaultDurationHours: number;
    defaultBidIncrement: number;
    defaultBidMechanism: "standard" | "proxy";
    requiresRegistrationApproval: boolean;
    autoExtend: boolean;
    defaultCurrency: string;
  };
  notifications: {
    new_bid: boolean;
    auction_ending_soon: boolean;
    auction_ending_soon_minutes: number;
    auction_ended: boolean;
    winner_paid: boolean;
    payout_processed: boolean;
    login_alerts: boolean;
  };
  security: {
    mfaEnabled: boolean;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
};

type Envelope<T> = { message?: string; data: T };

type ProfileApi = {
  display_name?: string | null;
  bio?: string | null;
  phone?: string | null;
  website?: string | null;
  full_address?: string | null;
  avatar_url?: string | null;
  subdomain?: string | null;
  wants_subdomain?: boolean | null;
};

type BusinessDocApi = {
  id?: string | number | null;
  name?: string | null;
  url?: string | null;
  uploaded_at?: string | null;
};

type BusinessApi = {
  company_name?: string | null;
  business_reg_no?: string | null;
  tax_id?: string | null;
  business_type?: string | null;
  specialization?: string | null;
  years_in_business?: string | number | null;
  license_number?: string | null;
  license_expiration_date?: string | null;
  certifications?: string | null;
  associations?: string | null;
  verification_status?: VerificationStatus | null;
  documents?: BusinessDocApi[] | null;
};

type PayoutApi = {
  payment_gateway?: PaymentProvider | null;
  gateway_account_id?: string | null;
  gateway_account_status?: string | null;
  business_name?: string | null;
  account_name?: string | null;
  bank_name?: string | null;
  account_number_last4?: string | null;
  country?: string | null;
  currency?: string | null;
  onboarding_completed?: boolean | null;
  onboarding_completed_at?: string | null;
  payment_account_connected?: boolean | null;
  redirect_url?: string | null;
};

type AuctionDefaultsApi = {
  default_duration_hours?: number;
  default_bid_increment?: number;
  default_bid_mechanism?: "standard" | "proxy";
  requires_registration_approval?: boolean;
  auto_extend?: boolean;
  default_currency?: string;
};

type NotificationsApi = {
  new_bid?: boolean;
  auction_ending_soon?: boolean;
  auction_ending_soon_minutes?: number;
  auction_ended?: boolean;
  winner_paid?: boolean;
  payout_processed?: boolean;
  login_alerts?: boolean;
};

type SecurityApi = {
  mfa_enabled?: boolean;
};

const ENDPOINTS = {
  profile: "/auctioneer/settings/profile",
  business: "/auctioneer/settings/business",
  businessDocuments: "/auctioneer/settings/business/documents",
  payouts: "/auctioneer/settings/payout",
  auctions: "/auctioneer/settings/auction-defaults",
  notifications: "/auctioneer/settings/notifications",
  security: "/auctioneer/settings/security",
  avatar: "/auctioneer/settings/profile/avatar",
  password: "/auctioneer/settings/security/password",
} as const;

const INITIAL_DIRTY: Record<TabKey, boolean> = {
  profile: false,
  business: false,
  payouts: false,
  auctions: false,
  notifications: false,
  security: false,
};

const INITIAL_STATE: SettingsState = {
  profile: { displayName: "", bio: "", phone: "", website: "", fullAddress: "", subdomain: "", wantsSubdomain: false },
  business: {
    companyName: "",
    businessRegNo: "",
    taxId: "",
    businessType: "",
    specialization: "",
    yearsInBusiness: "",
    licenseNumber: "",
    licenseExpirationDate: "",
    certifications: "",
    associations: "",
    verificationStatus: "pending",
    documents: [],
  },
  payouts: {
    paymentGateway: null,
    gatewayAccountStatus: null,
    businessName: null,
    accountName: null,
    bankName: null,
    accountNumberLast4: null,
    country: null,
    currency: null,
    onboardingCompleted: false,
    onboardingCompletedAt: null,
    paymentAccountConnected: false,
  },
  auctions: {
    defaultDurationHours: 72,
    defaultBidIncrement: 25,
    defaultBidMechanism: "proxy",
    requiresRegistrationApproval: true,
    autoExtend: true,
    defaultCurrency: "USD",
  },
  notifications: {
    new_bid: true,
    auction_ending_soon: true,
    auction_ending_soon_minutes: 60,
    auction_ended: true,
    winner_paid: true,
    payout_processed: true,
    login_alerts: true,
  },
  security: { mfaEnabled: false, currentPassword: "", newPassword: "", confirmPassword: "" },
};

const unwrap = <T,>(payload: unknown): T =>
  payload && typeof payload === "object" && "data" in payload
    ? (payload as Envelope<T>).data
    : (payload as T);

const getErr = (error: unknown): string => {
  if (!error || typeof error !== "object") return "Request failed.";
  const data = (error as { response?: { data?: unknown } }).response?.data;
  if (data && typeof data === "object") {
    const msg = (data as { message?: unknown }).message;
    if (typeof msg === "string" && msg.trim()) return msg;
    const errors = (data as { errors?: Record<string, unknown> }).errors;
    if (errors && typeof errors === "object") {
      const first = Object.values(errors)[0];
      if (Array.isArray(first) && typeof first[0] === "string") return first[0];
    }
  }
  const msg = (error as { message?: unknown }).message;
  return typeof msg === "string" && msg.trim() ? msg : "Request failed.";
};

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const initialTab = TAB_KEYS.includes(searchParams.get("tab") as TabKey)
    ? (searchParams.get("tab") as TabKey)
    : "profile";

  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [settings, setSettings] = useState<SettingsState>(INITIAL_STATE);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [savingTab, setSavingTab] = useState<TabKey | null>(null);
  const [subdomainTouched, setSubdomainTouched] = useState(false);
  const [dirtyTabs, setDirtyTabs] = useState<Record<TabKey, boolean>>(INITIAL_DIRTY);
  const [uploadingBusinessDocType, setUploadingBusinessDocType] = useState<BusinessDocType | null>(null);
  const [businessDocResetKeys, setBusinessDocResetKeys] = useState<Record<BusinessDocType, number>>({
    government_id: 0,
    business_doc: 0,
    license: 0,
  });
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | undefined>(undefined);
  const [paystackDialogOpen, setPaystackDialogOpen] = useState(false);
  const [isConnectingStripe, setIsConnectingStripe] = useState(false);

  const markDirty = (tab: TabKey) => setDirtyTabs((prev) => ({ ...prev, [tab]: true }));

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const [profileRes, businessRes, payoutsRes, auctionsRes, notificationsRes, securityRes] = await Promise.all([
          withAuctioneerAuth.get(ENDPOINTS.profile),
          withAuctioneerAuth.get(ENDPOINTS.business),
          withAuctioneerAuth.get(ENDPOINTS.payouts),
          withAuctioneerAuth.get(ENDPOINTS.auctions),
          withAuctioneerAuth.get(ENDPOINTS.notifications),
          withAuctioneerAuth.get(ENDPOINTS.security),
        ]);
        if (!mounted) return;

        const profile = unwrap<ProfileApi>(profileRes.data);
        const business = unwrap<BusinessApi>(businessRes.data);
        const payouts = unwrap<PayoutApi>(payoutsRes.data);
        const auctions = unwrap<AuctionDefaultsApi>(auctionsRes.data);
        const notifications = unwrap<NotificationsApi>(notificationsRes.data);
        const security = unwrap<SecurityApi>(securityRes.data);

        setAvatarUrl(profile?.avatar_url || "");
        setSettings({
          profile: {
            displayName: profile?.display_name || "",
            bio: profile?.bio || "",
            phone: profile?.phone || "",
            website: profile?.website || "",
            fullAddress: profile?.full_address || "",
            subdomain: profile?.subdomain || "",
            wantsSubdomain: Boolean(profile?.wants_subdomain),
          },
          business: {
            companyName: business?.company_name || "",
            businessRegNo: business?.business_reg_no || "",
            taxId: business?.tax_id || "",
            businessType: business?.business_type || "",
            specialization: business?.specialization || "",
            yearsInBusiness: business?.years_in_business == null ? "" : String(business?.years_in_business),
            licenseNumber: business?.license_number || "",
            licenseExpirationDate: business?.license_expiration_date || "",
            certifications: business?.certifications || "",
            associations: business?.associations || "",
            verificationStatus: business?.verification_status || "pending",
            documents: (business?.documents || []).map((doc: BusinessDocApi, idx: number) => ({
              id: String(doc?.id ?? idx),
              name: doc?.name || "Document",
              url: doc?.url || "#",
              uploadedAt: doc?.uploaded_at || "",
            })),
          },
          payouts: {
            paymentGateway: payouts?.payment_gateway || null,
            gatewayAccountStatus: payouts?.gateway_account_status || null,
            businessName: payouts?.business_name || null,
            accountName: payouts?.account_name || null,
            bankName: payouts?.bank_name || null,
            accountNumberLast4: payouts?.account_number_last4 || null,
            country: payouts?.country || null,
            currency: payouts?.currency || null,
            onboardingCompleted: Boolean(payouts?.onboarding_completed),
            onboardingCompletedAt: payouts?.onboarding_completed_at || null,
            paymentAccountConnected: Boolean(payouts?.payment_account_connected),
          },
          auctions: {
            defaultDurationHours: auctions?.default_duration_hours ?? 72,
            defaultBidIncrement: auctions?.default_bid_increment ?? 25,
            defaultBidMechanism: auctions?.default_bid_mechanism ?? "proxy",
            requiresRegistrationApproval: auctions?.requires_registration_approval ?? true,
            autoExtend: auctions?.auto_extend ?? true,
            defaultCurrency: auctions?.default_currency ?? "USD",
          },
          notifications: {
            new_bid: notifications?.new_bid ?? true,
            auction_ending_soon: notifications?.auction_ending_soon ?? true,
            auction_ending_soon_minutes: notifications?.auction_ending_soon_minutes ?? 60,
            auction_ended: notifications?.auction_ended ?? true,
            winner_paid: notifications?.winner_paid ?? true,
            payout_processed: notifications?.payout_processed ?? true,
            login_alerts: notifications?.login_alerts ?? true,
          },
          security: {
            mfaEnabled: Boolean(security?.mfa_enabled),
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          },
        });
        setSubdomainTouched(false);
        setDirtyTabs(INITIAL_DIRTY);
      } catch (error) {
        toast.error(getErr(error));
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const saveTab = async (tab: TabKey) => {
    setSavingTab(tab);
    try {
      if (tab === "business") {
        const res = await withAuctioneerAuth.patch(ENDPOINTS.business, {
          license_number: settings.business.licenseNumber.trim() || null,
          license_expiration_date: settings.business.licenseExpirationDate || null,
          certifications: settings.business.certifications.trim() || null,
          associations: settings.business.associations.trim() || null,
        });
        const business = unwrap<BusinessApi>(res.data);
        setSettings((prev) => ({
          ...prev,
          business: {
            ...prev.business,
            licenseNumber: business?.license_number || "",
            licenseExpirationDate: business?.license_expiration_date || "",
            certifications: business?.certifications || "",
            associations: business?.associations || "",
            verificationStatus: business?.verification_status || prev.business.verificationStatus,
          },
        }));
      }

      if (tab === "profile") {
        if (!settings.profile.displayName.trim()) {
          toast.error("Display name is required.");
          return;
        }
        const res = await withAuctioneerAuth.patch(ENDPOINTS.profile, {
          display_name: settings.profile.displayName.trim(),
          bio: settings.profile.bio.trim() || null,
          phone: settings.profile.phone.trim() || null,
          website: settings.profile.website.trim() || null,
          full_address: settings.profile.fullAddress.trim() || null,
          wants_subdomain: settings.profile.wantsSubdomain,
          ...(subdomainTouched ? { subdomain: settings.profile.subdomain.trim() || null } : {}),
        });
        const savedProfile = unwrap<ProfileApi>(res.data);
        setSettings((prev) => ({
          ...prev,
          profile: {
            ...prev.profile,
            subdomain: savedProfile?.subdomain || "",
            wantsSubdomain: Boolean(savedProfile?.wants_subdomain),
          },
        }));
        setSubdomainTouched(false);
      }

      if (tab === "auctions") {
        await withAuctioneerAuth.patch(ENDPOINTS.auctions, {
          default_duration_hours: settings.auctions.defaultDurationHours,
          default_bid_increment: settings.auctions.defaultBidIncrement,
          default_bid_mechanism: settings.auctions.defaultBidMechanism,
          requires_registration_approval: settings.auctions.requiresRegistrationApproval,
          auto_extend: settings.auctions.autoExtend,
          default_currency: settings.auctions.defaultCurrency,
        });
      }

      if (tab === "notifications") {
        await withAuctioneerAuth.patch(ENDPOINTS.notifications, settings.notifications);
      }

      if (tab === "security") {
        await withAuctioneerAuth.patch(ENDPOINTS.security, { mfa_enabled: settings.security.mfaEnabled });
        const hasPassword = settings.security.currentPassword || settings.security.newPassword || settings.security.confirmPassword;
        if (hasPassword) {
          if (!settings.security.currentPassword || !settings.security.newPassword || !settings.security.confirmPassword) {
            return void toast.error("Complete all password fields.");
          }
          if (settings.security.newPassword !== settings.security.confirmPassword) {
            return void toast.error("Password confirmation does not match.");
          }
          if (settings.security.currentPassword === settings.security.newPassword) {
            return void toast.error("New password must differ from current password.");
          }
          await withAuctioneerAuth.patch(ENDPOINTS.password, {
            current_password: settings.security.currentPassword,
            new_password: settings.security.newPassword,
            new_password_confirmation: settings.security.confirmPassword,
          });
          setSettings((prev) => ({
            ...prev,
            security: { ...prev.security, currentPassword: "", newPassword: "", confirmPassword: "" },
          }));
        }
      }

      setDirtyTabs((prev) => ({ ...prev, [tab]: false }));
      toast.success(`${tab} settings saved`);
    } catch (error) {
      toast.error(getErr(error));
    } finally {
      setSavingTab(null);
    }
  };

  const handleBusinessDocumentUpload = async (type: BusinessDocType, urls: string[] | null) => {
    if (!urls || urls.length === 0) return;
    const fileUrl = urls[urls.length - 1];
    setUploadingBusinessDocType(type);
    try {
      const res = await withAuctioneerAuth.post(ENDPOINTS.businessDocuments, {
        type,
        file_url: fileUrl,
      });
      const doc = unwrap<{ id?: string | number; name?: string; url?: string; uploaded_at?: string }>(res.data);
      setSettings((prev) => ({
        ...prev,
        business: {
          ...prev.business,
          documents: [
            ...prev.business.documents,
            {
              id: String(doc?.id ?? crypto.randomUUID()),
              name: doc?.name || "Document",
              url: doc?.url || fileUrl,
              uploadedAt: doc?.uploaded_at || new Date().toISOString(),
            },
          ],
        },
      }));
      toast.success("Document uploaded");
    } catch (error) {
      toast.error(getErr(error));
    } finally {
      setUploadingBusinessDocType(null);
      setBusinessDocResetKeys((prev) => ({ ...prev, [type]: prev[type] + 1 }));
    }
  };

  const applyPayoutResponse = (payoutApi: PayoutApi | undefined) => {
    setSettings((prev) => ({
      ...prev,
      payouts: {
        paymentGateway: payoutApi?.payment_gateway || null,
        gatewayAccountStatus: payoutApi?.gateway_account_status || null,
        businessName: payoutApi?.business_name || null,
        accountName: payoutApi?.account_name || null,
        bankName: payoutApi?.bank_name || null,
        accountNumberLast4: payoutApi?.account_number_last4 || null,
        country: payoutApi?.country || null,
        currency: payoutApi?.currency || null,
        onboardingCompleted: Boolean(payoutApi?.onboarding_completed),
        onboardingCompletedAt: payoutApi?.onboarding_completed_at || null,
        paymentAccountConnected: Boolean(payoutApi?.payment_account_connected),
      },
    }));
  };

  const handlePaystackConnectSave = async (values: PaystackAccountValues) => {
    setSavingTab("payouts");
    try {
      const res = await withAuctioneerAuth.patch(ENDPOINTS.payouts, {
        payment_provider: "paystack",
        account_number: values.accountNumber,
        bank_code: values.bankCode,
        bank_name: values.bankName,
        business_name: values.businessName,
        country: values.country,
      });
      applyPayoutResponse(unwrap<PayoutApi>(res.data));
      setSelectedProvider("paystack");
      toast.success("Payout account connected");
    } catch (error) {
      toast.error(getErr(error));
    } finally {
      setSavingTab(null);
    }
  };

  const handleConnectStripe = async () => {
    setIsConnectingStripe(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const res = await withAuctioneerAuth.patch(ENDPOINTS.payouts, {
        payment_provider: "stripe",
        stripe_return_url: `${origin}/settings/payment-return`,
        stripe_refresh_url: `${origin}/settings/payment-refresh`,
      });
      const payoutData = unwrap<PayoutApi>(res.data);
      if (payoutData?.redirect_url) {
        toast.success("Redirecting to Stripe");
        window.location.href = payoutData.redirect_url;
        return;
      }
      applyPayoutResponse(payoutData);
      toast.success("Stripe account connected");
    } catch (error) {
      toast.error(getErr(error));
    } finally {
      setIsConnectingStripe(false);
    }
  };

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return void toast.error("Please upload an image.");
    if (file.size > 5 * 1024 * 1024) return void toast.error("Image must be 5MB or less.");

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await withAuctioneerAuth.post(ENDPOINTS.avatar, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = unwrap<{ avatar_url?: string }>(res.data);
      if (data.avatar_url) setAvatarUrl(data.avatar_url);
      toast.success("Avatar uploaded");
    } catch (error) {
      toast.error(getErr(error));
    } finally {
      setIsUploadingAvatar(false);
      event.target.value = "";
    }
  };

  const saveButton = (tab: TabKey, label: string) => (
    <Button onClick={() => saveTab(tab)} disabled={savingTab === tab || !dirtyTabs[tab]}>
      {savingTab === tab ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
      {savingTab === tab ? "Saving..." : label}
    </Button>
  );

  const dirtyCount = Object.values(dirtyTabs).filter(Boolean).length;
  const effectiveProvider = selectedProvider ?? settings.payouts.paymentGateway ?? undefined;
  const selectedPaystackCountry = PAYSTACK_COUNTRIES.find((c) => c.code === settings.payouts.country);
  const maskedAccountNumber = settings.payouts.accountNumberLast4
    ? `••••${settings.payouts.accountNumberLast4}`
    : "";

  const statusBadge = settings.business.verificationStatus === "verified"
    ? <Badge className="gap-1 bg-emerald-600 text-white"><CheckCircle2 className="h-3.5 w-3.5" />Verified</Badge>
    : settings.business.verificationStatus === "pending"
      ? <Badge variant="secondary" className="gap-1"><Clock3 className="h-3.5 w-3.5" />Pending</Badge>
      : <Badge variant="outline" className="gap-1"><XCircle className="h-3.5 w-3.5" />Rejected</Badge>;

  return (
    <div className="space-y-6 pb-10 [&_label]:mb-1.5 [&_label]:inline-block">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Auctioneer Settings</h1>
        <p className="text-muted-foreground">Manage profile, business, payout, defaults, notifications and security.</p>
        <div className="flex flex-wrap gap-2">
          {isLoading && <Badge variant="secondary" className="gap-1"><Loader2 className="h-3.5 w-3.5 animate-spin" />Loading</Badge>}
          {dirtyCount > 0 && <Badge variant="secondary">{dirtyCount} unsaved tab(s)</Badge>}
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)} className="space-y-5">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-xl border border-border bg-muted/60 p-1 sm:grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="profile" className="h-auto w-full px-3 py-2"><User className="h-4 w-4" />Profile</TabsTrigger>
          <TabsTrigger value="business" className="h-auto w-full px-3 py-2"><Building2 className="h-4 w-4" />Business</TabsTrigger>
          <TabsTrigger value="payouts" className="h-auto w-full px-3 py-2"><Wallet className="h-4 w-4" />Payouts</TabsTrigger>
          <TabsTrigger value="auctions" className="h-auto w-full px-3 py-2"><Hammer className="h-4 w-4" />Auctions</TabsTrigger>
          <TabsTrigger value="notifications" className="h-auto w-full px-3 py-2"><Bell className="h-4 w-4" />Notifications</TabsTrigger>
          <TabsTrigger value="security" className="h-auto w-full px-3 py-2"><Shield className="h-4 w-4" />Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card><CardHeader><CardTitle>Profile</CardTitle><CardDescription>Public-facing identity and contact information.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4 rounded-lg border border-border bg-muted/30 p-4 sm:flex-row sm:items-center">
                <Avatar className="h-20 w-20 border border-border"><AvatarImage src={avatarUrl} /><AvatarFallback>{(settings.profile.displayName[0] || "A").toUpperCase()}</AvatarFallback></Avatar>
                <div className="w-full space-y-2"><Label htmlFor="profileAvatar">Avatar</Label><Input id="profileAvatar" type="file" accept="image/jpeg,image/jpg,image/png,image/webp" disabled={isUploadingAvatar} onChange={handleAvatarUpload} /></div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div><Label>Display Name</Label><Input value={settings.profile.displayName} onChange={(e) => { setSettings((p) => ({ ...p, profile: { ...p.profile, displayName: e.target.value } })); markDirty("profile"); }} /></div>
                <div><Label>Phone</Label><Input value={settings.profile.phone} onChange={(e) => { setSettings((p) => ({ ...p, profile: { ...p.profile, phone: e.target.value } })); markDirty("profile"); }} /></div>
                <div><Label>Website</Label><Input value={settings.profile.website} onChange={(e) => { setSettings((p) => ({ ...p, profile: { ...p.profile, website: e.target.value } })); markDirty("profile"); }} /></div>
              </div>
              <div><Label>Bio</Label><Textarea rows={4} value={settings.profile.bio} onChange={(e) => { setSettings((p) => ({ ...p, profile: { ...p.profile, bio: e.target.value } })); markDirty("profile"); }} /></div>
              <div><Label>Full Address</Label><Input value={settings.profile.fullAddress} onChange={(e) => { setSettings((p) => ({ ...p, profile: { ...p.profile, fullAddress: e.target.value } })); markDirty("profile"); }} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Bidooze Subdomain</CardTitle><CardDescription>Give bidders a dedicated storefront URL.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 p-4">
                <div>
                  <Label>Reserve a Bidooze subdomain</Label>
                  <p className="text-xs text-muted-foreground">
                    Turning this off clears your current subdomain.
                  </p>
                </div>
                <Switch
                  checked={settings.profile.wantsSubdomain}
                  onCheckedChange={(checked) => {
                    setSettings((p) => ({
                      ...p,
                      profile: { ...p.profile, wantsSubdomain: checked, ...(checked ? {} : { subdomain: "" }) },
                    }));
                    markDirty("profile");
                  }}
                />
              </div>
              {settings.profile.wantsSubdomain && (
                <div>
                  <Label>Subdomain</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={settings.profile.subdomain}
                      placeholder="yourcompany"
                      onChange={(e) => {
                        setSubdomainTouched(true);
                        setSettings((p) => ({ ...p, profile: { ...p.profile, subdomain: e.target.value } }));
                        markDirty("profile");
                      }}
                    />
                    <span className="whitespace-nowrap text-sm text-muted-foreground">.bidooze.com</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Lowercase letters, numbers, and hyphens only. Leave blank to auto-generate from your company name.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">{saveButton("profile", "Save Profile")}</div>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <Card><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>Business</CardTitle><CardDescription>Credentials set at registration are read-only here; license and verification details can be updated.</CardDescription></div>{statusBadge}</CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div><Label>Company</Label><p className="rounded-md border border-border bg-muted/20 px-3 py-2 text-sm">{settings.business.companyName || "-"}</p></div>
                <div><Label>Business Reg No</Label><p className="rounded-md border border-border bg-muted/20 px-3 py-2 text-sm">{settings.business.businessRegNo || "-"}</p></div>
                <div><Label>Tax ID</Label><p className="rounded-md border border-border bg-muted/20 px-3 py-2 text-sm">{settings.business.taxId || "-"}</p></div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div><Label>Business Type</Label><p className="rounded-md border border-border bg-muted/20 px-3 py-2 text-sm">{settings.business.businessType || "-"}</p></div>
                <div><Label>Specialization</Label><p className="rounded-md border border-border bg-muted/20 px-3 py-2 text-sm">{settings.business.specialization || "-"}</p></div>
                <div><Label>Years</Label><p className="rounded-md border border-border bg-muted/20 px-3 py-2 text-sm">{settings.business.yearsInBusiness || "-"}</p></div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label>License Number</Label>
                  <Input
                    value={settings.business.licenseNumber}
                    onChange={(e) => { setSettings((p) => ({ ...p, business: { ...p.business, licenseNumber: e.target.value } })); markDirty("business"); }}
                  />
                </div>
                <div>
                  <Label>License Expiration</Label>
                  <Input
                    type="date"
                    value={settings.business.licenseExpirationDate}
                    onChange={(e) => { setSettings((p) => ({ ...p, business: { ...p.business, licenseExpirationDate: e.target.value } })); markDirty("business"); }}
                  />
                </div>
              </div>
              <div>
                <Label>Certifications</Label>
                <Textarea
                  rows={3}
                  value={settings.business.certifications}
                  onChange={(e) => { setSettings((p) => ({ ...p, business: { ...p.business, certifications: e.target.value } })); markDirty("business"); }}
                />
              </div>
              <div>
                <Label>Associations</Label>
                <Textarea
                  rows={3}
                  value={settings.business.associations}
                  onChange={(e) => { setSettings((p) => ({ ...p, business: { ...p.business, associations: e.target.value } })); markDirty("business"); }}
                />
              </div>

              <div className="rounded-lg border border-dashed border-border p-4 space-y-3">
                <Label>Verification Documents</Label>
                {settings.business.documents.length > 0 ? (
                  <div className="space-y-2">
                    {settings.business.documents.map((document) => (
                      <div
                        key={document.id}
                        className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/20 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{document.name}</p>
                          <p className="text-xs text-muted-foreground">Uploaded {document.uploadedAt || "-"}</p>
                        </div>
                        <a
                          href={document.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-sm font-medium text-primary hover:underline"
                        >
                          Preview
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
                )}

                <div className="grid grid-cols-1 gap-4 pt-2 border-t border-border sm:grid-cols-3">
                  {BUSINESS_DOCUMENT_TYPES.map(({ type, label }) => (
                    <div key={type} className="space-y-2">
                      <FileUploader
                        key={businessDocResetKeys[type]}
                        folder="auctioneers/settings/business-documents"
                        label={label}
                        maxFiles={1}
                        onChange={(urls) => handleBusinessDocumentUpload(type, urls)}
                      />
                      {uploadingBusinessDocType === type && (
                        <p className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end">{saveButton("business", "Save Business")}</div>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payouts</CardTitle>
              <CardDescription>Where auction proceeds are sent when buyers pay.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Payment provider</Label>
                <RadioGroup
                  value={effectiveProvider}
                  onValueChange={(v) => setSelectedProvider(v as PaymentProvider)}
                  className="grid grid-cols-1 gap-3 md:grid-cols-2"
                >
                  {[
                    { value: "stripe", label: "Stripe", description: "Use Stripe Connect for supported countries.", icon: CreditCard },
                    { value: "paystack", label: "Paystack", description: "Use a bank account from a supported African country through Paystack.", icon: Landmark },
                  ].map((option) => {
                    const Icon = option.icon;
                    const selected = effectiveProvider === option.value;
                    return (
                      <label
                        key={option.value}
                        className={cn(
                          "flex cursor-pointer gap-3 rounded-lg border p-4 transition-colors",
                          selected ? "border-[#3F6B2D] bg-[#3F6B2D]/5" : "border-border bg-card"
                        )}
                      >
                        <RadioGroupItem value={option.value} className="mt-1" />
                        <Icon className="mt-0.5 h-5 w-5 text-muted-foreground" />
                        <span className="space-y-1">
                          <span className="block font-medium text-foreground">{option.label}</span>
                          <span className="block text-sm text-muted-foreground">{option.description}</span>
                        </span>
                      </label>
                    );
                  })}
                </RadioGroup>
              </div>

              {effectiveProvider === "stripe" && (
                <div className="space-y-3">
                  {settings.payouts.paymentAccountConnected && settings.payouts.paymentGateway === "stripe" ? (
                    <div className="flex items-start gap-3 rounded-lg border border-[#3F6B2D]/25 bg-[#3F6B2D]/5 p-4">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#3F6B2D]" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Stripe account connected</p>
                        {settings.payouts.onboardingCompletedAt && (
                          <p className="text-xs text-muted-foreground">
                            Since {new Date(settings.payouts.onboardingCompletedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Payouts via Stripe</p>
                          <p className="text-xs text-muted-foreground">
                            You will finish a short setup on Stripe&apos;s site, then come back here.
                          </p>
                        </div>
                      </div>
                      <Button type="button" onClick={handleConnectStripe} disabled={isConnectingStripe} className="w-full sm:w-auto">
                        {isConnectingStripe ? <><Loader2 className="h-4 w-4 animate-spin" /> Connecting...</> : "Connect with Stripe"}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {effectiveProvider === "paystack" && (
                <div className="space-y-3">
                  {settings.payouts.paymentAccountConnected && settings.payouts.paymentGateway === "paystack" ? (
                    <div className="flex flex-col gap-3 rounded-lg border border-[#3F6B2D]/25 bg-[#3F6B2D]/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#3F6B2D]" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{settings.payouts.accountName || "Account connected"}</p>
                          <p className="text-xs text-muted-foreground">
                            {settings.payouts.bankName} · {maskedAccountNumber} · {selectedPaystackCountry?.label}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPaystackDialogOpen(true)}
                        className="w-full gap-2 sm:w-auto"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Change
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">Payout details not added yet</p>
                        <p className="text-xs text-muted-foreground">
                          Add the bank account you would like your Paystack payouts sent to.
                        </p>
                      </div>
                      <Button type="button" onClick={() => setPaystackDialogOpen(true)} className="w-full sm:w-auto">
                        Add payout details
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <PaystackConnectDialog
            open={paystackDialogOpen}
            onOpenChange={setPaystackDialogOpen}
            initialValues={{
              country: settings.payouts.paymentGateway === "paystack" ? settings.payouts.country || "" : "",
              bankCode: "",
              bankName: settings.payouts.paymentGateway === "paystack" ? settings.payouts.bankName || "" : "",
              accountNumber: "",
              businessName: settings.payouts.businessName || "",
              resolvedAccountName: settings.payouts.paymentGateway === "paystack" ? settings.payouts.accountName || "" : "",
            }}
            onSave={handlePaystackConnectSave}
          />
        </TabsContent>

        <TabsContent value="auctions" className="space-y-6">
          <Card><CardHeader><CardTitle>Auction Defaults</CardTitle><CardDescription>Default values used during auction creation.</CardDescription></CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div><Label>Duration (hours)</Label><Input type="number" min={1} value={settings.auctions.defaultDurationHours} onChange={(e) => { setSettings((p) => ({ ...p, auctions: { ...p.auctions, defaultDurationHours: Number(e.target.value) || 1 } })); markDirty("auctions"); }} /></div>
              <div><Label>Bid Increment</Label><Input type="number" min={1} value={settings.auctions.defaultBidIncrement} onChange={(e) => { setSettings((p) => ({ ...p, auctions: { ...p.auctions, defaultBidIncrement: Number(e.target.value) || 1 } })); markDirty("auctions"); }} /></div>
              <div><Label>Bid Mechanism</Label><Select value={settings.auctions.defaultBidMechanism} onValueChange={(v) => { setSettings((p) => ({ ...p, auctions: { ...p.auctions, defaultBidMechanism: v as "standard" | "proxy" } })); markDirty("auctions"); }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="standard">Standard</SelectItem><SelectItem value="proxy">Proxy</SelectItem></SelectContent></Select></div>
              <div><Label>Default Currency</Label><CurrencySelect name="auctionCurrency" value={settings.auctions.defaultCurrency} onChange={(v) => { setSettings((p) => ({ ...p, auctions: { ...p.auctions, defaultCurrency: (v || p.auctions.defaultCurrency).toUpperCase() } })); markDirty("auctions"); }} /></div>
            </CardContent>
          </Card>
          <Card><CardHeader><CardTitle>Automation</CardTitle></CardHeader><CardContent className="space-y-3"><div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4"><p>Require Registration Approval</p><Switch checked={settings.auctions.requiresRegistrationApproval} onCheckedChange={(v) => { setSettings((p) => ({ ...p, auctions: { ...p.auctions, requiresRegistrationApproval: v } })); markDirty("auctions"); }} /></div><div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4"><p>Auto-Extend</p><Switch checked={settings.auctions.autoExtend} onCheckedChange={(v) => { setSettings((p) => ({ ...p, auctions: { ...p.auctions, autoExtend: v } })); markDirty("auctions"); }} /></div></CardContent></Card>
          <div className="flex justify-end">{saveButton("auctions", "Save Defaults")}</div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card><CardHeader><CardTitle>Notifications</CardTitle><CardDescription>Notification preferences for auction activity and security.</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4"><p>New bid</p><Switch checked={settings.notifications.new_bid} onCheckedChange={(v) => { setSettings((p) => ({ ...p, notifications: { ...p.notifications, new_bid: v } })); markDirty("notifications"); }} /></div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4"><p>Auction ending soon</p><div className="flex items-center gap-2"><Input type="number" min={1} className="w-20" value={settings.notifications.auction_ending_soon_minutes} disabled={!settings.notifications.auction_ending_soon} onChange={(e) => { setSettings((p) => ({ ...p, notifications: { ...p.notifications, auction_ending_soon_minutes: Math.max(1, Number(e.target.value) || 1) } })); markDirty("notifications"); }} /><Switch checked={settings.notifications.auction_ending_soon} onCheckedChange={(v) => { setSettings((p) => ({ ...p, notifications: { ...p.notifications, auction_ending_soon: v } })); markDirty("notifications"); }} /></div></div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4"><p>Auction ended</p><Switch checked={settings.notifications.auction_ended} onCheckedChange={(v) => { setSettings((p) => ({ ...p, notifications: { ...p.notifications, auction_ended: v } })); markDirty("notifications"); }} /></div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4"><p>Winner paid</p><Switch checked={settings.notifications.winner_paid} onCheckedChange={(v) => { setSettings((p) => ({ ...p, notifications: { ...p.notifications, winner_paid: v } })); markDirty("notifications"); }} /></div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4"><p>Payout processed</p><Switch checked={settings.notifications.payout_processed} onCheckedChange={(v) => { setSettings((p) => ({ ...p, notifications: { ...p.notifications, payout_processed: v } })); markDirty("notifications"); }} /></div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4"><p>Login alerts</p><Switch checked={settings.notifications.login_alerts} onCheckedChange={(v) => { setSettings((p) => ({ ...p, notifications: { ...p.notifications, login_alerts: v } })); markDirty("notifications"); }} /></div>
            </CardContent>
          </Card>
          <div className="flex justify-end">{saveButton("notifications", "Save Notifications")}</div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card><CardHeader><CardTitle>Security</CardTitle><CardDescription>MFA and password management.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4"><p>MFA Enabled</p><Switch checked={settings.security.mfaEnabled} onCheckedChange={(v) => { setSettings((p) => ({ ...p, security: { ...p.security, mfaEnabled: v } })); markDirty("security"); }} /></div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div><Label>Current Password</Label><Input type="password" value={settings.security.currentPassword} onChange={(e) => { setSettings((p) => ({ ...p, security: { ...p.security, currentPassword: e.target.value } })); markDirty("security"); }} /></div>
                <div><Label>New Password</Label><Input type="password" value={settings.security.newPassword} onChange={(e) => { setSettings((p) => ({ ...p, security: { ...p.security, newPassword: e.target.value } })); markDirty("security"); }} /></div>
                <div><Label>Confirm Password</Label><Input type="password" value={settings.security.confirmPassword} onChange={(e) => { setSettings((p) => ({ ...p, security: { ...p.security, confirmPassword: e.target.value } })); markDirty("security"); }} /></div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end">{saveButton("security", "Save Security")}</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
