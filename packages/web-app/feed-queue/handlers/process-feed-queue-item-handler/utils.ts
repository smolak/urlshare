import { FeedQueue, FeedQueueStatus, Prisma, PrismaClient, User, UserUrl } from "@urlshare/db/prisma/client";
import { ID_PLACEHOLDER_REPLACED_BY_ID_GENERATOR } from "@urlshare/db/prisma/middlewares/generate-model-id";

export enum Result {
  TIME_IS_UP,
  NO_MORE_FOLLOWERS,
  CONTINUE,
}

export type GetFollowersReturnType = ReadonlyArray<{ id: bigint; followerId: string }>;

type GetFollowers = (
  prisma: Prisma.TransactionClient,
  data: { followingId: User["id"]; lastAddedFollowId: bigint; take: number }
) => Prisma.PrismaPromise<GetFollowersReturnType>;

export const getFollowers: GetFollowers = (prisma, { followingId, lastAddedFollowId, take }) => {
  return prisma.follows.findMany({
    select: {
      id: true,
      followerId: true,
    },
    where: {
      followingId,
      id: {
        gt: lastAddedFollowId,
      },
    },
    take,
    orderBy: {
      createdAt: "asc",
    },
  });
};

export const createFollowersCacheKey = (userId: User["id"], lastAddedFollowId: bigint) => {
  return "followers" + userId + lastAddedFollowId.toString();
};

export const getFeedQueueEntries = (prisma: PrismaClient, status: FeedQueueStatus, take: number, page: number) => {
  return prisma.feedQueue.findMany({
    where: {
      status,
    },
    select: {
      id: true,
      userId: true,
      userUrlId: true,
      lastAddedFollowId: true,
      createdAt: true,
    },
    take,
    skip: page * take,
    orderBy: {
      createdAt: "asc",
    },
  });
};

export const getLastAddedFollowId = (followers: GetFollowersReturnType) => followers[followers.length - 1].id;

type HandleNoMoreFollowersCase = (
  prisma: Prisma.TransactionClient,
  data: {
    feedQueueId: FeedQueue["id"];
    lastAddedFollowId: bigint;
  }
) => Promise<Result.NO_MORE_FOLLOWERS>;

export const handleNoMoreFollowersCase: HandleNoMoreFollowersCase = async (
  prisma,
  { feedQueueId, lastAddedFollowId }
) => {
  await prisma.feedQueue.update({
    where: {
      id: feedQueueId,
    },
    data: {
      status: FeedQueueStatus.SUCCESS,
      lastAddedFollowId,
    },
  });

  return Result.NO_MORE_FOLLOWERS;
};

type HandleNoMoreTimeCase = (
  prisma: Prisma.TransactionClient,
  data: {
    feedQueueId: FeedQueue["id"];
    feedsPerIterationLimit: number;
    numberOfFollowers: number;
    lastAddedFollowId: bigint;
  }
) => Promise<Result.TIME_IS_UP>;

export const handleNoMoreTimeCase: HandleNoMoreTimeCase = async (
  prisma,
  { feedQueueId, feedsPerIterationLimit, numberOfFollowers, lastAddedFollowId }
) => {
  // Max number of followers to fetch upon each iteration is `feedsPerIterationLimit`.
  // If the difference in the length is greater than 0, then the last batch of followers
  // was already handled and there are no more followers to have their feeds populated.
  //
  // The 0 difference can mean two things actually:
  // (1) this is not the final batch
  // (2) this is the final batch, as the overall number of followers
  //     is a multiple of `feedsPerIterationLimit` - but that is a rare case,
  //     which is handled next to "NO_MORE_FOLLOWERS" case.
  const status = feedsPerIterationLimit - numberOfFollowers > 0 ? FeedQueueStatus.SUCCESS : FeedQueueStatus.ONGOING;

  await prisma.feedQueue.update({
    where: {
      id: feedQueueId,
    },
    data: {
      status,
      lastAddedFollowId,
    },
  });

  return Result.TIME_IS_UP;
};

type AddFeeds = (
  prisma: Prisma.TransactionClient,
  data: { followers: GetFollowersReturnType; userUrlId: UserUrl["id"]; createdAt: UserUrl["createdAt"] }
) => Prisma.PrismaPromise<Prisma.BatchPayload>;

export const addFeeds: AddFeeds = (prisma, { followers, userUrlId, createdAt }) => {
  return prisma.feed.createMany({
    data: followers.map(({ followerId }) => ({
      id: ID_PLACEHOLDER_REPLACED_BY_ID_GENERATOR,
      userId: followerId,
      userUrlId,
      createdAt,
      updatedAt: createdAt,
    })),
  });
};
