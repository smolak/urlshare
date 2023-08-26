import z from "zod";

import { userIdSchema } from "../../../user/schemas/user-id.schema";

export const isFollowingUserSchema = z.object({
  userId: userIdSchema,
});
