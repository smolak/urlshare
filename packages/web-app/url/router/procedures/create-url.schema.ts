import z from "zod";

import { urlSchema } from "../../schemas/url.schema";

export const createUrlSchema = z.object({
  url: urlSchema,
});
