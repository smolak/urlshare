import { FEED_ID_PREFIX, generateFeedId } from "./generate-feed-id";

describe("generateFeedId", () => {
  it("should prefix id with feed prefix", () => {
    const id = generateFeedId();

    const pattern = `^${FEED_ID_PREFIX}`;
    expect(id).toMatch(new RegExp(pattern));
  });
});
