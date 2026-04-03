import { capturePublicSentryException } from "./sentryPublic";

/**
 * Ponto único para erros não tratados na área pública.
 * Console sempre; Sentry quando `VITE_PUBLIC_SENTRY_DSN` + `initPublicSentry()` no boot.
 */
export type PublicErrorContext = Record<
  string,
  string | number | boolean | undefined
>;

export function reportPublicError(
  error: unknown,
  context?: PublicErrorContext,
): void {
  const payload = {
    scope: "public-web",
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  };
  console.error("[publicError]", payload);
  capturePublicSentryException(
    error,
    context as Record<string, unknown> | undefined,
  );
}
