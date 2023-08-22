import { initTRPC, TRPCError } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/src/adapters/next";
import { prisma } from "@urlshare/db/prisma/client";
import { logger } from "@urlshare/logger";
import { generateRequestId } from "@urlshare/shared/utils/generate-request-id";
import { type Session } from "next-auth";
import superjson from "superjson";

import { getServerAuthSession } from "../auth";

type CreateContextOptions = {
  session: Session | null;
};

const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    prisma,
    logger,
    requestId: generateRequestId(),
  };
};

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;

  // Get the session from the server using the getServerSession wrapper function
  const session = await getServerAuthSession({ req, res });

  return createInnerTRPCContext({
    session,
  });
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

const isAuthenticated = t.middleware(({ next, ctx, path }) => {
  if (!ctx.session || !ctx.session.user) {
    ctx.logger.warn({ requestId: ctx.requestId, path }, "Not logged in.");

    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthenticated);
