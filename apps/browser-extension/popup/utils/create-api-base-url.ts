import { WEB_APP_API_BASE_URL } from "@urlshare/web-app/constants";

export const createApiBaseUrl = (apiKey: string) => `${WEB_APP_API_BASE_URL}/${apiKey}`;
