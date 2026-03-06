"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import {
  Bell,
  Building2,
  CheckCircle2,
  Clock3,
  Hammer,
  Loader2,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CurrencySelect } from "@/components/ui/currency-select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COUNTRY_BANK_CONFIG, DEFAULT_ACCOUNT_TYPES } from "@/components/auth/registration/StepThree";
import { withAuth } from "@/services/api";

type TabKey = "profile" | "business" | "payouts" | "auctions" | "notifications" | "security";
type VerificationStatus = "verified" | "pending" | "rejected";
type AccountType = "business_checking" | "business_savings";
type PayoutSchedule = "daily" | "weekly" | "biweekly" | "monthly";

type SettingsState = {
  profile: {
    displayName: string;
    bio: string;
    phone: string;
    website: string;
    fullAddress: string;
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
    country: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    accountType: AccountType;
    bankIdentifiers: Record<string, string>;
    currency: string;
    payoutSchedule: PayoutSchedule;
    escrowParticipation: boolean;
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
  country?: string | null;
  bank_name?: string | null;
  account_name?: string | null;
  account_number?: string | null;
  account_type?: AccountType | null;
  bank_identifiers?: unknown;
  currency?: string | null;
  payout_schedule?: PayoutSchedule | null;
  escrow_participation?: boolean | null;
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
  profile: { displayName: "", bio: "", phone: "", website: "", fullAddress: "" },
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
    country: "US",
    bankName: "",
    accountName: "",
    accountNumber: "",
    accountType: "business_checking",
    bankIdentifiers: { routing_number: "" },
    currency: "USD",
    payoutSchedule: "weekly",
    escrowParticipation: true,
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

const normalizeBankIdentifiers = (value: unknown): Record<string, string> => {
  if (!value) return { routing_number: "" };
  if (Array.isArray(value)) {
    const out: Record<string, string> = {};
    value.forEach((v, i) => {
      const text = typeof v === "string" ? v : v == null ? "" : String(v);
      if (text.trim()) out[`identifier_${i + 1}`] = text;
    });
    return Object.keys(out).length ? out : { routing_number: "" };
  }
  if (typeof value === "object") {
    const out: Record<string, string> = {};
    Object.entries(value).forEach(([k, v]) => {
      out[k] = typeof v === "string" ? v : v == null ? "" : String(v);
    });
    return Object.keys(out).length ? out : { routing_number: "" };
  }
  return { routing_number: "" };
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const [settings, setSettings] = useState<SettingsState>(INITIAL_STATE);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [savingTab, setSavingTab] = useState<TabKey | null>(null);
  const [dirtyTabs, setDirtyTabs] = useState<Record<TabKey, boolean>>(INITIAL_DIRTY);

  const markDirty = (tab: TabKey) => setDirtyTabs((prev) => ({ ...prev, [tab]: true }));

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const [profileRes, businessRes, payoutsRes, auctionsRes, notificationsRes, securityRes] = await Promise.all([
          withAuth.get(ENDPOINTS.profile),
          withAuth.get(ENDPOINTS.business),
          withAuth.get(ENDPOINTS.payouts),
          withAuth.get(ENDPOINTS.auctions),
          withAuth.get(ENDPOINTS.notifications),
          withAuth.get(ENDPOINTS.security),
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
            country: (payouts?.country || "US").toUpperCase(),
            bankName: payouts?.bank_name || "",
            accountName: payouts?.account_name || "",
            accountNumber: payouts?.account_number || "",
            accountType: payouts?.account_type || "business_checking",
            bankIdentifiers: normalizeBankIdentifiers(payouts?.bank_identifiers),
            currency: payouts?.currency || "USD",
            payoutSchedule: payouts?.payout_schedule || "weekly",
            escrowParticipation: Boolean(payouts?.escrow_participation),
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
    if (tab === "business") return;
    setSavingTab(tab);
    try {
      if (tab === "profile") {
        if (!settings.profile.displayName.trim()) {
          toast.error("Display name is required.");
          return;
        }
        await withAuth.patch(ENDPOINTS.profile, {
          display_name: settings.profile.displayName.trim(),
          bio: settings.profile.bio.trim() || null,
          phone: settings.profile.phone.trim() || null,
          website: settings.profile.website.trim() || null,
          full_address: settings.profile.fullAddress.trim() || null,
        });
      }

      if (tab === "payouts") {
        const country = settings.payouts.country.trim().toUpperCase();
        const accountNumber = settings.payouts.accountNumber.trim();
        const bankIdentifiers = Object.entries(settings.payouts.bankIdentifiers).reduce<Record<string, string>>((acc, [k, v]) => {
          if (v.trim()) acc[k] = v.trim();
          return acc;
        }, {});

        if (country.length !== 2) return void toast.error("Country must be 2 letters.");
        if (!settings.payouts.bankName.trim()) return void toast.error("Bank name is required.");
        if (!settings.payouts.accountName.trim()) return void toast.error("Account name is required.");
        if (Object.keys(bankIdentifiers).length === 0) return void toast.error("At least one bank identifier is required.");
        if (country === "MX" && !accountNumber && !bankIdentifiers.clabe) return void toast.error("For MX, provide CLABE or account number.");
        if (country !== "MX" && !accountNumber) return void toast.error("Account number is required.");

        await withAuth.patch(ENDPOINTS.payouts, {
          country,
          bank_name: settings.payouts.bankName.trim(),
          account_name: settings.payouts.accountName.trim(),
          account_number: accountNumber || null,
          account_type: settings.payouts.accountType,
          bank_identifiers: bankIdentifiers,
          currency: settings.payouts.currency.trim().toUpperCase(),
          payout_schedule: settings.payouts.payoutSchedule,
          escrow_participation: settings.payouts.escrowParticipation,
        });
      }

      if (tab === "auctions") {
        await withAuth.patch(ENDPOINTS.auctions, {
          default_duration_hours: settings.auctions.defaultDurationHours,
          default_bid_increment: settings.auctions.defaultBidIncrement,
          default_bid_mechanism: settings.auctions.defaultBidMechanism,
          requires_registration_approval: settings.auctions.requiresRegistrationApproval,
          auto_extend: settings.auctions.autoExtend,
          default_currency: settings.auctions.defaultCurrency,
        });
      }

      if (tab === "notifications") {
        await withAuth.patch(ENDPOINTS.notifications, settings.notifications);
      }

      if (tab === "security") {
        await withAuth.patch(ENDPOINTS.security, { mfa_enabled: settings.security.mfaEnabled });
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
          await withAuth.patch(ENDPOINTS.password, {
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

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return void toast.error("Please upload an image.");
    if (file.size > 5 * 1024 * 1024) return void toast.error("Image must be 5MB or less.");

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await withAuth.post(ENDPOINTS.avatar, formData, {
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
  const selectedCountryConfig = COUNTRY_BANK_CONFIG[settings.payouts.country];
  const payoutAccountTypes = selectedCountryConfig?.accountTypes ?? DEFAULT_ACCOUNT_TYPES;
  const payoutIdentifierFields = selectedCountryConfig?.identifiers ?? [];
  const showPayoutAccountNumber = !selectedCountryConfig?.noAccountNumber;

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
          <div className="flex justify-end">{saveButton("profile", "Save Profile")}</div>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <Card><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>Business (Read Only)</CardTitle><CardDescription>Business profile and verification details.</CardDescription></div>{statusBadge}</CardHeader>
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
                <div><Label>License Number</Label><p className="rounded-md border border-border bg-muted/20 px-3 py-2 text-sm">{settings.business.licenseNumber || "-"}</p></div>
                <div><Label>License Expiration</Label><p className="rounded-md border border-border bg-muted/20 px-3 py-2 text-sm">{settings.business.licenseExpirationDate || "-"}</p></div>
              </div>
              <div><Label>Certifications</Label><p className="rounded-md border border-border bg-muted/20 px-3 py-2 text-sm">{settings.business.certifications || "-"}</p></div>
              <div><Label>Associations</Label><p className="rounded-md border border-border bg-muted/20 px-3 py-2 text-sm">{settings.business.associations || "-"}</p></div>
              <div className="rounded-lg border border-dashed border-border p-4">
                <Label>Documents</Label>
                {settings.business.documents.length > 0 ? (
                  <div className="mt-2 space-y-2">
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
                  <p className="mt-2 text-sm text-muted-foreground">No documents available.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-6">
          <Card><CardHeader><CardTitle>Payouts</CardTitle><CardDescription>Bank details and settlement controls.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Select
                    value={settings.payouts.country}
                    onValueChange={(value) => {
                      const nextAccountTypes = COUNTRY_BANK_CONFIG[value]?.accountTypes ?? DEFAULT_ACCOUNT_TYPES;
                      const defaultAccountType = (nextAccountTypes[0]?.value ?? "business_checking") as AccountType;

                      setSettings((p) => ({
                        ...p,
                        payouts: {
                          ...p.payouts,
                          country: value,
                          bankIdentifiers: {},
                          accountNumber: "",
                          accountType: defaultAccountType,
                        },
                      }));
                      markDirty("payouts");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {settings.payouts.country && !COUNTRY_BANK_CONFIG[settings.payouts.country] && (
                        <SelectItem value={settings.payouts.country}>{settings.payouts.country}</SelectItem>
                      )}
                      {Object.entries(COUNTRY_BANK_CONFIG).map(([code, config]) => (
                        <SelectItem key={code} value={code}>
                          {config.flag} {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Bank Name</Label><Input value={settings.payouts.bankName} onChange={(e) => { setSettings((p) => ({ ...p, payouts: { ...p.payouts, bankName: e.target.value } })); markDirty("payouts"); }} /></div>
                <div className="space-y-2"><Label>Account Name</Label><Input value={settings.payouts.accountName} onChange={(e) => { setSettings((p) => ({ ...p, payouts: { ...p.payouts, accountName: e.target.value } })); markDirty("payouts"); }} /></div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {showPayoutAccountNumber && (
                  <div className="space-y-2">
                    <Label>{selectedCountryConfig?.accountNumberLabel ?? "Account Number"}</Label>
                    <Input
                      placeholder={selectedCountryConfig?.accountNumberPlaceholder ?? "Account Number"}
                      value={settings.payouts.accountNumber}
                      onChange={(e) => {
                        setSettings((p) => ({ ...p, payouts: { ...p.payouts, accountNumber: e.target.value } }));
                        markDirty("payouts");
                      }}
                    />
                  </div>
                )}
                <div className="space-y-2"><Label>Account Type</Label><Select value={settings.payouts.accountType} onValueChange={(value) => { setSettings((p) => ({ ...p, payouts: { ...p.payouts, accountType: value as AccountType } })); markDirty("payouts"); }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{payoutAccountTypes.map((type) => (<SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>))}</SelectContent></Select></div>
              </div>
              {settings.payouts.country && payoutIdentifierFields.length > 0 && (
                <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
                  <p className="text-sm font-medium">Bank Identifiers</p>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {payoutIdentifierFields.map((field) => (
                      <div className="space-y-2" key={field.key}>
                        <Label htmlFor={field.key}>{field.label}</Label>
                        <Input
                          id={field.key}
                          placeholder={field.placeholder}
                          maxLength={field.maxLength}
                          value={settings.payouts.bankIdentifiers[field.key] || ""}
                          onChange={(e) => {
                            const value = field.transform ? field.transform(e.target.value) : e.target.value;
                            setSettings((p) => ({
                              ...p,
                              payouts: {
                                ...p.payouts,
                                bankIdentifiers: {
                                  ...p.payouts.bankIdentifiers,
                                  [field.key]: value,
                                },
                              },
                            }));
                            markDirty("payouts");
                          }}
                        />
                        {field.helpText && <p className="text-xs text-muted-foreground">{field.helpText}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div><Label>Currency</Label><CurrencySelect name="payoutCurrency" value={settings.payouts.currency} onChange={(v) => { setSettings((p) => ({ ...p, payouts: { ...p.payouts, currency: (v || p.payouts.currency).toUpperCase() } })); markDirty("payouts"); }} /></div>
                <div><Label>Payout Schedule</Label><Select value={settings.payouts.payoutSchedule} onValueChange={(value) => { setSettings((p) => ({ ...p, payouts: { ...p.payouts, payoutSchedule: value as PayoutSchedule } })); markDirty("payouts"); }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="biweekly">Bi-weekly</SelectItem><SelectItem value="monthly">Monthly</SelectItem></SelectContent></Select></div>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4"><div><p className="font-medium">Escrow Participation</p></div><Switch checked={settings.payouts.escrowParticipation} onCheckedChange={(v) => { setSettings((p) => ({ ...p, payouts: { ...p.payouts, escrowParticipation: v } })); markDirty("payouts"); }} /></div>
            </CardContent>
          </Card>
          <div className="flex justify-end">{saveButton("payouts", "Save Payouts")}</div>
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
