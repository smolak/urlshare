import { protectedProcedure } from "../../../trpc/server";
import { normalizeUsername } from "../../utils/normalize-username";
import { usernameCheckSchema } from "./username-check.schema";

export const usernameCheck = protectedProcedure
  .input(usernameCheckSchema)
  .mutation(async ({ input: { username }, ctx: { logger, requestId, prisma } }) => {
    const path = "userProfileData.usernameCheck";

    logger.info({ requestId, path, username }, "Checking username availability.");

    const usernameNormalized = normalizeUsername(username);
    const match = await prisma.userProfileData.findUnique({
      where: {
        usernameNormalized,
      },
    });
    const usernameAvailable = match === null;

    logger.info({ requestId, path, username, usernameAvailable }, "Username availability checked.");

    return { usernameAvailable };
  });
