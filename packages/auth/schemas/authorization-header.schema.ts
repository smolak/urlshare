import z from "zod";

export const authorizationHeaderSchema = z.string().startsWith("Bearer ").trim();
