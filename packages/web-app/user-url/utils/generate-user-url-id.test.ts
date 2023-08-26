import { generateUserUrlId, USER_URL_ID_PREFIX } from "./generate-user-url-id";

describe("generateUserUrlId", () => {
  it("should prefix id with user url prefix", () => {
    const id = generateUserUrlId();

    const pattern = `^${USER_URL_ID_PREFIX}`;
    expect(id).toMatch(new RegExp(pattern));
  });
});
