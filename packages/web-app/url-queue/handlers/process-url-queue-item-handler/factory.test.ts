/* eslint-disable simple-import-sort/imports */
// Mock needs to go first.
import { prismaMock } from "@urlshare/db/prisma/prisma-mock";
/* eslint-enable simple-import-sort/imports */
import { UrlQueueStatus } from "@urlshare/db/prisma/client";
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

const fetchMetadata = vi.fn();

const urlQueueId = generateUrlQueueId();

// Can be any random string
const urlQueueApiKey = generateId("", 40);

const logger = mockDeep<Logger>();
const reqMock = mockDeep<NextApiRequest>();
const resMock = mockDeep<NextApiResponse>();

const maxNumberOfAttempts = 5;

describe("processQueueItemHandler", () => {
  beforeEach(() => {
    setConfig({
      serverRuntimeConfig: {
        urlQueueApiKey,
      },
    });

    vi.resetAllMocks();

    prismaMock.urlQueue.findFirst.mockResolvedValue(createUrlQueueItem());
    fetchMetadata.mockResolvedValue(createExampleWebsiteMetadata());

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
      },
      where: {
        status: {
          in: processableStatuses,
        },
      },
      orderBy: [{ status: "desc" }, { createdAt: "desc" }, { attemptCount: "desc" }],
    });
  });

  describe("when no such item is found", () => {
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

  it("fetches the metadata for the URL in question", async () => {
    const urlQueueItem = createUrlQueueItem({ id: urlQueueId });
    prismaMock.urlQueue.findFirstOrThrow.mockResolvedValue(urlQueueItem);

    const handler = processUrlQueueItemHandlerFactory({ fetchMetadata, logger, maxNumberOfAttempts });

    await handler(reqMock, resMock);

    expect(fetchMetadata).toHaveBeenCalledWith(urlQueueItem.rawUrl);
  });

  describe("when metadata contains URL and it differs from the raw URL in url queue item", () => {
    const url = "https://urlshare.app/about";
    const metadata = createExampleWebsiteMetadata({ url });
    const urlQueueEntry = createUrlQueueItem({ rawUrl: url + "#faq" });

    beforeEach(() => {
      fetchMetadata.mockResolvedValue(metadata);
      prismaMock.urlQueue.findFirstOrThrow.mockResolvedValue(urlQueueEntry);
    });

    it("should check if an entry for that URL exist", async () => {
      const handler = processUrlQueueItemHandlerFactory({ fetchMetadata, logger, maxNumberOfAttempts });
      await handler(reqMock, resMock);

      expect(prismaMock.url.findUnique).toHaveBeenCalledWith({
        where: {
          urlHash: sha1(metadata.url as string), // I know `url` is there
        },
      });
    });
  });

  describe("when fetching metadata fails", () => {
    beforeEach(() => {
      fetchMetadata.mockRejectedValueOnce(new Error("Something went wrong with fetching metadata"));
    });

    it("should respond with NO_CONTENT status", async () => {
      const handler = processUrlQueueItemHandlerFactory({ fetchMetadata, logger, maxNumberOfAttempts });

      await handler(reqMock, resMock);

      expect(resMock.status).toHaveBeenCalledWith(StatusCodes.NO_CONTENT);
    });

    describe("when this was a final attempt to process the item in the queue", () => {
      const urlQueueItemWithSecondToLastAttempt = createUrlQueueItem({ attemptCount: maxNumberOfAttempts - 1 });

      beforeEach(() => {
        prismaMock.urlQueue.findFirst.mockResolvedValue(urlQueueItemWithSecondToLastAttempt);
      });

      it("should change the status of this item to REJECTED", async () => {
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

    describe("when the url in metadata differs from the raw one, from queue (e.g. canonical URL is different)", () => {
      const url = "https://urlshare.app/about";
      const metadata = createExampleWebsiteMetadata({ url });
      const urlQueueEntry = createUrlQueueItem({ rawUrl: url + "#faq" });

      describe("when such url exists already in the DB", () => {
        const existingUrlEntity = createUrlEntity({ url });

        beforeEach(() => {
          fetchMetadata.mockResolvedValue(metadata);
          prismaMock.urlQueue.findFirstOrThrow.mockResolvedValue(urlQueueEntry);
          prismaMock.url.findUnique.mockResolvedValue(existingUrlEntity);
        });

        it("should not create a new URL entry (as it already exists)", async () => {
          const handler = processUrlQueueItemHandlerFactory({ fetchMetadata, logger, maxNumberOfAttempts });
          await handler(reqMock, resMock);

          expect(prismaMock.$transaction).toHaveBeenCalled();

          // Triggering $transaction call. Don't know if it can be done otherwise.
          // TODO if it can
          const transactionCallback = getTransactionCallback();
          await transactionCallback(prismaMock);

          expect(prismaMock.url.create).not.toHaveBeenCalled();
        });

        it("should use existing url entry for adding relationship between that url and user that added it", async () => {
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
              urlId: existingUrlEntity.id,
            },
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
      });
    });

    describe("when the url in metadata is the same as the raw one, from queue", () => {
      const url = "https://urlshare.app/about";
      const metadata = createExampleWebsiteMetadata({ url });
      const urlQueueEntry = createUrlQueueItem({ rawUrl: url });

      beforeEach(() => {
        fetchMetadata.mockResolvedValue(metadata);

        prismaMock.urlQueue.findFirstOrThrow.mockResolvedValue(urlQueueEntry);
      });

      it("should create Url entity, as it doesn't exist yet", async () => {
        const handler = processUrlQueueItemHandlerFactory({ fetchMetadata, logger, maxNumberOfAttempts });
        await handler(reqMock, resMock);

        expect(prismaMock.$transaction).toHaveBeenCalled();

        // Triggering $transaction call. Don't know if it can be done otherwise.
        // TODO if it can
        const transactionCallback = getTransactionCallback();
        await transactionCallback(prismaMock);

        const expectedPayload = {
          data: {
            id: ID_PLACEHOLDER_REPLACED_BY_ID_GENERATOR,
            url: metadata.url,
            urlHash: sha1(metadata.url as string),
            metadata: compressMetadata(metadata),
          },
        };

        expect(prismaMock.url.create).toHaveBeenCalledWith(expectedPayload);
      });
    });

    describe('if metadata doesn\'t contain "url" property (e.g. it was an image, metadata was not obtained)', () => {
      const exampleImageMetadata = createExampleImageMetadata();

      beforeEach(() => {
        fetchMetadata.mockResolvedValue(exampleImageMetadata);
      });

      it("should use rawUrl for payload creation", async () => {
        const handler = processUrlQueueItemHandlerFactory({ fetchMetadata, logger, maxNumberOfAttempts });
        await handler(reqMock, resMock);

        expect(prismaMock.$transaction).toHaveBeenCalled();

        // Triggering $transaction call. Don't know if it can be done otherwise.
        // TODO if it can
        const transactionCallback = getTransactionCallback();
        await transactionCallback(prismaMock);

        const expectedPayload = {
          data: {
            id: ID_PLACEHOLDER_REPLACED_BY_ID_GENERATOR,
            url: urlQueueItem.rawUrl,
            urlHash: sha1(urlQueueItem.rawUrl),
            metadata: compressMetadata(exampleImageMetadata),
          },
        };

        expect(prismaMock.url.create).toHaveBeenCalledWith(expectedPayload);
      });
    });

    it("relationship between created url and user that added it is created", async () => {
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

    it("adds the user's url to the feed queue (so that it will appear on author's feed as well)", async () => {
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

    it("url in queue is marked as accepted (no future processing; entity can be deleted by separate job)", async () => {
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
