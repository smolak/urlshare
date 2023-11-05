/* eslint-disable simple-import-sort/imports */
// Mock needs to go first.
import { prismaMock } from "@urlshare/db/prisma/prisma-mock";
/* eslint-enable simple-import-sort/imports */
import { UrlQueue, UrlQueueStatus } from "@urlshare/db/prisma/client";
import { sha1 } from "@urlshare/crypto/sha1";
import { ID_PLACEHOLDER_REPLACED_BY_ID_GENERATOR } from "@urlshare/db/prisma/middlewares/generate-model-id";
import { Logger } from "@urlshare/logger";
import { compressMetadata } from "@urlshare/metadata/compression";
import {
  createExampleImageMetadata,
  createExampleWebsiteMetadata,
} from "@urlshare/metadata/fetch-adapters/default/fixtures/example-metadata";
import { generateId } from "@urlshare/shared/utils/generate-id";
import { StatusCodes } from "http-status-codes";
import { NextApiRequest, NextApiResponse } from "next";
import { setConfig } from "next/config";
import { vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";

import { createUrlEntity } from "../../../url/fixtures/create-url-entity.fixture";
import { createUserUrl } from "../../../user-url/fixtures/create-user-url.fixture";
import { createUrlQueueItem } from "../../test/fixtures/url-queue";
import { generateUrlQueueId } from "../../utils/generate-url-queue-id";
import { processUrlQueueItemHandlerFactory } from "./factory";
import { Metadata } from "@urlshare/metadata/types";
import { generateCategoryId } from "../../../category/utils/generate-category-id";
import { createCategory } from "../../../category/fixtures/create-category.fixture";

const fetchMetadata = vi.fn();

const urlQueueId = generateUrlQueueId();

// Can be any random string
const urlQueueApiKey = generateId("", 40);

const logger = mockDeep<Logger>();
const reqMock = mockDeep<NextApiRequest>();
const resMock = mockDeep<NextApiResponse>();

const maxNumberOfAttempts = 5;
const url = "https://urlshare.app/about";
let metadata: Metadata;
let urlQueueItem: UrlQueue;

describe("processQueueItemHandler", () => {
  beforeEach(() => {
    setConfig({
      serverRuntimeConfig: {
        urlQueueApiKey,
      },
    });

    vi.resetAllMocks();

    urlQueueItem = createUrlQueueItem();
    metadata = createExampleWebsiteMetadata({ url });

    prismaMock.urlQueue.findFirst.mockResolvedValue(urlQueueItem);
    fetchMetadata.mockResolvedValue(metadata);

    reqMock.headers = { authorization: `Bearer ${urlQueueApiKey}` };
    reqMock.body = { urlQueueId };
  });

  it("should look for item in queue, but only for one in processable status", async () => {
    const handler = processUrlQueueItemHandlerFactory({ fetchMetadata, logger, maxNumberOfAttempts });

    await handler(reqMock, resMock);

    const processableStatuses = [UrlQueueStatus.NEW, UrlQueueStatus.FAILED];

    expect(prismaMock.urlQueue.findFirst).toHaveBeenCalledWith({
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
          in: processableStatuses,
        },
      },
      orderBy: [{ status: "desc" }, { createdAt: "desc" }, { attemptCount: "desc" }],
    });
  });

  describe("when no url queue item is found", () => {
    beforeEach(() => {
      prismaMock.urlQueue.findFirst.mockResolvedValue(null);
    });

    it("should respond with NO_CONTENT status", async () => {
      const handler = processUrlQueueItemHandlerFactory({ fetchMetadata, logger, maxNumberOfAttempts });

      await handler(reqMock, resMock);

      expect(resMock.status).toHaveBeenCalledWith(StatusCodes.NO_CONTENT);
    });
  });

  it("found item gets updated in terms of attempt count", async () => {
    const urlQueueItem = createUrlQueueItem({ id: urlQueueId });
    prismaMock.urlQueue.findFirst.mockResolvedValue(urlQueueItem);

    const handler = processUrlQueueItemHandlerFactory({ fetchMetadata, logger, maxNumberOfAttempts });
    await handler(reqMock, resMock);

    expect(prismaMock.urlQueue.update).toHaveBeenCalledWith({
      data: {
        attemptCount: urlQueueItem.attemptCount + 1,
      },
      where: {
        id: urlQueueItem.id,
      },
    });
  });

  it("fetches the metadata for the url queue item", async () => {
    const urlQueueItem = createUrlQueueItem({ id: urlQueueId });
    prismaMock.urlQueue.findFirstOrThrow.mockResolvedValue(urlQueueItem);

    const handler = processUrlQueueItemHandlerFactory({ fetchMetadata, logger, maxNumberOfAttempts });

    await handler(reqMock, resMock);

    expect(fetchMetadata).toHaveBeenCalledWith(urlQueueItem.rawUrl);
  });

  describe("when fetching metadata fails", () => {
    beforeEach(() => {
      fetchMetadata.mockRejectedValueOnce(new Error("Something went wrong with fetching metadata"));
    });

    describe("when this was a final attempt to process the item in the queue", () => {
      const urlQueueItemWithSecondToLastAttempt = createUrlQueueItem({ attemptCount: maxNumberOfAttempts - 1 });

      beforeEach(() => {
        prismaMock.urlQueue.findFirst.mockResolvedValue(urlQueueItemWithSecondToLastAttempt);
      });

      it("should mark the queue item as REJECTED", async () => {
        const handler = processUrlQueueItemHandlerFactory({ fetchMetadata, logger, maxNumberOfAttempts });

        await handler(reqMock, resMock);

        expect(prismaMock.urlQueue.update).toHaveBeenCalledWith({
          data: {
            status: UrlQueueStatus.REJECTED,
          },
          where: {
            id: urlQueueItemWithSecondToLastAttempt.id,
          },
        });
      });
    });

    it("should respond with NO_CONTENT status", async () => {
      const handler = processUrlQueueItemHandlerFactory({ fetchMetadata, logger, maxNumberOfAttempts });

      await handler(reqMock, resMock);

      expect(resMock.status).toHaveBeenCalledWith(StatusCodes.NO_CONTENT);
    });
  });

  it("should use the url from metadata to check if Url already exists", async () => {
    const handler = processUrlQueueItemHandlerFactory({ fetchMetadata, logger, maxNumberOfAttempts });
    await handler(reqMock, resMock);

    expect(prismaMock.url.findUnique).toHaveBeenCalledWith({
      where: {
        urlHash: sha1(metadata.url as string), // I know `url` is there
      },
    });
  });

  describe("when there is no url in metadata (e.g. this was an image, so no metadata could be fetched)", () => {
    beforeEach(() => {
      const imageMetadata = createExampleImageMetadata();
      fetchMetadata.mockResolvedValue(imageMetadata);
    });

    it("should use the rawUrl property from queue item to check if Url exists", async () => {
      const handler = processUrlQueueItemHandlerFactory({ fetchMetadata, logger, maxNumberOfAttempts });
      await handler(reqMock, resMock);

      expect(prismaMock.url.findUnique).toHaveBeenCalledWith({
        where: {
          urlHash: sha1(urlQueueItem.rawUrl),
        },
      });
    });
  });

  describe("when Url does not exist yet", async () => {
    beforeEach(() => {
      prismaMock.url.findUnique.mockResolvedValue(null);
    });

    it("should create a new Url entry", async () => {
      const handler = processUrlQueueItemHandlerFactory({ fetchMetadata, logger, maxNumberOfAttempts });
      await handler(reqMock, resMock);

      expect(prismaMock.url.create).toHaveBeenCalledWith({
        data: {
          id: ID_PLACEHOLDER_REPLACED_BY_ID_GENERATOR,
          url,
          urlHash: sha1(metadata.url as string),
          metadata: compressMetadata(metadata),
        },
      });
    });
  });

  describe("further processing is wrapped in transaction, either all succeed or none", () => {
    const urlEntity = createUrlEntity();
    const urlQueueItem = createUrlQueueItem({ id: urlQueueId });
    const userUrlItem = createUserUrl({
      urlId: urlEntity.id,
      userId: urlQueueItem.userId,
    });
    const exampleMetadata = createExampleWebsiteMetadata({ contentType: undefined });

    const getTransactionCallback = () => prismaMock.$transaction.mock.calls[0][0];

    beforeEach(() => {
      fetchMetadata.mockResolvedValue(exampleMetadata);

      prismaMock.urlQueue.findFirst.mockResolvedValue(urlQueueItem);
      prismaMock.url.create.mockResolvedValue(urlEntity);
      prismaMock.userUrl.create.mockResolvedValue(userUrlItem);
    });

    it("should create relationship (UserUrl) between the Url and the user that added it", async () => {
      const handler = processUrlQueueItemHandlerFactory({ fetchMetadata, logger, maxNumberOfAttempts });
      await handler(reqMock, resMock);

      expect(prismaMock.$transaction).toHaveBeenCalled();

      // Triggering $transaction call. Don't know if it can be done otherwise.
      // TODO if it can
      const transactionCallback = getTransactionCallback();
      await transactionCallback(prismaMock);

      expect(prismaMock.userUrl.create).toHaveBeenCalledWith({
        data: {
          id: ID_PLACEHOLDER_REPLACED_BY_ID_GENERATOR,
          userId: urlQueueItem.userId,
          urlId: urlEntity.id,
        },
      });
    });

    describe("when the url was added with categories", () => {
      const categoryIds = [generateCategoryId(), generateCategoryId()];
      const categories = categoryIds.map((id) => createCategory({ id }));
      const urlQueueItem = createUrlQueueItem({ categoryIds });

      beforeEach(() => {
        prismaMock.urlQueue.findFirst.mockResolvedValue(urlQueueItem);
        prismaMock.category.findMany.mockResolvedValue(categories);
      });

      it("should fetch current user categories", async () => {
        const handler = processUrlQueueItemHandlerFactory({ fetchMetadata, logger, maxNumberOfAttempts });
        await handler(reqMock, resMock);

        expect(prismaMock.$transaction).toHaveBeenCalled();

        const transactionCallback = getTransactionCallback();
        await transactionCallback(prismaMock);

        expect(prismaMock.category.findMany).toHaveBeenCalledWith({
          where: {
            userId: urlQueueItem.userId,
          },
          select: {
            id: true,
          },
        });
      });

      it("should assign each category to the url", async () => {
        const handler = processUrlQueueItemHandlerFactory({ fetchMetadata, logger, maxNumberOfAttempts });
        await handler(reqMock, resMock);

        expect(prismaMock.$transaction).toHaveBeenCalled();

        const transactionCallback = getTransactionCallback();
        await transactionCallback(prismaMock);

        expect(prismaMock.userUrlCategory.createMany).toHaveBeenCalledWith({
          data: categoryIds.map((categoryId) => {
            return {
              categoryId,
              userUrlId: userUrlItem.id,
            };
          }),
        });
      });

      it("should increment urls count on each category", async () => {
        const handler = processUrlQueueItemHandlerFactory({ fetchMetadata, logger, maxNumberOfAttempts });
        await handler(reqMock, resMock);

        expect(prismaMock.$transaction).toHaveBeenCalled();

        const transactionCallback = getTransactionCallback();
        await transactionCallback(prismaMock);

        expect(prismaMock.category.updateMany).toHaveBeenCalledWith({
          data: {
            urlsCount: {
              increment: 1,
            },
          },
          where: {
            id: {
              in: categoryIds,
            },
          },
        });
      });

      describe("when user has no categories (e.g. they were removed before queue item got processed)", () => {
        beforeEach(() => {
          prismaMock.category.findMany.mockResolvedValue([]);
        });

        it("should not perform any categories related action", async () => {
          const handler = processUrlQueueItemHandlerFactory({ fetchMetadata, logger, maxNumberOfAttempts });
          await handler(reqMock, resMock);

          expect(prismaMock.$transaction).toHaveBeenCalled();

          const transactionCallback = getTransactionCallback();
          await transactionCallback(prismaMock);

          expect(prismaMock.userUrlCategory.createMany).not.toHaveBeenCalled();
          expect(prismaMock.category.updateMany).not.toHaveBeenCalled();
        });
      });

      describe("when some category IDs are not present in user's categories (e.g. category was removed before queue item got processed)", () => {
        const categoryId1 = generateCategoryId();
        const categoryId2 = generateCategoryId();

        const categoryIds = [categoryId1, categoryId2];

        const categories = [createCategory({ id: categoryId1 })];
        const urlQueueItem = createUrlQueueItem({ categoryIds });

        beforeEach(() => {
          prismaMock.urlQueue.findFirst.mockResolvedValue(urlQueueItem);
          prismaMock.category.findMany.mockResolvedValue(categories);
        });

        it("should assign categories to the url, but only those that user currently has", async () => {
          const handler = processUrlQueueItemHandlerFactory({ fetchMetadata, logger, maxNumberOfAttempts });
          await handler(reqMock, resMock);

          expect(prismaMock.$transaction).toHaveBeenCalled();

          const transactionCallback = getTransactionCallback();
          await transactionCallback(prismaMock);

          expect(prismaMock.userUrlCategory.createMany).toHaveBeenCalledWith({
            data: [categoryId1].map((categoryId) => {
              return {
                categoryId,
                userUrlId: userUrlItem.id,
              };
            }),
          });
        });

        it("should increment urls count on categories, but only those that user currently has", async () => {
          const handler = processUrlQueueItemHandlerFactory({ fetchMetadata, logger, maxNumberOfAttempts });
          await handler(reqMock, resMock);

          expect(prismaMock.$transaction).toHaveBeenCalled();

          const transactionCallback = getTransactionCallback();
          await transactionCallback(prismaMock);

          expect(prismaMock.category.updateMany).toHaveBeenCalledWith({
            data: {
              urlsCount: {
                increment: 1,
              },
            },
            where: {
              id: {
                in: [categoryId1],
              },
            },
          });
        });
      });
    });

    it("should increment the number of urls for the user that added it", async () => {
      const handler = processUrlQueueItemHandlerFactory({ fetchMetadata, logger, maxNumberOfAttempts });
      await handler(reqMock, resMock);

      expect(prismaMock.$transaction).toHaveBeenCalled();

      // Triggering $transaction call. Don't know if it can be done otherwise.
      // TODO if it can
      const transactionCallback = getTransactionCallback();
      await transactionCallback(prismaMock);

      expect(prismaMock.userProfileData.update).toHaveBeenCalledWith({
        data: {
          urlsCount: {
            increment: 1,
          },
        },
        where: {
          userId: urlQueueItem.userId,
        },
      });
    });

    it("should create FeedQueue entry", async () => {
      const handler = processUrlQueueItemHandlerFactory({ fetchMetadata, logger, maxNumberOfAttempts });
      await handler(reqMock, resMock);

      expect(prismaMock.$transaction).toHaveBeenCalled();

      // Triggering $transaction call. Don't know if it can be done otherwise.
      // TODO if it can
      const transactionCallback = getTransactionCallback();
      await transactionCallback(prismaMock);

      expect(prismaMock.feedQueue.create).toHaveBeenCalledWith({
        data: {
          id: ID_PLACEHOLDER_REPLACED_BY_ID_GENERATOR,
          userId: userUrlItem.userId,
          userUrlId: userUrlItem.id,
        },
      });
    });

    it("should mark the queue item as ACCEPTED (no future processing)", async () => {
      const handler = processUrlQueueItemHandlerFactory({ fetchMetadata, logger, maxNumberOfAttempts });
      await handler(reqMock, resMock);

      expect(prismaMock.$transaction).toHaveBeenCalled();

      // Triggering $transaction call. Don't know if it can be done otherwise.
      // TODO if it can
      const transactionCallback = getTransactionCallback();
      await transactionCallback(prismaMock);

      const compressedMetadata = compressMetadata(exampleMetadata);

      expect(prismaMock.urlQueue.update).toHaveBeenCalledWith({
        data: {
          metadata: compressedMetadata,
          status: "ACCEPTED",
        },
        where: {
          id: urlQueueItem.id,
        },
      });
    });

    it('should respond with CREATED status with "url" assigned', async () => {
      prismaMock.$transaction.mockResolvedValue(urlEntity);
      const handler = processUrlQueueItemHandlerFactory({ fetchMetadata, logger, maxNumberOfAttempts });

      await handler(reqMock, resMock);

      expect(resMock.status).toHaveBeenCalledWith(StatusCodes.CREATED);
      expect(resMock.json).toHaveBeenCalledWith({ url: urlEntity });
    });
  });

  describe("error handling - when any part of the implementation throws", () => {
    it("respond with INTERNAL_SERVER_ERROR and explanation", async () => {
      // trigger any type of error that might occur in the handler
      const error = new Error("Item not found.");
      prismaMock.urlQueue.findFirst.mockRejectedValue(error);
      const handler = processUrlQueueItemHandlerFactory({ fetchMetadata, logger, maxNumberOfAttempts });

      await handler(reqMock, resMock);

      expect(resMock.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(resMock.json).toHaveBeenCalledWith({ error: "Failed to process URL queue item." });
    });
  });
});
