import z from "zod";

import { categoryIdSchema } from "../../schemas/category-id.schema";

export const deleteCategorySchema = z.object({
  id: categoryIdSchema,
});
