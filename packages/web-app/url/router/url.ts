import { createTRPCRouter } from "../../trpc/server";
import { createUrl } from "./procedures/create-url";
import { getUrls } from "./procedures/get-urls";

export const urlRouter = createTRPCRouter({
  createUrl,
  getUrls,
});

export type UrlRouter = typeof urlRouter;
