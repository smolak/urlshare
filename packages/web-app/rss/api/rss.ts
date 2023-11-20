import { Category, prisma, UserProfileData } from "@urlshare/db/prisma/client";
import { decompressMetadata } from "@urlshare/metadata/compression";
import { generateRssFeed } from "@urlshare/rss/utils/generate-rss-feed";
import { createPossessiveForm } from "@urlshare/shared/utils/create-possessive-form";
import { ServerResponse } from "http";
import getConfig from "next/config";

import { CategoryId } from "../../category/schemas/category-id.schema";
import { sortAZ } from "../../category/utils/sort-a-z";
import { WEB_APP_BASE_URL, WEB_APP_DOMAIN } from "../../constants";
import { getUserFeedQuery } from "../../feed/queries/get-user-feed";
import { FeedSource } from "../../feed/ui/user-feed-source-selector/feed-source";

type RequiredUserData = Pick<UserProfileData, "username" | "userId">;
type GenerateRss = (
  {
    userData,
    feedSource,
    categoryIds,
  }: { userData: RequiredUserData; feedSource: FeedSource; categoryIds: CategoryId[] },
  res: ServerResponse
) => Promise<void>;

const createTitle = (username: UserProfileData["username"]) => `${createPossessiveForm(username)} URLs`;

export const generateRss: GenerateRss = async ({ userData, feedSource, categoryIds }, res) => {
  const { userId, username } = userData;
  const itemsPerUserChannel = getConfig().serverRuntimeConfig.rss.itemsPerUserChannel;
  let filteredCategoryIds: string[] = [];
  let filteredCategoryNames: Category["name"][] = [];

  if (categoryIds.length > 0) {
    const userCategories = await prisma.category.findMany({
      where: {
        userId,
      },
    });

    filteredCategoryIds = userCategories.filter(({ id }) => categoryIds.indexOf(id) !== -1).map(({ id }) => id);
    filteredCategoryNames = userCategories.filter(({ id }) => categoryIds.indexOf(id) !== -1).map(({ name }) => name);
  }

  const feedRawEntries = await getUserFeedQuery({
    userId,
    limit: itemsPerUserChannel,
    feedSource,
    categoryIds: filteredCategoryIds,
  });

  const channel = {
    title: createTitle(username),
    link: `${WEB_APP_BASE_URL}/${username}`,
    description: `Links added by ${username} @ ${WEB_APP_DOMAIN}`,
    categories: filteredCategoryNames.sort(sortAZ),
    items: feedRawEntries.map((feedRawEntry) => {
      const metadata = decompressMetadata(feedRawEntry.url_metadata);

      return {
        title: metadata.title || "",
        description: metadata.description || "",
        link: feedRawEntry.url_url,
        pubDate: new Date(feedRawEntry.feed_createdAt).toUTCString(),
        categories: feedRawEntry.category_names ? feedRawEntry.category_names.split(",").sort(sortAZ) : [],
      };
    }),
  };

  const rss = generateRssFeed(channel).trim();

  res.setHeader("Content-Type", "text/xml");
  res.write(rss);
  res.end();
};
