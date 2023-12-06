import { publicProcedure } from "../../../trpc/server";
import { createFindManyCategoriesArgs } from "../../prisma/operations";
import { getUserCategoriesSchema } from "./get-user-categories.schema";

export const getUserCategories = publicProcedure
  .input(getUserCategoriesSchema)
  .query(async ({ ctx: { logger, requestId, prisma }, input: { userId } }) => {
    const path = "category.getUserCategories";

    logger.info({ requestId, path, userId }, "Fetching user's categories.");

    const categories = await prisma.category.findMany(createFindManyCategoriesArgs(userId));

    logger.info({ requestId, path, userId }, "User's categories fetched.");

    return categories;
  });
