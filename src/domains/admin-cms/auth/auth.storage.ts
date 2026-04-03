import type { IAdminAuthSession, IAdminUser } from "./auth.types";

const AUTH_STORAGE_KEY = "celeiro-admin-auth";

function parseLegacyUser(raw: unknown): IAdminUser | null {
  if (
    typeof raw === "object" &&
    raw !== null &&
    "id" in raw &&
    "name" in raw &&
    "email" in raw &&
    "role" in raw &&
    "token" in raw
  ) {
    const u = raw as IAdminUser & { role: string };
    const roleNorm = u.role === "Admin" || u.role === "admin" ? "Admin" : null;
    if (!roleNorm) {
      return null;
    }
    return { ...u, role: "Admin" };
  }
  return null;
}

export function loadAdminSession(): IAdminAuthSession | null {
  try {
    const rawValue: string | null =
      window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!rawValue) {
      return null;
    }

    const parsedValue: unknown = JSON.parse(rawValue);

    if (
      typeof parsedValue === "object" &&
      parsedValue !== null &&
      "accessToken" in parsedValue &&
      "refreshToken" in parsedValue &&
      "user" in parsedValue
    ) {
      const s = parsedValue as IAdminAuthSession;
      const user = parseLegacyUser(s.user);
      if (!user || !s.accessToken || !s.refreshToken) {
        return null;
      }
      return {
        user: { ...user, token: s.accessToken },
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
      };
    }

    const legacyUser = parseLegacyUser(parsedValue);
    if (legacyUser) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return null;
  } catch {
    return null;
  }
}

export function saveAdminSession(session: IAdminAuthSession): void {
  const normalized: IAdminAuthSession = {
    ...session,
    user: { ...session.user, token: session.accessToken },
  };
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalized));
}

export function updateAdminAccessToken(accessToken: string): void {
  const current = loadAdminSession();
  if (!current) {
    return;
  }
  saveAdminSession({
    ...current,
    accessToken,
    user: { ...current.user, token: accessToken },
  });
}

/** @deprecated Preferir `loadAdminSession` quando precisar do refresh token. */
export function loadAdminUser(): IAdminUser | null {
  return loadAdminSession()?.user ?? null;
}

/** Compatibilidade com chamadas antigas; preferir `saveAdminSession`. */
export function saveAdminUser(user: IAdminUser): void {
  saveAdminSession({
    user: { ...user, role: "Admin", token: user.token },
    accessToken: user.token,
    refreshToken: "legacy-compat-refresh",
  });
}

export function clearAdminUser(): void {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}
