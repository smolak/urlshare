import z from "zod";

import { categoryIdSchema } from "../../../category/schemas/category-id.schema";
import { urlSchema } from "../../schemas/url.schema";

export type CreateUrlSchema = z.infer<typeof createUrlSchema>;

export const createUrlSchema = z.object({
  url: urlSchema,
  categoryIds: z.array(categoryIdSchema).optional().default([]),
});
