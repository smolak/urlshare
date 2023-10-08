import { sha1 } from "@urlshare/crypto/sha1";
import { Prisma, prisma, Url, UrlQueueStatus } from "@urlshare/db/prisma/client";
import { ID_PLACEHOLDER_REPLACED_BY_ID_GENERATOR } from "@urlshare/db/prisma/middlewares/generate-model-id";
import { Logger } from "@urlshare/logger";
import { compressMetadata } from "@urlshare/metadata/compression";
import { FetchMetadata } from "@urlshare/metadata/fetch-metadata";
import { Metadata } from "@urlshare/metadata/types";

interface Params {
  fetchMetadata: FetchMetadata;
  logger: Logger;
  requestId: string;
  maxNumberOfAttempts: number;
}

type NoItemsInQueue = null;
type ProcessUrlQueueItem = (params: Params) => Promise<Url | NoItemsInQueue>;

export const actionType = "processUrlQueueItemHandler";

export const processUrlQueueItem: ProcessUrlQueueItem = async ({
  fetchMetadata,
  logger,
  requestId,
  maxNumberOfAttempts,
}) => {
  const urlQueueItem = await prisma.urlQueue.findFirst({
    select: {
      id: true,
      attemptCount: true,
      rawUrl: true,
      userId: true,
    },
    where: {
      status: {
        in: [UrlQueueStatus.NEW, UrlQueueStatus.FAILED],
      },
    },
    orderBy: [{ status: "desc" }, { createdAt: "desc" }, { attemptCount: "desc" }],
  });

  if (!urlQueueItem) {
    // Queue is empty
    return null;
  }

  await prisma.urlQueue.update({
    data: {
      attemptCount: urlQueueItem.attemptCount + 1,
    },
    where: {
      id: urlQueueItem.id,
    },
  });

  let metadata: Metadata;

  try {
    metadata = await fetchMetadata(urlQueueItem.rawUrl);
  } catch (_) {
    if (urlQueueItem.attemptCount + 1 >= maxNumberOfAttempts) {
      await prisma.urlQueue.update({
        data: {
          status: UrlQueueStatus.REJECTED,
        },
        where: {
          id: urlQueueItem.id,
        },
      });
    }

    return null;
  }

  logger.info({ requestId, actionType, metadata }, "Metadata fetched.");

  const url = metadata.url || urlQueueItem.rawUrl;
  const urlHash = sha1(url);
  const compressedMetadata = compressMetadata(metadata);

  let urlEntry: Url | null = null;

  if (metadata.url !== urlQueueItem.rawUrl) {
    urlEntry = await prisma.url.findUnique({
      where: { urlHash },
    });
  }

  const urlEntryCreated = await prisma.$transaction(async (prisma) => {
    if (!urlEntry) {
      urlEntry = await prisma.url.create({
        data: {
          id: ID_PLACEHOLDER_REPLACED_BY_ID_GENERATOR,
          url,
          urlHash,
          metadata: compressedMetadata as Prisma.JsonObject,
        },
      });
    }

    const userUrl = await prisma.userUrl.create({
      data: {
        id: ID_PLACEHOLDER_REPLACED_BY_ID_GENERATOR,
        userId: urlQueueItem.userId,
        urlId: urlEntry.id,
      },
    });

    await prisma.userProfileData.update({
      data: {
        urlsCount: {
          increment: 1,
        },
      },
      where: {
        userId: urlQueueItem.userId,
      },
    });

    await prisma.feedQueue.create({
      data: {
        id: ID_PLACEHOLDER_REPLACED_BY_ID_GENERATOR,
        userId: urlQueueItem.userId,
        userUrlId: userUrl.id,
      },
    });

    await prisma.urlQueue.update({
      data: {
        metadata: compressedMetadata as Prisma.JsonObject,
        status: "ACCEPTED",
      },
      where: {
        id: urlQueueItem.id,
      },
    });

    logger.info({ requestId, actionType, createdUrl: urlEntry }, "Processing finished, URL created.");

    return urlEntry;
  });

  return urlEntryCreated;
};
