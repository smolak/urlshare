import { prisma, User } from "@urlshare/db/prisma/client";
import { FollowersRawEntries, getFollowersQuery } from "@urlshare/web-app/follow-user/queries/get-followers";
import { ThreeColumnLayout } from "@urlshare/web-app/ui/three-column.layout";
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
      data: {
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
      };
      error: null;
    }
  | {
      data: null;
      error: {
        message: string;
        code: number;
      };
    };

const FollowersPage: NextPage<FollowersPageProps> = (props) => {
  if (!props.error) {
    const { viewerId, userData, profiles } = props.data;
    const canFollow = viewerId !== null && viewerId !== userData.id;
    const myProfile = userData.id === viewerId;

    return (
      <ThreeColumnLayout
        mainContent={<FollowersList profiles={profiles} username={userData.username} myProfile={myProfile} />}
        rightColumnContent={<UserProfileCard publicUserProfileData={userData} canFollow={canFollow} />}
      />
    );
  } else {
    return (
      <ThreeColumnLayout
        mainContent={
          <div className="py-10 text-center">
            404 ... <code>{JSON.stringify(props.error)}</code>
          </div>
        }
      />
    );
  }
};

export default FollowersPage;

export const getServerSideProps: GetServerSideProps<FollowersPageProps> = async ({ req, res, query }) => {
  const parsingResult = usernameSchema.safeParse(query.username);

  if (!parsingResult.success) {
    res.statusCode = StatusCodes.NOT_FOUND;

    return {
      props: { error: { message: parsingResult.error.message, code: StatusCodes.NOT_FOUND }, data: null },
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
        error: { message: `User with username: '${parsingResult.data}' not found.`, code: StatusCodes.NOT_FOUND },
        data: null,
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

  return { props: { data: { userData: serializedUserData, profiles: followers, viewerId }, error: null } };
};
