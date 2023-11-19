import { useMutation } from "@tanstack/react-query";
import type { CreateUrlSchema } from "@urlshare/web-app/url/router/procedures/create-url.schema";
import axios from "axios";

import { createPublicApiBaseUrl } from "~popup/utils/create-public-api-base-url";

export const useAddUrl = (apiKey: string) =>
  useMutation(({ url, categoryIds }: CreateUrlSchema) =>
    axios.post(`${createPublicApiBaseUrl(apiKey)}/url`, { url, categoryIds })
  );
