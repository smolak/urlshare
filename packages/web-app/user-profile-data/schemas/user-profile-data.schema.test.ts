import { ALPHABET } from "@urlshare/shared/utils/generate-id";
import { expect } from "vitest";
import { SafeParseError, SafeParseSuccess } from "zod";

import { generateApiKey } from "../../user/utils/generate-api-key";
import { ApiKeySchema, apiKeySchema, UsernameSchema, usernameSchema } from "./user-profile-data.schema";

describe("usernameSchema", () => {
  it("should allow to use _azAZ09 characters only", () => {
    const validUsernames = ["Jacek", "_Jacek", "Jacek_", "Jacek123", "J_a_c_e_k", "__Jacek__", "123_jacek__"];

    validUsernames.forEach((username) => {
      expect(() => usernameSchema.parse(username)).not.toThrow();
    });

    const invalidUsernames = ["with spaces", "nonAZchars_ęóą", "badChars_!@#$%^"];

    invalidUsernames.forEach((username) => {
      const result = usernameSchema.safeParse(username) as SafeParseError<UsernameSchema>;

      expect(result.success).toEqual(false);
      expect(result.error.format()._errors).toContain("Only a-z, A-Z, 0-9 and _ characters allowed.");
    });
  });

  it("should allow for min 4 and max 15 character long values", () => {
    const minLength = 4;
    const maxLength = 15;

    const usernamesWithinLengthLimit = ["a".repeat(minLength), "a".repeat(maxLength)];
    const usernamesOutsideOfLengthLimit = ["a".repeat(minLength - 1), "a".repeat(maxLength + 1)];

    usernamesWithinLengthLimit.forEach((username) => {
      expect(() => usernameSchema.parse(username)).not.toThrow();
    });

    usernamesOutsideOfLengthLimit.forEach((username) => {
      const result = usernameSchema.safeParse(username) as SafeParseError<UsernameSchema>;

      expect(result.success).toEqual(false);
      expect(result.error.format()._errors).toContain(
        "Username cannot be shorter than 4 and longer than 15 characters."
      );
    });
  });

  it("should trim entered string", () => {
    const username = "Jacek";
    const stringsWithSpacesAroundThem = [
      ` ${username}`,
      `${username} `,
      ` ${username} `,
      `   ${username}   `,
      `\n\t   ${username}   \t\n`,
    ];

    stringsWithSpacesAroundThem.forEach((usernameWithSpaces) => {
      const result = usernameSchema.safeParse(usernameWithSpaces) as SafeParseSuccess<UsernameSchema>;

      expect(result.data).toEqual(username);
    });
  });
});

describe("apiKeySchema", () => {
  it("should be exactly 30 characters long", () => {
    const exactLength = 30;
    const tooShort = exactLength - 1;
    const tooLong = exactLength + 1;

    const exactLengthApiKey = "a".repeat(exactLength);
    const tooShortApiKey = "a".repeat(tooShort);
    const tooLongApiKey = "a".repeat(tooLong);

    expect(() => apiKeySchema.parse(exactLengthApiKey)).not.toThrow();

    const tooShortResult = apiKeySchema.safeParse(tooShortApiKey) as SafeParseError<ApiKeySchema>;
    expect(tooShortResult.success).toEqual(false);
    expect(tooShortResult.error.format()._errors).toContain("API Key must be exactly 30 characters long.");

    const tooLongResult = apiKeySchema.safeParse(tooLongApiKey) as SafeParseError<ApiKeySchema>;
    expect(tooLongResult.success).toEqual(false);
    expect(tooLongResult.error.format()._errors).toContain("API Key must be exactly 30 characters long.");
  });

  it("should allow only the ID generator dictionary characters to be used", () => {
    const validApiKey = generateApiKey();

    expect(() => apiKeySchema.parse(validApiKey)).not.toThrow();

    const invalidCharactersExamples = ["ą".repeat(30), "-".repeat(30)];

    invalidCharactersExamples.forEach((apiKey) => {
      const result = apiKeySchema.safeParse(apiKey) as SafeParseError<ApiKeySchema>;

      expect(result.success).toEqual(false);
      expect(result.error.format()._errors).toContain(`Only ${ALPHABET} characters allowed.`);
    });
  });

  it("should trim entered API key", () => {
    const apiKey = "a".repeat(30);
    const apiKeysWithSpacesAroundThem = [
      ` ${apiKey}`,
      `${apiKey} `,
      ` ${apiKey} `,
      `   ${apiKey}   `,
      `\n\t   ${apiKey}   \t\n`,
    ];

    apiKeysWithSpacesAroundThem.forEach((apiKeyWithSpaces) => {
      const result = apiKeySchema.safeParse(apiKeyWithSpaces) as SafeParseSuccess<ApiKeySchema>;

      expect(result.data).toEqual(apiKey);
    });
  });
});
