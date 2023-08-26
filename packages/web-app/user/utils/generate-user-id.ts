import { generateId } from "@urlshare/shared/utils/generate-id";

export const USER_ID_PREFIX = "usr_";

export const generateUserId = () => generateId(USER_ID_PREFIX);
