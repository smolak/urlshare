import { useMutation } from "@tanstack/react-query";
import type { CreateCategorySchema } from "@urlshare/web-app/category/router/procedures/create-category.schema";
import axios from "axios";

import { createPublicApiBaseUrl } from "~popup/utils/create-public-api-base-url";

export const useAddCategory = (apiKey: string, onSuccess?: () => void) =>
  useMutation(({ name }: CreateCategorySchema) => axios.post(`${createPublicApiBaseUrl(apiKey)}/category`, { name }), {
    onSuccess,
  });
