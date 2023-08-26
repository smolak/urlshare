import { prisma, User, UserProfileData } from "@urlshare/db/prisma/client";
import { YesNo } from "@urlshare/shared/types";

type ProfileData = Pick<UserProfileData, "username" | "image" | "createdAt">;
type ProfileFollowingMe = { isFollowingMe: YesNo };
type ProfileIFollow = { iFollow: YesNo };

type FollowingMyProfile = ReadonlyArray<ProfileData & ProfileFollowingMe>;
type FollowingNotMyProfileIAmLoggedIn = ReadonlyArray<ProfileData & ProfileFollowingMe & ProfileIFollow>;
type FollowingAnyProfileIAmNotLoggedIn = ReadonlyArray<ProfileData>;

export type FollowingRawEntries =
  | FollowingMyProfile
  | FollowingNotMyProfileIAmLoggedIn
  | FollowingAnyProfileIAmNotLoggedIn;

export const getFollowingQuery = (userId: User["id"], viewerId: User["id"] | null) => {
  const myProfile = userId === viewerId;
  const notMyProfileIAmLoggedIn = viewerId !== null && !myProfile;

  if (myProfile) {
    return prisma.$queryRaw<FollowingMyProfile>`
      SELECT UserProfileData.username, UserProfileData.image,
          CASE WHEN FollowsBack.followingId IS null THEN
              'no'
          ELSE
              'yes'
          END AS isFollowingMe           
      FROM Follows
      LEFT JOIN UserProfileData ON UserProfileData.userId = Follows.followingId
      LEFT JOIN Follows AS FollowsBack
          ON FollowsBack.followingId = Follows.followerId
          AND FollowsBack.followerId = UserProfileData.userId
      WHERE Follows.followerId = ${userId}
      ORDER BY Follows.createdAt DESC
      LIMIT 0, 100
    `;
  }

  if (notMyProfileIAmLoggedIn) {
    return prisma.$queryRaw<FollowingNotMyProfileIAmLoggedIn>`
      SELECT UserProfileData.username, UserProfileData.image,
          CASE WHEN FollowsBack.followingId IS null THEN
              'no'
          ELSE
              'yes'
          END AS isFollowingMe,
          CASE WHEN IFollow.followingId IS null THEN
               'no'
          ELSE
                'yes'
          END AS iFollow 
      FROM Follows
      LEFT JOIN UserProfileData ON UserProfileData.userId = Follows.followingId
      LEFT JOIN Follows AS IFollow
          ON Follows.followingId = IFollow.followingId
          AND IFollow.followerId = ${viewerId}
      LEFT JOIN Follows AS FollowsBack
          ON Follows.followingId = FollowsBack.followerId
          AND FollowsBack.followingId = ${viewerId}
      WHERE Follows.followerId = ${userId}
      ORDER BY Follows.id DESC
      LIMIT 0, 100
    `;
  }

  return prisma.$queryRaw<FollowingAnyProfileIAmNotLoggedIn>`
    SELECT UserProfileData.userId, UserProfileData.username, UserProfileData.image
    FROM UserProfileData
    LEFT JOIN Follows ON UserProfileData.userId = Follows.followingId
    WHERE Follows.followerId = ${userId}
    ORDER BY Follows.createdAt DESC
    LIMIT 0, 100
    `;
};
