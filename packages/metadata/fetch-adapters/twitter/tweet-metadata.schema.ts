import z from "zod";

const mediaSize = z.object({
  w: z.number(),
  h: z.number(),
  resize: z.literal("fit"),
});

const thumbSize = z.object({
  w: z.number(),
  h: z.number(),
  resize: z.literal("crop"),
});

const mediaDetailSchema = z.object({
  media_url_https: z.string().url(),
  original_info: z.object({
    width: z.number(),
    height: z.number(),
  }),
  sizes: z.object({
    large: mediaSize,
    medium: mediaSize,
    small: mediaSize,
    thumb: thumbSize,
  }),
  type: z.enum(["photo", "video"]),
});

const hashtagSchema = z.object({
  text: z.string(),
});

const videoVariantSchema = z.object({
  type: z.string(),
  src: z.string().url(),
});

export type TweetMetadata = z.infer<typeof tweetMetadataSchema>;

// There's more on the object, but I don't need everything
export const tweetMetadataSchema = z.object({
  __typename: z.literal("Tweet"),
  lang: z.string(),
  favorite_count: z.number(),
  created_at: z.string().datetime(),
  entities: z.object({
    hashtags: z.array(hashtagSchema),
  }),
  id_str: z.string(),
  text: z.string(),
  user: z.object({
    id_str: z.string(),
    name: z.string(),
    profile_image_url_https: z.string().url().optional(),
    screen_name: z.string(),
  }),
  mediaDetails: z.array(mediaDetailSchema).optional(),
  video: z
    .object({
      variants: z.array(videoVariantSchema),
    })
    .optional(),
});
