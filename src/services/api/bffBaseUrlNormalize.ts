/**
 * Garante a raiz do BFF no formato `.../api` para montar paths como `/auth/login`,
 * `/public/...` e `/admin/...` sem duplicar segmentos.
 *
 * Ex.: `https://host/api/public` → `https://host/api` (evita `/api/public/auth/login`).
 */
export function normalizeBffApiRootUrl(raw: string): string {
  let url = raw.trim().replace(/\/+$/, "");
  url = url.replace(/\/admin$/i, "");
  url = url.replace(/\/public$/i, "");
  return url;
}
