import z from "zod";

import { apiKeySchema, usernameSchema } from "../../schemas/user-profile-data.schema";

export type CreateUserProfileDataSchema = z.infer<typeof createUserProfileDataSchema>;

export const createUserProfileDataSchema = z.object({
  apiKey: apiKeySchema,
  username: usernameSchema,
});
