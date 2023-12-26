import { UserUrl } from "@prisma/client";
import { UploadImageFromUrl } from "@urlshare/cdn/utils/upload-image-from-url";
import { sha1 } from "@urlshare/crypto/sha1";
import { Prisma, prisma, Url, UrlQueue, UrlQueueStatus } from "@urlshare/db/prisma/client";
import { ID_PLACEHOLDER_REPLACED_BY_ID_GENERATOR } from "@urlshare/db/prisma/middlewares/generate-model-id";
import { TransactionPrismaClient } from "@urlshare/db/prisma/types";
import { Logger } from "@urlshare/logger";
import { CompressedMetadata, compressMetadata, decompressMetadata } from "@urlshare/metadata/compression";
import { FetchMetadata } from "@urlshare/metadata/fetch-metadata";
import { Metadata } from "@urlshare/metadata/types";

import { assignCategoriesToUserUrl, incrementUrlsCount } from "../../../category/prisma/operations";

interface Params {
  fetchMetadata: FetchMetadata;
  logger: Logger;
  requestId: string;
  maxNumberOfAttempts: number;
  uploadImageFromUrl: UploadImageFromUrl;
}

type NoItemsInQueue = null;
type ProcessUrlQueueItem = (params: Params) => Promise<Url | NoItemsInQueue>;

export const actionType = "processUrlQueueItemHandler";

export const processUrlQueueItem: ProcessUrlQueueItem = async ({
  fetchMetadata,
  logger,
  maxNumberOfAttempts,
  requestId,
  uploadImageFromUrl,
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

  const { urlEntry, status } = await getOrCreateUrl({ metadata, rawUrl: urlQueueItem.rawUrl });

  const urlId = urlEntry.id;
  const userId = urlQueueItem.userId;
  const categoryIds = urlQueueItem.categoryIds as Prisma.JsonArray;

  await prisma.$transaction(async (tx) => {
    const { id: userUrlId } = await createUserUrl(tx, { userId, urlId });

    if (status === "new") {
      await uploadImagesToCdn(tx, urlEntry, uploadImageFromUrl);
    }

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

const uploadImagesToCdn = async (
  prisma: TransactionPrismaClient,
  urlEntry: Url,
  uploadImageFromUrl: UploadImageFromUrl
) => {
  const currentMetadata = decompressMetadata(urlEntry.metadata as CompressedMetadata);

  let imageCdnUrl;
  let iconCdnUrl;
  let shouldUpdateMetadata = false;

  // TODO: possible improvement with Promise.all / Promise.allSettled
  // both in terms of speed and, if settled, error handling

  if (currentMetadata.image) {
    const imageFilename = `url/image-${urlEntry.id}`;
    imageCdnUrl = await uploadImageFromUrl(currentMetadata.image, imageFilename);
    shouldUpdateMetadata = true;
  }

  if (currentMetadata.icon) {
    const iconFilename = `url/icon-${urlEntry.id}`;
    iconCdnUrl = await uploadImageFromUrl(currentMetadata.icon, iconFilename);
    shouldUpdateMetadata = true;
  }

  if (shouldUpdateMetadata) {
    const currentMetadata = decompressMetadata(urlEntry.metadata as CompressedMetadata);
    const newMetadata: CompressedMetadata = compressMetadata({
      ...currentMetadata,
      imageCdn: imageCdnUrl,
      iconCdn: iconCdnUrl,
    });

    await prisma.url.update({
      data: {
        metadata: newMetadata as Prisma.JsonObject,
      },
      where: {
        id: urlEntry.id,
      },
    });
  }
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
      await assignCategoriesToUserUrl(prisma, { categoryIds: categoryIdsToUse, userUrlId });
      await incrementUrlsCount(prisma, { categoryIds: categoryIdsToUse });
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

const getOrCreateUrl = async ({
  rawUrl,
  metadata,
}: {
  rawUrl: UrlQueue["rawUrl"];
  metadata: Metadata;
}): Promise<{ urlEntry: Url; status: "existing" | "new" }> => {
  const url = metadata.url || rawUrl;
  const urlHash = sha1(url);
  const compressedMetadata = compressMetadata(metadata);

  const urlEntry = await prisma.url.findUnique({
    where: { urlHash },
  });

  if (urlEntry) {
    return {
      urlEntry,
      status: "existing",
    };
  }

  const newUrlEntry = await prisma.url.create({
    data: {
      id: ID_PLACEHOLDER_REPLACED_BY_ID_GENERATOR,
      url,
      urlHash,
      metadata: compressedMetadata as Prisma.JsonObject,
    },
  });

  return {
    urlEntry: newUrlEntry,
    status: "new",
  };
};
