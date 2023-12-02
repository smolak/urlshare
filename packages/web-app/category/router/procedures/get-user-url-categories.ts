import { UserUrlCategory } from "@urlshare/db/prisma/client";

import { publicProcedure } from "../../../trpc/server";
import { getUserUrlCategoriesSchema } from "./get-user-url-categories.schema";

export type GetUserUrlCategoriesReturnType = Pick<UserUrlCategory, "categoryId">[];

export const getUserUrlCategories = publicProcedure
  .input(getUserUrlCategoriesSchema)
  .query<GetUserUrlCategoriesReturnType>(async ({ ctx: { logger, requestId, prisma }, input: { userUrlId } }) => {
    const path = `category.${getUserUrlCategories.name}`;

    logger.info({ requestId, path, userUrlId }, "Fetching user url's categories.");

    const userUrlCategories = await prisma.userUrlCategory.findMany({
      select: {
        categoryId: true,
      },
      where: {
        userUrlId,
      },
    });

    logger.info({ requestId, path, userUrlId }, "User url's categories fetched.");

    return userUrlCategories;
  });
