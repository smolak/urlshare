import { uploadImageFromUrl } from "@urlshare/cdn/utils/upload-image-from-url";
import { Url } from "@urlshare/db/prisma/client";
import { logger } from "@urlshare/logger";
import { fetchMetadata } from "@urlshare/metadata/fetch-metadata";
import { NextApiRequest, NextApiResponse } from "next";

import { processUrlQueueItemHandlerFactory } from "./factory";

export type ProcessUrlQueueItemSuccessResponse = { url: Url };
export type ProcessUrlQueueItemFailureResponse = { error: string };
export type ProcessUrlQueueItemResponse = ProcessUrlQueueItemSuccessResponse | ProcessUrlQueueItemFailureResponse;

export type ProcessUrlQueueItemHandler = (
  req: NextApiRequest,
  res: NextApiResponse<ProcessUrlQueueItemResponse>
) => Promise<void>;

const MAX_NUMBER_OF_ATTEMPTS = 5;

export const processUrlQueueItemHandler: ProcessUrlQueueItemHandler = processUrlQueueItemHandlerFactory({
  fetchMetadata,
  logger,
  maxNumberOfAttempts: MAX_NUMBER_OF_ATTEMPTS,
  uploadImageFromUrl,
});
