import { prisma } from "@urlshare/db/prisma/client";
import { ID_PLACEHOLDER_REPLACED_BY_ID_GENERATOR } from "@urlshare/db/prisma/middlewares/generate-model-id";
import { Logger } from "@urlshare/logger";
import { generateRequestId } from "@urlshare/request-id/utils/generate-request-id";
import { StatusCodes } from "http-status-codes";

import { apiKeySchema } from "../../../user-profile-data/schemas/user-profile-data.schema";
import { addCategoryWithApiKeyHandlerBodyPayloadSchema } from "./body-payload.schema";
import { AddCategoryWithApiKeyHandler } from "./index";

interface Params {
  logger: Logger;
}

type AddCategoryWithApiKeyFactory = ({ logger }: Params) => AddCategoryWithApiKeyHandler;

const actionType = "addCategoryWithApiKeyHandler";

export const addCategoryWithApiKeyFactory: AddCategoryWithApiKeyFactory =
  ({ logger }) =>
  async (req, res) => {
    const requestId = generateRequestId();
    logger.info({ requestId, actionType }, "Creating URL with ApiKey initiated.");

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
    const bodyResult = addCategoryWithApiKeyHandlerBodyPayloadSchema.safeParse(req.body);

    if (!bodyResult.success) {
      logger.error({ requestId, actionType }, "Body validation error.");

      res.status(StatusCodes.NOT_ACCEPTABLE);
      return;
    }

    const { name } = bodyResult.data;

    const maybeCategory = await prisma.category.findFirst({
      where: {
        userId,
        name,
      },
    });

    if (maybeCategory) {
      logger.error({ requestId, name }, `Category (${name}) exists.`);

      res.status(StatusCodes.BAD_REQUEST);
      res.json({ error: "Category name exists. Use different category name." });

      return;
    }

    try {
      await prisma.category.create({
        data: {
          id: ID_PLACEHOLDER_REPLACED_BY_ID_GENERATOR,
          name,
          userId,
        },
      });

      logger.info({ requestId, name }, "Category created.");

      res.status(StatusCodes.CREATED);
      res.json({ success: true });
    } catch (error) {
      logger.error({ requestId, actionType, error }, "Failed to create the category.");

      res.status(StatusCodes.INTERNAL_SERVER_ERROR);
      res.json({ error: "Failed to create the category, try again." });
    }
  };
