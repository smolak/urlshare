import { sha1 } from "@urlshare/crypto/sha1";
import { Prisma, Url } from "@urlshare/db/prisma/client";
import { compressMetadata } from "@urlshare/metadata/compression";
import { createExampleWebsiteMetadata } from "@urlshare/metadata/fetch-adapters/default/fixtures/example-metadata";

import { generateUrlId } from "../utils/generate-url-id";

const url = "https://example.url";

export const createUrlEntity = (overwrites: Partial<Omit<Url, "urlHash" | "metadata">> = {}): Url => ({
  id: generateUrlId(),
  createdAt: new Date(),
  updatedAt: new Date(),
  url,
  ...overwrites,
  urlHash: sha1(url),
  metadata: compressMetadata(createExampleWebsiteMetadata({ url })) as Prisma.JsonValue,
});
