import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { ApiError } from "@/services/api/apiError";
import { loginWithPassword, refreshAccessToken } from "../adminAuth.api";

describe("adminAuth.api", () => {
  const mockPost = vi.fn();
  const mockInstance = { post: mockPost };

  beforeEach(() => {
    vi.spyOn(axios, "create").mockReturnValue(mockInstance as never);
    mockPost.mockReset();
  });

  afterEach(() => {
    vi.mocked(axios.create).mockRestore();
  });

  it("loginWithPassword envia POST /auth/login e mapeia sessão", async () => {
    mockPost.mockResolvedValue({
      data: {
        data: {
          accessToken: "acc",
          refreshToken: "ref",
          user: {
            id: 1,
            name: "Admin",
            email: "a@b.com",
            role: "admin",
          },
        },
      },
    });

    const session = await loginWithPassword(
      "https://bff.test/",
      "a@b.com",
      "secret",
    );

    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: "https://bff.test/",
        timeout: 30_000,
      }),
    );
    expect(mockPost).toHaveBeenCalledWith("/auth/login", {
      email: "a@b.com",
      password: "secret",
    });
    expect(session.accessToken).toBe("acc");
    expect(session.refreshToken).toBe("ref");
    expect(session.user.email).toBe("a@b.com");
    expect(session.user.role).toBe("Admin");
  });

  it("loginWithPassword envolve falha em ApiError (mensagem da exceção para erro genérico)", async () => {
    mockPost.mockRejectedValue(new Error("network"));

    await expect(
      loginWithPassword("https://bff.test/", "x", "y"),
    ).rejects.toSatisfy(
      (e: unknown) => e instanceof ApiError && e.message === "network",
    );
  });

  it("refreshAccessToken envia refreshToken e retorna novo access", async () => {
    mockPost.mockResolvedValue({
      data: {
        data: { accessToken: "new-acc" },
      },
    });

    const token = await refreshAccessToken("https://bff.test/", "old-ref");

    expect(mockPost).toHaveBeenCalledWith("/auth/refresh-token", {
      refreshToken: "old-ref",
    });
    expect(token).toBe("new-acc");
  });

  it("refreshAccessToken propaga ApiError em falha Axios", async () => {
    const err = new AxiosError("Unauthorized");
    err.config = {
      headers: {},
      url: "/auth/refresh-token",
    } as InternalAxiosRequestConfig;
    err.response = {
      status: 401,
      data: {},
      statusText: "Unauthorized",
      headers: {},
      config: err.config,
    };
    mockPost.mockRejectedValue(err);

    await expect(
      refreshAccessToken("https://bff.test/", "ref"),
    ).rejects.toSatisfy(
      (e: unknown) =>
        e instanceof ApiError &&
        e.status === 401 &&
        typeof e.message === "string" &&
        e.message.length > 0,
    );
  });
});
