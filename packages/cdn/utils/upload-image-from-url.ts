import { UploadApiOptions, v2 as cloudinary } from "cloudinary";
import { z } from "zod";

type ImageUrl = z.infer<typeof urlSchema>;
type SecureUrl = string;

export type UploadImageFromUrl = (imageUrl: ImageUrl, filename: string) => Promise<SecureUrl | undefined>;

const urlSchema = z.string().url().trim();

export const uploadImageFromUrl: UploadImageFromUrl = async (maybeImageUrl, filename) => {
  try {
    const imageUrl = urlSchema.parse(maybeImageUrl);

    cloudinary.config({ secure: true });

    const options: UploadApiOptions = {
      public_id: filename,
    };

    const result = await cloudinary.uploader.upload(imageUrl, options);

    return result.secure_url;
  } catch (error) {
    console.error(error);
  }
};
