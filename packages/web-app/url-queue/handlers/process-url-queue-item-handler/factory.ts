import { authorizationHeaderSchema } from "@urlshare/auth/schemas/authorization-header.schema";
import { getAuthToken } from "@urlshare/auth/utils/get-auth-token";
import { UploadImageFromUrl } from "@urlshare/cdn/utils/upload-image-from-url";
import { Logger } from "@urlshare/logger";
import { FetchMetadata } from "@urlshare/metadata/fetch-metadata";
import { generateRequestId } from "@urlshare/request-id/utils/generate-request-id";
import { StatusCodes } from "http-status-codes";
import getConfig from "next/config";

import { ProcessUrlQueueItemHandler } from "./index";
import { actionType, processUrlQueueItem } from "./process-url-queue-item";

export type Params = {
  fetchMetadata: FetchMetadata;
  logger: Logger;
  maxNumberOfAttempts: number;
  uploadImageFromUrl: UploadImageFromUrl;
};

export type ProcessUrlQueueItemHandlerFactory = (params: Params) => ProcessUrlQueueItemHandler;

export const processUrlQueueItemHandlerFactory: ProcessUrlQueueItemHandlerFactory = ({
  fetchMetadata,
  logger,
  maxNumberOfAttempts,
  uploadImageFromUrl,
}) => {
  return async (req, res) => {
    const requestId = generateRequestId();

    logger.info({ requestId, actionType }, "Processing URL queue item.");

    const authHeaderResult = authorizationHeaderSchema.safeParse(req.headers.authorization);

    if (!authHeaderResult.success) {
      logger.error({ requestId, actionType }, "Authorization header validation error.");

      res.status(StatusCodes.UNAUTHORIZED);
      res.json({ error: "Authorization error." });
      return;
    }

    const urlQueueApiKey = getAuthToken(authHeaderResult.data);

    if (urlQueueApiKey !== getConfig().serverRuntimeConfig.urlQueueApiKey) {
      logger.error({ requestId, actionType }, "Invalid url queue API key provided.");

      res.status(StatusCodes.FORBIDDEN);
      res.json({ error: "Authorization error." });
      return;
    }

    try {
      const urlEntryCreated = await processUrlQueueItem({
        fetchMetadata,
        logger,
        maxNumberOfAttempts,
        requestId,
        uploadImageFromUrl,
      });

      if (urlEntryCreated === null) {
        logger.info({ requestId, actionType }, "Queue is empty.");

        res.status(StatusCodes.NO_CONTENT);
        res.end();
        return;
      }

      res.status(StatusCodes.CREATED);
      res.json({ url: urlEntryCreated });
    } catch (error) {
      logger.error({ requestId, actionType, error }, "Failed to process URL queue item.");

      res.status(StatusCodes.INTERNAL_SERVER_ERROR);
      res.json({ error: "Failed to process URL queue item." });
    }
  };
};
