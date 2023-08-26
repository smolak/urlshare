import { TRPCError } from "@trpc/server";

import { protectedProcedure } from "../../../trpc/server";
import { updateUserProfileDataSchema } from "./update-user-profile-data.schema";

export const updateUserProfileData = protectedProcedure
  .input(updateUserProfileDataSchema)
  .mutation(async ({ input, ctx: { logger, requestId, session, prisma } }) => {
    const userId = session.user.id;
    const path = "userProfileData.updateUserProfileData";

    logger.info({ requestId, path }, "Updating user profile initiated.");

    const maybeUserProfileData = await prisma.userProfileData.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
        username: true,
      },
    });

    if (!maybeUserProfileData) {
      logger.error({ requestId, path }, "Failed to update user profile data.");

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User profile does not exist.",
      });
    }

    const userProfileData = await prisma.userProfileData.update({
      where: {
        userId,
      },
      data: input,
    });

    logger.info({ requestId, path }, "User profile data update complete.");

    return userProfileData;
  });
