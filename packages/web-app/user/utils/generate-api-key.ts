import { generateId } from "@urlshare/shared/utils/generate-id";

export const generateApiKey = () => generateId("", 30);
