"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { TimezoneSelect } from "@/components/ui/timezone-select";
import { CurrencySelect } from "@/components/ui/currency-select";
import { useDetectedTimezone } from "@/lib/timezones";
import { toast } from "sonner";
import {
  User,
  Bell,
  Shield,
  Globe,
  Lock,
  Save,
  CheckCircle2,
} from "lucide-react";

export default function Settings() {
  const [isLoading, setIsLoading] = useState(false);
  const detectedTimezone = useDetectedTimezone();
  const [settings, setSettings] = useState({
    // Profile
    firstName: "Abdulhameed",
    lastName: "Durodola",
    email: "durodolaabdulhameed2021@gmail.com",
    phone: "+234 123 456 7890",
    
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    
    // Security
    twoFactorEnabled: false,
    loginAlerts: true,
    
    // Preferences
    language: "en",
    timezone: "",
    currency: "NGN",
  });

  const handleSave = async (section: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    toast.success("Settings saved", {
      description: `${section} settings have been updated successfully.`,
    });
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Settings */}
      <Card className="shadow-lg">
        <CardHeader className="bg-linear-to-r from-blue-50 to-transparent border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={settings.firstName}
                  onChange={(e) => setSettings({ ...settings, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={settings.lastName}
                  onChange={(e) => setSettings({ ...settings, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={() => handleSave("Profile")} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="shadow-lg">
        <CardHeader className="bg-linear-to-r from-purple-50 to-transparent border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Notification Preferences</CardTitle>
              <CardDescription>Control how you receive notifications</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
              <div>
                <Label htmlFor="emailNotifications" className="text-base font-medium">
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                id="emailNotifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
              <div>
                <Label htmlFor="smsNotifications" className="text-base font-medium">
                  SMS Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via SMS
                </p>
              </div>
              <Switch
                id="smsNotifications"
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, smsNotifications: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
              <div>
                <Label htmlFor="pushNotifications" className="text-base font-medium">
                  Push Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive browser push notifications
                </p>
              </div>
              <Switch
                id="pushNotifications"
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
              <div>
                <Label htmlFor="marketingEmails" className="text-base font-medium">
                  Marketing Emails
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive promotional emails and updates
                </p>
              </div>
              <Switch
                id="marketingEmails"
                checked={settings.marketingEmails}
                onCheckedChange={(checked) => setSettings({ ...settings, marketingEmails: checked })}
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={() => handleSave("Notification")} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="shadow-lg">
        <CardHeader className="bg-linear-to-r from-red-50 to-transparent border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Security</CardTitle>
              <CardDescription>Manage your account security settings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
              <div>
                <Label htmlFor="twoFactor" className="text-base font-medium">
                  Two-Factor Authentication
                </Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <div className="flex items-center gap-3">
                {settings.twoFactorEnabled && (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Enabled
                  </Badge>
                )}
                <Switch
                  id="twoFactor"
                  checked={settings.twoFactorEnabled}
                  onCheckedChange={(checked) => {
                    setSettings({ ...settings, twoFactorEnabled: checked });
                    if (checked) {
                      toast.success("2FA enabled", {
                        description: "Two-factor authentication has been enabled.",
                      });
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
              <div>
                <Label htmlFor="loginAlerts" className="text-base font-medium">
                  Login Alerts
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when someone logs into your account
                </p>
              </div>
              <Switch
                id="loginAlerts"
                checked={settings.loginAlerts}
                onCheckedChange={(checked) => setSettings({ ...settings, loginAlerts: checked })}
              />
            </div>
            <Separator />
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Lock className="h-4 w-4 mr-2" />
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                View Active Sessions
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="shadow-lg">
        <CardHeader className="bg-linear-to-r from-green-50 to-transparent border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Preferences</CardTitle>
              <CardDescription>Customize your platform experience</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <select
                  id="language"
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <TimezoneSelect
                  name="timezone"
                  value={settings.timezone || detectedTimezone || ""}
                  onChange={(value) => setSettings({ ...settings, timezone: value || "" })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <CurrencySelect
                  name="currency"
                  value={settings.currency}
                  onChange={(value) => setSettings({ ...settings, currency: value || settings.currency })}
                />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={() => handleSave("Preferences")} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

