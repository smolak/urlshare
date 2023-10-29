import { protectedProcedure } from "../../../trpc/server";

export const getMyCategories = protectedProcedure.query(async ({ ctx: { logger, requestId, prisma, session } }) => {
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
});
