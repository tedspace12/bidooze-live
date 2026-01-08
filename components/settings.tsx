import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Save, X } from "lucide-react";

export default function SettingsTab() {
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState({
    auctionName: "Modern Art & Collectibles Auction",
    description: "A curated collection of modern art and rare collectibles",
    category: "art",
    currency: "USD",
    allowAbsentee: true,
    allowProxy: false,
    enableNotifications: true,
    commissionRate: 10,
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // In a real app, this would save to the backend
    setHasChanges(false);
  };

  const handleCancel = () => {
    setHasChanges(false);
    // Reset form to original values
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="auctionName" className="text-sm font-medium">
              Auction Name
            </Label>
            <Input
              id="auctionName"
              value={formData.auctionName}
              onChange={(e) => handleChange("auctionName", e.target.value)}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              The name displayed to bidders
            </p>
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="mt-2 resize-none"
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Brief description of the auction
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category" className="text-sm font-medium">
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange("category", value)}
              >
                <SelectTrigger id="category" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="art">Art</SelectItem>
                  <SelectItem value="antiques">Antiques</SelectItem>
                  <SelectItem value="jewelry">Jewelry</SelectItem>
                  <SelectItem value="collectibles">Collectibles</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="currency" className="text-sm font-medium">
                Currency
              </Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => handleChange("currency", value)}
              >
                <SelectTrigger id="currency" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bidding Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Bidding Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
            <div>
              <p className="font-medium text-foreground">Allow Absentee Bids</p>
              <p className="text-sm text-muted-foreground">
                Allow bidders to place bids without attending live
              </p>
            </div>
            <Switch
              checked={formData.allowAbsentee}
              onCheckedChange={(value) =>
                handleChange("allowAbsentee", value)
              }
            />
          </div>
          <div>
            <Label htmlFor="commissionRate" className="text-sm font-medium">
              Commission Rate (%)
            </Label>
            <Input
              id="commissionRate"
              type="number"
              value={formData.commissionRate}
              onChange={(e) =>
                handleChange("commissionRate", parseFloat(e.target.value))
              }
              className="mt-2"
              min="0"
              max="100"
              step="0.5"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Percentage commission on final bid amount
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
            <div>
              <p className="font-medium text-foreground">Enable Notifications</p>
              <p className="text-sm text-muted-foreground">
                Send email notifications for important auction events
              </p>
            </div>
            <Switch
              checked={formData.enableNotifications}
              onCheckedChange={(value) =>
                handleChange("enableNotifications", value)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Sticky Action Buttons */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-lg">
          <div className="container flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
