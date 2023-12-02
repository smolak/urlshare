import { createTRPCRouter } from "../../trpc/server";
import { createUrl } from "./procedures/create-url";
import { getUrls } from "./procedures/get-urls";
import { updateUserUrl } from "./procedures/update-user-url";

export const urlRouter = createTRPCRouter({
  createUrl,
  getUrls,
  updateUserUrl,
});

export type UrlRouter = typeof urlRouter;
