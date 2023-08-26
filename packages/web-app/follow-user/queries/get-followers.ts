import { prisma, User, UserProfileData } from "@urlshare/db/prisma/client";
import { YesNo } from "@urlshare/shared/types";

type ProfileData = Pick<UserProfileData, "username" | "image" | "createdAt">;
type ProfileFollowingMe = { isFollowingMe: YesNo };
type ProfileIFollow = { iFollow: YesNo };

type FollowersOfMyProfile = ReadonlyArray<ProfileData & ProfileIFollow>;
type FollowersOfNotMyProfileIAmLoggedIn = ReadonlyArray<ProfileData & ProfileFollowingMe & ProfileIFollow>;
type FollowersOfAnyProfileIAmNotLoggedIn = ReadonlyArray<ProfileData>;

export type FollowersRawEntries =
  | FollowersOfMyProfile
  | FollowersOfNotMyProfileIAmLoggedIn
  | FollowersOfAnyProfileIAmNotLoggedIn;

export const getFollowersQuery = (userId: User["id"], viewerId: User["id"] | null) => {
  const myProfile = userId === viewerId;
  const notMyProfileIAmLoggedIn = viewerId !== null && !myProfile;

  if (myProfile) {
    return prisma.$queryRaw<FollowersOfMyProfile>`
      SELECT UserProfileData.userId, UserProfileData.username, UserProfileData.image,
          CASE WHEN IFollow.followerId IS null THEN
            'no'
          ELSE
            'yes'
          END AS iFollow
      FROM Follows
      LEFT JOIN UserProfileData ON UserProfileData.userId = Follows.followerId
      LEFT JOIN Follows AS IFollow
          ON IFollow.followerId = Follows.followingId
          AND IFollow.followingId = UserProfileData.userId
      WHERE Follows.followingId = ${userId}
      ORDER BY Follows.createdAt DESC
      LIMIT 0, 100
  `;
  }

  if (notMyProfileIAmLoggedIn) {
    return prisma.$queryRaw<FollowersOfNotMyProfileIAmLoggedIn>`
      SELECT UserProfileData.userId, UserProfileData.username, UserProfileData.image,
          CASE WHEN IFollow.followerId IS null THEN
            'no'
          ELSE
            'yes'
          END AS iFollow,
          CASE WHEN FollowsBack.followerId IS null THEN
            'no'
          ELSE
            'yes'
          END AS isFollowingMe
      FROM Follows
      LEFT JOIN UserProfileData ON UserProfileData.userId = Follows.followerId
      LEFT JOIN Follows AS IFollow
          ON Follows.followerId = IFollow.followingId
          AND IFollow.followerId = ${viewerId}
      LEFT JOIN Follows AS FollowsBack
          ON Follows.followerId = FollowsBack.followerId
          AND FollowsBack.followingId = ${viewerId}
      WHERE Follows.followingId = ${userId}
      ORDER BY Follows.createdAt DESC
      LIMIT 0, 100
  `;
  }

  return prisma.$queryRaw<FollowersOfAnyProfileIAmNotLoggedIn>`
    SELECT UserProfileData.userId, UserProfileData.username, UserProfileData.image
    FROM UserProfileData
    LEFT JOIN Follows ON UserProfileData.userId = Follows.followerId
    WHERE Follows.followingId = ${userId}
    ORDER BY Follows.createdAt DESC
    LIMIT 0, 100
  `;
};
