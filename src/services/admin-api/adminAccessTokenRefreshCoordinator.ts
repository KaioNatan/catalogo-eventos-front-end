import { refreshAccessToken } from "./adminAuth.api";
import {
  notifyAdminHttpAuthExpired,
  persistAdminHttpAccessToken,
  readAdminHttpSession,
} from "./adminHttpSessionBridge";

function trimBaseUrl(baseURL: string): string {
  return baseURL.replace(/\/+$/, "");
}

let inFlightRefresh: Promise<string> | null = null;

/**
 * Um único refresh em voo por vez, para evitar múltiplos POST /auth/refresh-token
 * quando várias requisições admin recebem 401 ao mesmo tempo.
 */
export function refreshAdminAccessTokenSingleFlight(
  baseURL: string,
): Promise<string> {
  if (inFlightRefresh) {
    return inFlightRefresh;
  }

  const session = readAdminHttpSession();
  if (!session?.refreshToken) {
    notifyAdminHttpAuthExpired();
    return Promise.reject(new Error("Sem refresh token."));
  }

  inFlightRefresh = refreshAccessToken(
    trimBaseUrl(baseURL),
    session.refreshToken,
  )
    .then((accessToken) => {
      persistAdminHttpAccessToken(accessToken);
      return accessToken;
    })
    .catch((caught) => {
      notifyAdminHttpAuthExpired();
      throw caught;
    })
    .finally(() => {
      inFlightRefresh = null;
    });

  return inFlightRefresh;
}
