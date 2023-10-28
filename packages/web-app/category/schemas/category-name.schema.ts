import z from "zod";

const MAX_LENGTH = 30;

export const categoryNameSchema = z
  .string()
  .trim()
  .refine(
    (val) => val.length <= MAX_LENGTH,
    (val) => ({
      message: `Category name too long. Detected ${val.length} characters and max ${MAX_LENGTH} is allowed.`,
    })
  );
