import { TRPCError } from "@trpc/server";

import { protectedProcedure } from "../../../trpc/server";
import { updateCategorySchema } from "./update-category.schema";

export const updateCategory = protectedProcedure
  .input(updateCategorySchema)
  .mutation(async ({ input: { id, name }, ctx: { logger, requestId, session, prisma } }) => {
    const path = "category.updateCategory";
    const userId = session.user.id;

    const maybeCategory = await prisma.category.findUnique({
      where: {
        id,
        userId,
      },
    });

    if (!maybeCategory) {
      logger.error({ requestId, path }, `Category (${name}) doesn't exist.`);

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Category (${name}) doesn't exists.`,
      });
    }

    const maybeExists = await prisma.category.findFirst({
      where: {
        userId,
        name,
        id: {
          not: id,
        },
      },
    });

    if (maybeExists) {
      logger.error({ requestId, path }, `Category (${name}) exists.`);

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Category name exists. Use different category name.`,
      });
    }

    const updatedCategory = await prisma.category.update({
      data: {
        name,
      },
      where: {
        id,
      },
    });

    logger.info({ requestId, path, name }, "Category updated.");

    return updatedCategory;
  });
