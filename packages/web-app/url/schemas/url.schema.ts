import z from "zod";

const MAX_URL_LENGTH = 500;

export const urlSchema = z
  .string()
  .trim()
  .min(1, { message: "URL can't be empty." })
  .url({ message: "Value is not a URL." })
  .startsWith("https://", { message: "Only https:// URLs allowed." })
  .refine(
    (val) => val.length <= MAX_URL_LENGTH,
    (val) => ({ message: `URL is too long. Detected ${val.length} characters and max ${MAX_URL_LENGTH} is allowed.` })
  );
