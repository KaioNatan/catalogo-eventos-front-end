import { loginWithPassword } from "@/services/admin-api/adminAuth.api";
import { ADMIN_AUTH_EXPIRED_EVENT } from "@/services/admin-api/adminAuthEvents";
import { normalizeBffApiRootUrl } from "@/services/api/bffBaseUrlNormalize";
import {
  resolveAdminBffBaseUrl,
  resolveAdminUsesRealHttp,
} from "@/services/admin-api/adminBffConfig";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
  type ReactElement,
} from "react";
import {
  isAdminMockLoginAllowed,
  mustClearAdminSessionWithoutApiInProduction,
} from "./adminAuthDevPolicy";
import { AuthContext } from "./auth.context";
import {
  clearAdminUser,
  loadAdminSession,
  saveAdminSession,
} from "./auth.storage";
import type { IAdminAuthSession, IAuthContextValue } from "./auth.types";

function readInitialAdminSession(): IAdminAuthSession | null {
  const usesRealHttp = resolveAdminUsesRealHttp();
  if (mustClearAdminSessionWithoutApiInProduction(!usesRealHttp)) {
    clearAdminUser();
    return null;
  }
  return loadAdminSession();
}

export function AuthProvider({ children }: PropsWithChildren): ReactElement {
  const [session, setSession] = useState<IAdminAuthSession | null>(
    readInitialAdminSession,
  );

  useEffect(() => {
    const onExpired = (): void => {
      setSession(null);
      clearAdminUser();
    };
    window.addEventListener(ADMIN_AUTH_EXPIRED_EVENT, onExpired);
    return () => {
      window.removeEventListener(ADMIN_AUTH_EXPIRED_EVENT, onExpired);
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (resolveAdminUsesRealHttp()) {
      const baseURL = normalizeBffApiRootUrl(resolveAdminBffBaseUrl());
      const next = await loginWithPassword(baseURL, email, password);
      setSession(next);
      saveAdminSession(next);
      return;
    }

    if (!isAdminMockLoginAllowed(true)) {
      throw new Error(
        "API administrativa não configurada. No build de produção defina VITE_PUBLIC_BFF_BASE_URL ou VITE_ADMIN_BFF_BASE_URL com HTTPS (ex.: https://api.seudominio.com/api).",
      );
    }

    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 300);
    });

    if (!email || !password) {
      throw new Error("Informe email e senha.");
    }

    const mockSession: IAdminAuthSession = {
      accessToken: "dev-mock-access",
      refreshToken: "dev-mock-refresh",
      user: {
        id: 1,
        name: "Administrador (mock)",
        email,
        role: "Admin",
        token: "dev-mock-access",
      },
    };
    setSession(mockSession);
    saveAdminSession(mockSession);
  }, []);

  const logout = useCallback((): void => {
    setSession(null);
    clearAdminUser();
  }, []);

  const contextValue: IAuthContextValue = useMemo(
    () => ({
      user: session?.user ?? null,
      isAuthenticated: Boolean(session),
      login,
      logout,
    }),
    [login, logout, session],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
