import { Prisma } from "@urlshare/db/prisma/client";

export const PUBLIC_USER_PROFILE_DATA_SELECT_FRAGMENT: Prisma.UserProfileDataSelect = {
  username: true,
  image: true,
  followers: true,
  following: true,
  likes: true,
  createdAt: true,
  urlsCount: true,
};
