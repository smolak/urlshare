import { createNextApiHandler } from "@trpc/server/adapters/next";
import { appRouter } from "@urlshare/web-app/trpc/app-router";
import { createTRPCContext } from "@urlshare/web-app/trpc/server";

// TODO there is some TS incompatibility with the router created and expected. It wasn't the case till recently :/

export default createNextApiHandler({
  // @ts-ignore
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    process.env.NODE_ENV === "development"
      ? ({ path, error }) => {
          console.error(`❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`);
        }
      : undefined,
});
