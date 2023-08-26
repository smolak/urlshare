import { expect } from "vitest";

import { normalizeUsername } from "./normalize-username";

describe("normalizeUsername", () => {
  it("should lowercase passed username", () => {
    const usernames = [
      { input: "jacek", output: "jacek" },
      { input: "JACEK", output: "jacek" },
      { input: "Jacek", output: "jacek" },
      { input: "JaCeK", output: "jacek" },
      { input: "jaCek", output: "jacek" },
    ];

    usernames.forEach(({ input, output }) => {
      expect(normalizeUsername(input)).toEqual(output);
    });
  });
});
