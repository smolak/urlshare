import { generateSessionId, SESSION_ID_PREFIX } from "./generate-session-id";

describe("generateSessionId", () => {
  it("should prefix id with session prefix", () => {
    const id = generateSessionId();

    const pattern = `^${SESSION_ID_PREFIX}`;
    expect(id).toMatch(new RegExp(pattern));
  });
});
