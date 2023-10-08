import z from "zod";

import { apiKeySchema, usernameSchema } from "../../schemas/user-profile-data.schema";

export type CreateUserProfileDataSchema = z.infer<typeof createUserProfileDataSchema>;

export const NOT_ALLOWED_NORMALIZED_USERNAMES = ["admin", "urlshare", "contact", "accounting", "security"];

const restrictedUsernameSchema = usernameSchema.refine(
  (username) => {
    return !NOT_ALLOWED_NORMALIZED_USERNAMES.includes(username.toLowerCase());
  },
  {
    message: "Username not allowed.",
  }
);

export const createUserProfileDataSchema = z.object({
  apiKey: apiKeySchema,
  username: restrictedUsernameSchema,
});
