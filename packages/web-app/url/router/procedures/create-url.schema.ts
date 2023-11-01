import z from "zod";

import { urlSchema } from "../../schemas/url.schema";

export type CreateUrlSchema = z.infer<typeof createUrlSchema>;

export const createUrlSchema = z.object({
  url: urlSchema,
});
