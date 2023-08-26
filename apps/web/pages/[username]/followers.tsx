import { prisma, User } from "@urlshare/db/prisma/client";
import { FollowersRawEntries, getFollowersQuery } from "@urlshare/web-app/follow-user/queries/get-followers";
import { FollowingFollowersLayout } from "@urlshare/web-app/user-profile-data/layouts/following-followers.layout";
import { PUBLIC_USER_PROFILE_DATA_SELECT_FRAGMENT } from "@urlshare/web-app/user-profile-data/models/fragments";
import { usernameSchema } from "@urlshare/web-app/user-profile-data/schemas/user-profile-data.schema";
import { FollowersList } from "@urlshare/web-app/user-profile-data/ui/followers-list";
import { UserProfileCard } from "@urlshare/web-app/user-profile-data/ui/user-profile-card";
import { StatusCodes } from "http-status-codes";
import { GetServerSideProps, NextPage } from "next";
import { getToken } from "next-auth/jwt";

type ViewerId = User["id"] | null;

type FollowersPageProps =
  | {
      viewerId: ViewerId;
      userData: {
        id: string;
        username: string;
        image: string;
        followers: number;
        following: number;
        likes: number;
        createdAt: string;
        urlsCount: number;
      };
      profiles: FollowersRawEntries;
    }
  | {
      userData: null;
      feed: null;
      error: string;
      errorCode: number;
    };

const FollowersPage: NextPage<FollowersPageProps> = (props) => {
  if (props.userData) {
    const { viewerId, userData, profiles } = props;
    const canFollow = viewerId !== null && viewerId !== userData.id;
    const myProfile = userData.id === viewerId;

    return (
      <FollowingFollowersLayout
        mainContent={<FollowersList profiles={profiles} username={userData.username} myProfile={myProfile} />}
        rightColumnContent={<UserProfileCard publicUserProfileData={userData} canFollow={canFollow} />}
      />
    );
  } else {
    return (
      <div>
        404 ... <code>{JSON.stringify(props.error)}</code>
      </div>
    );
  }
};

export default FollowersPage;

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  const parsingResult = usernameSchema.safeParse(query.username);

  if (!parsingResult.success) {
    res.statusCode = StatusCodes.NOT_FOUND;

    return {
      props: { error: parsingResult.error.message, errorCode: StatusCodes.NOT_FOUND, userData: null, urls: null },
    };
  }

  const token = await getToken({ req });
  const viewerId = token ? (token.sub as string) : null;
  const username = parsingResult.data;

  const maybePublicUserData = await prisma.userProfileData.findUnique({
    where: {
      username,
    },
    select: {
      ...PUBLIC_USER_PROFILE_DATA_SELECT_FRAGMENT,
      userId: true,
    },
  });

  if (maybePublicUserData === null) {
    res.statusCode = StatusCodes.NOT_FOUND;

    return {
      props: {
        error: `User with username: '${parsingResult.data}' not found.`,
        errorCode: StatusCodes.NOT_FOUND,
        userData: null,
        feed: null,
      },
    };
  }

  const { userId, createdAt, ...userData } = maybePublicUserData;
  const serializedUserData = {
    ...userData,
    id: userId,
    createdAt: createdAt?.toISOString(),
  };

  const followers = await getFollowersQuery(maybePublicUserData.userId, viewerId);

  return { props: { userData: serializedUserData, profiles: followers, viewerId } };
};
