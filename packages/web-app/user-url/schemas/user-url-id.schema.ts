import { DEFAULT_ID_SIZE } from "@urlshare/shared/utils/generate-id";
import z from "zod";

import { USER_URL_ID_PREFIX } from "../utils/generate-user-url-id";

export const userUrlIdSchema = z
  .string()
  .trim()
  .startsWith(USER_URL_ID_PREFIX, { message: "ID passed is not a userUrl ID." })
  .length(USER_URL_ID_PREFIX.length + DEFAULT_ID_SIZE, { message: "Wrong ID size." });
