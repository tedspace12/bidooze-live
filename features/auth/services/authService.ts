import { withAuth, withoutAuth, getToken, setToken, removeToken } from "@/services/api";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "buyer" | "auctioneer" | "admin" | "superadmin";
  avatar?: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
  token_type: string;
}

export const authService = {
  /**
   * Buyer Login
   */
  async loginBuyer(email: string, password: string): Promise<LoginResponse> {
    try {
      const res = await withoutAuth.post<LoginResponse>("/buyer/login", {
        email,
        password,
      });

      // Store token in cookie
      if (res.data.token) {
        setToken(res.data.token);
      }

      return res.data;
    } catch (error: any) {
      throw error?.response?.data || { message: error.message };
    }
  },

  /**
   * Auctioneer Login
   */
  async loginAuctioneer(email: string, password: string): Promise<LoginResponse> {
    try {
      const res = await withoutAuth.post<LoginResponse>("/auctioneer/login", {
        email,
        password,
      });

      // Store token in cookie
      if (res.data.token) {
        setToken(res.data.token);
      }

      return res.data;
    } catch (error: any) {
      throw error?.response?.data || { message: error.message };
    }
  },

  /**
   * Admin Login
   */
  async loginAdmin(email: string, password: string): Promise<LoginResponse> {
    try {
      const res = await withoutAuth.post<LoginResponse>("/admin/login", {
        email,
        password,
      });

      // Store token in cookie
      if (res.data.token) {
        setToken(res.data.token);
      }

      return res.data;
    } catch (error: any) {
      throw error?.response?.data || { message: error.message };
    }
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      await withAuth.post("/logout");
    } catch (error) {
      // Continue even if logout fails
    } finally {
      removeToken();
    }
  },

  /**
   * Get Current User
   */
  async getCurrentUser(): Promise<User> {
    try {
      const res = await withAuth.get<{ user: User }>("/user");
      return res.data.user || res.data;
    } catch (error: any) {
      throw error?.response?.data || { message: error.message };
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!getToken();
  },
};

