import { withAuth } from "@/services/api";

export interface AdminStats {
    users: {
      total: number;
      buyers: number;
      auctioneers: number;
      admins: number;
    };
    auctioneers: {
      pending: number;
      approved: number;
      rejected: number;
      under_review: number;
    };
    bidders: {
      total: number;
      approved: number;
      active: number;
    };
    recent_activity: {
      new_registrations_7days: number;
      new_registrations_30days: number;
    };
  };

export interface AuctioneerStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  under_review: number;
}

export interface Auctioneer {
  id: number;
  name: string;
  email: string;
  status: string;
  registration_step: number;
  created_at: string;
  updated_at: string;
  auctioneer: {
    id: number;
    user_id: number;
    company_name: string;
    business_reg_no: string;
    tax_id: string;
    business_type: string;
    years_in_business: number;
    license_number: string;
    license_expiration_date: string;
    certifications: string;
    associations: string;
    registration_step: number;
    status: string;
    contacts: {
      id: number;
      contact_name: string;
      phone: string;
      email: string;
      website: string;
      address: string;
    };
    bank: {
      id: number;
      bank_name: string;
      account_name: string;
      account_type: string;
    };
    documents: unknown[];
    industries: unknown[];
    socials: unknown[];
  };
}

export interface AuctioneerListItem {
  id: number;
  company_name: string | null;
  status: string;
  registration_step: number;
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
    account_status: string;
  };
}
export interface PendingApplication {
  id: number;
  company_name: string | null;
  status: string;
  registration_step: number;
  created_at: string;
  contacts?: {
    id: number;
    auctioneer_id: number;
    contact_name: string;
    phone: string;
    email: string;
    website?: string | null;
    address?: string | null;
    created_at?: string;
    updated_at?: string;
  } | null;
}

export interface AuctioneerDetails {
  id: number;
  status: string;
  registration_step: number;
  company_info: {
    company_name: string | null;
    registration_no: string | null;
    business_type: string | null;
    tax_id: string | null;
    years_in_business: number | null;
    industries: string[];
    license_number: string | null;
    license_expiration_date: string | null;
    certifications: string;
    associations: string;
  };
  contacts: {
    id: number;
    auctioneer_id: number;
    contact_name: string;
    phone: string;
    email: string;
    website?: string | null;
    address?: string | null;
    created_at?: string;
    updated_at?: string;
  } | null;
  socials: Array<{
    id: number;
    auctioneer_id: number;
    platform: string;
    url: string;
    created_at?: string;
    updated_at?: string;
  }>;
  bank: {
    id: number;
    auctioneer_id: number;
    bank_name: string;
    account_name: string;
    account_type: string;
    created_at?: string;
    updated_at?: string;
  } | null;
  documents: Array<{
    id: number;
    auctioneer_id: number;
    type: string;
    file_url: string;
    status: string;
    created_at?: string;
    updated_at?: string;
  }>;
  created_at: string;
}


export interface Bidder {
  id: number;
  name: string;
  email: string;
  status: "active" | "suspended";
  reputation_score: number;
  created_at: string;
  updated_at: string;
}



export interface SystemHealth {
  application: {
    status: "healthy" | "degraded" | "down";
    app_env: string;
    app_version: string | null;
    uptime_seconds: number;
    server_time: string;
  };
  database: {
    status: "healthy" | "degraded" | "down";
    connection: boolean;
    response_time_ms: number | null;
    total_tables: number | null;
    failed_queries_last_24h: number | null;
  };
  queue: {
    status: "healthy" | "degraded" | "down";
    default_queue: string | null;
    pending_jobs: number | null;
    failed_jobs_last_24h: number | null;
    last_job_processed_at: string | null;
  };
  cache: {
    status: "healthy" | "degraded" | "down";
    driver: string | null;
    connection: boolean;
    response_time_ms: number | null;
  };
  storage: {
    status: "healthy" | "degraded" | "down";
    total_disk_space: number | null;
    used_disk_space: number | null;
    free_disk_space: number | null;
    usage_percentage: number | null;
  };
  scheduler: {
    status: "healthy" | "degraded" | "down";
    scheduler_running: boolean;
    last_run_at: string | null;
    missed_runs_count: number | null;
  };
  security: {
    status: "healthy" | "degraded" | "down";
    admin_logins_last_24h: number | null;
    failed_admin_logins_last_24h: number | null;
    forced_logouts_last_24h: number | null;
  };
}

export interface AdminProfile {
  id: number;
  name: string;
  email: string;
  role: "admin" | "superadmin";
  avatar_url?: string | null;
  bio?: string | null;
  mfa_enabled?: boolean | null;
}

export interface NotificationPreferences {
  email_alerts: boolean;
  sms_alerts: boolean;
  weekly_digest: boolean;
}

export interface AccessControlSettings {
  require_admin_approval: boolean;
  invite_expiry_hours: number;
}

export type ActivityLogSeverity = "info" | "warning" | "critical";
export type ActivityLogStatus = "success" | "failed" | "pending";
type PaginationLinks = Record<string, unknown>;
export interface PaginationMeta {
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number | null;
  to?: number | null;
  path?: string;
  [key: string]: unknown;
}

export interface ActivityLogItem {
  id: string;
  created_at: string;
  action: string;
  severity: ActivityLogSeverity;
  status: ActivityLogStatus;
  summary: string;
  actor: {
    id: number;
    name: string;
    role: string;
  };
  entity: {
    type: string;
    id: number | null;
  };
  has_details: boolean;
}

export interface ActivityLogDetail extends ActivityLogItem {
  diff?: {
    before: Record<string, unknown>;
    after: Record<string, unknown>;
  };
  metadata?: {
    ip_address?: string;
    user_agent?: string;
  };
  note?: string;
  reason?: string | null;
}

export const adminService = {
  /**
   * Get Dashboard Statistics
   */
  async getDashboardStats(): Promise<AdminStats> {
    const res = await withAuth.get<{ data: AdminStats }>("/admin/dashboard");
    return res.data.data;
  },

  /**
   * Get Auctioneer Statistics
   */
  async getAuctioneerStats(): Promise<AuctioneerStats> {
    const res = await withAuth.get<{ data: AuctioneerStats }>("/admin/auctioneers/statistics");
    return res.data.data;
  },

  /**
   * Get Pending Auctioneer Applications
   */
  async getPendingApplications(): Promise<PendingApplication[]> {
    const res = await withAuth.get<{ data: PendingApplication[] }>("/admin/dashboard/pending-applications");
    return res.data.data;
  },

  /**
   * Get Activity Logs
   */
  async getActivityLogs(params?: {
    page?: number;
    per_page?: number;
    action?: string;
    entity_type?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<{ data: ActivityLogItem[]; links: PaginationLinks; meta: PaginationMeta }> {
    const res = await withAuth.get<{ data: ActivityLogItem[]; links: PaginationLinks; meta: PaginationMeta }>(
      "/admin/activity-logs",
      { params }
    );
    return res.data;
  },

  /**
   * Get Activity Log Detail
   */
  async getActivityLogDetail(id: string): Promise<ActivityLogDetail> {
    const res = await withAuth.get<{ data: ActivityLogDetail }>(`/admin/activity-logs/${id}`);
    return res.data.data;
  },

  /**
   * Get System Health
   */
  async getSystemHealth(): Promise<SystemHealth> {
    const res = await withAuth.get<{ data: SystemHealth; generated_at: string }>("/admin/dashboard/system-health");
    return res.data.data;
  },

  /**
   * Get Admin Profile
   */
  async getAdminProfile(): Promise<AdminProfile> {
    const res = await withAuth.get<{ data: AdminProfile }>("/admin/profile");
    return res.data.data;
  },

  /**
   * Update Admin Profile
   */
  async updateAdminProfile(payload: { name: string; email: string; bio?: string | null }): Promise<AdminProfile> {
    const res = await withAuth.patch<{ data: AdminProfile }>("/admin/profile", payload);
    return res.data.data;
  },

  /**
   * Upload Admin Avatar
   */
  async uploadAdminAvatar(file: File): Promise<{ avatar_url: string }> {
    const formData = new FormData();
    formData.append("avatar", file);
    const res = await withAuth.post<{ data: { avatar_url: string } }>("/admin/profile/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  },

  /**
   * Change Admin Password
   */
  async updateAdminPassword(payload: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }): Promise<{ message: string }> {
    const res = await withAuth.put<{ message: string }>("/admin/profile/password", payload);
    return res.data;
  },

  /**
   * Update Admin MFA
   */
  async updateAdminMfa(payload: { enabled: boolean }): Promise<{ mfa_enabled: boolean }> {
    const res = await withAuth.patch<{ data: { mfa_enabled: boolean } }>("/admin/profile/mfa", payload);
    return res.data.data;
  },

  /**
   * Update Notification Preferences
   */
  async getNotificationPreferences(): Promise<NotificationPreferences> {
    const res = await withAuth.get<{ data: NotificationPreferences }>("/admin/notification-preferences");
    return res.data.data;
  },

  async updateNotificationPreferences(payload: NotificationPreferences): Promise<NotificationPreferences> {
    const res = await withAuth.patch<{ data: NotificationPreferences }>("/admin/notification-preferences", payload);
    return res.data.data;
  },

  /**
   * Update Access Control (Superadmin only)
   */
  async getAccessControl(): Promise<AccessControlSettings> {
    const res = await withAuth.get<{ data: AccessControlSettings }>("/admin/access-control");
    return res.data.data;
  },

  async updateAccessControl(payload: AccessControlSettings): Promise<AccessControlSettings> {
    const res = await withAuth.patch<{ data: AccessControlSettings }>("/admin/access-control", payload);
    return res.data.data;
  },

  /**
   * List Auctioneers with filter and pagination
   */
  async getAuctioneers(params?: { status?: string; search?: string; page?: number; per_page?: number }): Promise<{ data: AuctioneerListItem[], meta: PaginationMeta }> {
    const res = await withAuth.get<{ data: AuctioneerListItem[], meta: PaginationMeta }>("/admin/auctioneers", { params });
    return res.data;
  },

  /**
   * Get Single Auctioneer
   */
  async getAuctioneer(id: number): Promise<AuctioneerDetails> {
    const res = await withAuth.get<{ data: AuctioneerDetails }>(`/admin/auctioneers/${id}`);
    return res.data.data;
  },

  /**
   * Approve Auctioneer
   */
  async approveAuctioneer(id: number, notes?: string): Promise<unknown> {
    const res = await withAuth.post(`/admin/auctioneers/${id}/approve`, { notes });
    return res.data;
  },

  /**
   * Reject Auctioneer
   */
  async rejectAuctioneer(id: number, reason: string, notes?: string): Promise<unknown> {
    const res = await withAuth.post(`/admin/auctioneers/${id}/reject`, { reason, notes });
    return res.data;
  },

  /**
   * Request Review for Auctioneer
   */
  async requestReview(id: number, notes: string): Promise<unknown> {
    const res = await withAuth.post(`/admin/auctioneers/${id}/request-review`, { notes });
    return res.data;
  },

  /**
   * List Bidders with filter and pagination
   */
  async getBidders(params?: { status?: string; page?: number; limit?: number }): Promise<{ data: Bidder[], total: number }> {
    const res = await withAuth.get<{ data: Bidder[], total: number }>("/admin/bidders", { params });
    return res.data;
  },

  /**
   * Get Single Bidder
   */
  async getBidder(id: number): Promise<Bidder> {
    const res = await withAuth.get<Bidder>(`/admin/bidders/${id}`);
    return res.data;
  },

  /**
   * Update Bidder Status
   */
  async updateBidderStatus(id: number, status: string): Promise<Bidder> {
    const res = await withAuth.put<Bidder>(`/admin/bidders/${id}/status`, { status });
    return res.data;
  },

  /**
   * Create New Admin (Superadmin only)
   */
  async createAdmin(data: { name: string; email: string}): Promise<unknown> {
    const res = await withAuth.post("/admin/create", data);
    return res.data;
  }
};
