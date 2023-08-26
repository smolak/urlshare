import { generateUserProfileDataId, USER_PROFILE_DATA_ID_PREFIX } from "./generate-user-profile-data-id";

describe("generateUserProfileDataId", () => {
  it("should prefix id with user profile data prefix", () => {
    const id = generateUserProfileDataId();

    const pattern = `^${USER_PROFILE_DATA_ID_PREFIX}`;
    expect(id).toMatch(new RegExp(pattern));
  });
});
