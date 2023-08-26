import { TRPCError } from "@trpc/server";
import { ID_PLACEHOLDER_REPLACED_BY_ID_GENERATOR } from "@urlshare/db/prisma/middlewares/generate-model-id";

import { protectedProcedure } from "../../../trpc/server";
import { normalizeUsername } from "../../utils/normalize-username";
import { createUserProfileDataSchema } from "./create-user-profile-data.schema";

export const createUserProfileData = protectedProcedure
  .input(createUserProfileDataSchema)
  .mutation(async ({ input, ctx: { logger, requestId, session, prisma } }) => {
    const userId = session.user.id;
    const path = "userProfileData.createUserProfileData";

    logger.info({ requestId, path }, "Creating user profile initiated.");

    const maybeUserProfileData = await prisma.userProfileData.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
        username: true,
      },
    });

    if (maybeUserProfileData) {
      logger.error({ requestId, path }, "Failed to store the URL.");

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User profile data already exists.",
      });
    }

    const userProfileData = await prisma.$transaction(async (prisma) => {
      const { image } = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          role: "USER",
        },
        select: {
          image: true,
        },
      });
      const { apiKey, username } = input;

      return await prisma.userProfileData.create({
        data: {
          apiKey,
          username,
          usernameNormalized: normalizeUsername(username),
          id: ID_PLACEHOLDER_REPLACED_BY_ID_GENERATOR,
          userId,
          image,
        },
      });
    });

    logger.info({ requestId, path }, "User profile data creation complete.");

    return userProfileData;
  });
