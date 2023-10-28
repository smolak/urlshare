import { TRPCError } from "@trpc/server";

import { protectedProcedure } from "../../../trpc/server";
import { deleteCategorySchema } from "./delete-category.schema";

export const deleteCategory = protectedProcedure
  .input(deleteCategorySchema)
  .mutation(async ({ input: { id }, ctx: { logger, requestId, session, prisma } }) => {
    const path = "category.deleteCategory";
    const userId = session.user.id;

    const maybeCategory = await prisma.category.findUnique({
      where: {
        id,
        userId,
      },
    });

    if (!maybeCategory) {
      logger.error({ requestId, path }, `Category (${id}) doesn't exist.`);

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Category doesn't exists.`,
      });
    }

    await prisma.category.delete({
      where: {
        id,
      },
    });

    logger.info({ requestId, path, id }, `Category (${id})} deleted.`);
  });
