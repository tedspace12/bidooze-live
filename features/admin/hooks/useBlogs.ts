import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService, type CreateBlogPayload, type UpdateBlogPayload } from "../services/adminService";
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

export const useBlogs = () => {
  const queryClient = useQueryClient();

  const useBlogList = (params?: { search?: string; category?: string; page?: number; per_page?: number }) => {
    return useQuery({
      queryKey: ["admin", "blogs", params],
      queryFn: () => adminService.getBlogs(params),
    });
  };

  const useBlogDetail = (id?: number) => {
    return useQuery({
      queryKey: ["admin", "blog", id],
      queryFn: () => adminService.getBlog(Number(id)),
      enabled: !!id,
    });
  };

  const createBlog = useMutation({
    mutationFn: (payload: CreateBlogPayload) => adminService.createBlog(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "blogs"] });
      toast.success("Blog post created successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create blog post"));
    },
  });

  const updateBlog = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateBlogPayload }) =>
      adminService.updateBlog(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "blogs"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "blog"] });
      toast.success("Blog post updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update blog post"));
    },
  });

  const deleteBlog = useMutation({
    mutationFn: (id: number) => adminService.deleteBlog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "blogs"] });
      toast.success("Blog post deleted");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete blog post"));
    },
  });

  return {
    useBlogList,
    useBlogDetail,
    createBlog,
    updateBlog,
    deleteBlog,
  };
};
