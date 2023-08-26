import { UserUrl } from "@urlshare/db/prisma/client";

import { generateUrlId } from "../../url/utils/generate-url-id";
import { generateUserId } from "../../user/utils/generate-user-id";
import { generateUserUrlId } from "../utils/generate-user-url-id";

export const createUserUrl = (overwrites: Partial<UserUrl> = {}): UserUrl => ({
  id: generateUserUrlId(),
  userId: generateUserId(),
  urlId: generateUrlId(),
  createdAt: new Date(),
  likes: 0,
  ...overwrites,
});
