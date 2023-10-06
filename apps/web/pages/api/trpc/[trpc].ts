import { createNextApiHandler } from "@trpc/server/adapters/next";
import { appRouter } from "@urlshare/web-app/trpc/app-router";
import { createTRPCContext } from "@urlshare/web-app/trpc/server";

export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    process.env.NODE_ENV === "development"
      ? ({ path, error }) => {
          console.error(`❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`);
        }
      : undefined,
});
