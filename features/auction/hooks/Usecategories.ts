import { useQuery } from "@tanstack/react-query";
import { categoryService } from "../services/Categoryservice";
import type { Category, Subcategory } from "../types";

export { type Category, type Subcategory };

export const useCategories = () => {
  const query = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getCategories(),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const allCategories: Array<{ id: number; name: string; parentId: number | null }> =
    query.data?.data.flatMap((parent) => [
      { id: parent.id, name: parent.name, parentId: null },
      ...parent.subcategories.map((sub) => ({
        id: sub.id,
        name: sub.name,
        parentId: sub.parent_id,
      })),
    ]) ?? [];

  const categoryNameById = new Map<number, string>(
    allCategories.map((c) => [c.id, c.name])
  );

  return {
    ...query,
    tree: query.data?.data ?? [],
    allCategories,
    categoryNameById,
  };
};