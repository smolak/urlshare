import { TRPCError } from "@trpc/server";

import { protectedProcedure } from "../../../trpc/server";
import { PrivateUserProfileDataVM, toPrivateUserProfileDataVM } from "../../models/private-user-profile-data.vm";

export const getPrivateUserProfileData = protectedProcedure.query<PrivateUserProfileDataVM>(
  async ({ ctx: { logger, requestId, session, prisma } }) => {
    const path = "userProfileData.getPrivateUserProfileData";
    const userId = session.user.id;

    logger.info({ requestId, path, userId }, "Get private user profile data initiated.");

    const maybeUserProfileData = await prisma.userProfileData.findUnique({
      where: {
        userId,
      },
    });

    if (maybeUserProfileData === null) {
      logger.info({ requestId, path, userId }, "User not found");

      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    return toPrivateUserProfileDataVM(maybeUserProfileData);
  }
);
