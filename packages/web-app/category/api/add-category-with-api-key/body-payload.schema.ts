import z from "zod";

import { categoryNameSchema } from "../../schemas/category-name.schema";

export const addCategoryWithApiKeyHandlerBodyPayloadSchema = z.object({
  name: categoryNameSchema,
});
