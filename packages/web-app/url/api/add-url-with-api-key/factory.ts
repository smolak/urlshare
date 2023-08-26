import { sha1 } from "@urlshare/crypto/sha1";
import { prisma } from "@urlshare/db/prisma/client";
import { ID_PLACEHOLDER_REPLACED_BY_ID_GENERATOR } from "@urlshare/db/prisma/middlewares/generate-model-id";
import { Logger } from "@urlshare/logger";
import { generateRequestId } from "@urlshare/request-id/utils/generate-request-id";
import { StatusCodes } from "http-status-codes";

import { apiKeySchema } from "../../../user-profile-data/schemas/user-profile-data.schema";
import { addUrlWithApiKeyHandlerBodyPayloadSchema } from "./body-payload.schema";
import { AddUrlWithApiKeyHandler } from "./index";

interface Params {
  logger: Logger;
}

type AddUllWithApiKeyFactory = ({ logger }: Params) => AddUrlWithApiKeyHandler;

const actionType = "addUrlWithApiKeyHandler";

export const addUrlWithApiKeyFactory: AddUllWithApiKeyFactory =
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
    const bodyResult = addUrlWithApiKeyHandlerBodyPayloadSchema.safeParse(req.body);

    if (!bodyResult.success) {
      logger.error({ requestId, actionType }, "Body validation error.");

      res.status(StatusCodes.NOT_ACCEPTABLE);
      return;
    }

    const url = bodyResult.data.url;
    const urlHash = sha1(url);

    // Check if there's a record for this hash
    const maybeUrl = await prisma.url.findUnique({
      where: {
        urlHash,
      },
    });

    try {
      // If there's one, attempt creating a userUrl entry
      if (maybeUrl) {
        // TODO: Perhaps IDEA#4
        await prisma.userUrl.create({
          data: {
            id: ID_PLACEHOLDER_REPLACED_BY_ID_GENERATOR,
            userId,
            urlId: maybeUrl.id,
          },
        });

        logger.info({ requestId, actionType, url }, "URL exists, added to user.");

        res.status(StatusCodes.CREATED);
        res.send({ success: true });

        return;
      }

      // If there isn't one
      // TODO: IDEA#5
      await prisma.urlQueue.create({
        data: {
          id: ID_PLACEHOLDER_REPLACED_BY_ID_GENERATOR,
          rawUrl: url,
          rawUrlHash: urlHash,
          userId,
        },
      });

      logger.info({ requestId, actionType, url }, "URL added to queue.");

      res.status(StatusCodes.CREATED);
      res.json({ success: true });
    } catch (error) {
      logger.error({ requestId, actionType, error }, "Failed to store the URL.");

      res.status(StatusCodes.INTERNAL_SERVER_ERROR);
      res.json({ error: "Failed to add the URL, try again." });
    }
  };
