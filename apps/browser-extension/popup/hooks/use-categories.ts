import { useQuery } from "@tanstack/react-query";
import type { CategoryVM } from "@urlshare/web-app/category/models/category.vm";
import axios from "axios";

import { createPublicApiBaseUrl } from "~popup/utils/create-public-api-base-url";

export const useCategories = (apiKey: string) => useQuery<CategoryVM[]>(["categories"], () => getCategories(apiKey));

const getCategories = async (apiKey: string) => {
  const { data } = await axios.get<{ categories: CategoryVM[] }>(`${createPublicApiBaseUrl(apiKey)}/category`);

  return data.categories;
};
