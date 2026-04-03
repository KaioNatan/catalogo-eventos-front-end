/**
 * Valida variáveis Vite usadas no build para alinhar CI (smoke) e deploy (secrets reais).
 *
 * Modos (BUILD_ENV_CHECK):
 * - ci-smoke: URLs HTTPS bem formadas, mocks obrigatórios (evita CI acidental sem mocks).
 * - ci-integration: URLs HTTPS + VITE_USE_API_MOCKS=false (job opcional com URL real de staging).
 * - deploy: mesmas regras de negócio do deploy (HTTPS opcional com ALLOW_HTTP_BFF).
 *
 * @see .github/workflows/ci.yml
 * @see .github/workflows/deploy-frontend.yml
 */

const mode = process.env.BUILD_ENV_CHECK ?? "";

function fail(message) {
  console.error(`[validate-vite-build-env] ${message}`);
  process.exit(1);
}

function trimOrEmpty(v) {
  return typeof v === "string" ? v.trim() : "";
}

/**
 * @param {string} name
 * @param {string} raw
 * @param {{ requireHttps: boolean }} opts
 */
function assertUrl(name, raw, opts) {
  const v = trimOrEmpty(raw);
  if (!v) {
    fail(`${name} vazio.`);
  }
  let u;
  try {
    u = new URL(v);
  } catch {
    fail(`${name} não é uma URL válida: ${v.slice(0, 80)}`);
  }
  if (opts.requireHttps && u.protocol !== "https:") {
    fail(
      `${name} deve usar HTTPS (https://...). Para laboratório com HTTP no BFF, use DEPLOY_ALLOW_HTTP_BFF=true apenas no deploy.`,
    );
  }
  if (!opts.requireHttps && u.protocol !== "https:" && u.protocol !== "http:") {
    fail(`${name} deve começar com http:// ou https://`);
  }
}

/**
 * Raiz do BFF costuma terminar em `/api` (ver bffBaseUrlNormalize / adminBffConfig).
 *
 * @param {string} name
 * @param {string} raw
 */
function warnIfMissingApiPath(name, raw) {
  const v = trimOrEmpty(raw);
  if (!v) return;
  try {
    const u = new URL(v);
    const path = u.pathname.replace(/\/+$/, "") || "/";
    if (!path.endsWith("/api") && path !== "/api") {
      console.warn(
        `[validate-vite-build-env] Aviso: ${name} normalmente inclui o sufixo /api (ex.: https://host/api). Valor atual: ${v}`,
      );
    }
  } catch {
    /* já falhou em assertUrl */
  }
}

function runCiSmoke() {
  const mocks = trimOrEmpty(process.env.VITE_USE_API_MOCKS);
  if (mocks !== "true") {
    fail(
      'No perfil ci-smoke, VITE_USE_API_MOCKS deve ser "true" para o build de fumaça não depender de BFF real.',
    );
  }

  const publicBff = process.env.VITE_PUBLIC_BFF_BASE_URL;
  const adminBff = process.env.VITE_ADMIN_BFF_BASE_URL;
  const siteUrl = process.env.VITE_PUBLIC_SITE_URL;

  assertUrl("VITE_PUBLIC_BFF_BASE_URL", publicBff, { requireHttps: true });
  assertUrl("VITE_ADMIN_BFF_BASE_URL", adminBff, { requireHttps: true });
  assertUrl("VITE_PUBLIC_SITE_URL", siteUrl, { requireHttps: true });

  warnIfMissingApiPath("VITE_PUBLIC_BFF_BASE_URL", publicBff);
  warnIfMissingApiPath("VITE_ADMIN_BFF_BASE_URL", adminBff);

  console.log("[validate-vite-build-env] ci-smoke: variáveis Vite OK.");
}

function runCiIntegration() {
  const mocks = trimOrEmpty(process.env.VITE_USE_API_MOCKS);
  if (mocks === "true") {
    fail(
      'No perfil ci-integration, VITE_USE_API_MOCKS deve ser "false" para exercitar o mesmo caminho de bundle que produção (HTTP clients).',
    );
  }

  const publicBff = process.env.VITE_PUBLIC_BFF_BASE_URL;
  const adminBff = process.env.VITE_ADMIN_BFF_BASE_URL;
  const siteUrl = process.env.VITE_PUBLIC_SITE_URL;

  assertUrl("VITE_PUBLIC_BFF_BASE_URL", publicBff, { requireHttps: true });
  assertUrl("VITE_ADMIN_BFF_BASE_URL", adminBff, { requireHttps: true });
  assertUrl("VITE_PUBLIC_SITE_URL", siteUrl, { requireHttps: true });

  warnIfMissingApiPath("VITE_PUBLIC_BFF_BASE_URL", publicBff);
  warnIfMissingApiPath("VITE_ADMIN_BFF_BASE_URL", adminBff);

  console.log(
    "[validate-vite-build-env] ci-integration: variáveis Vite OK (build alinhado a produção).",
  );
}

function runDeploy() {
  const allowHttp =
    process.env.ALLOW_HTTP_BFF === "true" ||
    process.env.ALLOW_HTTP_BFF === "True";

  const publicBff = process.env.VITE_PUBLIC_BFF_BASE_URL;
  const adminBff = process.env.VITE_ADMIN_BFF_BASE_URL;
  const siteUrl = process.env.VITE_PUBLIC_SITE_URL;
  const requireSite =
    process.env.REQUIRE_VITE_PUBLIC_SITE_URL === "true" ||
    process.env.REQUIRE_VITE_PUBLIC_SITE_URL === "True";

  const publicTrim = trimOrEmpty(publicBff);
  if (!publicTrim) {
    fail("VITE_PUBLIC_BFF_BASE_URL é obrigatório para deploy (URL do BFF).");
  }

  if (allowHttp) {
    assertUrl("VITE_PUBLIC_BFF_BASE_URL", publicBff, { requireHttps: false });
  } else {
    assertUrl("VITE_PUBLIC_BFF_BASE_URL", publicBff, { requireHttps: true });
  }

  const adminTrim = trimOrEmpty(adminBff);
  if (adminTrim) {
    assertUrl("VITE_ADMIN_BFF_BASE_URL", adminBff, { requireHttps: true });
  }

  const siteTrim = trimOrEmpty(siteUrl);
  if (siteTrim) {
    assertUrl("VITE_PUBLIC_SITE_URL", siteUrl, { requireHttps: true });
  }

  if (requireSite && !siteTrim) {
    fail(
      "REQUIRE_VITE_PUBLIC_SITE_URL está ativo mas VITE_PUBLIC_SITE_URL está vazio.",
    );
  }

  warnIfMissingApiPath("VITE_PUBLIC_BFF_BASE_URL", publicBff);
  if (adminTrim) {
    warnIfMissingApiPath("VITE_ADMIN_BFF_BASE_URL", adminBff);
  }

  console.log("[validate-vite-build-env] deploy: variáveis Vite OK.");
}

if (mode === "ci-smoke") {
  runCiSmoke();
} else if (mode === "ci-integration") {
  runCiIntegration();
} else if (mode === "deploy") {
  runDeploy();
} else {
  fail(
    `Defina BUILD_ENV_CHECK=ci-smoke, ci-integration ou deploy (recebido: "${mode}").`,
  );
}
