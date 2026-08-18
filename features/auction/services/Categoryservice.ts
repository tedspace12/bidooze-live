import { withAuctioneerAuth } from "@/services/api";
import type { CategoriesResponse } from "../types";
 
export const categoryService = {
  async getCategories(): Promise<CategoriesResponse> {
    const response = await withAuctioneerAuth.get<CategoriesResponse>("/categories");
    return response.data;
  },
};
 