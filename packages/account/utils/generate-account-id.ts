import { generateId } from "@urlshare/shared/utils/generate-id";

export const ACCOUNT_ID_PREFIX = "acc_";

export const generateAccountId = () => generateId(ACCOUNT_ID_PREFIX);
