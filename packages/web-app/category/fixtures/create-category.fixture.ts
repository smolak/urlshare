import { Category } from "@urlshare/db/prisma/client";

import { generateUserId } from "../../user/utils/generate-user-id";
import { generateCategoryId } from "../utils/generate-category-id";

export const createCategory = (overwrites: Partial<Category> = {}): Category => ({
  id: generateCategoryId(),
  userId: generateUserId(),
  name: "Category name",
  urlsCount: 0,
  createdAt: new Date(),
  ...overwrites,
});
