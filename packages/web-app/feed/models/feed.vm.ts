import { Category, Feed, Url, User, UserProfileData, UserUrl } from "@urlshare/db/prisma/client";
import { decompressMetadata } from "@urlshare/metadata/compression";
import { Metadata } from "@urlshare/metadata/types";

import { RawFeedEntry } from "../queries/get-user-feed";

export const toFeedVM = (entry: RawFeedEntry): FeedVM => {
  return {
    id: entry.feed_id,
    createdAt: entry.feed_createdAt.toISOString(),
    user: {
      image: entry.user_image,
      username: entry.user_username,
    },
    url: {
      url: entry.url_url,
      metadata: decompressMetadata(entry.url_metadata),
      likes: Number(entry.url_likes),
      liked: entry.feed_liked,
      categoryNames: entry.category_names ? entry.category_names.split(",") : [],
    },
    userUrlId: entry.userUrl_id,
  };
};

type ISODateString = string;

export type FeedVM = {
  id: Feed["id"];
  createdAt: ISODateString;
  user: {
    image: User["image"];
    username: UserProfileData["username"];
  };
  url: {
    url: Url["url"];
    metadata: Metadata;
    liked: Feed["liked"];
    likes: UserUrl["likes"];
    categoryNames: Category["name"][];
  };
  userUrlId: UserUrl["id"];
};
