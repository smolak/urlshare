import { ALPHABET } from "@urlshare/shared/utils/generate-id";
import z from "zod";

export type UsernameSchema = z.infer<typeof usernameSchema>;
export type ApiKeySchema = z.infer<typeof apiKeySchema>;

export const usernameSchema = z
  .string()
  .trim()
  .min(4, "Username cannot be shorter than 4 and longer than 15 characters.")
  .max(15, "Username cannot be shorter than 4 and longer than 15 characters.")
  .regex(/^[A-Za-z0-9_]+$/, "Only a-z, A-Z, 0-9 and _ characters allowed.");

export const apiKeySchema = z
  .string()
  .trim()
  .length(30, "API Key must be exactly 30 characters long.")
  .regex(new RegExp(`[${ALPHABET}]`), `Only ${ALPHABET} characters allowed.`);
