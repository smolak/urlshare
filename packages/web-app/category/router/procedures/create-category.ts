import { TRPCError } from "@trpc/server";
import { Category } from "@urlshare/db/prisma/client";
import { ID_PLACEHOLDER_REPLACED_BY_ID_GENERATOR } from "@urlshare/db/prisma/middlewares/generate-model-id";

import { protectedProcedure } from "../../../trpc/server";
import { createCategorySchema } from "./create-category.schema";

type CreatedCategoryResult = {
  categoryId: Category["id"];
};

type CreateCategoryResult = CreatedCategoryResult;

export const createCategory = protectedProcedure
  .input(createCategorySchema)
  .mutation<CreateCategoryResult>(async ({ input: { name }, ctx: { logger, requestId, session, prisma } }) => {
    const path = "category.createCategory";
    const userId = session.user.id;

    const maybeCategory = await prisma.category.findFirst({
      where: {
        userId,
        name,
      },
    });

    if (maybeCategory) {
      logger.error({ requestId, path }, `Category (${name}) exists.`);

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Category name exists. Use different category name.`,
      });
    }

    const createdCategory = await prisma.category.create({
      data: {
        id: ID_PLACEHOLDER_REPLACED_BY_ID_GENERATOR,
        name,
        userId,
      },
    });

    logger.info({ requestId, path, name }, "Category created.");

    return { categoryId: createdCategory.id };
  });
