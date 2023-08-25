import axios from "axios";

import { FetchMetadata } from "../../fetch-metadata";
import { Metadata } from "../../types";
import { TweetMetadata } from "./tweet-metadata.schema";

export const TWITTER_METADATA_URL = "https://cdn.syndication.twimg.com/tweet-result";

export const isTweetUrl = (url: string) => {
  const maybeTweetUrl = new URL(url);

  return maybeTweetUrl.host === "twitter.com" && maybeTweetUrl.pathname.includes("/status/");
};

export const getTweetId = (tweetUrl: string) => {
  const url = new URL(tweetUrl);
  const pathnameParts = url.pathname.split("/status/");

  return pathnameParts[1];
};

const createTweetMetadataUrl = (tweetId: string) => {
  const url = new URL(TWITTER_METADATA_URL);
  url.searchParams.set("id", tweetId);

  return url.toString();
};

const fetchTweetDetails = async (tweetId: string) => {
  const { data } = await axios.get<TweetMetadata>(createTweetMetadataUrl(tweetId));

  return data;
};

export const toMetadata = (tweetUrl: string, tweetDetails: TweetMetadata): Metadata => {
  return {
    author: tweetDetails.user.screen_name,
    contentType: "text/html",
    description: tweetDetails.text,
    icon: tweetDetails.user.profile_image_url_https,
    image: tweetDetails.mediaDetails?.[0].media_url_https,
    keywords: tweetDetails.entities.hashtags.map(({ text }) => text),
    language: tweetDetails.lang,
    provider: "Twitter",
    published: tweetDetails.created_at,
    twitter: tweetUrl,
    type: "tweet",
    url: tweetUrl,
    video: tweetDetails.video?.variants[0].src,
  };
};

export const twitterMetadataFetchAdapter: FetchMetadata = async (tweetUrl: string) => {
  const tweetDetails = await fetchTweetDetails(getTweetId(tweetUrl));

  return toMetadata(tweetUrl, tweetDetails);
};
