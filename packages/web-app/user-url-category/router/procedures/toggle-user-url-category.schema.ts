import z from "zod";

import { categoryIdSchema } from "../../../category/schemas/category-id.schema";
import { userUrlIdSchema } from "../../../user-url/schemas/user-url-id.schema";

export const toggleUserUrlCategorySchema = z.object({
  userUrlId: userUrlIdSchema,
  categoryId: categoryIdSchema,
});
