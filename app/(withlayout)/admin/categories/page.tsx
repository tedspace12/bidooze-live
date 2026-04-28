"use client";

import { useState, useMemo } from "react";
import { useCategories } from "@/features/admin/hooks/useCategories";
import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from "@/features/admin/services/adminService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  ChevronDown,
  ChevronRight,
  Edit,
  FolderOpen,
  FolderPlus,
  Plus,
  Search,
  Tag,
  Trash2,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Category Form ────────────────────────────────────────────────────────────

interface CategoryFormProps {
  mode: "create" | "edit";
  initial?: Partial<Category>;
  parentOptions: { id: number; name: string }[];
  onSubmit: (payload: CreateCategoryPayload | UpdateCategoryPayload) => void;
  onCancel: () => void;
  isPending: boolean;
}

function CategoryForm({ mode, initial, parentOptions, onSubmit, onCancel, isPending }: CategoryFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [parentId, setParentId] = useState<number | null>(initial?.parent_id ?? null);
  const [sortOrder, setSortOrder] = useState<number>(initial?.sort_order ?? 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      image: image.trim() || null,
      parent_id: parentId,
      sort_order: sortOrder,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cat-name">Category Name *</Label>
        <Input
          id="cat-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Electronics"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cat-image">Image URL</Label>
        <Input
          id="cat-image"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cat-parent">Parent Category</Label>
        <select
          id="cat-parent"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={parentId ?? ""}
          onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">None (top-level)</option>
          {parentOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>{opt.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cat-sort">Sort Order</Label>
        <Input
          id="cat-sort"
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value))}
          min={0}
        />
      </div>

      <DialogFooter className="flex-col gap-2 sm:flex-row">
        <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">Cancel</Button>
        <Button type="submit" className="w-full sm:w-auto" disabled={isPending || !name.trim()}>
          {isPending ? (mode === "create" ? "Creating..." : "Saving...") : (mode === "create" ? "Create" : "Save Changes")}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ─── Category Tree Node ───────────────────────────────────────────────────────

function CategoryNode({
  category,
  depth,
  parentOptions,
  onEdit,
  onDelete,
  onAddSub,
}: {
  category: Category;
  depth: number;
  parentOptions: { id: number; name: string }[];
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
  onAddSub: (parentId: number) => void;
}) {
  const [expanded, setExpanded] = useState(depth === 0);
  const hasSubs = (category.subcategories?.length ?? 0) > 0;

  return (
    <div className={cn("select-none", depth > 0 && "ml-6 border-l border-slate-200 pl-4")}>
      <div className="group flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-slate-50 transition-colors">
        {/* Expand / collapse toggle */}
        <button
          type="button"
          className="shrink-0 text-slate-400 hover:text-slate-600"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {hasSubs ? (
            expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          ) : (
            <span className="inline-block h-4 w-4" />
          )}
        </button>

        {/* Icon */}
        {category.image ? (
          <img src={category.image} alt="" className="h-7 w-7 rounded object-cover shrink-0" />
        ) : (
          <div className="h-7 w-7 rounded bg-slate-100 flex items-center justify-center shrink-0">
            {depth === 0 ? <FolderOpen className="h-4 w-4 text-slate-400" /> : <Tag className="h-4 w-4 text-slate-400" />}
          </div>
        )}

        {/* Name */}
        <span className="flex-1 min-w-0 text-sm font-medium text-slate-800 truncate">
          {category.name}
        </span>

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          {(category.subcategories_count ?? 0) > 0 && (
            <Badge variant="outline" className="text-xs gap-1">
              <Layers className="h-3 w-3" />
              {category.subcategories_count}
            </Badge>
          )}
          {(category.auctions_count ?? 0) > 0 && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
              {category.published_auctions_count ?? 0}/{category.auctions_count} auctions
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {depth === 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-400 hover:text-blue-600"
              onClick={() => onAddSub(category.id)}
              title="Add subcategory"
            >
              <FolderPlus className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-slate-700"
            onClick={() => onEdit(category)}
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-red-600"
            onClick={() => onDelete(category)}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Subcategories */}
      {hasSubs && expanded && (
        <div className="mt-1 space-y-1">
          {category.subcategories!.map((sub) => (
            <CategoryNode
              key={sub.id}
              category={sub}
              depth={depth + 1}
              parentOptions={parentOptions}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddSub={onAddSub}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type DialogMode = "create" | "edit" | null;

export default function CategoriesPage() {
  const { useCategoryList, createCategory, updateCategory, deleteCategory } = useCategories();
  const [search, setSearch] = useState("");
  const { data: categories, isLoading, error } = useCategoryList({ search: search || undefined });

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [presetParentId, setPresetParentId] = useState<number | null>(null);

  // Top-level categories only — subcategories cannot themselves be parents
  const flatCategories = useMemo(
    () => (categories ?? []).map((cat) => ({ id: cat.id, name: cat.name })),
    [categories]
  );

  const openCreate = () => {
    setEditTarget(null);
    setPresetParentId(null);
    setDialogMode("create");
  };

  const openAddSub = (parentId: number) => {
    setEditTarget(null);
    setPresetParentId(parentId);
    setDialogMode("create");
  };

  const openEdit = (cat: Category) => {
    setEditTarget(cat);
    setPresetParentId(null);
    setDialogMode("edit");
  };

  const closeDialog = () => {
    setDialogMode(null);
    setEditTarget(null);
    setPresetParentId(null);
  };

  const handleCreate = async (payload: CreateCategoryPayload | UpdateCategoryPayload) => {
    await createCategory.mutateAsync(payload as CreateCategoryPayload);
    closeDialog();
  };

  const handleEdit = async (payload: CreateCategoryPayload | UpdateCategoryPayload) => {
    if (!editTarget) return;
    await updateCategory.mutateAsync({ id: editTarget.id, payload: payload as UpdateCategoryPayload });
    closeDialog();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteCategory.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const initialForDialog = editTarget
    ? { name: editTarget.name, image: editTarget.image, parent_id: editTarget.parent_id, sort_order: editTarget.sort_order }
    : presetParentId != null
    ? { parent_id: presetParentId }
    : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-800">Category Management</h1>
          <p className="text-slate-600">Organize auction categories in a hierarchical tree.</p>
        </div>
        <Button onClick={openCreate} className="w-full sm:w-auto gap-2">
          <Plus className="h-4 w-4" /> New Category
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Card>

      {/* Tree */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Category Tree
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="py-8 text-center text-muted-foreground">
              <p className="font-medium">Failed to load categories</p>
              <p className="text-sm mt-1">Check your connection and try again.</p>
            </div>
          ) : !categories || categories.length === 0 ? (
            <div className="py-12 text-center">
              <Tag className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="font-medium text-slate-700">No categories yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Create your first category to get started.</p>
              <Button onClick={openCreate} className="mt-4 gap-2" variant="outline">
                <Plus className="h-4 w-4" /> Create Category
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {categories.map((cat) => (
                <CategoryNode
                  key={cat.id}
                  category={cat}
                  depth={0}
                  parentOptions={flatCategories.filter((c) => c.id !== cat.id)}
                  onEdit={openEdit}
                  onDelete={setDeleteTarget}
                  onAddSub={openAddSub}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      {categories && categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground px-1">
          <div className="flex items-center gap-1">
            <FolderPlus className="h-3.5 w-3.5" /> Add subcategory
          </div>
          <div className="flex items-center gap-1">
            <Edit className="h-3.5 w-3.5" /> Edit
          </div>
          <div className="flex items-center gap-1">
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </div>
          <span className="text-muted-foreground/60">(hover a row to reveal actions)</span>
        </div>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={dialogMode !== null} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {dialogMode === "create" ? (
                <><Plus className="h-4 w-4" />{presetParentId ? "Add Subcategory" : "New Category"}</>
              ) : (
                <><Edit className="h-4 w-4" />Edit Category</>
              )}
            </DialogTitle>
          </DialogHeader>
          {dialogMode !== null && (
            <CategoryForm
              mode={dialogMode}
              initial={initialForDialog}
              parentOptions={flatCategories}
              onSubmit={dialogMode === "create" ? handleCreate : handleEdit}
              onCancel={closeDialog}
              isPending={createCategory.isPending || updateCategory.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{deleteTarget?.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category. If it has subcategories or is used by auctions, the deletion will be blocked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteCategory.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCategory.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
