import { TRPCError } from "@trpc/server";
import { sha1 } from "@urlshare/crypto/sha1";
import { Url, UrlQueue } from "@urlshare/db/prisma/client";
import { ID_PLACEHOLDER_REPLACED_BY_ID_GENERATOR } from "@urlshare/db/prisma/middlewares/generate-model-id";

import { assignCategoriesToUserUrl, incrementUrlsCount } from "../../../category/prisma/operations";
import { protectedProcedure } from "../../../trpc/server";
import { createUrlSchema } from "./create-url.schema";

type ExistingUrlResult = {
  url: Url["url"];
};
type CreatedUrlQueueItemResult = {
  url: Url["url"];
  urlQueueId: UrlQueue["id"];
};

type CreateUrlResult = ExistingUrlResult | CreatedUrlQueueItemResult;

export const createUrl = protectedProcedure
  .input(createUrlSchema)
  .mutation<CreateUrlResult>(async ({ input: { url, categoryIds }, ctx: { logger, requestId, session, prisma } }) => {
    const path = "url.createUrl";
    const userId = session.user.id;
    const urlHash = sha1(url);

    if (categoryIds.length > 0) {
      // Check the existence of the categories
      const myCategories = await prisma.category.findMany({
        where: {
          userId,
        },
        select: {
          id: true,
        },
      });

      categoryIds.forEach((categoryId) => {
        const categoryNotFound = myCategories.find(({ id }) => id === categoryId) === undefined;

        if (categoryNotFound) {
          logger.error({ requestId, path, userId }, "User used not owned categories.");

          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You used one or more categories you don't have.",
          });
        }
      });
    }

    // Check if there's a record for this hash
    const maybeUrl = await prisma.url.findUnique({
      where: {
        urlHash,
      },
    });

    try {
      // If there's one, attempt creating a userUrl entry
      if (maybeUrl) {
        // TODO: Perhaps IDEA#4

        await prisma.$transaction(async (tx) => {
          const userUrl = await tx.userUrl.create({
            data: {
              id: ID_PLACEHOLDER_REPLACED_BY_ID_GENERATOR,
              userId,
              urlId: maybeUrl.id,
            },
          });

          if (categoryIds.length > 0) {
            await assignCategoriesToUserUrl(tx, { categoryIds, userUrlId: userUrl.id });
            await incrementUrlsCount(tx, { categoryIds });
          }

          await tx.userProfileData.update({
            data: {
              urlsCount: {
                increment: 1,
              },
            },
            where: {
              userId,
            },
          });

          await tx.feedQueue.create({
            data: {
              id: ID_PLACEHOLDER_REPLACED_BY_ID_GENERATOR,
              userId,
              userUrlId: userUrl.id,
            },
          });
        });

        logger.info({ requestId, path, url }, "URL exists, added to user.");

        return { url: maybeUrl.url };
      }

      // If there isn't one
      // TODO: IDEA#5
      const urlInQueue = await prisma.urlQueue.create({
        data: {
          id: ID_PLACEHOLDER_REPLACED_BY_ID_GENERATOR,
          rawUrl: url,
          rawUrlHash: urlHash,
          userId,
          categoryIds,
        },
      });

      logger.info({ requestId, path, url }, "URL added to queue.");

      return { urlQueueId: urlInQueue.id, url };
    } catch (error) {
      logger.error({ requestId, path, error }, "Failed to store the URL.");

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to store the URL, try again.",
        cause: error,
      });
    }
  });
