import { UserUrl } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { sha1 } from "@urlshare/crypto/sha1";
import { Prisma, prisma, PrismaClient, Url, UrlQueue, UrlQueueStatus } from "@urlshare/db/prisma/client";
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
type TransactionPrismaClient = Omit<
  PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

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
      metadata: true,
      categoryIds: true,
    },
    where: {
      status: {
        in: [UrlQueueStatus.NEW, UrlQueueStatus.FAILED],
      },
    },
    orderBy: [{ status: "desc" }, { createdAt: "desc" }, { attemptCount: "desc" }],
  });

  const queueIsEmpty = !urlQueueItem;

  if (queueIsEmpty) {
    return null;
  }

  await increaseAttemptCount(urlQueueItem);

  const urlQueueId = urlQueueItem.id;
  let metadata: Metadata;

  try {
    metadata = await getOrFetchMetadata({ urlQueueItem, fetchMetadata });
  } catch (_) {
    if (urlQueueItem.attemptCount + 1 >= maxNumberOfAttempts) {
      logger.error({ requestId, actionType, urlQueueId }, "Final attempt reached, rejecting URL queue item.");

      await markUrlQueueAsRejected(urlQueueId);
    }

    return null;
  }

  logger.info({ requestId, actionType, metadata }, "Metadata fetched.");

  const urlEntry: Url = await getOrCreateUrl({ metadata, rawUrl: urlQueueItem.rawUrl });

  const urlId = urlEntry.id;
  const userId = urlQueueItem.userId;
  const categoryIds = urlQueueItem.categoryIds as Prisma.JsonArray;

  await prisma.$transaction(async (tx) => {
    const { id: userUrlId } = await createUserUrl(tx, { userId, urlId });

    if (categoryIds.length > 0) {
      await attachCategoriesToUrl(tx, { userId, userUrlId, categoryIds });
    }

    await incrementUserUrlsCount(tx, { userId });
    await createFeedQueueEntry(tx, { userId, userUrlId });
    await markUrlQueueAsAccepted(tx, { urlQueueId: urlQueueItem.id, metadata });

    logger.info({ requestId, actionType, createdUrlId: urlId }, "Processing finished, URL created.");
  });

  return urlEntry;
};

const increaseAttemptCount = async ({ id, attemptCount }: Pick<UrlQueue, "id" | "attemptCount">) => {
  await prisma.urlQueue.update({
    data: {
      attemptCount: attemptCount + 1,
    },
    where: {
      id,
    },
  });
};

const getOrFetchMetadata = async ({
  urlQueueItem,
  fetchMetadata,
}: {
  urlQueueItem: Pick<UrlQueue, "rawUrl" | "metadata">;
  fetchMetadata: FetchMetadata;
}): Promise<Metadata> => {
  // I know it's Metadata
  if (Object.keys(urlQueueItem.metadata as Metadata).length > 0) {
    return urlQueueItem.metadata as Metadata;
  }

  return await fetchMetadata(urlQueueItem.rawUrl);
};

const markUrlQueueAsRejected = async (urlQueueId: UrlQueue["id"]) => {
  await prisma.urlQueue.update({
    data: {
      status: UrlQueueStatus.REJECTED,
    },
    where: {
      id: urlQueueId,
    },
  });
};

const createUserUrl = async (
  prisma: TransactionPrismaClient,
  {
    userId,
    urlId,
  }: {
    userId: UrlQueue["userId"];
    urlId: Url["id"];
  }
): Promise<UserUrl> => {
  return prisma.userUrl.create({
    data: {
      id: ID_PLACEHOLDER_REPLACED_BY_ID_GENERATOR,
      userId,
      urlId,
    },
  });
};

const attachCategoriesToUrl = async (
  prisma: TransactionPrismaClient,
  {
    userId,
    categoryIds,
    userUrlId,
  }: {
    userId: UrlQueue["userId"];
    categoryIds: Prisma.JsonArray;
    userUrlId: UserUrl["id"];
  }
) => {
  // At this point I know the categories had been checked in terms of them being part of user's categories.
  // The only check that needs to be done is if any of the categories had been deleted in the meanwhile.
  // If so, those need to be skipped and only existing ones should be used.

  const userCategoryIds = await prisma.category
    .findMany({
      where: {
        userId,
      },
      select: {
        id: true,
      },
    })
    .then((categories) => {
      return categories.map(({ id }) => id);
    });

  if (userCategoryIds.length > 0) {
    const categoryIdsToUse = categoryIds
      .filter((id) => {
        if (typeof id === "string") {
          return userCategoryIds.indexOf(id) !== -1;
        }

        return false;
      })
      .map((categoryId) => String(categoryId));

    if (categoryIdsToUse.length > 0) {
      await prisma.userUrlCategory.createMany({
        data: categoryIdsToUse.map((categoryId) => {
          return {
            categoryId,
            userUrlId,
          };
        }),
      });

      await prisma.category.updateMany({
        data: {
          urlsCount: {
            increment: 1,
          },
        },
        where: {
          id: {
            in: categoryIdsToUse,
          },
        },
      });
    }
  }
};

const incrementUserUrlsCount = async (prisma: TransactionPrismaClient, { userId }: { userId: UrlQueue["userId"] }) => {
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
};

const createFeedQueueEntry = async (
  prisma: TransactionPrismaClient,
  {
    userId,
    userUrlId,
  }: {
    userId: UrlQueue["userId"];
    userUrlId: UserUrl["id"];
  }
) => {
  await prisma.feedQueue.create({
    data: {
      id: ID_PLACEHOLDER_REPLACED_BY_ID_GENERATOR,
      userId,
      userUrlId,
    },
  });
};

const markUrlQueueAsAccepted = async (
  prisma: TransactionPrismaClient,
  { urlQueueId, metadata }: { urlQueueId: UrlQueue["id"]; metadata: Metadata }
) => {
  await prisma.urlQueue.update({
    data: {
      metadata: compressMetadata(metadata) as Prisma.JsonObject,
      status: "ACCEPTED",
    },
    where: {
      id: urlQueueId,
    },
  });
};

const getOrCreateUrl = async ({ rawUrl, metadata }: { rawUrl: UrlQueue["rawUrl"]; metadata: Metadata }) => {
  const url = metadata.url || rawUrl;
  const urlHash = sha1(url);
  const compressedMetadata = compressMetadata(metadata);

  const urlEntry = await prisma.url.findUnique({
    where: { urlHash },
  });

  if (urlEntry) {
    return urlEntry;
  }

  return prisma.url.create({
    data: {
      id: ID_PLACEHOLDER_REPLACED_BY_ID_GENERATOR,
      url,
      urlHash,
      metadata: compressedMetadata as Prisma.JsonObject,
    },
  });
};
