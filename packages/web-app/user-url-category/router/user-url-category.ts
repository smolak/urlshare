import { createTRPCRouter } from "../../trpc/server";
import { setUserUrlCategories } from "./procedures/set-user-url-categories";
import { toggleUserUrlCategory } from "./procedures/toggle-user-url-category";

export const userUrlCategoryRouter = createTRPCRouter({
  setUserUrlCategories,
  toggleUserUrlCategory,
});

export type UserUrlCategoryRouter = typeof userUrlCategoryRouter;
