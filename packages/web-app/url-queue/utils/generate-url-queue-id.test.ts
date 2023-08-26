import { generateUrlQueueId, URL_QUEUE_ID_PREFIX } from "./generate-url-queue-id";

describe("generateUrlQueueId", () => {
  it("should prefix id with url queue prefix", () => {
    const id = generateUrlQueueId();

    const pattern = `^${URL_QUEUE_ID_PREFIX}`;
    expect(id).toMatch(new RegExp(pattern));
  });
});
