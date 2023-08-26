import { createTRPCRouter } from "../../trpc/server";
import { createUserProfileData } from "./procedures/create-user-profile-data";
import { getPrivateUserProfileData } from "./procedures/get-private-user-profile-data";
import { updateUserProfileData } from "./procedures/update-user-profile-data";
import { usernameCheck } from "./procedures/username-check";

export const userProfileDataRouter = createTRPCRouter({
  getPrivateUserProfileData,
  usernameCheck,
  updateUserProfileData,
  createUserProfileData,
});
