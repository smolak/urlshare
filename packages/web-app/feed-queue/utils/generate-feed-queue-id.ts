import { generateId } from "@urlshare/shared/utils/generate-id";

export const FEED_QUEUE_ID_PREFIX = "feed_queue_";

export const generateFeedQueueId = () => generateId(FEED_QUEUE_ID_PREFIX);
