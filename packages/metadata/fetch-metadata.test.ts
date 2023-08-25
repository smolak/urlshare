import nock from "nock";
import { fetchMetadata } from "./fetch-metadata";
import { afterEach } from "vitest";
import { getTweetId, TWITTER_METADATA_URL } from "./fetch-adapters/twitter";
import { tweetExampleMetadata } from "../../test/fixtures/tweet-example-metadata";

describe("fetchMetadata", () => {
  beforeEach(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  describe("when the url is a Twitter Tweet / X Xeet (?)", () => {
    const tweetUrl = "https://twitter.com/ValaAfshar/status/1684664268547837952";

    it("should use twitter fetch adapter", async () => {
      const url = new URL(TWITTER_METADATA_URL);
      const scope = nock(url.origin)
        .get(url.pathname)
        .query({ id: getTweetId(tweetUrl) })
        .reply(200, tweetExampleMetadata);

      await fetchMetadata(tweetUrl);

      scope.done();
    });
  });

  describe("when the url is pointing to anything else", () => {
    const otherUrl = "https://urlshare.me/whatever";

    it("should use default fetch adapter", async () => {
      const url = new URL(otherUrl);
      const scope = nock(url.origin).head(url.pathname).reply(200);

      await fetchMetadata(otherUrl);

      scope.done();
    });
  });
});
