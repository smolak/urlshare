import { DEFAULT_ID_SIZE } from "@urlshare/shared/utils/generate-id";
import z from "zod";

import { USER_ID_PREFIX } from "../utils/generate-user-id";

export type UserId = z.infer<typeof userIdSchema>;

export const userIdSchema = z
  .string()
  .trim()
  .startsWith(USER_ID_PREFIX, { message: "ID passed is not a user ID." })
  .length(USER_ID_PREFIX.length + DEFAULT_ID_SIZE, { message: "Wrong ID size." });
