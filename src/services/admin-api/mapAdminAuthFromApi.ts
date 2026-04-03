import type { IAdminAuthSession } from "@/domains/admin-cms/auth/auth.types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

const ADMIN_ROLE_VALUES = new Set(["admin", "administrator", "administrador"]);

function normalizeAdminRole(role: unknown): "Admin" | null {
  const s = String(role ?? "")
    .trim()
    .toLowerCase();
  return ADMIN_ROLE_VALUES.has(s) ? "Admin" : null;
}

/**
 * Converte o conteúdo de `data` no envelope do POST /auth/login para sessão interna.
 * Aceita `token` ou `accessToken` (compatibilidade com variações do BFF).
 */
export function mapLoginDataToSession(inner: unknown): IAdminAuthSession {
  if (!isRecord(inner)) {
    throw new Error("Resposta de login inválida: data não é um objeto.");
  }

  const accessToken =
    (typeof inner.accessToken === "string" && inner.accessToken.trim() !== ""
      ? inner.accessToken
      : null) ??
    (typeof inner.token === "string" && inner.token.trim() !== ""
      ? inner.token
      : null) ??
    "";

  const refreshToken =
    typeof inner.refreshToken === "string" ? inner.refreshToken.trim() : "";

  if (!accessToken || !refreshToken) {
    throw new Error(
      "Resposta de login inválida: é necessário token (ou accessToken) e refreshToken em data.",
    );
  }

  const userRaw = inner.user;
  if (!isRecord(userRaw)) {
    throw new Error("Resposta de login inválida: user ausente em data.");
  }

  const id = Number(userRaw.id);
  const name = String(userRaw.name ?? "").trim();
  const email = String(userRaw.email ?? "").trim();
  const role = normalizeAdminRole(userRaw.role);

  if (!role) {
    throw new Error("Acesso negado: perfil não é administrador.");
  }
  if (!Number.isFinite(id) || !email) {
    throw new Error(
      "Resposta de login inválida: dados de usuário incompletos.",
    );
  }

  return {
    accessToken,
    refreshToken,
    user: {
      id,
      name,
      email,
      role: "Admin",
      token: accessToken,
    },
  };
}

/**
 * Converte o conteúdo de `data` no refresh para o novo access token (Bearer).
 */
export function mapRefreshDataToAccessToken(inner: unknown): string {
  if (!isRecord(inner)) {
    throw new Error("Resposta de refresh inválida.");
  }
  const access =
    (typeof inner.accessToken === "string" && inner.accessToken.trim() !== ""
      ? inner.accessToken
      : null) ??
    (typeof inner.token === "string" && inner.token.trim() !== ""
      ? inner.token
      : null) ??
    "";
  if (!access) {
    throw new Error(
      "Resposta de refresh inválida: token (ou accessToken) ausente em data.",
    );
  }
  return access;
}
