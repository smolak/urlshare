import { createTRPCRouter } from "../../trpc/server";
import { createCategory } from "./procedures/create-category";
import { deleteCategory } from "./procedures/delete-category";
import { getUserCategories } from "./procedures/get-user-categories";
import { updateCategory } from "./procedures/update-category";

export const categoryRouter = createTRPCRouter({
  createCategory,
  deleteCategory,
  getUserCategories,
  updateCategory,
});
