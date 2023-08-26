import { generateId } from "@urlshare/shared/utils/generate-id";

export const USER_URL_ID_PREFIX = "usr_url_";

export const generateUserUrlId = () => generateId(USER_URL_ID_PREFIX);
