import { useState } from "react";
import { Auction } from "@/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X, Settings, Bell, DollarSign, Shield } from "lucide-react";
import { toast } from "sonner";

interface SettingsTabProps {
  auction: Auction;
}

export default function SettingsTab({ auction }: SettingsTabProps) {
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState({
    title: auction.title,
    description: auction.description,
    category: auction.category.toLowerCase(),
    currency: auction.currency,
    location: auction.location,
    type: auction.type,
    allowAbsentee: true,
    enableNotifications: true,
    commissionRate: 10,
    buyerPremium: 15,
    autoExtend: true,
    extensionMinutes: 5,
  });

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    setHasChanges(false);
    toast.success("Settings saved successfully");
  };

  const handleCancel = () => {
    setHasChanges(false);
  };

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h2 className="text-2xl font-display font-semibold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground font-body mt-1">Configure auction parameters</p>
      </div>

      <Card className="border border-border shadow-soft">
        <CardHeader className="border-b border-border"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center"><Settings className="w-4 h-4 text-muted-foreground" /></div><div><CardTitle className="text-lg font-display font-semibold">Basic Information</CardTitle><CardDescription className="font-body">General auction details</CardDescription></div></div></CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2"><Label htmlFor="title" className="font-body font-medium">Auction Title</Label><Input id="title" value={formData.title} onChange={(e) => handleChange("title", e.target.value)} className="font-body" /></div>
            <div className="space-y-2"><Label htmlFor="location" className="font-body font-medium">Location</Label><Input id="location" value={formData.location} onChange={(e) => handleChange("location", e.target.value)} className="font-body" /></div>
          </div>
          <div className="space-y-2"><Label htmlFor="description" className="font-body font-medium">Description</Label><Textarea id="description" value={formData.description} onChange={(e) => handleChange("description", e.target.value)} className="font-body resize-none" rows={4} /></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2"><Label className="font-body font-medium">Currency</Label><Select value={formData.currency} onValueChange={(v) => handleChange("currency", v)}><SelectTrigger className="font-body"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="NGN">NGN (₦)</SelectItem><SelectItem value="USD">USD ($)</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label className="font-body font-medium">Auction Type</Label><Select value={formData.type} onValueChange={(v) => handleChange("type", v)}><SelectTrigger className="font-body"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Timed Auction">Timed Auction</SelectItem><SelectItem value="Live Webcast Auction">Live Webcast</SelectItem><SelectItem value="Hybrid Auction">Hybrid Auction</SelectItem></SelectContent></Select></div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border shadow-soft">
        <CardHeader className="border-b border-border"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center"><Shield className="w-4 h-4 text-muted-foreground" /></div><div><CardTitle className="text-lg font-display font-semibold">Bidding Rules</CardTitle></div></div></CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg"><div><p className="font-body font-medium text-foreground">Allow Absentee Bids</p><p className="text-sm text-muted-foreground font-body">Bidders can place maximum bids before the auction</p></div><Switch checked={formData.allowAbsentee} onCheckedChange={(v) => handleChange("allowAbsentee", v)} /></div>
          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg"><div><p className="font-body font-medium text-foreground">Auto-Extend Bidding</p><p className="text-sm text-muted-foreground font-body">Extend lot closing time if bids come in near the end</p></div><Switch checked={formData.autoExtend} onCheckedChange={(v) => handleChange("autoExtend", v)} /></div>
        </CardContent>
      </Card>

      <Card className="border border-border shadow-soft">
        <CardHeader className="border-b border-border"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center"><DollarSign className="w-4 h-4 text-muted-foreground" /></div><div><CardTitle className="text-lg font-display font-semibold">Fees & Commissions</CardTitle></div></div></CardHeader>
        <CardContent className="p-6"><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="space-y-2"><Label className="font-body font-medium">Seller Commission (%)</Label><Input type="number" value={formData.commissionRate} onChange={(e) => handleChange("commissionRate", parseFloat(e.target.value))} className="font-body" min="0" max="50" step="0.5" /></div><div className="space-y-2"><Label className="font-body font-medium">Buyer Premium (%)</Label><Input type="number" value={formData.buyerPremium} onChange={(e) => handleChange("buyerPremium", parseFloat(e.target.value))} className="font-body" min="0" max="50" step="0.5" /></div></div></CardContent>
      </Card>

      <Card className="border border-border shadow-soft">
        <CardHeader className="border-b border-border"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center"><Bell className="w-4 h-4 text-muted-foreground" /></div><div><CardTitle className="text-lg font-display font-semibold">Notifications</CardTitle></div></div></CardHeader>
        <CardContent className="p-6"><div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg"><div><p className="font-body font-medium text-foreground">Email Notifications</p><p className="text-sm text-muted-foreground font-body">Receive updates for bids and auction events</p></div><Switch checked={formData.enableNotifications} onCheckedChange={(v) => handleChange("enableNotifications", v)} /></div></CardContent>
      </Card>

      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border p-4 shadow-elevated z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <p className="text-sm text-muted-foreground font-body">You have unsaved changes</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel} className="gap-2 font-body"><X className="w-4 h-4" />Cancel</Button>
              <Button onClick={handleSave} className="gap-2 font-body gradient-gold border-0 text-accent-foreground hover:opacity-90"><Save className="w-4 h-4" />Save Changes</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
