import { TRPCError } from "@trpc/server";

import { protectedProcedure } from "../../../trpc/server";
import { isFollowingUserSchema } from "./is-following-user.schema";

export const isFollowingUser = protectedProcedure
  .input(isFollowingUserSchema)
  .query(async ({ input: { userId: followingId }, ctx: { logger, requestId, session, prisma } }) => {
    const path = "followUser.isFollowingUser";
    const followerId = session.user.id;

    logger.info({ requestId, path, followerId, followingId }, "Check if is following a user.");

    try {
      const maybeFollowing = await prisma.follows.findUnique({
        where: {
          followerId_followingId: {
            followingId,
            followerId,
          },
        },
      });
      const isFollowing = maybeFollowing !== null;

      logger.info({ requestId, path, followerId, followingId }, "Following a user checked.");

      return isFollowing;
    } catch (error) {
      logger.error({ requestId, path, followerId, followingId, error }, "Failed to check follow status.");

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to check follow status. Try again.",
        cause: error,
      });
    }
  });
