import { prisma } from "@urlshare/db/prisma/client";
import { FeedVM, toFeedVM } from "@urlshare/web-app/feed/models/feed.vm";
import { getUserFeedQuery } from "@urlshare/web-app/feed/queries/get-user-feed";
import { FeedList } from "@urlshare/web-app/feed/ui/user-feed-list/feed-list";
import { InfiniteUserFeed } from "@urlshare/web-app/feed/ui/user-feed-list/infinite-user-feed";
import { UserFeedSourceSelector } from "@urlshare/web-app/feed/ui/user-feed-source-selector";
import { feedSourceSchema } from "@urlshare/web-app/feed/ui/user-feed-source-selector/feed-source";
import { ThreeColumnLayout } from "@urlshare/web-app/ui/three-column.layout";
import { PUBLIC_USER_PROFILE_DATA_SELECT_FRAGMENT } from "@urlshare/web-app/user-profile-data/models/fragments";
import { PublicUserProfileDataVM } from "@urlshare/web-app/user-profile-data/models/public-user-profile-data.vm";
import { usernameSchema } from "@urlshare/web-app/user-profile-data/schemas/user-profile-data.schema";
import { UserProfileCard } from "@urlshare/web-app/user-profile-data/ui/user-profile-card";
import { StatusCodes } from "http-status-codes";
import { RssIcon } from "lucide-react";
import { GetServerSideProps, NextPage } from "next";
import getConfig from "next/config";
import Link from "next/link";
import { getToken } from "next-auth/jwt";

type Self = {
  id: string;
} | null;

type UserProfilePageProps =
  | {
      self: Self;
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
      feed: ReadonlyArray<FeedVM>;
      itemsPerPage: number;
    }
  | {
      userData: null;
      feed: null;
      error: string;
      errorCode: number;
    };

const createForm = (username: PublicUserProfileDataVM["username"]): string => {
  const endsWithS = username.substring(username.length - 1).toLowerCase() === "s";

  return endsWithS ? `${username}'` : `${username}'s`;
};

const UserProfilePage: NextPage<UserProfilePageProps> = (props) => {
  if (props.userData) {
    const { self, userData, feed, itemsPerPage } = props;
    const iAmLoggedIn = Boolean(self?.id);
    const myProfile = Boolean(self?.id && self.id === userData.id);
    const canFollow = !myProfile && iAmLoggedIn;

    return (
      <ThreeColumnLayout
        mainContent={
          <section>
            <div className="mb-5 flex items-center justify-between">
              <h1 className="text-lg font-bold">{myProfile ? "My URLs" : `${createForm(userData.username)} URLs`}</h1>
              <Link href={`${userData.username}/rss.xml`} className="-mt-3 p-3">
                <RssIcon size={16} />
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              <UserFeedSourceSelector className="md:max-w-[420px]" author={myProfile ? "Me" : userData.username} />
              {feed.length > 0 ? (
                <>
                  <FeedList feed={feed} />
                  {feed.length === itemsPerPage && (
                    <InfiniteUserFeed userId={userData.id} from={feed[feed.length - 1].createdAt} />
                  )}
                </>
              ) : (
                <div>No URLs yet.</div>
              )}
            </div>
          </section>
        }
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

export default UserProfilePage;

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  const username = query.username;
  const parsingResult = usernameSchema.safeParse(username);

  if (!parsingResult.success) {
    res.statusCode = StatusCodes.NOT_FOUND;

    return {
      props: { error: parsingResult.error.message, errorCode: StatusCodes.NOT_FOUND, userData: null, urls: null },
    };
  }

  const token = await getToken({ req });
  const self = token
    ? {
        id: token.sub as string,
      }
    : null;

  const maybePublicUserData = await prisma.userProfileData.findUnique({
    where: {
      username: parsingResult.data,
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

  const feedSource = feedSourceSchema.parse(query.source);
  const itemsPerPage = getConfig().serverRuntimeConfig.userFeedList.itemsPerPage;
  const feedRawEntries = await getUserFeedQuery({
    userId: maybePublicUserData.userId,
    limit: itemsPerPage,
    feedSource,
  });

  const feed = feedRawEntries.map(toFeedVM);
  const { userId, createdAt, ...userData } = maybePublicUserData;
  const serializedUserData = {
    ...userData,
    id: userId,
    createdAt: createdAt?.toISOString(),
  };

  return { props: { userData: serializedUserData, feed, self, itemsPerPage } };
};
