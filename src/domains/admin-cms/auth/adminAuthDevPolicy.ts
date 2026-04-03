/**
 * Login administrativo sem chamada HTTP só é permitido em desenvolvimento (Vite `import.meta.env.DEV`).
 * Builds de produção devem definir `VITE_PUBLIC_BFF_BASE_URL` ou `VITE_ADMIN_BFF_BASE_URL` (HTTPS).
 */
export function isAdminMockLoginAllowed(
  noAdministrativeApiUrl: boolean,
): boolean {
  if (!noAdministrativeApiUrl) {
    return false;
  }
  return import.meta.env.DEV === true;
}

export function mustClearAdminSessionWithoutApiInProduction(
  noAdministrativeApiUrl: boolean,
): boolean {
  return import.meta.env.PROD === true && noAdministrativeApiUrl;
}
