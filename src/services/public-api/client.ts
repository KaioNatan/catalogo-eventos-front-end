import { normalizeBffApiRootUrl } from "@/services/api/bffBaseUrlNormalize";
import { isApiMocksForced } from "@/services/api/apiClientMode";
import type { IPublicApiClient } from "./publicApi.types";
import { createHttpPublicApiClient } from "./httpPublicApiClient";
import { createInMemoryPublicApiClient } from "./inMemoryPublicApiClient";

function resolvePublicBffBaseUrl(): string {
  const raw: string | undefined = import.meta.env.VITE_PUBLIC_BFF_BASE_URL;
  return typeof raw === "string" ? raw.trim() : "";
}

const bffBaseUrl: string = normalizeBffApiRootUrl(resolvePublicBffBaseUrl());

/**
 * Cliente da API pública. HTTP ao BFF quando há `VITE_PUBLIC_BFF_BASE_URL` e
 * `VITE_USE_API_MOCKS` não é `"true"`. Caso contrário, dados in-memory.
 */
export const publicApiClient: IPublicApiClient =
  isApiMocksForced() || !bffBaseUrl
    ? createInMemoryPublicApiClient()
    : createHttpPublicApiClient(bffBaseUrl);
