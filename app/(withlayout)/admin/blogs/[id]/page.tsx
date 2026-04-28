"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useBlogs } from "@/features/admin/hooks/useBlogs";
import type { UpdateBlogPayload } from "@/features/admin/services/adminService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { AlertTriangle, ChevronLeft, FileText, Image as ImageIcon, Tag, User, X } from "lucide-react";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function EditBlogPage() {
  const router = useRouter();
  const { id } = useParams();
  const { useBlogDetail, updateBlog } = useBlogs();

  const { data: post, isLoading } = useBlogDetail(Number(id));

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [readTime, setReadTime] = useState<number | "">("");
  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [published, setPublished] = useState(false);

  // Populate form when data loads
  useEffect(() => {
    if (!post) return;
    setTitle(post.title ?? "");
    setSlug(post.slug ?? "");
    setExcerpt(post.excerpt ?? "");
    setContent(post.content ?? "");
    setCategory(post.category ?? "");
    setFeaturedImage(post.featured_image ?? "");
    setPublishDate(post.publish_date ? post.publish_date.slice(0, 16) : "");
    setReadTime(post.read_time ?? "");
    setAuthorName(post.author?.name ?? "");
    setAuthorRole(post.author?.role ?? "");
    setTags(post.tags ?? []);
    setPublished(post.status === "published");
  }, [post]);

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (!slugManual) setSlug(slugify(v));
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const payload: UpdateBlogPayload = {
      title: title.trim(),
      slug: slug.trim() || slugify(title),
      excerpt: excerpt.trim() || undefined,
      content,
      category: category.trim() || undefined,
      featured_image: featuredImage.trim() || undefined,
      publish_date: publishDate || undefined,
      read_time: readTime !== "" ? Number(readTime) : undefined,
      author: authorName ? { name: authorName, role: authorRole || undefined } : undefined,
      tags: tags.length ? tags : undefined,
      status: published ? "published" : "draft",
    };

    await updateBlog.mutateAsync({ id: Number(id), payload });
    router.push("/admin/blogs");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <Skeleton className="h-[500px] w-full" />
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="py-12 text-center">
        <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
        <p className="font-medium text-slate-700">Post not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Edit Post</h1>
          <p className="text-slate-600 truncate max-w-xs">{post.title}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          {/* Left: Editor */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4" /> Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Post title..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Slug</Label>
                  <div className="flex gap-2">
                    <Input
                      value={slug}
                      onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }}
                      placeholder="auto-generated-from-title"
                      className="font-mono text-sm"
                    />
                    {slugManual && (
                      <Button type="button" variant="outline" size="sm" onClick={() => { setSlug(slugify(title)); setSlugManual(false); }}>
                        Auto
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">URL: /blog/{slug || "auto-generated"}</p>
                </div>

                <div className="space-y-2">
                  <Label>Excerpt</Label>
                  <Textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Short summary shown in listings..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Content *</Label>
                  {/* Only render when content is loaded to avoid stale initialValue */}
                  {content !== undefined && (
                    <RichTextEditor
                      key={post.id}
                      value={content}
                      onChange={setContent}
                      placeholder="Write your post content here..."
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Metadata */}
          <div className="space-y-4">
            {/* Publish */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="published-toggle">Published</Label>
                  <Switch id="published-toggle" checked={published} onCheckedChange={setPublished} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {published ? "Post is visible publicly." : "Post is saved as draft."}
                </p>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={updateBlog.isPending || !title.trim() || !content.trim()}
                >
                  {updateBlog.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button type="button" variant="outline" className="w-full" onClick={() => router.back()}>
                  Cancel
                </Button>
              </CardContent>
            </Card>

            {/* Image */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <ImageIcon className="h-4 w-4" /> Featured Image
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  placeholder="https://..."
                />
                {featuredImage && (
                  <img src={featuredImage} alt="Preview" className="w-full rounded-lg object-cover aspect-video" />
                )}
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4" /> Metadata
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. News" />
                </div>
                <div className="space-y-2">
                  <Label>Publish Date</Label>
                  <Input type="datetime-local" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Read Time (minutes)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="5"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add a tag..."
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={addTag}>Add</Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                          {tag}
                          <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Author */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4" /> Author
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>Author Name</Label>
                  <Input value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Jane Doe" />
                </div>
                <div className="space-y-2">
                  <Label>Author Role</Label>
                  <Input value={authorRole} onChange={(e) => setAuthorRole(e.target.value)} placeholder="Editor" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
