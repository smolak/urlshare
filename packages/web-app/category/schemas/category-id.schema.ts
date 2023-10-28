import { DEFAULT_ID_SIZE } from "@urlshare/shared/utils/generate-id";
import z from "zod";

import { CATEGORY_ID_PREFIX } from "../utils/generate-category-id";

export const categoryIdSchema = z
  .string()
  .trim()
  .startsWith(CATEGORY_ID_PREFIX, { message: "ID passed is not a category ID." })
  .length(CATEGORY_ID_PREFIX.length + DEFAULT_ID_SIZE, { message: "Wrong ID size." });
