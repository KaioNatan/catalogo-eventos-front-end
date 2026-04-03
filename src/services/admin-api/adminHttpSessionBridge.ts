/**
 * Ponte entre o Axios admin e a persistência/expiração de sessão.
 * Implementação concreta vive no domínio (`installAdminHttpSessionBridge`) para manter
 * `httpAdminApiClient` sem imports de `@/domains/...`.
 */
export interface IAdminHttpSessionTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IAdminHttpSessionBridge {
  readSession(): IAdminHttpSessionTokens | null;
  persistAccessToken(accessToken: string): void;
  notifyAuthExpired(): void;
}

let bridge: IAdminHttpSessionBridge | null = null;

export function registerAdminHttpSessionBridge(
  next: IAdminHttpSessionBridge,
): void {
  bridge = next;
}

function requireBridge(): IAdminHttpSessionBridge {
  if (!bridge) {
    throw new Error(
      "[admin-api] Ponte de sessão HTTP admin não registrada. Importe " +
        "`@/domains/admin-cms/auth/installAdminHttpSessionBridge` no entry (ex.: `main.tsx`) " +
        "antes de qualquer uso do `adminApiClient` HTTP, ou registre no `setupTests` dos testes.",
    );
  }
  return bridge;
}

/** Falha rápido na criação do cliente HTTP (evita axios sem política de token). */
export function assertAdminHttpSessionBridgeRegistered(): void {
  requireBridge();
}

export function readAdminHttpSession(): IAdminHttpSessionTokens | null {
  return requireBridge().readSession();
}

export function persistAdminHttpAccessToken(accessToken: string): void {
  requireBridge().persistAccessToken(accessToken);
}

export function notifyAdminHttpAuthExpired(): void {
  requireBridge().notifyAuthExpired();
}
