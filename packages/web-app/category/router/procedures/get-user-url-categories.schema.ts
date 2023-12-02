import z from "zod";

import { userUrlIdSchema } from "../../../user-url/schemas/user-url-id.schema";

export const getUserUrlCategoriesSchema = z.object({
  userUrlId: userUrlIdSchema,
});
