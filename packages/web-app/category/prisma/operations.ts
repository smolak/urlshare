import { User, UserUrl } from "@prisma/client";
import { Category, Prisma } from "@urlshare/db/prisma/client";
import { TransactionPrismaClient } from "@urlshare/db/prisma/types";

type CategoryIds = Category["id"][];

export const createFindManyCategoriesArgs = (userId: User["id"]): Prisma.CategoryFindManyArgs => ({
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

export const incrementUrlsCount = async (
  tx: TransactionPrismaClient,
  { categoryIds }: { categoryIds: CategoryIds }
) => {
  await tx.category.updateMany({
    data: {
      urlsCount: {
        increment: 1,
      },
    },
    where: {
      id: {
        in: categoryIds,
      },
    },
  });
};

export const assignCategoriesToUserUrl = async (
  tx: TransactionPrismaClient,
  { categoryIds, userUrlId }: { categoryIds: CategoryIds; userUrlId: UserUrl["id"] }
) => {
  await tx.userUrlCategory.createMany({
    data: categoryIds.map((categoryId) => {
      return {
        categoryId,
        userUrlId,
      };
    }),
  });
};
