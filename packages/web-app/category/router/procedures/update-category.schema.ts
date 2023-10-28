import z from "zod";

import { categoryIdSchema } from "../../schemas/category-id.schema";
import { categoryNameSchema } from "../../schemas/category-name.schema";

export const updateCategorySchema = z.object({
  id: categoryIdSchema,
  name: categoryNameSchema,
});
