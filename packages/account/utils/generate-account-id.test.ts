import { ACCOUNT_ID_PREFIX, generateAccountId } from "./generate-account-id";

describe("generateAccountId", () => {
  it("should prefix id with account prefix", () => {
    const id = generateAccountId();

    const pattern = `^${ACCOUNT_ID_PREFIX}`;
    expect(id).toMatch(new RegExp(pattern));
  });
});
