import { Url } from "@urlshare/db/prisma/client";
import { Metadata } from "@urlshare/metadata/types";

export interface UrlVM extends Omit<Url, "metadata"> {
  metadata: Metadata;
}
