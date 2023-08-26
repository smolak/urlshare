import { Feed, UserUrl } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { protectedProcedure } from "../../../trpc/server";
import { toggleLikeUrlSchema } from "./toggle-like-url.schema";

type ToggleLikeUrlResult = {
  status: "liked" | "unliked";
  likes: UserUrl["likes"];
  feedId: Feed["id"];
};

type UrlNotFound = {
  status: "notFound";
  feedId: Feed["id"];
};

export const toggleLikeUrl = protectedProcedure
  .input(toggleLikeUrlSchema)
  .mutation<UrlNotFound | ToggleLikeUrlResult>(
    async ({ input: { feedId }, ctx: { logger, requestId, session, prisma } }) => {
      const path = "likeUrl.toggleLikeUrl";
      const userId = session.user.id;

      logger.info({ requestId, path, userId, feedId }, "Toggle liking the URL.");

      try {
        const maybeFeed = await prisma.feed.findUnique({
          where: {
            id: feedId,
          },
          select: {
            liked: true,
            userId: true,
            userUrlId: true,
            userUrl: {
              select: {
                userId: true,
              },
            },
          },
        });

        const feedNotFound = maybeFeed === null;

        if (feedNotFound) {
          return { status: "notFound", feedId };
        }

        const idOfProfileOwningTheUrl = maybeFeed.userUrl.userId;

        if (!maybeFeed.liked) {
          // Liking
          const likes = await prisma.$transaction(async (prisma) => {
            const [{ likes }] = await Promise.all([
              // Increment likes on the URL
              prisma.userUrl.update({
                data: {
                  likes: {
                    increment: 1,
                  },
                },
                where: {
                  id: maybeFeed.userUrlId,
                },
                select: {
                  likes: true,
                },
              }),

              // Increment total likes count for the URL owner
              prisma.userProfileData.update({
                data: {
                  liked: {
                    increment: 1,
                  },
                },
                where: {
                  userId: idOfProfileOwningTheUrl,
                },
              }),

              // Increment my likes count, of the things that I liked
              prisma.userProfileData.update({
                data: {
                  likes: {
                    increment: 1,
                  },
                },
                where: {
                  userId,
                },
              }),

              // Like the URL
              prisma.feed.update({
                data: {
                  liked: true,
                },
                where: {
                  id: feedId,
                },
              }),
            ]);

            return likes;
          });

          logger.info({ requestId, path, userId, feedId }, "Liked the URL.");

          return { status: "liked", feedId, likes };
        }

        // Unliking
        const likes = await prisma.$transaction(async (prisma) => {
          const [{ likes }] = await Promise.all([
            // Decrement likes on the URL
            prisma.userUrl.update({
              data: {
                likes: {
                  decrement: 1,
                },
              },
              where: {
                id: maybeFeed.userUrlId,
              },
              select: {
                likes: true,
              },
            }),

            // Decrement total liked count for the URL owner
            prisma.userProfileData.update({
              data: {
                liked: {
                  decrement: 1,
                },
              },
              where: {
                userId: idOfProfileOwningTheUrl,
              },
            }),

            // Decrement my likes count, of the things that I liked
            prisma.userProfileData.update({
              data: {
                likes: {
                  decrement: 1,
                },
              },
              where: {
                userId,
              },
            }),

            // Unlike the URL
            prisma.feed.update({
              data: {
                liked: false,
              },
              where: {
                id: feedId,
              },
            }),
          ]);

          return likes;
        });

        logger.info({ requestId, path, userId, feedId }, "Unliked the URL.");

        return { status: "unliked", feedId, likes };
      } catch (error) {
        logger.error({ requestId, path, userId, feedId, error }, "Failed to (un)like a URL.");

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to (un)the URL. Try again.",
          cause: error,
        });
      }
    }
  );
