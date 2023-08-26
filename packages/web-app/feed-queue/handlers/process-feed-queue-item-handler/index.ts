import { logger } from "@urlshare/logger";
import { NextApiRequest, NextApiResponse } from "next";

import { processFeedQueueItemHandlerFactory } from "./factory";

export type ProcessFeedQueueItemSuccessResponse = { feedsAdded: number };
export type ProcessFeedQueueItemFailureResponse = { error: string };
export type ProcessFeedQueueItemResponse = ProcessFeedQueueItemSuccessResponse | ProcessFeedQueueItemFailureResponse;

export type ProcessFeedQueueItemHandler = (
  req: NextApiRequest,
  res: NextApiResponse<ProcessFeedQueueItemResponse>
) => Promise<void>;

export const processFeedQueueItemHandler: ProcessFeedQueueItemHandler = processFeedQueueItemHandlerFactory({
  logger,
});
