import z from "zod";

import { categoryIdSchema } from "../../schemas/category-id.schema";
import { categoryNameSchema } from "../../schemas/category-name.schema";

export type UpdateCategorySchema = z.infer<typeof updateCategorySchema>;

export const updateCategorySchema = z.object({
  id: categoryIdSchema,
  name: categoryNameSchema,
});
