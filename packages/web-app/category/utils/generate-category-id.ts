import { generateId } from "@urlshare/shared/utils/generate-id";

export const CATEGORY_ID_PREFIX = "cat_";

export const generateCategoryId = () => generateId(CATEGORY_ID_PREFIX);
