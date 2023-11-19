import z from "zod";

import { categoryIdSchema } from "../../../category/schemas/category-id.schema";
import { urlSchema } from "../../schemas/url.schema";

export const addUrlWithApiKeyHandlerBodyPayloadSchema = z.object({
  url: urlSchema,
  categoryIds: z.array(categoryIdSchema).optional().default([]),
});
