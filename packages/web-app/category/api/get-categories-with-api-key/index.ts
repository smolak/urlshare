import { logger } from "@urlshare/logger";
import { NextApiRequest, NextApiResponse } from "next";

import { CategoryVM } from "../../models/category.vm";
import { getCategoriesWithApiKeyFactory } from "./factory";

type GetCategoriesWithApiKeySuccessResponse = { categories: CategoryVM[] };
type GetCategoriesWithApiKeyFailureResponse = { error: string };
export type GetCategoriesWithApiKeyResponse =
  | GetCategoriesWithApiKeySuccessResponse
  | GetCategoriesWithApiKeyFailureResponse;

export type GetCategoriesWithApiKeyHandler = (
  req: NextApiRequest,
  res: NextApiResponse<GetCategoriesWithApiKeyResponse>
) => Promise<void>;

export const getCategoriesWithApiKeyHandler: GetCategoriesWithApiKeyHandler = getCategoriesWithApiKeyFactory({
  logger,
});
