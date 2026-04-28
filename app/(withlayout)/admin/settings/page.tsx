"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAdmin } from "@/features/admin/hooks/useAdmin";
import { useAuthStore } from "@/features/auth/store/authStore";
import {
  useAccessControlQuery,
  useNotificationPreferencesQuery,
  useSettingsQuery,
  useUpdateSettingsMutation,
} from "@/features/admin/hooks/useAdminSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { UserPlus, Settings, ShieldCheck, Bell, Lock, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ProfileForm = {
  name: string;
  email: string;
  bio: string;
  avatarUrl: string;
  role: string;
  mfaEnabled: boolean;
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type NotificationForm = {
  emailAlerts: boolean;
  smsAlerts: boolean;
  weeklyDigest: boolean;
};

type AccessControlForm = {
  requireAdminApproval: boolean;
  inviteExpiryHours: string;
};

type FieldErrors = Record<string, string>;

function mapValidationErrors(error: unknown) {
  const errors = (error as { response?: { data?: { errors?: unknown } } })?.response?.data?.errors;
  if (!errors || typeof errors !== "object") return {} as FieldErrors;
  const mapped: FieldErrors = {};
  Object.entries(errors as Record<string, unknown>).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      const [first] = value;
      if (typeof first === "string") mapped[key] = first;
    } else if (typeof value === "string") {
      mapped[key] = value;
    }
  });
  return mapped;
}

export default function AdminSettingsPage() {
  const { useCurrentUser } = useAuth();
  const { data: authUser, isLoading: userLoading } = useCurrentUser();
  const { createAdmin } = useAdmin();
  const { data: profileData, isLoading: profileLoading } = useSettingsQuery();
  const { data: notificationData } = useNotificationPreferencesQuery();
  const updateSettings = useUpdateSettingsMutation();
  const { user: authStoreUser, auctioneer, canAccessAuctioneerFeatures, setSession } = useAuthStore();

  const currentUser = authUser?.user;
  const isSuperAdmin = currentUser?.role === "superadmin";

  const { data: accessData } = useAccessControlQuery(!!isSuperAdmin);

  const [profile, setProfile] = useState<ProfileForm>({
    name: "",
    email: "",
    bio: "",
    avatarUrl: "",
    role: "",
    mfaEnabled: false,
  });
  const [profileErrors, setProfileErrors] = useState<FieldErrors>({});

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<FieldErrors>({});

  const [notifications, setNotifications] = useState<NotificationForm>({
    emailAlerts: false,
    smsAlerts: false,
    weeklyDigest: false,
  });

  const [accessControl, setAccessControl] = useState<AccessControlForm>({
    requireAdminApproval: true,
    inviteExpiryHours: "48",
  });

  const [adminForm, setAdminForm] = useState({ name: "", email: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const notificationsLoaded = !!notificationData;
  const accessLoaded = !!accessData;

  useEffect(() => {
    if (!profileData) return;
    setProfile({
      name: profileData.name || "",
      email: profileData.email || "",
      bio: profileData.bio || "",
      avatarUrl: profileData.avatar_url || "",
      role: profileData.role || "",
      mfaEnabled: !!profileData.mfa_enabled,
    });
  }, [profileData]);

  useEffect(() => {
    if (!profileData) return;
    const baseUser = authStoreUser || currentUser;
    if (!baseUser) return;
    const nextAvatar = profileData.avatar_url || baseUser.avatar || null;
    if (
      baseUser.name === profileData.name &&
      baseUser.email === profileData.email &&
      baseUser.avatar === nextAvatar
    ) {
      return;
    }
    setSession({
      user: {
        ...baseUser,
        name: profileData.name,
        email: profileData.email,
        avatar: nextAvatar,
      },
      auctioneer,
      can_access_auctioneer_features: canAccessAuctioneerFeatures,
    });
  }, [profileData, authStoreUser, currentUser, auctioneer, canAccessAuctioneerFeatures, setSession]);

  useEffect(() => {
    if (!notificationData) return;
    setNotifications({
      emailAlerts: !!notificationData.email_alerts,
      smsAlerts: !!notificationData.sms_alerts,
      weeklyDigest: !!notificationData.weekly_digest,
    });
  }, [notificationData]);

  useEffect(() => {
    if (!accessData) return;
    setAccessControl({
      requireAdminApproval: !!accessData.require_admin_approval,
      inviteExpiryHours: accessData.invite_expiry_hours?.toString() || "48",
    });
  }, [accessData]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const profileDirty = useMemo(() => {
    if (!profileData) return false;
    return (
      profile.name !== (profileData.name || "") ||
      profile.email !== (profileData.email || "") ||
      profile.bio !== (profileData.bio || "")
    );
  }, [profile, profileData]);

  const validateProfile = () => {
    const errors: FieldErrors = {};
    if (!profile.name.trim()) errors.name = "Name is required.";
    if (!profile.email.trim() || !emailRegex.test(profile.email)) errors.email = "Enter a valid email.";
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePassword = () => {
    const errors: FieldErrors = {};
    if (!passwordForm.currentPassword) errors.current_password = "Current password is required.";
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 8) {
      errors.new_password = "New password must be at least 8 characters.";
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.new_password_confirmation = "Passwords do not match.";
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) return;
    try {
      await updateSettings.mutateAsync({
        profile: {
          name: profile.name,
          email: profile.email,
          bio: profile.bio || null,
        },
      });
    } catch (error: unknown) {
      setProfileErrors(mapValidationErrors(error));
    }
  };

  const handleAvatarChange = async (file?: File | null) => {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setAvatarFile(file);
    setAvatarPreview(preview);
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) return;
    try {
      const result = await updateSettings.mutateAsync({ avatarFile });
      if (result.avatar?.avatar_url) {
        setProfile((prev) => ({ ...prev, avatarUrl: result.avatar!.avatar_url }));
      }
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(null);
      setAvatarFile(null);
    } catch {
      // toast handled in hook
    }
  };

  const handleSavePassword = async () => {
    if (!validatePassword()) return;
    try {
      await updateSettings.mutateAsync({
        password: {
          current_password: passwordForm.currentPassword,
          new_password: passwordForm.newPassword,
          new_password_confirmation: passwordForm.confirmPassword,
        },
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: unknown) {
      setPasswordErrors(mapValidationErrors(error));
    }
  };

  const handleMfaToggle = async (enabled: boolean) => {
    setProfile((prev) => ({ ...prev, mfaEnabled: enabled }));
    try {
      const result = await updateSettings.mutateAsync({ mfa: { enabled } });
      if (result.mfa?.mfa_enabled !== undefined) {
        setProfile((prev) => ({ ...prev, mfaEnabled: result.mfa!.mfa_enabled }));
      }
    } catch {
      setProfile((prev) => ({ ...prev, mfaEnabled: !enabled }));
    }
  };

  const handleSaveNotifications = async () => {
    if (!notificationsLoaded) return;
    await updateSettings.mutateAsync({
      notifications: {
        email_alerts: notifications.emailAlerts,
        sms_alerts: notifications.smsAlerts,
        weekly_digest: notifications.weeklyDigest,
      },
    });
  };

  const handleSaveAccess = async () => {
    if (!accessLoaded) return;
    await updateSettings.mutateAsync({
      accessControl: {
        require_admin_approval: accessControl.requireAdminApproval,
        invite_expiry_hours: Number(accessControl.inviteExpiryHours),
      },
    });
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAdmin.mutateAsync(adminForm);
    setAdminForm({ name: "", email: "" });
    setIsModalOpen(false);
  };

  if (userLoading || profileLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-800">Admin Settings</h1>
        <p className="text-slate-500">Manage your admin profile, security, notifications, and access control.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-4 lg:w-[700px]">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Settings className="h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="access" className="flex items-center gap-2">
            <Lock className="h-4 w-4" /> Access Control
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardDescription>Update your name, email, avatar, and bio.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-4 rounded-md border p-4 sm:flex-row sm:items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-600 overflow-hidden">
                  {avatarPreview ? (
                    <Image src={avatarPreview} alt="Avatar preview" width={56} height={56} unoptimized className="h-full w-full object-cover" />
                  ) : profile.avatarUrl ? (
                    <Image src={profile.avatarUrl} alt="Avatar" width={56} height={56} unoptimized className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-6 w-6" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Profile photo</p>
                  <p className="text-xs text-muted-foreground">Upload a square image (min 400x400).</p>
                </div>
                <label className="cursor-pointer text-sm font-medium text-primary">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleAvatarChange(e.target.files?.[0])}
                  />
                  Change
                </label>
                <Button
                  variant="outline"
                  disabled={!avatarFile || updateSettings.isPending}
                  onClick={handleUploadAvatar}
                  className="w-full sm:w-auto"
                >
                  {updateSettings.isPending ? "Uploading..." : "Upload"}
                </Button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="profileName">Full Name</Label>
                  <Input
                    id="profileName"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                  {profileErrors.name && <p className="text-xs text-red-600">{profileErrors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input value={profile.role} readOnly disabled />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="profileEmail">Email</Label>
                  <Input
                    id="profileEmail"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                  {profileErrors.email && <p className="text-xs text-red-600">{profileErrors.email}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profileBio">Bio</Label>
                <Textarea
                  id="profileBio"
                  rows={3}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  if (!profileData) return;
                  setProfile({
                    name: profileData.name || "",
                    email: profileData.email || "",
                    bio: profileData.bio || "",
                    avatarUrl: profileData.avatar_url || "",
                    role: profileData.role || "",
                    mfaEnabled: !!profileData.mfa_enabled,
                  });
                  setProfileErrors({});
                }}
                disabled={!profileDirty}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button onClick={handleSaveProfile} disabled={!profileDirty || updateSettings.isPending} className="w-full sm:w-auto">
                {updateSettings.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Change your password and manage MFA.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="*****"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  />
                  {passwordErrors.current_password && (
                    <p className="text-xs text-red-600">{passwordErrors.current_password}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="*****"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  />
                  {passwordErrors.new_password && (
                    <p className="text-xs text-red-600">{passwordErrors.new_password}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="*****"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />
                  {passwordErrors.new_password_confirmation && (
                    <p className="text-xs text-red-600">{passwordErrors.new_password_confirmation}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-4 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <Label htmlFor="mfaEnabled">Multi-Factor Authentication</Label>
                  <p className="text-xs text-muted-foreground">
                    {profile.mfaEnabled
                      ? "MFA enabled (email OTP required at login)."
                      : "MFA disabled."}
                  </p>
                </div>
                <Switch
                  id="mfaEnabled"
                  checked={profile.mfaEnabled}
                  onCheckedChange={handleMfaToggle}
                  aria-label="Toggle MFA"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button variant="outline" onClick={() => setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button onClick={handleSavePassword} disabled={updateSettings.isPending} className="w-full sm:w-auto">
                {updateSettings.isPending ? "Saving..." : "Update Password"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Alert preferences for admin activity.</CardDescription>
                </div>
                {!notificationsLoaded && (
                  <Badge variant="outline" className="text-xs text-muted-foreground">Not loaded</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {!notificationsLoaded && (
                <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                  Notification preferences are not loaded. Add a GET endpoint to populate current values.
                </div>
              )}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-4 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="emailAlerts">Email Alerts</Label>
                    <p className="text-xs text-muted-foreground">Receive critical system alerts.</p>
                  </div>
                  <Switch
                    id="emailAlerts"
                    checked={notifications.emailAlerts}
                    onCheckedChange={(value) => setNotifications({ ...notifications, emailAlerts: value })}
                    disabled={!notificationsLoaded}
                  />
                </div>
                <div className="flex flex-col gap-4 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="smsAlerts">SMS Alerts</Label>
                    <p className="text-xs text-muted-foreground">Text notifications for outages.</p>
                  </div>
                  <Switch
                    id="smsAlerts"
                    checked={notifications.smsAlerts}
                    onCheckedChange={(value) => setNotifications({ ...notifications, smsAlerts: value })}
                    disabled={!notificationsLoaded}
                  />
                </div>
                <div className="flex flex-col gap-4 rounded-md border p-3 md:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="weeklyDigest">Weekly Digest</Label>
                    <p className="text-xs text-muted-foreground">Email weekly summaries.</p>
                  </div>
                  <Switch
                    id="weeklyDigest"
                    checked={notifications.weeklyDigest}
                    onCheckedChange={(value) => setNotifications({ ...notifications, weeklyDigest: value })}
                    disabled={!notificationsLoaded}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button variant="outline" disabled={!notificationsLoaded} className="w-full sm:w-auto">Cancel</Button>
              <Button onClick={handleSaveNotifications} disabled={!notificationsLoaded || updateSettings.isPending} className="w-full sm:w-auto">
                {updateSettings.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="mt-6">
            <Card>
              <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <CardTitle>Admin Management</CardTitle>
                  <CardDescription>Manage admin invitations, approvals, and access rules.</CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {!accessLoaded && (
                    <Badge variant="outline" className="text-xs text-muted-foreground">Not loaded</Badge>
                  )}
                  {isSuperAdmin && (
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                      <DialogTrigger asChild>
                        <Button className="flex w-full items-center gap-2 sm:w-auto">
                          <UserPlus className="h-4 w-4" /> Add Admin
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <form onSubmit={handleCreateAdmin}>
                          <DialogHeader>
                            <DialogTitle>Add New Admin</DialogTitle>
                            <DialogDescription>
                              Create an administrative account. A password will be generated by the backend.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="name">Full Name</Label>
                              <Input
                                id="name"
                                placeholder="John Doe"
                                required
                                value={adminForm.name}
                                onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="email">Email Address</Label>
                              <Input
                                id="email"
                                type="email"
                                placeholder="john@example.com"
                                required
                                value={adminForm.email}
                                onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                              />
                            </div>
                          </div>
                          <DialogFooter className="flex-col gap-2 sm:flex-row">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto">
                              Cancel
                            </Button>
                            <Button type="submit" disabled={createAdmin.isPending} className="w-full sm:w-auto">
                              {createAdmin.isPending ? "Creating..." : "Create Admin"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isSuperAdmin ? (
                <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                  You are not authorized to manage access control settings.
                </div>
              ) : (
                <>
                  {!accessLoaded && (
                    <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                      Access control settings are not loaded. Add a GET endpoint to populate current values.
                    </div>
                  )}
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="flex flex-col gap-4 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="requireApproval">Require Approval</Label>
                        <p className="text-xs text-muted-foreground">Approve new admin accounts manually.</p>
                      </div>
                      <Switch
                        id="requireApproval"
                        checked={accessControl.requireAdminApproval}
                        onCheckedChange={(value) => setAccessControl({ ...accessControl, requireAdminApproval: value })}
                        disabled={!accessLoaded}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inviteExpiry">Invite Expiry (hours)</Label>
                      <Input
                        id="inviteExpiry"
                        type="number"
                        value={accessControl.inviteExpiryHours}
                        onChange={(e) => setAccessControl({ ...accessControl, inviteExpiryHours: e.target.value })}
                        disabled={!accessLoaded}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button variant="outline" disabled={!accessLoaded || !isSuperAdmin} className="w-full sm:w-auto">Cancel</Button>
              <Button onClick={handleSaveAccess} disabled={!accessLoaded || !isSuperAdmin || updateSettings.isPending} className="w-full sm:w-auto">
                {updateSettings.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
