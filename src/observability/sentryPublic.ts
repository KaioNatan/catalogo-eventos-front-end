import * as Sentry from "@sentry/react";

let sentryEnabled = false;

/**
 * Inicializa o SDK Sentry no browser quando `VITE_PUBLIC_SENTRY_DSN` está definido.
 * Sem DSN, não há custo de rede nem bundle extra de envio (init não é chamado).
 */
export function initPublicSentry(): void {
  const raw: string | undefined = import.meta.env.VITE_PUBLIC_SENTRY_DSN;
  if (typeof raw !== "string" || raw.trim() === "") {
    return;
  }

  Sentry.init({
    dsn: raw.trim(),
    environment: import.meta.env.MODE,
    sendDefaultPii: false,
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1,
  });
  sentryEnabled = true;
}

export function capturePublicSentryException(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  if (!sentryEnabled) {
    return;
  }
  const err: Error = error instanceof Error ? error : new Error(String(error));
  Sentry.captureException(err, { extra: context });
}
