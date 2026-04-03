/**
 * Ponto único para eventos de negócio/navegação na área pública.
 * Não chamar `dataLayer.push` diretamente em componentes de domínio.
 *
 * Evolução (RUM / Core Web Vitals, percepção de carregamento do catálogo): preferir
 * eventos nomeados aqui ou extensão documentada — evitar `dataLayer` espalhado na UI.
 *
 * @see docs/architecture/frontend-analytics-constraints.md
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export type PublicAnalyticsPayload = Record<
  string,
  string | number | boolean | undefined
>;

/**
 * Dispara evento para o GTM (se `dataLayer` existir). Seguro em SSR ausente e sem GTM.
 */
export function trackPublicEvent(
  eventName: string,
  payload?: PublicAnalyticsPayload,
): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dataLayer ??= [];
  window.dataLayer.push({
    event: eventName,
    ...payload,
  });
}
