import { protectedProcedure } from "../../../trpc/server";
import { CategoryVM } from "../../types/category.vm";

type GetMyCategoriesResult = ReadonlyArray<CategoryVM>;

export const getMyCategories = protectedProcedure.query<GetMyCategoriesResult>(
  async ({ ctx: { logger, requestId, prisma, session } }) => {
    const path = "category.getMyCategories";
    const userId = session.user.id;

    logger.info({ requestId, path, userId }, "Fetching my categories.");

    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        urlsCount: true,
      },
      where: {
        userId,
      },
      orderBy: {
        name: "asc",
      },
    });

    logger.info({ requestId, path, userId }, "My categories fetched.");

    return categories;
  }
);
