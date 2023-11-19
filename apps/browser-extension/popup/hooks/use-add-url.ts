import { useMutation } from "@tanstack/react-query";
import type { CreateUrlSchema } from "@urlshare/web-app/url/router/procedures/create-url.schema";
import axios from "axios";

import { createApiBaseUrl } from "~popup/utils/create-api-base-url";

export const useAddUrl = (apiKey: string) =>
  useMutation(({ url, categoryIds }: CreateUrlSchema) =>
    axios.post(`${createApiBaseUrl(apiKey)}/url`, { url, categoryIds })
  );
