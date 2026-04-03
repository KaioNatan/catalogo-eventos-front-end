/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Raiz do BFF (ex.: https://api.exemplo.com/api), sem `/public` ou `/admin` no final.
   * Vazio = cliente in-memory.
   */
  readonly VITE_PUBLIC_BFF_BASE_URL?: string;
  /**
   * URL base só para rotas admin (sobrepõe o público quando definida).
   * Útil se admin e público forem hosts diferentes; senão use só VITE_PUBLIC_BFF_BASE_URL.
   */
  readonly VITE_ADMIN_BFF_BASE_URL?: string;
  /**
   * Origem canônica do site público (HTTPS, sem barra final), ex.: https://www.exemplo.com
   * Usada em link rel=canonical no cliente e no pós-build (robots.txt / sitemap.xml).
   */
  readonly VITE_PUBLIC_SITE_URL?: string;
  /** Google Tag Manager container ID (ex.: GTM-XXXX). Opcional; só injeta script no build. */
  readonly VITE_PUBLIC_GTM_ID?: string;
  /** Sentry browser DSN (opcional). Com valor, `initPublicSentry` envia erros públicos capturados. */
  readonly VITE_PUBLIC_SENTRY_DSN?: string;
  /**
   * `"true"` força clientes público e admin in-memory e login mock em dev,
   * mesmo com URL do BFF definida. Produção: use `false` com URL HTTPS.
   */
  readonly VITE_USE_API_MOCKS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
