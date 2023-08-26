import { logger } from "@urlshare/logger";
import { NextApiRequest, NextApiResponse } from "next";

import { addUrlWithApiKeyFactory } from "./factory";

type AddUrlWithApiKeySuccessResponse = { success: true };
type AddUrlWithApiKeyFailureResponse = { error: string };
export type AddUrlWithApiKeyResponse = AddUrlWithApiKeySuccessResponse | AddUrlWithApiKeyFailureResponse;

export type AddUrlWithApiKeyHandler = (
  req: NextApiRequest,
  res: NextApiResponse<AddUrlWithApiKeyResponse>
) => Promise<void>;

export const addUrlWithApiKeyHandler: AddUrlWithApiKeyHandler = addUrlWithApiKeyFactory({ logger });
