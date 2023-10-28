import z from "zod";

import { userIdSchema } from "../../../user/schemas/user-id.schema";

export const getUserCategoriesSchema = z.object({
  userId: userIdSchema,
});
