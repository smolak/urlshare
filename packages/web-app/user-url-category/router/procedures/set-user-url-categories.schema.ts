import z from "zod";

import { CategoryId, categoryIdSchema } from "../../../category/schemas/category-id.schema";
import { userUrlIdSchema } from "../../../user-url/schemas/user-url-id.schema";

const notDistinct = (value: CategoryId, index: number, self: ReadonlyArray<CategoryId>) =>
  self.indexOf(value) !== index;

export const setUserUrlCategoriesSchema = z.object({
  categoryIds: z
    .array(categoryIdSchema)
    .min(1)
    .refine(
      (val) => val.length === [...new Set(val)].length,
      (val) => {
        const duplicates = val.filter(notDistinct);

        return {
          message: `Categories must be unique, can't contain duplicates. Duplicates found: ${duplicates.join(", ")}.`,
        };
      }
    ),
  userUrlId: userUrlIdSchema,
});
