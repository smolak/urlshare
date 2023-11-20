import { prisma } from "@urlshare/db/prisma/client";
import { getCategoryIdsFromSearchQuery } from "@urlshare/web-app/category/utils/get-category-ids-from-search-query";
import { feedSourceSchema } from "@urlshare/web-app/feed/ui/user-feed-source-selector/feed-source";
import { generateRss } from "@urlshare/web-app/rss/api/rss";
import { usernameSchema } from "@urlshare/web-app/user-profile-data/schemas/user-profile-data.schema";
import { StatusCodes } from "http-status-codes";
import { GetServerSideProps, NextPage } from "next";

type RssProps = {
  error?: string;
  errorCode: StatusCodes;
};

const RssXml: NextPage<RssProps> = (props) => {
  if (props.error) {
    return <div>{props.error}</div>;
  }

  return null;
};

export const getServerSideProps: GetServerSideProps = async ({ res, query }) => {
  const username = query.username;
  const parsingResult = usernameSchema.safeParse(username);

  if (!parsingResult.success) {
    res.statusCode = StatusCodes.NOT_FOUND;

    // logger with error from zod

    return {
      props: {
        error: `User with username: '${String(username).trim()}' not found.`,
        errorCode: StatusCodes.NOT_FOUND,
      },
    };
  }

  const maybePublicUserData = await prisma.userProfileData.findUnique({
    where: {
      username: parsingResult.data,
    },
    select: {
      username: true,
      userId: true,
    },
  });

  if (maybePublicUserData === null) {
    res.statusCode = StatusCodes.NOT_FOUND;

    return {
      props: {
        error: `User with username: '${parsingResult.data}' not found.`,
        errorCode: StatusCodes.NOT_FOUND,
      },
    };
  }

  const feedSource = feedSourceSchema.parse(query.source);
  const categoryIds = getCategoryIdsFromSearchQuery(query.categories);

  await generateRss({ userData: maybePublicUserData, feedSource, categoryIds }, res);

  return { props: {} };
};

export default RssXml;
