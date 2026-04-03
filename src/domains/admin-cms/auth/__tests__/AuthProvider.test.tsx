import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../AuthProvider";
import { useAuth } from "../useAuth";
import {
  clearAdminUser,
  loadAdminSession,
  saveAdminSession,
} from "../auth.storage";

vi.mock("../auth.storage", () => ({
  loadAdminSession: vi.fn(),
  saveAdminSession: vi.fn(),
  clearAdminUser: vi.fn(),
}));

vi.mock("@/services/admin-api/adminBffConfig", () => ({
  resolveAdminBffBaseUrl: () => "",
  resolveAdminUsesRealHttp: () => false,
}));

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve iniciar deslogado quando não houver usuário salvo", () => {
    vi.mocked(loadAdminSession).mockReturnValue(null);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("deve iniciar logado quando houver sessão salva", () => {
    vi.mocked(loadAdminSession).mockReturnValue({
      accessToken: "at",
      refreshToken: "rt",
      user: {
        id: 1,
        name: "Admin",
        email: "admin@teste.com",
        token: "at",
        role: "Admin",
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe("admin@teste.com");
  });

  it("deve efetuar login mock e persistir a sessão (sem BFF)", async () => {
    vi.mocked(loadAdminSession).mockReturnValue(null);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login("admin@teste.com", "123456");
    });

    expect(saveAdminSession).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("deve efetuar logout e limpar storage", () => {
    vi.mocked(loadAdminSession).mockReturnValue({
      accessToken: "at",
      refreshToken: "rt",
      user: {
        id: 1,
        name: "Admin",
        email: "admin@teste.com",
        token: "at",
        role: "Admin",
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.logout();
    });

    expect(clearAdminUser).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
