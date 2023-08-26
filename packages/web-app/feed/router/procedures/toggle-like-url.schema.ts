import z from "zod";

import { feedIdSchema } from "../../schemas/feed-id.schema";

export const toggleLikeUrlSchema = z.object({
  feedId: feedIdSchema,
});
