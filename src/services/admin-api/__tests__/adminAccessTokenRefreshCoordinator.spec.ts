import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { IAdminAuthSession } from "@/domains/admin-cms/auth/auth.types";
import {
  clearAdminUser,
  loadAdminSession,
  saveAdminSession,
} from "@/domains/admin-cms/auth/auth.storage";
import { ADMIN_AUTH_EXPIRED_EVENT } from "../adminAuthEvents";

const refreshAccessTokenMock = vi.hoisted(() => vi.fn());

vi.mock("../adminAuth.api", () => ({
  refreshAccessToken: (...args: unknown[]) => refreshAccessTokenMock(...args),
  loginWithPassword: vi.fn(),
}));

import { refreshAdminAccessTokenSingleFlight } from "../adminAccessTokenRefreshCoordinator";

describe("refreshAdminAccessTokenSingleFlight", () => {
  const validSession: IAdminAuthSession = {
    accessToken: "acc",
    refreshToken: "ref",
    user: {
      id: 1,
      name: "A",
      email: "a@b.com",
      role: "Admin",
      token: "acc",
    },
  };

  beforeEach(() => {
    clearAdminUser();
    refreshAccessTokenMock.mockReset();
  });

  afterEach(() => {
    clearAdminUser();
    vi.restoreAllMocks();
  });

  it("rejeita e dispara evento de sessão expirada quando não há sessão", async () => {
    const spy = vi
      .spyOn(window, "dispatchEvent")
      .mockImplementation(() => true);

    await expect(
      refreshAdminAccessTokenSingleFlight("https://bff.test/"),
    ).rejects.toThrow(/Sem refresh token/);

    expect(
      spy.mock.calls.some(
        (call) => (call[0] as Event).type === ADMIN_AUTH_EXPIRED_EVENT,
      ),
    ).toBe(true);
  });

  it("persiste novo access token no storage após refresh bem-sucedido", async () => {
    saveAdminSession(validSession);
    refreshAccessTokenMock.mockResolvedValue("new-access");

    const token =
      await refreshAdminAccessTokenSingleFlight("https://bff.test/");

    expect(token).toBe("new-access");
    expect(refreshAccessTokenMock).toHaveBeenCalledWith(
      "https://bff.test",
      "ref",
    );
    expect(loadAdminSession()?.accessToken).toBe("new-access");
  });

  it("reutiliza a mesma Promise em voo (single-flight)", async () => {
    saveAdminSession(validSession);
    let resolveOuter!: (value: string) => void;
    const pending = new Promise<string>((resolve) => {
      resolveOuter = resolve;
    });
    refreshAccessTokenMock.mockReturnValue(pending);

    const p1 = refreshAdminAccessTokenSingleFlight("https://bff.test/");
    const p2 = refreshAdminAccessTokenSingleFlight("https://bff.test/");

    expect(p2).toBe(p1);

    resolveOuter!("tok");
    await expect(p1).resolves.toBe("tok");
    expect(refreshAccessTokenMock).toHaveBeenCalledTimes(1);
  });

  it("em falha do refresh dispara evento de expiração e propaga erro", async () => {
    saveAdminSession(validSession);
    refreshAccessTokenMock.mockRejectedValue(new Error("refresh failed"));
    const spy = vi
      .spyOn(window, "dispatchEvent")
      .mockImplementation(() => true);

    await expect(
      refreshAdminAccessTokenSingleFlight("https://bff.test/"),
    ).rejects.toThrow(/refresh failed/);

    expect(
      spy.mock.calls.some(
        (call) => (call[0] as Event).type === ADMIN_AUTH_EXPIRED_EVENT,
      ),
    ).toBe(true);
  });
});
