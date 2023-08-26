import z from "zod";

import { urlSchema } from "../../schemas/url.schema";

export const addUrlWithApiKeyHandlerBodyPayloadSchema = z.object({
  url: urlSchema,
});
