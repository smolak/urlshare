import { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { protectedProcedure } from "../../../trpc/server";
import { toggleFollowUserSchema } from "./toggle-follow-user.schema";

type ToggleFollowUserResult = {
  status: "following" | "unfollowed";
  userId: User["id"];
};

export const toggleFollowUser = protectedProcedure
  .input(toggleFollowUserSchema)
  .mutation<ToggleFollowUserResult>(
    async ({ input: { userId: followingId }, ctx: { logger, requestId, session, prisma } }) => {
      const path = "followUser.toggleFollowUser";
      const followerId = session.user.id;

      logger.info({ requestId, path, followerId, followingId }, "Toggle following user initiated.");

      try {
        const maybeFollowing = await prisma.follows.findUnique({
          where: {
            followerId_followingId: {
              followingId,
              followerId,
            },
          },
        });
        const notFollowing = maybeFollowing === null;

        if (notFollowing) {
          await prisma.$transaction(async (prisma) => {
            await prisma.follows.create({
              data: {
                followingId,
                followerId,
              },
            });

            await prisma.userProfileData.update({
              data: {
                following: {
                  increment: 1,
                },
              },
              where: {
                userId: followerId,
              },
            });

            await prisma.userProfileData.update({
              data: {
                followers: {
                  increment: 1,
                },
              },
              where: {
                userId: followingId,
              },
            });
          });

          logger.info({ requestId, path, followerId, followingId }, "Followed user.");

          return { status: "following", userId: followingId };
        } else {
          await prisma.$transaction(async (prisma) => {
            await prisma.follows.delete({
              where: {
                followerId_followingId: {
                  followingId,
                  followerId,
                },
              },
            });

            await prisma.userProfileData.update({
              data: {
                following: {
                  decrement: 1,
                },
              },
              where: {
                userId: followerId,
              },
            });

            await prisma.userProfileData.update({
              data: {
                followers: {
                  decrement: 1,
                },
              },
              where: {
                userId: followingId,
              },
            });
          });

          logger.info({ requestId, path, followerId, followingId }, "Unfollowed user.");

          return { status: "unfollowed", userId: followingId };
        }
      } catch (error) {
        logger.error({ requestId, path, followerId, followingId, error }, "Failed to (un)follow a user.");

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to (un)follow this user. Try again.",
          cause: error,
        });
      }
    }
  );
