/* eslint-disable react-hooks/set-state-in-effect */

import { useMemo, useState, useEffect } from "react";
import { Save, Settings, Plus, Trash2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { AuctionOverviewResponse, type AuctionFormat, type AuctionSettingsPayload, type BidIncrementInput } from "@/features/auction/types";
import { useAuctionSettings } from "@/features/auction/hooks/useAuctionSettings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface SettingsTabProps {
  auction: AuctionOverviewResponse;
}

interface AuctionSettingsForm {
  commissionRate: number;
  buyerPremium: number;
  allowAbsentee: boolean;
  autoExtend: boolean;
  extensionMinutes: number;
  enableNotifications: boolean;
}

const DEFAULT_AUCTION_SETTINGS_FORM: AuctionSettingsForm = {
  commissionRate: 0,
  buyerPremium: 0,
  allowAbsentee: false,
  autoExtend: false,
  extensionMinutes: 0,
  enableNotifications: false,
};

const extractSettingsObject = (payload: unknown): Record<string, unknown> => {
  if (!payload || typeof payload !== "object") return {};
  const raw = payload as Record<string, unknown>;
  const nested = raw.data;
  if (nested && typeof nested === "object") {
    return nested as Record<string, unknown>;
  }
  return raw;
};

const readNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const readBoolean = (value: unknown, fallback = false): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return fallback;
};

const readText = (value: unknown, fallback = ""): string => {
  if (typeof value === "string") return value.trim() || fallback;
  if (typeof value === "number") return String(value);
  return fallback;
};

const readNotificationsEnabled = (value: unknown, fallback = false): boolean => {
  if (typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).some((entry) => {
      if (typeof entry === "boolean") return entry;
      if (entry && typeof entry === "object" && "enabled" in entry) {
        return readBoolean((entry as Record<string, unknown>).enabled, false);
      }
      return false;
    });
  }
  return fallback;
};

const resolveAuctionFormat = (
  allowAbsentee: boolean,
  currentFormat: string,
  biddingType: AuctionOverviewResponse["auction"]["bidding_type"]
): AuctionFormat => {
  if (allowAbsentee) return "absentee";
  if (currentFormat && currentFormat !== "absentee") return currentFormat as AuctionFormat;
  if (biddingType === "live" || biddingType === "hybrid") return "webcast";
  return "internet_only";
};

export default function SettingsTab({ auction }: SettingsTabProps) {
  const { settings, updateSettings, bidIncrements, saveBidIncrements } = useAuctionSettings(auction.auction.id);
  const [draft, setDraft] = useState<Partial<AuctionSettingsForm>>({});

  // Bid increment rows state
  const [incrementRows, setIncrementRows] = useState<BidIncrementInput[]>([]);
  const [incrementsDirty, setIncrementsDirty] = useState(false);

  useEffect(() => {
    if (bidIncrements.data) {
      const rows = Array.isArray(bidIncrements.data)
        ? bidIncrements.data
        : (bidIncrements.data as { data?: BidIncrementInput[] }).data ?? [];
      setIncrementRows(rows);
      setIncrementsDirty(false);
    }
  }, [bidIncrements.data]);

  const handleIncrementChange = (index: number, field: keyof BidIncrementInput, value: number) => {
    setIncrementRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setIncrementsDirty(true);
  };

  const addIncrementRow = () => {
    setIncrementRows((prev) => [...prev, { up_to_amount: 0, increment: 0 }]);
    setIncrementsDirty(true);
  };

  const removeIncrementRow = (index: number) => {
    setIncrementRows((prev) => prev.filter((_, i) => i !== index));
    setIncrementsDirty(true);
  };

  const handleSaveIncrements = async () => {
    try {
      await saveBidIncrements.mutateAsync(incrementRows);
      setIncrementsDirty(false);
      toast.success("Bid increments saved.");
    } catch (error: unknown) {
      const description = error instanceof Error ? error.message : "Please try again.";
      toast.error("Failed to save bid increments", { description });
    }
  };
  const settingsMeta = useMemo(() => {
    const data = extractSettingsObject(settings.data);
    const softCloseSeconds = readNumber(data.soft_close_seconds, 0);
    return {
      auctionFormat: readText(data.auction_format, ""),
      notificationScope: readText(data.notification_settings_scope, "auctioneer"),
      softCloseSeconds,
      hasNotificationSettings: !!data.notification_settings,
    };
  }, [settings.data]);

  const remoteFormData = useMemo<AuctionSettingsForm>(() => {
    const data = extractSettingsObject(settings.data);
    const softCloseSeconds = readNumber(data.soft_close_seconds, 0);
    return {
      ...DEFAULT_AUCTION_SETTINGS_FORM,
      commissionRate: readNumber(data.commissionRate ?? data.commission_percentage, 0),
      buyerPremium: readNumber(data.buyerPremium ?? data.buyer_premium_percentage, 0),
      allowAbsentee: readBoolean(data.allowAbsentee, readText(data.auction_format) === "absentee"),
      autoExtend: readBoolean(data.autoExtend, softCloseSeconds > 0),
      extensionMinutes: readNumber(data.extensionMinutes, softCloseSeconds > 0 ? softCloseSeconds / 60 : 0),
      enableNotifications: readBoolean(
        data.enableNotifications,
        readNotificationsEnabled(data.notification_settings, false)
      ),
    };
  }, [settings.data]);

  const formData = useMemo<AuctionSettingsForm>(
    () => ({ ...remoteFormData, ...draft }),
    [remoteFormData, draft]
  );

  const hasChanges = useMemo(() => Object.keys(draft).length > 0, [draft]);

  const handleChange = <K extends keyof AuctionSettingsForm>(field: K, value: AuctionSettingsForm[K]) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const softCloseSeconds = formData.autoExtend ? Math.max(0, formData.extensionMinutes) * 60 : 0;
      const payload: AuctionSettingsPayload = {
        commissionRate: formData.commissionRate,
        buyerPremium: formData.buyerPremium,
        allowAbsentee: formData.allowAbsentee,
        autoExtend: formData.autoExtend,
        extensionMinutes: formData.extensionMinutes,
        enableNotifications: formData.enableNotifications,
        commission_percentage: formData.commissionRate,
        buyer_premium_percentage: formData.buyerPremium,
        auction_format: resolveAuctionFormat(
          formData.allowAbsentee,
          settingsMeta.auctionFormat,
          auction.auction.bidding_type
        ),
        soft_close_seconds: softCloseSeconds,
      };

      await updateSettings.mutateAsync(payload);
      setDraft({});
      toast.success("Settings updated.");
    } catch (error: unknown) {
      const description =
        error instanceof Error ? error.message : "Please try again.";
      toast.error("Failed to update settings", { description });
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h2 className="text-2xl font-display font-semibold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground font-body mt-1">Configure auction parameters</p>
      </div>

      <Card className="border border-border shadow-soft">
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <Settings className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg font-display font-semibold">Auction Settings</CardTitle>
              <CardDescription className="font-body">Configure auction behavior</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="font-body font-medium">Commission Rate (%)</Label>
              <Input
                type="number"
                value={formData.commissionRate}
                onChange={(e) => handleChange("commissionRate", Number(e.target.value))}
                className="font-body"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-body font-medium">Buyer Premium (%)</Label>
              <Input
                type="number"
                value={formData.buyerPremium}
                onChange={(e) => handleChange("buyerPremium", Number(e.target.value))}
                className="font-body"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-body font-medium">Extension Minutes</Label>
              <Input
                type="number"
                value={formData.extensionMinutes}
                onChange={(e) => handleChange("extensionMinutes", Number(e.target.value))}
                className="font-body"
              />
              <p className="text-xs text-muted-foreground">Mapped to `soft_close_seconds` on save.</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
            <div>
              <p className="font-body font-medium text-foreground">Allow Absentee Bids</p>
              <p className="text-sm text-muted-foreground font-body">
                Bidders can place maximum bids before the auction
              </p>
              <p className="text-xs text-muted-foreground font-body mt-1">
                Current format: {settingsMeta.auctionFormat || "not provided"}
              </p>
            </div>
            <Switch checked={formData.allowAbsentee} onCheckedChange={(value) => handleChange("allowAbsentee", value)} />
          </div>

          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
            <div>
              <p className="font-body font-medium text-foreground">Auto-Extend Bidding</p>
              <p className="text-sm text-muted-foreground font-body">
                Extend lot closing time if bids come in near the end
              </p>
              <p className="text-xs text-muted-foreground font-body mt-1">
                Current soft close: {settingsMeta.softCloseSeconds} seconds
              </p>
            </div>
            <Switch checked={formData.autoExtend} onCheckedChange={(value) => handleChange("autoExtend", value)} />
          </div>

          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
            <div>
              <p className="font-body font-medium text-foreground">Enable Notifications</p>
              <p className="text-sm text-muted-foreground font-body">
                Receive updates for bids and auction events
              </p>
              <p className="text-xs text-muted-foreground font-body mt-1">
                Scope: {settingsMeta.notificationScope}
                {settingsMeta.hasNotificationSettings ? " with backend notification settings" : ""}
              </p>
            </div>
            <Switch
              checked={formData.enableNotifications}
              onCheckedChange={(value) => handleChange("enableNotifications", value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border shadow-soft">
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg font-display font-semibold">Bid Increment Schedule</CardTitle>
              <CardDescription className="font-body">Define how bid amounts increase at each price tier</CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={addIncrementRow} className="gap-1.5 font-body">
              <Plus className="w-3.5 h-3.5" />
              Add Row
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {bidIncrements.isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-secondary/50 rounded animate-pulse" />
              ))}
            </div>
          ) : incrementRows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-body">No bid increments configured.</p>
              <p className="text-xs font-body mt-1">Add rows to define a tiered increment schedule.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_1fr_auto] gap-3 pb-1">
                <Label className="font-body font-medium text-xs text-muted-foreground uppercase tracking-wide">Up To Amount ($)</Label>
                <Label className="font-body font-medium text-xs text-muted-foreground uppercase tracking-wide">Increment ($)</Label>
                <span />
              </div>
              {incrementRows.map((row, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center">
                  <Input
                    type="number"
                    min={0}
                    value={row.up_to_amount}
                    onChange={(e) => handleIncrementChange(i, "up_to_amount", Number(e.target.value))}
                    className="font-body"
                    placeholder="e.g. 1000"
                  />
                  <Input
                    type="number"
                    min={0}
                    value={row.increment}
                    onChange={(e) => handleIncrementChange(i, "increment", Number(e.target.value))}
                    className="font-body"
                    placeholder="e.g. 50"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeIncrementRow(i)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          {incrementsDirty && (
            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleSaveIncrements}
                disabled={saveBidIncrements.isPending}
                className="gap-2 font-body gradient-gold border-0 text-accent-foreground hover:opacity-90"
              >
                <Save className="w-4 h-4" />
                {saveBidIncrements.isPending ? "Saving…" : "Save Increments"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border p-4 shadow-elevated z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <p className="text-sm text-muted-foreground font-body">You have unsaved changes</p>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="gap-2 font-body gradient-gold border-0 text-accent-foreground hover:opacity-90">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
