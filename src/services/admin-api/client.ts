import { normalizeBffApiRootUrl } from "@/services/api/bffBaseUrlNormalize";
import { isApiMocksForced } from "@/services/api/apiClientMode";
import type { IAdminApiClient } from "./adminApi.types";
import { resolveAdminBffBaseUrl } from "./adminBffConfig";
import { createHttpAdminApiClient } from "./httpAdminApiClient";
import { createInMemoryAdminApiClient } from "./inMemoryAdminApiClient";

const baseURL = normalizeBffApiRootUrl(resolveAdminBffBaseUrl());

/**
 * HTTP + JWT quando há URL de admin/BFF e `VITE_USE_API_MOCKS` não é `"true"`.
 * Caso contrário, mock in-memory (alinhado ao cliente público).
 */
export const adminApiClient: IAdminApiClient =
  isApiMocksForced() || !baseURL
    ? createInMemoryAdminApiClient()
    : createHttpAdminApiClient(baseURL);
