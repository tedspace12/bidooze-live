import { useMemo, useState } from "react";
import { Save, Settings } from "lucide-react";
import { toast } from "sonner";
import { AuctionOverviewResponse, type AuctionSettingsPayload } from "@/features/auction/types";
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

const readNumber = (value: unknown, fallback = 0): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const readBoolean = (value: unknown, fallback = false): boolean =>
  typeof value === "boolean" ? value : fallback;

export default function SettingsTab({ auction }: SettingsTabProps) {
  const { settings, updateSettings } = useAuctionSettings(auction.auction.id);
  const [draft, setDraft] = useState<Partial<AuctionSettingsForm>>({});

  const remoteFormData = useMemo<AuctionSettingsForm>(() => {
    const data = extractSettingsObject(settings.data);
    return {
      ...DEFAULT_AUCTION_SETTINGS_FORM,
      commissionRate: readNumber(data.commissionRate ?? data.commission_percentage, 0),
      buyerPremium: readNumber(data.buyerPremium ?? data.buyer_premium_percentage, 0),
      allowAbsentee: readBoolean(data.allowAbsentee, false),
      autoExtend: readBoolean(data.autoExtend, false),
      extensionMinutes: readNumber(data.extensionMinutes, 0),
      enableNotifications: readBoolean(data.enableNotifications, false),
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
      const payload: AuctionSettingsPayload = {
        commission_percentage: formData.commissionRate,
        buyer_premium_percentage: formData.buyerPremium,
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
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
            <div>
              <p className="font-body font-medium text-foreground">Allow Absentee Bids</p>
              <p className="text-sm text-muted-foreground font-body">
                Bidders can place maximum bids before the auction
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
            </div>
            <Switch checked={formData.autoExtend} onCheckedChange={(value) => handleChange("autoExtend", value)} />
          </div>

          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
            <div>
              <p className="font-body font-medium text-foreground">Enable Notifications</p>
              <p className="text-sm text-muted-foreground font-body">
                Receive updates for bids and auction events
              </p>
            </div>
            <Switch
              checked={formData.enableNotifications}
              onCheckedChange={(value) => handleChange("enableNotifications", value)}
            />
          </div>
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
