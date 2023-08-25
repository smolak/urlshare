import { generateId } from "@urlshare/shared/utils/generate-id";

export const SESSION_ID_PREFIX = "ses_";

export const generateSessionId = () => generateId(SESSION_ID_PREFIX);
