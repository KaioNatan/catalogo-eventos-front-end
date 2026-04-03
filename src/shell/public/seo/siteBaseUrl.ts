/**
 * URL canônica do site público (sem barra final), para link rel=canonical.
 * Deve coincidir com VITE_PUBLIC_SITE_URL usado no pós-build (robots/sitemap).
 */
export function getPublicSiteBaseUrl(): string {
  const raw = import.meta.env.VITE_PUBLIC_SITE_URL;
  if (typeof raw !== "string") {
    return "";
  }
  return raw.trim().replace(/\/+$/, "");
}
