import { Feed } from "@prisma/client";

import { generateUserId } from "../../user/utils/generate-user-id";
import { generateUserUrlId } from "../../user-url/utils/generate-user-url-id";
import { generateFeedId } from "../utils/generate-feed-id";

export const createFeed = (overwrites: Partial<Feed> = {}): Feed => ({
  id: generateFeedId(),
  userId: generateUserId(),
  userUrlId: generateUserUrlId(),
  createdAt: new Date(),
  updatedAt: new Date(),
  liked: false,
  ...overwrites,
});
