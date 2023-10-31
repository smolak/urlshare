import { Category } from "@urlshare/db/prisma/client";

export type CategoryVM = Pick<Category, "id" | "name" | "urlsCount">;
