import { generateUrlId, URL_ID_PREFIX } from "./generate-url-id";

describe("generateUrlId", () => {
  it("should prefix id with url prefix", () => {
    const id = generateUrlId();

    const pattern = `^${URL_ID_PREFIX}`;
    expect(id).toMatch(new RegExp(pattern));
  });
});
