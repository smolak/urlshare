import { WEB_APP_API_BASE_URL } from "@urlshare/web-app/constants";

export const createPublicApiBaseUrl = (apiKey: string) => `${WEB_APP_API_BASE_URL}/public/${apiKey}`;
