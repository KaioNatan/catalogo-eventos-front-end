import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const initMock = vi.hoisted(() => vi.fn());
const captureExceptionMock = vi.hoisted(() => vi.fn());

vi.mock("@sentry/react", () => ({
  init: initMock,
  captureException: captureExceptionMock,
}));

describe("sentryPublic", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    initMock.mockClear();
    captureExceptionMock.mockClear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("initPublicSentry não chama Sentry.init quando DSN está vazio", async () => {
    vi.stubEnv("VITE_PUBLIC_SENTRY_DSN", "   ");
    const { initPublicSentry } = await import("../sentryPublic");
    initPublicSentry();
    expect(initMock).not.toHaveBeenCalled();
  });

  it("initPublicSentry chama Sentry.init com DSN válido", async () => {
    vi.stubEnv("VITE_PUBLIC_SENTRY_DSN", "https://key@o.ingest.sentry.io/1");
    const { initPublicSentry } = await import("../sentryPublic");
    initPublicSentry();
    expect(initMock).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: "https://key@o.ingest.sentry.io/1",
        sendDefaultPii: false,
      }),
    );
  });

  it("capturePublicSentryException não envia quando Sentry não foi habilitado", async () => {
    vi.stubEnv("VITE_PUBLIC_SENTRY_DSN", "");
    const { initPublicSentry, capturePublicSentryException } =
      await import("../sentryPublic");
    initPublicSentry();
    capturePublicSentryException(new Error("x"));
    expect(captureExceptionMock).not.toHaveBeenCalled();
  });

  it("capturePublicSentryException envia após init com DSN", async () => {
    vi.stubEnv("VITE_PUBLIC_SENTRY_DSN", "https://key@o.ingest.sentry.io/1");
    const { initPublicSentry, capturePublicSentryException } =
      await import("../sentryPublic");
    initPublicSentry();
    capturePublicSentryException("plain", { a: 1 });
    expect(captureExceptionMock).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ extra: { a: 1 } }),
    );
  });
});
