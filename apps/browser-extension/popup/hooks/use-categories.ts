import { useQuery } from "@tanstack/react-query";
import type { CategoryVM } from "@urlshare/web-app/category/models/category.vm";
import axios from "axios";

import { createApiBaseUrl } from "~popup/utils/create-api-base-url";

export const useCategories = (apiKey: string) => useQuery<CategoryVM[]>(["categories"], () => getCategories(apiKey));

const getCategories = async (apiKey: string) => {
  const { data } = await axios.get<{ categories: CategoryVM[] }>(`${createApiBaseUrl(apiKey)}/category`);

  return data.categories;
};
