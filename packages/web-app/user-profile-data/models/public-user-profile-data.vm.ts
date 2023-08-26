import { UserProfileData } from "@urlshare/db/prisma/client";

export type PublicUserProfileDataVM = Pick<
  UserProfileData,
  "username" | "image" | "following" | "followers" | "likes" | "urlsCount"
> & {
  id: UserProfileData["userId"];
  createdAt: UserProfileData["createdAt"] | string;
};

export const toPublicUserProfileDataVM = ({
  username,
  image,
  following,
  followers,
  likes,
  createdAt,
  userId,
  urlsCount,
}: UserProfileData): PublicUserProfileDataVM => {
  return { username, image, following, followers, createdAt, id: userId, likes: Number(likes), urlsCount };
};
