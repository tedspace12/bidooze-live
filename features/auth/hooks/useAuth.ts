import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService, User, LoginResponse } from "../services/authService";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Get current user
  const useCurrentUser = () => {
    return useQuery({
      queryKey: ["current-user"],
      queryFn: () => authService.getCurrentUser(),
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };

  // Auctioneer login mutation
  const loginAuctioneer = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.loginAuctioneer(email, password),
    mutationKey: ["auth", "login", "auctioneer"],
    onSuccess: (data: LoginResponse) => {
      queryClient.setQueryData(["current-user"], data.user);
      toast.success("Login successful!");
      router.push("/dashboard");
    },
    onError: (error: any) => {
      const message = error?.message || "Login failed. Please try again.";
      toast.error(message);
    },
  });

  // Admin login mutation
  const loginAdmin = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.loginAdmin(email, password),
    mutationKey: ["auth", "login", "admin"],
    onSuccess: (data: LoginResponse) => {
      queryClient.setQueryData(["current-user"], data.user);
      toast.success("Login successful!");
      router.push("/dashboard");
    },
    onError: (error: any) => {
      const message = error?.message || "Login failed. Please try again.";
      toast.error(message);
    },
  });

  // Logout mutation
  const logout = useMutation({
    mutationFn: () => authService.logout(),
    mutationKey: ["auth", "logout"],
    onSuccess: () => {
      queryClient.clear();
      toast.success("Logged out successfully");
      router.push("/login");
    },
    onError: () => {
      // Even if logout fails, clear local state
      queryClient.clear();
      router.push("/login");
    },
  });

  return {
    useCurrentUser,
    loginAuctioneer,
    loginAdmin,
    logout,
  };
};

