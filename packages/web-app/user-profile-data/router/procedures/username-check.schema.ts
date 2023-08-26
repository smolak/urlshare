import z from "zod";

import { usernameSchema } from "../../schemas/user-profile-data.schema";

export const usernameCheckSchema = z.object({
  username: usernameSchema,
});
