import _getMetadata from "metadata-scraper";

import { Metadata } from "../../types";

type URL = string;

export type GetMetadata = (url: URL, html?: string) => Promise<Metadata>;

export const getMetadata: GetMetadata = async (url, html) => {
  const options = {
    url,
    html,
  };

  return (await _getMetadata(options)) as unknown as Promise<Metadata>;
};
