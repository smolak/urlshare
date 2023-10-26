import { User } from "@prisma/client";
import { InfiniteData } from "@tanstack/react-query";
import { FC } from "react";

import { api } from "../../../trpc/client";
import { FeedVM } from "../../models/feed.vm";
import { GetUserFeedResponse } from "../../router/procedures/get-user-feed";
import { ErrorLoadingFeed } from "../error-loading-feed";
import { LoadingFeed } from "../loading-feed";
import { InfiniteFeedList } from "./infinite-feed-list";

const aggregateFeeds = (data: InfiniteData<GetUserFeedResponse>) => {
  return data.pages.reduce((acc, page) => {
    return acc.concat(page.feed);
  }, [] as FeedVM[]);
};

const getNextCursor = (data: InfiniteData<GetUserFeedResponse>) => {
  return data?.pages[data?.pages.length - 1].nextCursor;
};

type InfiniteUserFeedProps = {
  from?: FeedVM["createdAt"];
  userId: User["id"];
};

export const InfiniteUserFeed: FC<InfiniteUserFeedProps> = ({ userId, from }) => {
  const { data, isLoading, isError, fetchNextPage, isFetchingNextPage } = api.feed.getUserFeed.useInfiniteQuery(
    {
      userId,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: from && new Date(from),
    }
  );

  if (isLoading) {
    return <LoadingFeed />;
  }

  if (isError) {
    return <ErrorLoadingFeed />;
  }

  const feed = aggregateFeeds(data);
  const shouldLoadMore = Boolean(getNextCursor(data));

  if (feed.length === 0) {
    return (
      <div className="rounded rounded-xl bg-gray-50 p-10">
        <h2 className="text-md font-bold">No URLs yet. Add some!</h2>
      </div>
    );
  }

  return (
    <InfiniteFeedList
      feed={feed}
      loadMore={fetchNextPage}
      shouldLoadMore={shouldLoadMore}
      isFetching={isFetchingNextPage}
    />
  );
};
