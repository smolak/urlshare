import { NonEmptyArray } from "@urlshare/shared/types";
import { z } from "zod";

export const feedSources = [
  { label: "All", value: "default" },
  { label: "Author", value: "author" },
] as const;

export type FeedSourceLabel = (typeof feedSources)[number]["label"];
export type FeedSourceValue = (typeof feedSources)[number]["value"];

export const DEFAULT_FEED_SOURCE: FeedSourceValue = "default";

const feedSourceValues = feedSources.map(({ value }) => value) as NonEmptyArray<FeedSourceValue>;

export const feedSourceSchema = z.enum(feedSourceValues).catch(DEFAULT_FEED_SOURCE);
