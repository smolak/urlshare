import z from "zod";

import { apiKeySchema } from "../../schemas/user-profile-data.schema";

export type UpdateUserProfileDataSchema = z.infer<typeof updateUserProfileDataSchema>;

export const updateUserProfileDataSchema = z.object({
  apiKey: apiKeySchema,
});
