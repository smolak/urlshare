import { createTRPCRouter } from "../../trpc/server";
import { createUrl } from "./procedures/create-url";
import { getUrls } from "./procedures/get-urls";
import { updateUrl } from "./procedures/update-url";

export const urlRouter = createTRPCRouter({
  createUrl,
  getUrls,
  updateUrl,
});

export type UrlRouter = typeof urlRouter;
