import z from "zod";

import { categoryIdSchema } from "../../../category/schemas/category-id.schema";
import { userUrlIdSchema } from "../../../user-url/schemas/user-url-id.schema";

export const updateUserUrlSchema = z.object({
  userUrlId: userUrlIdSchema,
  categoryIds: z.array(categoryIdSchema).optional().default([]),
});
