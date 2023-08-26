import { TRPCError } from "@trpc/server";
import { sha1 } from "@urlshare/crypto/sha1";
import { Url, UrlQueue } from "@urlshare/db/prisma/client";
import { ID_PLACEHOLDER_REPLACED_BY_ID_GENERATOR } from "@urlshare/db/prisma/middlewares/generate-model-id";

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
  .mutation<CreateUrlResult>(async ({ input: { url }, ctx: { logger, requestId, session, prisma } }) => {
    const path = "url.createUrl";
    const userId = session.user.id;
    const urlHash = sha1(url);

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

        await prisma.$transaction(async (prisma) => {
          const userUrl = await prisma.userUrl.create({
            data: {
              id: ID_PLACEHOLDER_REPLACED_BY_ID_GENERATOR,
              userId,
              urlId: maybeUrl.id,
            },
          });

          await prisma.userProfileData.update({
            data: {
              urlsCount: {
                increment: 1,
              },
            },
            where: {
              userId,
            },
          });

          await prisma.feedQueue.create({
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
