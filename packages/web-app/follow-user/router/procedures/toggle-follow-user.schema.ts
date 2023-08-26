import z from "zod";

import { userIdSchema } from "../../../user/schemas/user-id.schema";

export const toggleFollowUserSchema = z.object({
  userId: userIdSchema,
});
