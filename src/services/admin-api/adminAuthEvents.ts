export const ADMIN_AUTH_EXPIRED_EVENT = "celeiro-admin-auth-expired";

export const ADMIN_AUTH_FORBIDDEN_EVENT = "celeiro-admin-auth-forbidden";

export function notifyAdminAuthExpired(): void {
  window.dispatchEvent(new Event(ADMIN_AUTH_EXPIRED_EVENT));
}

/** Conta autenticada mas sem permissão (HTTP 403) — UI admin pode exibir aviso. */
export function notifyAdminAuthForbidden(): void {
  window.dispatchEvent(new Event(ADMIN_AUTH_FORBIDDEN_EVENT));
}
