import { describe, expect, it } from "vitest";
import {
  mapLoginDataToSession,
  mapRefreshDataToAccessToken,
} from "../mapAdminAuthFromApi";

describe("mapLoginDataToSession", () => {
  it("aceita token + refreshToken (contrato API Celeiro)", () => {
    const session = mapLoginDataToSession({
      token: "jwt-access",
      refreshToken: "jwt-refresh",
      user: {
        id: 1,
        name: "Admin",
        email: "a@b.com",
        role: "admin",
      },
    });
    expect(session.accessToken).toBe("jwt-access");
    expect(session.refreshToken).toBe("jwt-refresh");
    expect(session.user.email).toBe("a@b.com");
    expect(session.user.role).toBe("Admin");
    expect(session.user.token).toBe("jwt-access");
  });

  it("aceita accessToken + refreshToken (legado)", () => {
    const session = mapLoginDataToSession({
      accessToken: "a",
      refreshToken: "r",
      user: { id: 2, name: "X", email: "x@y.com", role: "Administrator" },
    });
    expect(session.accessToken).toBe("a");
  });

  it("rejeita sem refreshToken", () => {
    expect(() =>
      mapLoginDataToSession({
        token: "a",
        user: { id: 1, name: "A", email: "a@b.com", role: "admin" },
      }),
    ).toThrow(/refreshToken/);
  });

  it("rejeita perfil não admin", () => {
    expect(() =>
      mapLoginDataToSession({
        token: "a",
        refreshToken: "r",
        user: { id: 1, name: "A", email: "a@b.com", role: "viewer" },
      }),
    ).toThrow(/administrador/);
  });
});

describe("mapRefreshDataToAccessToken", () => {
  it("aceita token em data", () => {
    expect(mapRefreshDataToAccessToken({ token: "new" })).toBe("new");
  });

  it("aceita accessToken em data", () => {
    expect(mapRefreshDataToAccessToken({ accessToken: "new2" })).toBe("new2");
  });
});
