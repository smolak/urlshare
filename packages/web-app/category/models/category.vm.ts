import { Category } from "@urlshare/db/prisma/client";

export type CategoryVM = Pick<Category, "id" | "name" | "urlsCount">;

export const toCategoryVM = ({ id, name, urlsCount }: Category): CategoryVM => {
  return { id, name, urlsCount };
};
