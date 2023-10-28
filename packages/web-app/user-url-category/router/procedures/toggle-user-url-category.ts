import { TRPCError } from "@trpc/server";
import { Category } from "@urlshare/db/prisma/client";

import { protectedProcedure } from "../../../trpc/server";
import { toggleUserUrlCategorySchema } from "./toggle-user-url-category.schema";

type ToggleUserUrlCategoryResult = {
  categoryId: Category["id"];
  urlsCount: Category["urlsCount"];
  selected: boolean;
};

export const toggleUserUrlCategory = protectedProcedure
  .input(toggleUserUrlCategorySchema)
  .mutation<ToggleUserUrlCategoryResult>(
    async ({ input: { categoryId, userUrlId }, ctx: { logger, requestId, session, prisma } }) => {
      const path = "userUrlCategory.toggleUserUrlCategory";
      const userId = session.user.id;

      logger.info({ requestId, path, userId, categoryId, userUrlId }, "Toggle adding category to URL.");

      const results = await Promise.all([
        prisma.userUrl.findUnique({
          where: {
            id: userUrlId,
            userId,
          },
        }),
        prisma.category.findUnique({
          where: {
            id: categoryId,
            userId,
          },
        }),
      ]);

      const userUrlAndCategoryArePresent = results.every((result) => Boolean(result));

      if (!userUrlAndCategoryArePresent) {
        const keys = ["userUrl", "category"];

        const messages = results.map((result, index) => {
          if (result === null) {
            return keys[index] + " not found";
          }
        });

        logger.error(
          { requestId, path, userId, categoryId, userUrlId },
          `Toggle adding category to URL failed. Missing data: ${messages.join(", ")}.`
        );

        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Missing data: ${messages.join(", ")}.`,
        });
      }

      const userUrlCategory = await prisma.userUrlCategory.findUnique({
        where: {
          userUrlId_categoryId: {
            userUrlId,
            categoryId,
          },
        },
      });

      if (!userUrlCategory) {
        const urlsCount = await prisma.$transaction(async (prisma) => {
          const [{ urlsCount }] = await Promise.all([
            // Increment urls count on category
            prisma.category.update({
              data: {
                urlsCount: {
                  increment: 1,
                },
              },
              where: {
                id: categoryId,
              },
              select: {
                urlsCount: true,
              },
            }),

            // Add category to URL
            prisma.userUrlCategory.create({
              data: {
                categoryId,
                userUrlId,
              },
            }),
          ]);

          return urlsCount;
        });

        logger.info({ requestId, path, userId, categoryId, userUrlId }, "Category added to URL.");

        return {
          categoryId,
          urlsCount,
          selected: true,
        };
      }

      const urlsCount = await prisma.$transaction(async (prisma) => {
        const [{ urlsCount }] = await Promise.all([
          // Decrement urls count on category
          prisma.category.update({
            data: {
              urlsCount: {
                decrement: 1,
              },
            },
            where: {
              id: categoryId,
            },
            select: {
              urlsCount: true,
            },
          }),

          // Remove category from URL
          prisma.userUrlCategory.delete({
            where: {
              userUrlId_categoryId: {
                userUrlId,
                categoryId,
              },
            },
          }),
        ]);

        return urlsCount;
      });

      logger.info({ requestId, path, userId, categoryId, userUrlId }, "Category removed from URL.");

      return {
        categoryId,
        urlsCount,
        selected: false,
      };
    }
  );
