import { ACCOUNT_ID_PREFIX } from "@urlshare/account/utils/generate-account-id";
import { Feed, Prisma } from "@urlshare/db/prisma/client";
import { SESSION_ID_PREFIX } from "@urlshare/session/utils/generate-session-id";
import { createFeed } from "@urlshare/web-app/feed/fixtures/create-feed.fixture";
import { FEED_ID_PREFIX } from "@urlshare/web-app/feed/utils/generate-feed-id";
import { FEED_QUEUE_ID_PREFIX } from "@urlshare/web-app/feed-queue/utils/generate-feed-queue-id";
import { URL_ID_PREFIX } from "@urlshare/web-app/url/utils/generate-url-id";
import { URL_QUEUE_ID_PREFIX } from "@urlshare/web-app/url-queue/utils/generate-url-queue-id";
import { generateUserId, USER_ID_PREFIX } from "@urlshare/web-app/user/utils/generate-user-id";
import { USER_PROFILE_DATA_ID_PREFIX } from "@urlshare/web-app/user-profile-data/utils/generate-user-profile-data-id";
import { USER_URL_ID_PREFIX } from "@urlshare/web-app/user-url/utils/generate-user-url-id";
import { expect, vi } from "vitest";

import { generateModelId, ID_PLACEHOLDER_REPLACED_BY_ID_GENERATOR } from "./generate-model-id";

describe("generateModelId middleware", () => {
  describe('for "create" action', () => {
    describe('when model is "User"', () => {
      it("should generate ID prefixed for User model", async () => {
        const params = {
          action: "create",
          model: "User",
          args: {
            data: {
              // any user data
            },
          },
        } as Prisma.MiddlewareParams;
        const nextSpy = vi.fn();

        await generateModelId(params, nextSpy);

        expect(nextSpy).toHaveBeenCalledWith({
          ...params,
          args: {
            ...params.args,
            data: {
              ...params.args.data,
              id: expect.stringMatching(`^${USER_ID_PREFIX}`),
            },
          },
        });
      });
    });

    describe('when model is "UserProfileData"', () => {
      it("should generate ID prefixed for UserProfileData model", async () => {
        const params = {
          action: "create",
          model: "UserProfileData",
          args: {
            data: {
              // any user data
            },
          },
        } as Prisma.MiddlewareParams;
        const nextSpy = vi.fn();

        await generateModelId(params, nextSpy);

        expect(nextSpy).toHaveBeenCalledWith({
          ...params,
          args: {
            ...params.args,
            data: {
              ...params.args.data,
              id: expect.stringMatching(`^${USER_PROFILE_DATA_ID_PREFIX}`),
            },
          },
        });
      });
    });

    describe('when model is "Session"', () => {
      it("should generate ID prefixed for Session model", async () => {
        const params = {
          action: "create",
          model: "Session",
          args: {
            data: {
              // any session data
            },
          },
        } as Prisma.MiddlewareParams;
        const nextSpy = vi.fn();

        await generateModelId(params, nextSpy);

        expect(nextSpy).toHaveBeenCalledWith({
          ...params,
          args: {
            ...params.args,
            data: {
              ...params.args.data,
              id: expect.stringMatching(`^${SESSION_ID_PREFIX}`),
            },
          },
        });
      });
    });

    describe('when model is "Account"', () => {
      it("should generate ID prefixed for Account model", async () => {
        const params = {
          action: "create",
          model: "Account",
          args: {
            data: {
              // any account data
            },
          },
        } as Prisma.MiddlewareParams;
        const nextSpy = vi.fn();

        await generateModelId(params, nextSpy);

        expect(nextSpy).toHaveBeenCalledWith({
          ...params,
          args: {
            ...params.args,
            data: {
              ...params.args.data,
              id: expect.stringMatching(`^${ACCOUNT_ID_PREFIX}`),
            },
          },
        });
      });
    });

    describe('when model is "UrlQueue"', () => {
      it("should generate ID prefixed for UrlQueue model", async () => {
        const params = {
          action: "create",
          model: "UrlQueue",
          args: {
            data: {
              // any url queue data
            },
          },
        } as Prisma.MiddlewareParams;
        const nextSpy = vi.fn();

        await generateModelId(params, nextSpy);

        expect(nextSpy).toHaveBeenCalledWith({
          ...params,
          args: {
            ...params.args,
            data: {
              ...params.args.data,
              id: expect.stringMatching(`^${URL_QUEUE_ID_PREFIX}`),
            },
          },
        });
      });
    });

    describe('when model is "Url"', () => {
      it("should generate ID prefixed for Url model", async () => {
        const params = {
          action: "create",
          model: "Url",
          args: {
            data: {
              // any url data
            },
          },
        } as Prisma.MiddlewareParams;
        const nextSpy = vi.fn();

        await generateModelId(params, nextSpy);

        expect(nextSpy).toHaveBeenCalledWith({
          ...params,
          args: {
            ...params.args,
            data: {
              ...params.args.data,
              id: expect.stringMatching(`^${URL_ID_PREFIX}`),
            },
          },
        });
      });
    });

    describe('when model is "UserUrl"', () => {
      it("should generate ID prefixed for UserUrl model", async () => {
        const params = {
          action: "create",
          model: "UserUrl",
          args: {
            data: {
              // any url data
            },
          },
        } as Prisma.MiddlewareParams;
        const nextSpy = vi.fn();

        await generateModelId(params, nextSpy);

        expect(nextSpy).toHaveBeenCalledWith({
          ...params,
          args: {
            ...params.args,
            data: {
              ...params.args.data,
              id: expect.stringMatching(`^${USER_URL_ID_PREFIX}`),
            },
          },
        });
      });
    });

    describe('when model is "Feed"', () => {
      it("should generate ID prefixed for Feed model", async () => {
        const params = {
          action: "create",
          model: "Feed",
          args: {
            data: {
              // any url data
            },
          },
        } as Prisma.MiddlewareParams;
        const nextSpy = vi.fn();

        await generateModelId(params, nextSpy);

        expect(nextSpy).toHaveBeenCalledWith({
          ...params,
          args: {
            ...params.args,
            data: {
              ...params.args.data,
              id: expect.stringMatching(`^${FEED_ID_PREFIX}`),
            },
          },
        });
      });
    });

    describe('when model is "FeedQueue"', () => {
      it("should generate ID prefixed for FeedQueue model", async () => {
        const params = {
          action: "create",
          model: "FeedQueue",
          args: {
            data: {
              // any url data
            },
          },
        } as Prisma.MiddlewareParams;
        const nextSpy = vi.fn();

        await generateModelId(params, nextSpy);

        expect(nextSpy).toHaveBeenCalledWith({
          ...params,
          args: {
            ...params.args,
            data: {
              ...params.args.data,
              id: expect.stringMatching(`^${FEED_QUEUE_ID_PREFIX}`),
            },
          },
        });
      });
    });
  });

  describe('for "createMany" action', () => {
    describe('when model is "Feed"', () => {
      it("should generate ID prefixed for every Feed model on the list", async () => {
        const userId = generateUserId();
        const data = new Array(10).fill(null).map(() => {
          return createFeed({ userId, id: ID_PLACEHOLDER_REPLACED_BY_ID_GENERATOR });
        });
        const params = {
          action: "createMany",
          model: "Feed",
          args: {
            data,
          },
        } as Prisma.MiddlewareParams;
        const nextSpy = vi.fn();

        await generateModelId(params, nextSpy);

        const itemsInData: ReadonlyArray<Feed> = nextSpy.mock.calls[0][0].args.data;
        const hasFeedIdGenerated = ({ id }: Feed) => id.startsWith(FEED_ID_PREFIX);

        itemsInData.forEach((item) => {
          expect(item).toSatisfy(hasFeedIdGenerated);
        });
      });
    });
  });

  describe('for "upsert" action', () => {
    describe('when model is "UserProfileData"', () => {
      it("should generate ID prefixed for creation of UserProfileData model", async () => {
        const params = {
          action: "upsert",
          model: "UserProfileData",
          args: {
            create: {
              // any url data
            },
          },
        } as Prisma.MiddlewareParams;
        const nextSpy = vi.fn();

        await generateModelId(params, nextSpy);

        expect(nextSpy).toHaveBeenCalledWith({
          ...params,
          args: {
            ...params.args,
            create: {
              ...params.args.data,
              id: expect.stringMatching(`^${USER_PROFILE_DATA_ID_PREFIX}`),
            },
          },
        });
      });
    });
  });
});
