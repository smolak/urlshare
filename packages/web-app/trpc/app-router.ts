import { categoryRouter } from "../category/router/category";
import { feedRouter } from "../feed/router/feed";
import { followUserRouter } from "../follow-user/router/follow-user";
import { urlRouter } from "../url/router/url";
import { userProfileDataRouter } from "../user-profile-data/router/user-profile-data";
import { createTRPCRouter } from "./server";

export const appRouter = createTRPCRouter({
  category: categoryRouter,
  feed: feedRouter,
  followUser: followUserRouter,
  url: urlRouter,
  userProfileData: userProfileDataRouter,
});

export type AppRouter = typeof appRouter;
