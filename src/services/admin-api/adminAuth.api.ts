import axios from "axios";
import { unwrapResource } from "@/services/api/httpEnvelope";
import { toApiError } from "@/services/api/apiError";
import type { IAdminAuthSession } from "@/domains/admin-cms/auth/auth.types";
import {
  mapLoginDataToSession,
  mapRefreshDataToAccessToken,
} from "./mapAdminAuthFromApi";

export async function loginWithPassword(
  baseURL: string,
  email: string,
  password: string,
): Promise<IAdminAuthSession> {
  const http = axios.create({
    baseURL,
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    timeout: 30_000,
  });

  try {
    const { data } = await http.post<unknown>("/auth/login", {
      email,
      password,
    });
    const inner = unwrapResource<unknown>(data);
    return mapLoginDataToSession(inner);
  } catch (error: unknown) {
    throw toApiError(
      error,
      "Falha no login. Verifique credenciais e tente novamente.",
    );
  }
}

export async function refreshAccessToken(
  baseURL: string,
  refreshToken: string,
): Promise<string> {
  const http = axios.create({
    baseURL,
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    timeout: 30_000,
  });
  try {
    const { data } = await http.post<unknown>("/auth/refresh-token", {
      refreshToken,
    });
    const inner = unwrapResource<unknown>(data);
    return mapRefreshDataToAccessToken(inner);
  } catch (error: unknown) {
    throw toApiError(error, "Não foi possível renovar a sessão.");
  }
}
