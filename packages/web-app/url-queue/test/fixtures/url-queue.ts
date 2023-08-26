import { sha1 } from "@urlshare/crypto/sha1";
import { UrlQueue } from "@urlshare/db/prisma/client";

import { generateUserId } from "../../../user/utils/generate-user-id";
import { generateUrlQueueId } from "../../utils/generate-url-queue-id";

const urlQueue: UrlQueue = {
  id: generateUrlQueueId(),
  createdAt: new Date(),
  updatedAt: new Date(),
  rawUrl: "https://urlshare.me",
  rawUrlHash: sha1("https://urlshare.me"),
  status: "NEW",
  attemptCount: 0,
  metadata: {},
  userId: generateUserId(),
};

export const createUrlQueueItem = ({
  rawUrl,
  ...remainingOverwrites
}: Partial<Omit<UrlQueue, "rawUrlHash">> = {}): UrlQueue => {
  let rawUrlValue;
  let rawUrlHash;

  if (rawUrl) {
    rawUrlValue = rawUrl;
    rawUrlHash = sha1(rawUrl);
  } else {
    rawUrlValue = urlQueue.rawUrl;
    rawUrlHash = urlQueue.rawUrlHash;
  }

  return {
    ...urlQueue,
    ...remainingOverwrites,
    rawUrl: rawUrlValue,
    rawUrlHash,
  };
};
