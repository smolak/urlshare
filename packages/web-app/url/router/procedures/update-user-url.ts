import { TRPCError } from "@trpc/server";

import { CategoryId } from "../../../category/schemas/category-id.schema";
import { protectedProcedure } from "../../../trpc/server";
import { updateUserUrlSchema } from "./update-user-url.schema";
import { selectCategoryIdsForUpdate } from "./utils/select-category-ids-for-update";

type UpdateUrlResult = boolean;

export const updateUserUrl = protectedProcedure
  .input(updateUserUrlSchema)
  .mutation<UpdateUrlResult>(
    async ({ input: { userUrlId, categoryIds }, ctx: { requestId, logger, session, prisma } }) => {
      const path = `url.${updateUserUrl.name}`;
      const userId = session.user.id;

      const userUrl = await prisma.userUrl.findFirst({
        where: {
          id: userUrlId,
          userId,
        },
        select: {
          userUrlCategory: true,
        },
      });

      if (!userUrl) {
        logger.error({ requestId, path, userUrlId, userId }, "UserUrl not found.");

        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Url not found.",
        });
      }

      const userCategoryIds: CategoryId[] = await prisma.category
        .findMany({
          where: {
            userId,
          },
          select: {
            id: true,
          },
        })
        .then((categories) => categories.map(({ id }) => id));

      categoryIds.forEach((categoryId) => {
        if (userCategoryIds.indexOf(categoryId) === -1) {
          logger.error({ requestId, path, userUrlId, userId, categoryId }, "Trying to assign non-existing category.");

          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Trying to assign non-existing category.",
          });
        }
      });

      const currentCategoryIds = userUrl.userUrlCategory.map(({ categoryId }) => categoryId);
      const result = selectCategoryIdsForUpdate({ currentCategoryIds, newCategoryIds: categoryIds });

      try {
        await prisma.$transaction(async (tx) => {
          if (result.increment.length > 0) {
            await tx.userUrlCategory.createMany({
              data: result.increment.map((categoryId) => ({
                categoryId,
                userUrlId,
              })),
            });

            await tx.category.updateMany({
              data: {
                urlsCount: {
                  increment: 1,
                },
              },
              where: {
                id: {
                  in: result.increment,
                },
              },
            });
          }

          if (result.decrement.length > 0) {
            await tx.userUrlCategory.deleteMany({
              where: {
                categoryId: {
                  in: result.decrement,
                },
              },
            });

            await tx.category.updateMany({
              data: {
                urlsCount: {
                  decrement: 1,
                },
              },
              where: {
                id: {
                  in: result.decrement,
                },
              },
            });
          }
        });

        logger.info({ requestId, path, userUrlId, userId, categoryIds }, "Url updated.");

        return true;
      } catch (error) {
        logger.error({ requestId, path, error }, "Failed to update Url.");

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update Url, try again.",
          cause: error,
        });
      }
    }
  );
