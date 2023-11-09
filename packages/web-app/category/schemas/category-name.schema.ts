import z from "zod";

const MAX_LENGTH = 30;

export const categoryNameSchema = z
  .string()
  .trim()
  .min(1, { message: "Category name can't be empty." })
  .refine(
    (val) => val.length <= MAX_LENGTH,
    (val) => ({
      message: `Category name too long. ${val.length} characters, max ${MAX_LENGTH}.`,
    })
  )
  .refine((val) => !val.includes(","), {
    message: `Category name can't include comma "," character.`,
  });
