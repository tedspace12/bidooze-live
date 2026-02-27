"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminService, AccessControlSettings, AdminProfile, NotificationPreferences } from "@/features/admin/services/adminService";

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
};

export function useSettingsQuery() {
  return useQuery({
    queryKey: ["admin", "profile"],
    queryFn: () => adminService.getAdminProfile(),
  });
}

export function useNotificationPreferencesQuery() {
  return useQuery({
    queryKey: ["admin", "notification-preferences"],
    queryFn: () => adminService.getNotificationPreferences(),
  });
}

export function useAccessControlQuery(enabled: boolean) {
  return useQuery({
    queryKey: ["admin", "access-control"],
    queryFn: () => adminService.getAccessControl(),
    enabled,
  });
}

export function useUpdateSettingsMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      profile?: { name: string; email: string; bio?: string | null };
      password?: { current_password: string; new_password: string; new_password_confirmation: string };
      mfa?: { enabled: boolean };
      notifications?: NotificationPreferences;
      accessControl?: AccessControlSettings;
      avatarFile?: File;
    }) => {
      const results: {
        profile?: AdminProfile;
        mfa?: { mfa_enabled: boolean };
        notifications?: NotificationPreferences;
        accessControl?: AccessControlSettings;
        avatar?: { avatar_url: string };
      } = {};

      if (payload.profile) {
        results.profile = await adminService.updateAdminProfile(payload.profile);
      }
      if (payload.password) {
        await adminService.updateAdminPassword(payload.password);
      }
      if (payload.mfa) {
        results.mfa = await adminService.updateAdminMfa(payload.mfa);
      }
      if (payload.notifications) {
        results.notifications = await adminService.updateNotificationPreferences(payload.notifications);
      }
      if (payload.accessControl) {
        results.accessControl = await adminService.updateAccessControl(payload.accessControl);
      }
      if (payload.avatarFile) {
        results.avatar = await adminService.uploadAdminAvatar(payload.avatarFile);
      }

      return results;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "profile"] });
      toast.success("Settings saved successfully.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to save settings."));
    },
  });
}
