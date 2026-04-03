import { isApiMocksForced } from "@/services/api/apiClientMode";

/**
 * Base URL da API admin (mesmo host que o BFF público na maioria dos deploys).
 * Prioridade: VITE_ADMIN_BFF_BASE_URL → VITE_PUBLIC_BFF_BASE_URL.
 * Deve incluir o prefixo `/api` quando a API monta rotas em `/api`.
 */
export function resolveAdminBffBaseUrl(): string {
  const adminRaw: string | undefined = import.meta.env.VITE_ADMIN_BFF_BASE_URL;
  const publicRaw: string | undefined = import.meta.env
    .VITE_PUBLIC_BFF_BASE_URL;

  const chosen: string =
    typeof adminRaw === "string" && adminRaw.trim() !== ""
      ? adminRaw.trim()
      : typeof publicRaw === "string" && publicRaw.trim() !== ""
        ? publicRaw.trim()
        : "";

  return chosen.replace(/\/+$/, "");
}

export function isAdminHttpEnabled(): boolean {
  return resolveAdminUsesRealHttp();
}

/** HTTP real (login + cliente admin) só quando há URL e mocks não estão forçados. */
export function resolveAdminUsesRealHttp(): boolean {
  return resolveAdminBffBaseUrl() !== "" && !isApiMocksForced();
}
