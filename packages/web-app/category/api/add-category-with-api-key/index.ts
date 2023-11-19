import { logger } from "@urlshare/logger";
import { NextApiRequest, NextApiResponse } from "next";

import { addCategoryWithApiKeyFactory } from "./factory";

type AddCategoryWithApiKeySuccessResponse = { success: true };
type AddCategoryWithApiKeyFailureResponse = { error: string };
export type AddCategoryWithApiKeyResponse = AddCategoryWithApiKeySuccessResponse | AddCategoryWithApiKeyFailureResponse;

export type AddCategoryWithApiKeyHandler = (
  req: NextApiRequest,
  res: NextApiResponse<AddCategoryWithApiKeyResponse>
) => Promise<void>;

export const addCategoryWithApiKeyHandler: AddCategoryWithApiKeyHandler = addCategoryWithApiKeyFactory({ logger });
