import z from "zod";

import { categoryNameSchema } from "../../schemas/category-name.schema";

export const createCategorySchema = z.object({
  name: categoryNameSchema,
});
