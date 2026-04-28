import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService, type CreateCategoryPayload, type UpdateCategoryPayload } from "../services/adminService";
import { toast } from "sonner";
import { isAxiosError } from "axios";

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error)) {
    const msg = error.response?.data?.message;
    if (typeof msg === "string" && msg.trim()) return msg;
  }
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
};

export const useCategories = () => {
  const queryClient = useQueryClient();

  const useCategoryList = (params?: { search?: string }) => {
    return useQuery({
      queryKey: ["admin", "categories", params],
      queryFn: () => adminService.getCategories(params),
    });
  };

  const createCategory = useMutation({
    mutationFn: (payload: CreateCategoryPayload) => adminService.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      toast.success("Category created successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create category"));
    },
  });

  const updateCategory = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateCategoryPayload }) =>
      adminService.updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      toast.success("Category updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update category"));
    },
  });

  const deleteCategory = useMutation({
    mutationFn: (id: number) => adminService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      toast.success("Category deleted successfully");
    },
    onError: (error: unknown) => {
      if (isAxiosError(error) && error.response?.status === 409) {
        toast.error("Cannot delete: category has subcategories or is in use by auctions");
      } else {
        toast.error(getErrorMessage(error, "Failed to delete category"));
      }
    },
  });

  return {
    useCategoryList,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
