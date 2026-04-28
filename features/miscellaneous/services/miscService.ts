import { withAuth } from "@/services/api";
import type {
  Account,
  Formula,
  Company,
  CreateAccountPayload,
  User,
  InviteUserPayload,
  Location,
  CreateLocationPayload,
} from "@/lib/miscellaneous/types";

type ApiErrorLike = { response?: { data?: unknown }; message?: string };

const extractData = <T>(payload: unknown): T => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

const rethrow = (error: unknown): never => {
  const err = error as ApiErrorLike;
  throw err?.response?.data || { message: err?.message || "Request failed" };
};

type FormulaPayload = Omit<Formula, "id" | "tenant_id" | "auction_reference_count" | "created_at" | "updated_at">;
type CompanyPayload = Partial<Omit<Company, "id" | "tenant_id" | "created_at" | "updated_at">>;

export const miscService = {
  // ── Accounts ──────────────────────────────────────────────────────────────
  async listAccounts(): Promise<Account[]> {
    try {
      const res = await withAuth.get("/miscellaneous/accounts");
      return extractData<Account[]>(res.data) ?? [];
    } catch (e) {
      return rethrow(e);
    }
  },

  async createAccount(payload: CreateAccountPayload): Promise<Account> {
    try {
      const res = await withAuth.post("/miscellaneous/accounts", payload);
      return extractData<Account>(res.data);
    } catch (e) {
      return rethrow(e);
    }
  },

  async updateAccount(id: number, payload: Partial<CreateAccountPayload>): Promise<Account> {
    try {
      const res = await withAuth.patch(`/miscellaneous/accounts/${id}`, payload);
      return extractData<Account>(res.data);
    } catch (e) {
      return rethrow(e);
    }
  },

  async deleteAccount(id: number): Promise<void> {
    try {
      await withAuth.delete(`/miscellaneous/accounts/${id}`);
    } catch (e) {
      rethrow(e);
    }
  },

  async seedDefaultAccounts(): Promise<Account[]> {
    try {
      const res = await withAuth.post("/miscellaneous/accounts/seed-defaults", {});
      return extractData<Account[]>(res.data) ?? [];
    } catch (e) {
      return rethrow(e);
    }
  },

  // ── Formulas ──────────────────────────────────────────────────────────────
  async listFormulas(): Promise<Formula[]> {
    try {
      const res = await withAuth.get("/miscellaneous/formulas");
      return extractData<Formula[]>(res.data) ?? [];
    } catch (e) {
      return rethrow(e);
    }
  },

  async createFormula(payload: FormulaPayload): Promise<Formula> {
    try {
      const res = await withAuth.post("/miscellaneous/formulas", payload);
      return extractData<Formula>(res.data);
    } catch (e) {
      return rethrow(e);
    }
  },

  async updateFormula(id: string, payload: Partial<FormulaPayload>): Promise<Formula> {
    try {
      const res = await withAuth.patch(`/miscellaneous/formulas/${id}`, payload);
      return extractData<Formula>(res.data);
    } catch (e) {
      return rethrow(e);
    }
  },

  async deleteFormula(id: string): Promise<void> {
    try {
      await withAuth.delete(`/miscellaneous/formulas/${id}`);
    } catch (e) {
      rethrow(e);
    }
  },

  // ── Company ──────────────────────────────────────────────────────────────
  async getCompany(): Promise<Company> {
    try {
      const res = await withAuth.get("/miscellaneous/company");
      return extractData<Company>(res.data);
    } catch (e) {
      return rethrow(e);
    }
  },

  async updateCompany(payload: CompanyPayload): Promise<Company> {
    try {
      const res = await withAuth.patch("/miscellaneous/company", payload);
      return extractData<Company>(res.data);
    } catch (e) {
      return rethrow(e);
    }
  },

  async uploadCompanyLogo(file: File, type: "logo" | "logo_mono"): Promise<Company> {
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("type", type);
      const res = await withAuth.post("/miscellaneous/company/logo", form, {
        headers: { "Content-Type": "multipart/form-data" },
      } as never);
      return extractData<Company>(res.data);
    } catch (e) {
      return rethrow(e);
    }
  },

  async deleteCompanyLogo(type: "logo" | "logo_mono"): Promise<Company> {
    try {
      const res = await withAuth.delete("/miscellaneous/company/logo", { data: { type } } as never);
      return extractData<Company>(res.data);
    } catch (e) {
      return rethrow(e);
    }
  },

  // ── Users ─────────────────────────────────────────────────────────────────
  async listUsers(): Promise<User[]> {
    try {
      const res = await withAuth.get("/miscellaneous/users");
      return extractData<User[]>(res.data) ?? [];
    } catch (e) {
      return rethrow(e);
    }
  },

  async inviteUser(payload: InviteUserPayload): Promise<User> {
    try {
      const res = await withAuth.post("/miscellaneous/users/invite", payload);
      return extractData<User>(res.data);
    } catch (e) {
      return rethrow(e);
    }
  },

  async updateUser(
    id: string,
    payload: Partial<Pick<User, "role" | "custom_permissions" | "auction_access" | "is_active">>
  ): Promise<User> {
    try {
      const res = await withAuth.patch(`/miscellaneous/users/${id}`, payload);
      return extractData<User>(res.data);
    } catch (e) {
      return rethrow(e);
    }
  },

  async transferOwnership(toUserId: string): Promise<void> {
    try {
      await withAuth.post("/miscellaneous/users/transfer-ownership", { to_user_id: toUserId });
    } catch (e) {
      rethrow(e);
    }
  },

  async removeUser(id: string): Promise<void> {
    try {
      await withAuth.delete(`/miscellaneous/users/${id}`);
    } catch (e) {
      rethrow(e);
    }
  },

  // ── Locations ─────────────────────────────────────────────────────────────
  async listLocations(): Promise<Location[]> {
    try {
      const res = await withAuth.get("/miscellaneous/locations");
      return extractData<Location[]>(res.data) ?? [];
    } catch (e) {
      return rethrow(e);
    }
  },

  async createLocation(payload: CreateLocationPayload): Promise<Location> {
    try {
      const res = await withAuth.post("/miscellaneous/locations", payload);
      return extractData<Location>(res.data);
    } catch (e) {
      return rethrow(e);
    }
  },

  async updateLocation(id: string, payload: Partial<CreateLocationPayload>): Promise<Location> {
    try {
      const res = await withAuth.patch(`/miscellaneous/locations/${id}`, payload);
      return extractData<Location>(res.data);
    } catch (e) {
      return rethrow(e);
    }
  },

  async deleteLocation(id: string): Promise<void> {
    try {
      await withAuth.delete(`/miscellaneous/locations/${id}`);
    } catch (e) {
      rethrow(e);
    }
  },
};
