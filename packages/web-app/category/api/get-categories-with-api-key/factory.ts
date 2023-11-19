import { prisma } from "@urlshare/db/prisma/client";
import { Logger } from "@urlshare/logger";
import { generateRequestId } from "@urlshare/request-id/utils/generate-request-id";
import { StatusCodes } from "http-status-codes";

import { apiKeySchema } from "../../../user-profile-data/schemas/user-profile-data.schema";
import { GetCategoriesWithApiKeyHandler } from "./index";

interface Params {
  logger: Logger;
}

type GetCategoriesWithApiKeyFactory = ({ logger }: Params) => GetCategoriesWithApiKeyHandler;

const actionType = "getUrlsWithApiKeyHandler";

export const getCategoriesWithApiKeyFactory: GetCategoriesWithApiKeyFactory =
  ({ logger }) =>
  async (req, res) => {
    const requestId = generateRequestId();
    logger.info({ requestId, actionType }, "Getting categories with ApiKey initiated.");

    const apiKeyResult = apiKeySchema.safeParse(req.query.apiKey);

    if (!apiKeyResult.success) {
      logger.error({ requestId, actionType }, "Invalid ApiKey provided.");

      res.status(StatusCodes.FORBIDDEN);
      res.json({ error: "Invalid ApiKey provided." });
      return;
    }

    const apiKey = apiKeyResult.data;
    const maybeUser = await prisma.userProfileData.findFirst({
      where: {
        apiKey,
      },
    });

    if (maybeUser === null) {
      logger.error({ requestId, actionType }, "User identified by ApiKey not found.");

      res.status(StatusCodes.FORBIDDEN);
      res.json({ error: "Invalid ApiKey provided." });
      return;
    }

    const userId = maybeUser.userId;
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        urlsCount: true,
      },
      where: {
        userId,
      },
      orderBy: {
        name: "asc",
      },
    });

    logger.info({ requestId, actionType, categories }, "Categories fetched.");

    res.status(StatusCodes.OK);
    res.json({ categories });
  };
