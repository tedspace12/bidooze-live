"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DollarSign,
  Calculator,
  Gavel,
  CreditCard,
  Building2,
  Users,
  Bell,
  FileText,
  HelpCircle,
  Download,
  ExternalLink,
  X,
  Mail,
  MessageSquare,
  Settings,
  Palette,
  Shield,
  Database,
  Edit,
  Plus,
  Save,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  Globe,
  Upload,
  Eye,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Miscellaneous() {
  const [dismissedNotices, setDismissedNotices] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [emailNotifications, setEmailNotifications] = useState({
    auctionUpdates: true,
    bidNotifications: true,
    paymentConfirmations: true,
    weeklySummaries: false,
  });
  const [smsNotifications, setSmsNotifications] = useState({
    highBidAlerts: true,
    auctionEndingReminders: true,
    paymentReminders: false,
  });
  const [isNewTemplateOpen, setIsNewTemplateOpen] = useState(false);
  const [isEditTemplateOpen, setIsEditTemplateOpen] = useState(false);
  const [isEditBrandingOpen, setIsEditBrandingOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const systemNotices = [
    {
      id: "notice-1",
      timestamp: "2024-01-15 10:30 AM",
      type: "maintenance",
      title: "Scheduled Maintenance",
      message: "System maintenance scheduled for January 20, 2024 from 2:00 AM to 4:00 AM EST. Some features may be temporarily unavailable.",
    },
    {
      id: "notice-2",
      timestamp: "2024-01-10 3:45 PM",
      type: "update",
      title: "Policy Update",
      message: "Our refund policy has been updated. Please review the new terms in the Auction Rules section.",
    },
    {
      id: "notice-3",
      timestamp: "2024-01-05 9:15 AM",
      type: "feature",
      title: "New Feature Release",
      message: "Enhanced reporting features are now available. Check the Reports section for new export options.",
    },
  ];

  const handleDismissNotice = (id: string) => {
    setDismissedNotices([...dismissedNotices, id]);
  };

  const visibleNotices = systemNotices.filter(notice => !dismissedNotices.includes(notice.id));

  return (
    <div className="space-y-6 pb-8">
      {/* Enhanced Page Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/10 via-primary/5 to-background border border-primary/20 p-8">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Miscellaneous</h1>
              <p className="text-muted-foreground text-lg">
                Global settings, system defaults, and advanced configuration
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Badge variant="outline" className="bg-background/80">
                <Shield className="h-3 w-3 mr-1" />
                Admin Access
              </Badge>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      </div>

      {/* System Notices - Enhanced */}
      {/* {visibleNotices.length > 0 && (
        <div className="w-full space-y-4">
          {visibleNotices.map((notice) => (
            <Card
              key={notice.id}
              className="relative w-full border-l-4 border-l-primary shadow-md hover:shadow-lg transition-shadow p-0"
            >
              <CardContent className="p-6">
                <div className="w-full flex items-start justify-between gap-6">
                  <div className="flex items-start gap-4 flex-1 w-full">
                    <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                      <Bell className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 w-full space-y-3">
                      <div className="flex items-center gap-3 flex-wrap w-full">
                        <h3 className="text-base font-semibold leading-tight">
                          {notice.title}
                        </h3>
                        <Badge variant="outline" className="text-xs shrink-0 capitalize">
                          {notice.type}
                        </Badge>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground w-full">
                        {notice.message}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{notice.timestamp}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDismissNotice(notice.id)}
                    className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted shrink-0"
                    aria-label="Dismiss notice"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )} */}

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1 bg-muted/50">
          <TabsTrigger value="overview" className="data-[state=active]:bg-background">
            <FileText className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-background">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-background">
            <Users className="h-4 w-4 mr-2" />
            Users & Access
          </TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-background">
            <Database className="h-4 w-4 mr-2" />
            System
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Platform Commission</p>
                    <p className="text-2xl font-bold">8%</p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-600 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Active Users</p>
                    <p className="text-2xl font-bold">3</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-purple-600 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Email Templates</p>
                    <p className="text-2xl font-bold">5</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Mail className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-orange-600 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Audit Logs</p>
                    <p className="text-2xl font-bold">50+</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Shield className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fees & Charges - Enhanced */}
          <Card className="shadow-lg border-2">
            <CardHeader className="bg-linear-to-r from-primary/5 to-transparent border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary rounded-lg">
                    <DollarSign className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Fees & Charges</CardTitle>
                    <CardDescription>Platform fees and transaction charges</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-linear-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-700" />
                      <h3 className="font-semibold text-sm">Platform Commission</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      8% commission applied to all successful auction sales, calculated on the final hammer price.
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold text-sm">Listing Fees</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Standard listings are free. Premium listings with featured placement cost $25 per auction.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold text-sm">Buyer Premiums</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Buyer premiums are not applied. The final bid amount is the total price paid by the buyer.
                    </p>
                  </div>
                  <div className="p-4 bg-linear-to-br from-green-50 to-green-100/50 rounded-xl border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Calculator className="h-4 w-4 text-green-700" />
                      <h3 className="font-semibold text-sm">Example Calculation</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Item sells for $1,000 → Commission (8%) = $80 → Your payout = $920. Tax handled separately.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Auction Rules - Enhanced */}
          <Card className="shadow-lg p-0 overflow-hidden">
            <CardHeader className="bg-linear-to-r from-purple-50 to-transparent border-b pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <Gavel className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Auction Rules & Policies</CardTitle>
                  <CardDescription>Platform rules to reduce disputes</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "Cancellation Rules", icon: X, textClass: "text-red-600" },
                  { title: "Reserve Price Behavior", icon: Eye, textClass: "text-blue-600" },
                  { title: "Failed Auction Handling", icon: AlertCircle, textClass: "text-orange-600" },
                  { title: "Dispute Timeframes", icon: Clock, textClass: "text-purple-600" },
                ].map((rule, idx) => (
                  <div key={idx} className="p-4 bg-muted/30 rounded-xl border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <rule.icon className={`h-4 w-4 ${rule.textClass}`} />
                      <h3 className="font-semibold text-sm">{rule.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Configure rules and policies for auction management and dispute resolution.
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6 mt-6">
          {/* Notification Settings - Interactive */}
          <Card className="shadow-lg p-0 overflow-hidden">
            <CardHeader className="bg-linear-to-r from-blue-50 to-transparent border-b pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Bell className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Notification Settings</CardTitle>
                    <CardDescription>Manage your notification preferences</CardDescription>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={async () => {
                    setIsLoading(true);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    setIsLoading(false);
                    toast.success("Notification settings saved", {
                      description: "Your notification preferences have been updated.",
                    });
                  }}
                  disabled={isLoading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Notifications
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(emailNotifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                        <div>
                          <p className="text-sm font-medium capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </p>
                          <p className="text-xs text-muted-foreground">Receive email notifications for this event</p>
                        </div>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) =>
                            setEmailNotifications({ ...emailNotifications, [key]: checked })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    SMS Notifications
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(smsNotifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                        <div>
                          <p className="text-sm font-medium capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </p>
                          <p className="text-xs text-muted-foreground">Receive SMS notifications for this event</p>
                        </div>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) =>
                            setSmsNotifications({ ...smsNotifications, [key]: checked })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Templates - Enhanced */}
          <Card className="shadow-lg p-0 overflow-hidden">
            <CardHeader className="bg-linear-to-r from-purple-50 to-transparent border-b pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-600 rounded-lg">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Email Templates</CardTitle>
                    <CardDescription>Manage automated email communications</CardDescription>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsNewTemplateOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Template
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "Auction Created", status: "Active", recipients: "Auction creator, assigned staff", color: "green" },
                  { name: "Bid Received", status: "Active", recipients: "Auction owner, outbid bidders", color: "blue" },
                  { name: "Auction Closed", status: "Active", recipients: "Auction owner, winning bidder, all bidders", color: "purple" },
                  { name: "Payment Received", status: "Active", recipients: "Auction owner, buyer", color: "green" },
                  { name: "Payout Processed", status: "Active", recipients: "Account owner", color: "orange" },
                ].map((template, idx) => (
                  <div
                    key={idx}
                    className="group p-4 bg-linear-to-br from-muted/50 to-muted/30 rounded-xl border hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm">{template.name}</h3>
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {template.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{template.recipients}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          setIsEditTemplateOpen(true);
                          toast.info("Edit template", {
                            description: `Editing ${template.name} template`,
                          });
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Branding & Customization - Enhanced */}
          <Card className="shadow-lg p-0 overflow-hidden">
            <CardHeader className="bg-linear-to-r from-pink-50 to-transparent border-b pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-600 rounded-lg">
                    <Palette className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Branding & Customization</CardTitle>
                    <CardDescription>Customize your platform appearance</CardDescription>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setIsEditBrandingOpen(true);
                    toast.info("Edit branding", {
                      description: "Opening branding editor...",
                    });
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Branding
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Brand Colors</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { name: "Primary", color: "#1a4d2e", hex: "#1a4d2e" },
                      { name: "Secondary", color: "#8650eb", hex: "#8650eb" },
                      { name: "Accent", color: "#232423", hex: "#232423" },
                    ].map((brand, idx) => (
                      <div key={idx} className="group relative overflow-hidden rounded-xl border-2 border-border hover:border-primary/50 transition-colors">
                        <div className="h-24 w-full" style={{ backgroundColor: brand.color }}></div>
                        <div className="p-3 bg-background">
                          <p className="text-sm font-medium">{brand.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{brand.hex}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90"
                          onClick={() => {
                            toast.info("Edit color", {
                              description: `Editing ${brand.name} color`,
                            });
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-4">Logo</h3>
                  <div 
                    className="p-8 bg-linear-to-br from-muted/50 to-muted/30 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer group"
                    onClick={() => {
                      toast.info("Upload logo", {
                        description: "Select an image file to upload as your logo",
                      });
                    }}
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="p-4 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <Upload className="h-8 w-8 text-green-700" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">Upload Logo</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users & Access Tab */}
        <TabsContent value="users" className="space-y-6 mt-6">
          {/* Users & Roles - Enhanced */}
          <Card className="shadow-lg p-0 overflow-hidden">
            <CardHeader className="bg-linear-to-r from-green-50 to-transparent border-b pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-600 rounded-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Users & Roles</CardTitle>
                    <CardDescription>Manage team members and permissions</CardDescription>
                  </div>
                </div>
                <Button onClick={() => setIsAddUserOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {[
                  { name: "John Smith", email: "john.smith@acmeauction.com", role: "Administrator", lastActive: "Jan 15, 2024 at 2:45 PM", bgClass: "bg-red-100", textClass: "text-red-600" },
                  { name: "Sarah Johnson", email: "sarah.j@acmeauction.com", role: "Manager", lastActive: "Jan 14, 2024 at 10:30 AM", bgClass: "bg-blue-100", textClass: "text-blue-600" },
                  { name: "Mike Davis", email: "mike.davis@acmeauction.com", role: "Viewer", lastActive: "Jan 12, 2024 at 11:15 AM", bgClass: "bg-gray-100", textClass: "text-gray-600" },
                ].map((user, idx) => (
                  <div
                    key={idx}
                    className="group p-4 bg-linear-to-r from-muted/50 to-muted/30 rounded-xl border hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 ${user.bgClass} rounded-lg`}>
                          <Users className={`h-5 w-5 ${user.textClass}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{user.name}</p>
                            <Badge variant="outline">{user.role}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground mt-1">Last active: {user.lastActive}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsEditUserOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDeleteUserOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Business & Account Info - Enhanced */}
          <Card className="shadow-lg p-0 overflow-hidden">
            <CardHeader className="bg-linear-to-r from-orange-50 to-transparent border-b pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-600 rounded-lg">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Business & Account Info</CardTitle>
                  <CardDescription>Your account and business details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "Business Name", value: "Acme Auction House", icon: Building2 },
                  { label: "Account Type", value: "Professional Seller", icon: Badge, badge: true },
                  { label: "Verification Status", value: "Verified", icon: CheckCircle2, badge: true, verified: true },
                  { label: "Registered Email", value: "admin@acmeauction.com", icon: Mail },
                ].map((info, idx) => (
                  <div key={idx} className="p-4 bg-muted/30 rounded-xl border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <info.icon className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {info.label}
                      </p>
                    </div>
                    {info.badge ? (
                      <Badge variant={info.verified ? "default" : "secondary"} className="mt-1">
                        {info.value}
                      </Badge>
                    ) : (
                      <p className="text-sm font-semibold">{info.value}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6 mt-6">
          {/* Audit Logs - Enhanced */}
          <Card className="shadow-lg p-0 overflow-hidden">
            <CardHeader className="bg-linear-to-r from-red-50 to-transparent border-b pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-600 rounded-lg">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Audit Logs</CardTitle>
                    <CardDescription>Account activity and security event history</CardDescription>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    toast.info("Exporting audit logs...", {
                      description: "Preparing audit log export",
                    });
                    setTimeout(() => {
                      toast.success("Export completed", {
                        description: "Your audit logs have been exported.",
                      });
                    }, 1500);
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Logs
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {[
                  { action: "User login", details: "John Smith logged in from 192.168.1.100", date: "Jan 15, 2024", time: "2:45 PM", icon: Shield, bgClass: "bg-blue-100", textClass: "text-blue-600" },
                  { action: "Auction created", details: 'Sarah Johnson created auction "Vintage Collection #123"', date: "Jan 14, 2024", time: "10:30 AM", icon: FileText, bgClass: "bg-green-100", textClass: "text-green-600" },
                  { action: "Settings updated", details: "John Smith updated notification preferences", date: "Jan 13, 2024", time: "4:20 PM", icon: Settings, bgClass: "bg-purple-100", textClass: "text-purple-600" },
                  { action: "User role changed", details: "Mike Davis role changed from Viewer to Manager by John Smith", date: "Jan 12, 2024", time: "11:15 AM", icon: Users, bgClass: "bg-orange-100", textClass: "text-orange-600" },
                  { action: "Export generated", details: "Sarah Johnson generated full account data export", date: "Jan 10, 2024", time: "3:00 PM", icon: Download, bgClass: "bg-blue-100", textClass: "text-blue-600" },
                ].map((log, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-linear-to-r from-muted/50 to-muted/30 rounded-xl border hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-2 ${log.bgClass} rounded-lg`}>
                          <log.icon className={`h-4 w-4 ${log.textClass}`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm mb-1">{log.action}</p>
                          <p className="text-xs text-muted-foreground">{log.details}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium">{log.date}</p>
                        <p className="text-xs text-muted-foreground">{log.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <p className="text-xs text-muted-foreground text-center">
                Audit logs are retained for 90 days. Showing most recent 50 entries.
              </p>
            </CardContent>
          </Card>

          {/* Logs & Generated Assets - Enhanced */}
          <Card className="shadow-lg p-0 overflow-hidden">
            <CardHeader className="bg-linear-to-r from-indigo-50 to-transparent border-b pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-600 rounded-lg">
                    <Database className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Logs & Generated Assets</CardTitle>
                    <CardDescription>Export history and generated reports</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {[
                  { name: "Auction Report - January 2024", date: "Jan 15, 2024 at 2:30 PM", type: "Report" },
                  { name: "Transaction Export - Q4 2023", date: "Dec 31, 2023 at 11:45 PM", type: "Export" },
                  { name: "Fee Summary Report", date: "Dec 20, 2023 at 10:15 AM", type: "Report" },
                  { name: "Complete Account Data - January 2024", date: "Jan 15, 2024 at 2:30 PM", type: "Full Export", highlight: true },
                ].map((asset, idx) => (
                  <div
                    key={idx}
                    className={`group p-4 rounded-xl border hover:shadow-md transition-all ${
                      asset.highlight
                        ? "bg-linear-to-r from-primary/10 to-primary/5 border-primary/30"
                        : "bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${asset.highlight ? "bg-primary/20" : "bg-muted"}`}>
                          <FileText className={`h-5 w-5 ${asset.highlight ? "text-green-700" : "text-muted-foreground"}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-sm">{asset.name}</p>
                            <Badge variant="outline" className="text-xs">
                              {asset.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{asset.date}</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          toast.info("Downloading export...", {
                            description: `Preparing ${asset.name}`,
                          });
                          setTimeout(() => {
                            toast.success("Download started", {
                              description: "Your file download should begin shortly.",
                            });
                          }, 1000);
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Help & Support - Enhanced */}
          <Card className="shadow-lg p-0 overflow-hidden">
            <CardHeader className="bg-linear-to-r from-cyan-50 to-transparent border-b pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-600 rounded-lg">
                  <HelpCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Help & Support</CardTitle>
                  <CardDescription>Quick access to support resources</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "Contact Support", description: "Get help from our team", icon: HelpCircle, bgClass: "bg-blue-100", textClass: "text-blue-600" },
                  { title: "Documentation", description: "Platform guides and tutorials", icon: FileText, bgClass: "bg-purple-100", textClass: "text-purple-600" },
                  { title: "FAQs", description: "Frequently asked questions", icon: HelpCircle, bgClass: "bg-green-100", textClass: "text-green-600" },
                  { title: "Report Issue", description: "Report bugs or problems", icon: AlertCircle, bgClass: "bg-orange-100", textClass: "text-orange-600" },
                ].map((support, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      toast.info(support.title, {
                        description: support.description,
                      });
                    }}
                    className="group p-4 bg-linear-to-br from-muted/50 to-muted/30 rounded-xl border hover:shadow-md hover:border-primary/50 transition-all w-full text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 ${support.bgClass} rounded-lg group-hover:scale-110 transition-transform`}>
                        <support.icon className={`h-5 w-5 ${support.textClass}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm mb-1">{support.title}</p>
                        <p className="text-xs text-muted-foreground">{support.description}</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-green-700 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Template Dialog */}
      <Dialog open={isNewTemplateOpen} onOpenChange={setIsNewTemplateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Email Template</DialogTitle>
            <DialogDescription>
              Create a new email template for automated communications
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">Template Name</Label>
              <Input id="templateName" placeholder="Enter template name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="templateSubject">Subject</Label>
              <Input id="templateSubject" placeholder="Email subject line" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="templateBody">Body</Label>
              <Textarea id="templateBody" placeholder="Email body content..." rows={8} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewTemplateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setIsNewTemplateOpen(false);
              toast.success("Template created", {
                description: "Your new email template has been created.",
              });
            }}>
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={isEditTemplateOpen} onOpenChange={setIsEditTemplateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Email Template</DialogTitle>
            <DialogDescription>
              Update the email template content and settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editTemplateName">Template Name</Label>
              <Input id="editTemplateName" placeholder="Enter template name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editTemplateSubject">Subject</Label>
              <Input id="editTemplateSubject" placeholder="Email subject line" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editTemplateBody">Body</Label>
              <Textarea id="editTemplateBody" placeholder="Email body content..." rows={8} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditTemplateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setIsEditTemplateOpen(false);
              toast.success("Template updated", {
                description: "The email template has been updated.",
              });
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Branding Dialog */}
      <Dialog open={isEditBrandingOpen} onOpenChange={setIsEditBrandingOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Branding</DialogTitle>
            <DialogDescription>
              Update your platform branding and customization settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <Input id="primaryColor" type="color" defaultValue="#1a4d2e" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <Input id="secondaryColor" type="color" defaultValue="#8650eb" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customDomain">Custom Domain</Label>
              <Input id="customDomain" placeholder="auctions.yourdomain.com" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditBrandingOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setIsEditBrandingOpen(false);
              toast.success("Branding updated", {
                description: "Your branding settings have been saved.",
              });
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Invite a new user to your account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="userEmail">Email Address</Label>
              <Input id="userEmail" type="email" placeholder="user@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userRole">Role</Label>
              <select
                id="userRole"
                className="w-full h-9 px-3 rounded-md border border-input bg-background"
              >
                <option value="viewer">Viewer</option>
                <option value="manager">Manager</option>
                <option value="administrator">Administrator</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setIsAddUserOpen(false);
              toast.success("User invited", {
                description: "An invitation email has been sent.",
              });
            }}>
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user role and permissions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedUser && (
              <>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={selectedUser.name} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={selectedUser.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editUserRole">Role</Label>
                  <select
                    id="editUserRole"
                    className="w-full h-9 px-3 rounded-md border border-input bg-background"
                    defaultValue={selectedUser.role.toLowerCase()}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="manager">Manager</option>
                    <option value="administrator">Administrator</option>
                  </select>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setIsEditUserOpen(false);
              setSelectedUser(null);
              toast.success("User updated", {
                description: "User role has been updated.",
              });
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={isDeleteUserOpen} onOpenChange={setIsDeleteUserOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {selectedUser?.name} from your account. They will lose access immediately. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setIsDeleteUserOpen(false);
                setSelectedUser(null);
                toast.success("User removed", {
                  description: "The user has been removed from your account.",
                });
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
