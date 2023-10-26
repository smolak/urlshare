import { Feed, Prisma, prisma, Url, User, UserProfileData, UserUrl } from "@urlshare/db/prisma/client";
import { CompressedMetadata } from "@urlshare/metadata/compression";

import { FeedSourceValue } from "../ui/user-feed-source-selector/feed-source";

export type RawFeedEntry = {
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
};

const baseQuery = Prisma.sql`
      SELECT UserProfileData.username AS user_username, UserProfileData.image AS user_image,
        Feed.id AS feed_id, Feed.createdAt AS feed_createdAt, Feed.liked as feed_liked,
        Url.url AS url_url, Url.metadata AS url_metadata,
        UserUrl.id AS userUrl_id, UserUrl.likes as url_likes
      FROM Feed
      LEFT JOIN UserUrl ON Feed.userUrlId = UserUrl.id
      LEFT JOIN Url ON UserUrl.urlId = Url.id
      LEFT JOIN UserProfileData ON UserUrl.userId = UserProfileData.userId`;

export const getUserFeedQuery = ({ userId, limit, cursor, feedSource }: GetUserFeedQueryOptions) => {
  if (cursor) {
    if (feedSource === "author") {
      return prisma.$queryRaw<ReadonlyArray<RawFeedEntry>>`
          ${baseQuery}
          WHERE Feed.userId = ${userId}
            AND UserProfileData.userId = ${userId}
            AND Feed.createdAt < ${cursor}
          ORDER BY Feed.createdAt DESC
          LIMIT 0, ${limit}
      `;
    }

    return prisma.$queryRaw<ReadonlyArray<RawFeedEntry>>`
          ${baseQuery}
          WHERE Feed.userId = ${userId}
            AND Feed.createdAt < ${cursor}
          ORDER BY Feed.createdAt DESC
          LIMIT 0, ${limit}
      `;
  }

  if (feedSource === "author") {
    return prisma.$queryRaw<ReadonlyArray<RawFeedEntry>>`
          ${baseQuery}
          WHERE Feed.userId = ${userId}
            AND UserProfileData.userId = ${userId}
          ORDER BY Feed.createdAt DESC
          LIMIT 0, ${limit}
      `;
  }

  return prisma.$queryRaw<ReadonlyArray<RawFeedEntry>>`
          ${baseQuery}
          WHERE Feed.userId = ${userId}
          ORDER BY Feed.createdAt DESC
          LIMIT 0, ${limit}
      `;
};
