"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBlogs } from "@/features/admin/hooks/useBlogs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import type { BlogPost } from "@/features/admin/services/adminService";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

const statusBadge = (status?: string) => {
  if (status === "published")
    return <Badge className="bg-green-100 text-green-700 border-green-200">Published</Badge>;
  return <Badge className="bg-slate-100 text-slate-600 border-slate-200">Draft</Badge>;
};

export default function BlogsPage() {
  const router = useRouter();
  const { useBlogList, deleteBlog } = useBlogs();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);

  const { data, isLoading } = useBlogList({ search: search || undefined, page, per_page: 15 });

  const posts = data?.data ?? [];
  const meta = data?.meta;
  const total = typeof meta?.total === "number" ? meta.total : 0;
  const totalPages = Math.max(1, typeof meta?.last_page === "number" ? meta.last_page : 1);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteBlog.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-800">Blog Management</h1>
          <p className="text-slate-600">Create and manage blog posts and articles.</p>
        </div>
        <Button onClick={() => router.push("/admin/blogs/create")} className="w-full sm:w-auto gap-2">
          <Plus className="h-4 w-4" /> New Post
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-3 rounded-lg border bg-white p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search posts by title..."
            className="pl-10"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white">
        {isLoading ? (
          <div className="space-y-4 p-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="py-16 text-center">
            <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium text-slate-700">No blog posts yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Create your first post to get started.</p>
            <Button className="mt-4 gap-2" onClick={() => router.push("/admin/blogs/create")}>
              <Plus className="h-4 w-4" /> Create Post
            </Button>
          </div>
        ) : (
          <>
            {/* Mobile */}
            <div className="space-y-4 p-4 md:hidden">
              {posts.map((post) => (
                <div key={post.id} className="rounded-lg border p-4 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">{post.title}</p>
                      {post.category && <p className="text-xs text-muted-foreground mt-0.5">{post.category}</p>}
                    </div>
                    {statusBadge(post.status)}
                  </div>
                  {post.excerpt && (
                    <p className="text-sm text-slate-500 line-clamp-2">{post.excerpt}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {post.read_time && (
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.read_time} min</span>
                    )}
                    <span>{post.publish_date ? new Date(post.publish_date).toLocaleDateString() : new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => router.push(`/admin/blogs/${post.id}`)}>
                      <Edit className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-1 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(post)}>
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Read Time</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900">{post.title}</p>
                          {post.excerpt && (
                            <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">{post.excerpt}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{post.category || "—"}</TableCell>
                      <TableCell>{post.author?.name || "—"}</TableCell>
                      <TableCell>{statusBadge(post.status)}</TableCell>
                      <TableCell>
                        {post.read_time ? (
                          <span className="flex items-center gap-1 text-sm">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            {post.read_time} min
                          </span>
                        ) : "—"}
                      </TableCell>
                      <TableCell>
                        {post.publish_date
                          ? new Date(post.publish_date).toLocaleDateString()
                          : new Date(post.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/blogs/${post.id}`)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(post)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {posts.length > 0 && (
          <div className="flex flex-col gap-3 border-t px-4 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <div>Showing {posts.length} of {total} posts</div>
            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || isLoading}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-24 text-center font-medium text-foreground">Page {page} of {totalPages}</div>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || isLoading}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{deleteTarget?.title}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the blog post. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteBlog.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteBlog.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
