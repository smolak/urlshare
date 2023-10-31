import z from "zod";

import { categoryNameSchema } from "../../schemas/category-name.schema";

export type CreateCategorySchema = z.infer<typeof createCategorySchema>;

export const createCategorySchema = z.object({
  name: categoryNameSchema,
});
