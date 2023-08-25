import { Metadata } from "./types";
import { twitterMetadataFetchAdapter, isTweetUrl } from "./fetch-adapters/twitter";
import { defaultMetadataFetchAdapter } from "./fetch-adapters/default";

export type FetchMetadata = (url: string) => Promise<Metadata>;

export const fetchMetadata: FetchMetadata = async (url) => {
  if (isTweetUrl(url)) {
    return await twitterMetadataFetchAdapter(url);
  }

  return await defaultMetadataFetchAdapter(url);
};
