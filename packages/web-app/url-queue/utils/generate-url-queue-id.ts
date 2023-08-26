import { generateId } from "@urlshare/shared/utils/generate-id";

export const URL_QUEUE_ID_PREFIX = "url_queue_";

export const generateUrlQueueId = () => generateId(URL_QUEUE_ID_PREFIX);
