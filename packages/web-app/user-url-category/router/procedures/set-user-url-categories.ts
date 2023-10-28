import { TRPCError } from "@trpc/server";
import { Category } from "@urlshare/db/prisma/client";

import { protectedProcedure } from "../../../trpc/server";
import { setUserUrlCategoriesSchema } from "./set-user-url-categories.schema";

type SetUserUrlCategoriesResult = ReadonlyArray<Category["id"]>;

export const setUserUrlCategories = protectedProcedure
  .input(setUserUrlCategoriesSchema)
  .mutation<SetUserUrlCategoriesResult>(
    async ({ input: { categoryIds, userUrlId }, ctx: { logger, requestId, session, prisma } }) => {
      const path = "userUrlCategory.setCategoriesForUserUrl";
      const userId = session.user.id;

      const maybeUserUrl = await prisma.userUrl.findFirst({
        where: {
          id: userUrlId,
          userId,
        },
      });

      if (!maybeUserUrl) {
        logger.error({ requestId, path, userId, userUrlId }, "User URL doesn't exist.");

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User URL doesn't exist.",
        });
      }

      await prisma.userUrlCategory.createMany({
        data: categoryIds.map((categoryId) => ({
          categoryId,
          userUrlId,
        })),
      });

      logger.info({ requestId, path, userId, userUrlId }, "Categories set on user URL.");

      return categoryIds;
    }
  );
