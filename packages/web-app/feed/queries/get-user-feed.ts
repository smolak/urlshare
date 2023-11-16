import { Category, Feed, Prisma, prisma, Url, User, UserProfileData, UserUrl } from "@urlshare/db/prisma/client";
import { CompressedMetadata } from "@urlshare/metadata/compression";

import { FeedSourceValue } from "../ui/user-feed-source-selector/feed-source";

export type RawFeedEntry = {
  category_names: string | null;
  feed_id: Feed["id"];
  feed_createdAt: Feed["createdAt"];
  feed_liked: Feed["liked"];
  user_username: UserProfileData["username"];
  user_image: User["image"];
  url_url: Url["url"];
  url_likes: UserUrl["likes"];
  url_metadata: CompressedMetadata;
  userUrl_id: UserUrl["id"];
};

type GetUserFeedQueryOptions = {
  userId: User["id"];
  limit: number;
  cursor?: Feed["createdAt"];
  feedSource?: FeedSourceValue;
  categoryIds: Category["id"][];
};

const baseQuery = Prisma.sql`
      SELECT UserProfileData.username AS user_username, UserProfileData.image AS user_image,
        Feed.id AS feed_id, Feed.createdAt AS feed_createdAt, Feed.liked as feed_liked,
        Url.url AS url_url, Url.metadata AS url_metadata,
        UserUrl.id AS userUrl_id, UserUrl.likes as url_likes,
        GROUP_CONCAT(DISTINCT(Category.name)) AS category_names
      FROM Feed
      LEFT JOIN UserUrl ON Feed.userUrlId = UserUrl.id
      LEFT JOIN Url ON UserUrl.urlId = Url.id
      LEFT JOIN UserUrlCategory ON UserUrl.id = UserUrlCategory.userUrlId
      LEFT JOIN Category ON UserUrlCategory.categoryId = Category.id
      LEFT JOIN UserProfileData ON UserUrl.userId = UserProfileData.userId`;

const categoriesJoinQuery = Prisma.sql`LEFT JOIN UserUrlCategory UserUrlCategoryFilter ON UserUrl.id = UserUrlCategoryFilter.userUrlId`;
const createCategoriesHavingQuery = (categoryIds: Category["id"][]) => {
  return Prisma.sql`HAVING COUNT(DISTINCT CASE WHEN Category.id IN (${Prisma.join(
    categoryIds
  )}) THEN Category.id END) >= ${categoryIds.length}`;
};
const createCategoriesWhereQuery = (categoryIds: Category["id"][]) => {
  return Prisma.sql`AND UserUrlCategoryFilter.categoryId IN (${Prisma.join(categoryIds)})`;
};

export const getUserFeedQuery = ({ userId, limit, cursor, feedSource, categoryIds }: GetUserFeedQueryOptions) => {
  const includeCategories = categoryIds.length > 0;

  if (cursor) {
    if (feedSource === "author") {
      return prisma.$queryRaw<ReadonlyArray<RawFeedEntry>>`
          ${baseQuery}
          ${includeCategories ? categoriesJoinQuery : Prisma.empty}
          WHERE Feed.userId = ${userId}
            AND UserProfileData.userId = ${userId}
            AND Feed.createdAt < ${cursor}
            ${includeCategories ? createCategoriesWhereQuery(categoryIds) : Prisma.empty}
          GROUP BY Feed.id
          ${includeCategories ? createCategoriesHavingQuery(categoryIds) : Prisma.empty}
          ORDER BY Feed.createdAt DESC
          LIMIT 0, ${limit}
      `;
    }

    return prisma.$queryRaw<ReadonlyArray<RawFeedEntry>>`
          ${baseQuery}
          ${includeCategories ? categoriesJoinQuery : Prisma.empty}
          WHERE Feed.userId = ${userId}
            AND Feed.createdAt < ${cursor}
            ${includeCategories ? createCategoriesWhereQuery(categoryIds) : Prisma.empty}
          GROUP BY Feed.id
          ${includeCategories ? createCategoriesHavingQuery(categoryIds) : Prisma.empty}
          ORDER BY Feed.createdAt DESC
          LIMIT 0, ${limit}
      `;
  }

  if (feedSource === "author") {
    return prisma.$queryRaw<ReadonlyArray<RawFeedEntry>>`
          ${baseQuery}
          ${includeCategories ? categoriesJoinQuery : Prisma.empty}
          WHERE Feed.userId = ${userId}
            AND UserProfileData.userId = ${userId}
            ${includeCategories ? createCategoriesWhereQuery(categoryIds) : Prisma.empty}
          GROUP BY Feed.id
          ${includeCategories ? createCategoriesHavingQuery(categoryIds) : Prisma.empty}
          ORDER BY Feed.createdAt DESC
          LIMIT 0, ${limit}
      `;
  }

  return prisma.$queryRaw<ReadonlyArray<RawFeedEntry>>`
          ${baseQuery}
          ${includeCategories ? categoriesJoinQuery : Prisma.empty}
          WHERE Feed.userId = ${userId}
            ${includeCategories ? createCategoriesWhereQuery(categoryIds) : Prisma.empty}
          GROUP BY Feed.id
          ${includeCategories ? createCategoriesHavingQuery(categoryIds) : Prisma.empty}
          ORDER BY Feed.createdAt DESC
          LIMIT 0, ${limit}
      `;
};
