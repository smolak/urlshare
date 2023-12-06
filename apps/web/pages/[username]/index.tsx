import { prisma } from "@urlshare/db/prisma/client";
import { createPossessiveForm } from "@urlshare/shared/utils/create-possessive-form";
import { generateId } from "@urlshare/shared/utils/generate-id";
import { CategoryVM, toCategoryVM } from "@urlshare/web-app/category/models/category.vm";
import { createFindManyCategoriesArgs } from "@urlshare/web-app/category/prisma/operations";
import { getCategoryIdsFromSearchQuery } from "@urlshare/web-app/category/utils/get-category-ids-from-search-query";
import { FeedVM, toFeedVM } from "@urlshare/web-app/feed/models/feed.vm";
import { getUserFeedQuery } from "@urlshare/web-app/feed/queries/get-user-feed";
import { FeedListFilters } from "@urlshare/web-app/feed/ui/feed-list-filters";
import { FeedList } from "@urlshare/web-app/feed/ui/user-feed-list/feed-list";
import { InfiniteUserFeed } from "@urlshare/web-app/feed/ui/user-feed-list/infinite-user-feed";
import { feedSourceSchema } from "@urlshare/web-app/feed/ui/user-feed-source-selector/feed-source";
import { RssLink } from "@urlshare/web-app/rss/ui/rss-link";
import { ThreeColumnLayout } from "@urlshare/web-app/ui/three-column.layout";
import { PUBLIC_USER_PROFILE_DATA_SELECT_FRAGMENT } from "@urlshare/web-app/user-profile-data/models/fragments";
import { usernameSchema } from "@urlshare/web-app/user-profile-data/schemas/user-profile-data.schema";
import { UserProfileCard } from "@urlshare/web-app/user-profile-data/ui/user-profile-card";
import { StatusCodes } from "http-status-codes";
import { GetServerSideProps, NextPage } from "next";
import getConfig from "next/config";
import { getToken } from "next-auth/jwt";

type Self = {
  id: string;
} | null;

type UserData = {
  id: string;
  username: string;
  image: string;
  followers: number;
  following: number;
  likes: number;
  createdAt: string;
  urlsCount: number;
};

type UserProfilePageProps =
  | {
      error: null;
      data: {
        self: Self;
        userData: UserData;
        feed: ReadonlyArray<FeedVM>;
        categories: ReadonlyArray<CategoryVM>;
        itemsPerPage: number;
        hash: string;
      };
    }
  | {
      error: {
        message: string;
        code: number;
      };
      data: null;
    };

const UserProfilePage: NextPage<UserProfilePageProps> = (props) => {
  if (!props.error) {
    const { self, userData, feed, itemsPerPage, categories, hash } = props.data;
    const maybeUserId = self?.id;
    const iAmLoggedIn = Boolean(maybeUserId);
    const myProfile = Boolean(maybeUserId === userData.id);
    const canFollow = !myProfile && iAmLoggedIn;

    return (
      <ThreeColumnLayout
        mainContent={
          <section>
            <div className="mb-5 flex items-center justify-between">
              <h1 className="text-lg font-bold">
                {myProfile ? "My URLs" : `${createPossessiveForm(userData.username)} URLs`}
              </h1>
              <RssLink username={userData.username} />
            </div>
            <div className="flex flex-col gap-4">
              <FeedListFilters categories={categories} username={myProfile ? "Me" : userData.username} />
              {feed.length > 0 ? (
                <>
                  <FeedList feed={feed} viewerId={maybeUserId} key={hash} />
                  {feed.length === itemsPerPage && (
                    <InfiniteUserFeed
                      viewerId={maybeUserId}
                      userId={userData.id}
                      from={feed[feed.length - 1].createdAt}
                    />
                  )}
                </>
              ) : (
                <div className="rounded rounded-xl bg-gray-50 p-10">
                  <h2 className="text-md font-bold">No URLs yet.</h2>
                </div>
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

export const getServerSideProps: GetServerSideProps<UserProfilePageProps> = async ({ req, res, query }) => {
  const username = query.username;
  const parsingResult = usernameSchema.safeParse(username);

  if (!parsingResult.success) {
    res.statusCode = StatusCodes.NOT_FOUND;

    return {
      props: { error: { message: parsingResult.error.message, code: StatusCodes.NOT_FOUND }, data: null },
    };
  }

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
        error: {
          message: `User with username: '${parsingResult.data}' not found.`,
          code: StatusCodes.NOT_FOUND,
        },
        data: null,
      },
    };
  }

  const token = await getToken({ req });
  const self = token
    ? {
        id: token.sub as string,
      }
    : null;

  const feedSource = feedSourceSchema.parse(query.source);
  const categoryIds = getCategoryIdsFromSearchQuery(query.categories);
  const itemsPerPage = getConfig().serverRuntimeConfig.userFeedList.itemsPerPage;

  const categories = await prisma.category
    .findMany(createFindManyCategoriesArgs(maybePublicUserData.userId))
    .then((categories) => {
      return categories.map(toCategoryVM);
    });

  // Make sure only the user-owned category IDs are used, and not all passed from URL.
  const filteredCategoryIds = categories.filter(({ id }) => categoryIds.indexOf(id) !== -1).map(({ id }) => id);

  const feedRawEntries = await getUserFeedQuery({
    userId: maybePublicUserData.userId,
    limit: itemsPerPage,
    feedSource,
    categoryIds: filteredCategoryIds,
  });

  const feed = feedRawEntries.map(toFeedVM);
  const { userId, createdAt, ...userData } = maybePublicUserData;
  const serializedUserData = {
    ...userData,
    id: userId,
    createdAt: createdAt?.toISOString(),
  };

  const hash = generateId();

  return {
    props: {
      data: {
        userData: serializedUserData,
        feed,
        self,
        itemsPerPage,
        categories,
        hash,
      },
      error: null,
    },
  };
};
