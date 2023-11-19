import { useMutation } from "@tanstack/react-query";
import type { CreateCategorySchema } from "@urlshare/web-app/category/router/procedures/create-category.schema";
import axios from "axios";

import { createApiBaseUrl } from "~popup/utils/create-api-base-url";

export const useAddCategory = (apiKey: string, onSuccess?: () => void) =>
  useMutation(({ name }: CreateCategorySchema) => axios.post(`${createApiBaseUrl(apiKey)}/category`, { name }), {
    onSuccess,
  });
