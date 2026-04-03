/**
 * Com VITE_USE_API_MOCKS=true, os singletons em services/public-api/client e
 * services/admin-api/client usam sempre clientes in-memory, mesmo que a URL do
 * BFF esteja definida (útil até o BFF falar com a API real).
 *
 * Login admin: ver resolveAdminUsesRealHttp em adminBffConfig.ts.
 */
export function isApiMocksForced(): boolean {
  return import.meta.env.VITE_USE_API_MOCKS === "true";
}
