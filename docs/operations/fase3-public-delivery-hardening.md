# Fase 3 — Endurecimento da entrega web pública (v1)

Escopo **somente** publicação estática + SEO técnico mínimo + governança de tags + observabilidade básica. **Não** inclui SSR/pré-render (fase posterior de produto).

## 1. Endurecimento mínimo entregue

| Área                    | O quê                                                                                                                                                                                                                             |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **robots / sitemap**    | Pós-build `scripts/finalize-public-seo.mjs`: `dist/robots.txt` com `Disallow: /admin` e `Sitemap:` quando `VITE_PUBLIC_SITE_URL` existe; `dist/sitemap.xml` com rotas estáveis (`/`, `/eventos`, `/pontos-turisticos`, `/sobre`). |
| **Metadata**            | `usePublicPageMetadata` nas rotas públicas: `document.title`, `meta description`, `link rel=canonical` (se `VITE_PUBLIC_SITE_URL` no bundle).                                                                                     |
| **Tag manager**         | `VITE_PUBLIC_GTM_ID` opcional — injeção única no `index.html` via `vite.config` (`loadEnv`).                                                                                                                                      |
| **Observabilidade**     | `reportPublicError` + listeners globais em **produção** (`main.tsx`) para `error` e `unhandledrejection` (hoje: `console.error` estruturado; ponto de extensão para Sentry).                                                      |
| **Rollback / operação** | Inalterado na essência: `s3 sync` + invalidação; ver `infra/README.md`.                                                                                                                                                           |

Fichas dinâmicas (`/eventos/:id`, `/pontos-turisticos/:id`, `/cidades/:slug`) têm **title/description/canonical em tempo de execução** no cliente; **não** entram no `sitemap.xml` estático da v1 (mitigação: Search Console + evolução futura com sitemap gerado pela API ou build incremental).

## 2. Variáveis de build (resumo)

| Variável                   | Uso                                                                                |
| -------------------------- | ---------------------------------------------------------------------------------- |
| `VITE_PUBLIC_SITE_URL`     | Canonical, robots `Sitemap`, geração de `sitemap.xml`. **HTTPS**, sem barra final. |
| `VITE_PUBLIC_GTM_ID`       | Opcional. Container GTM.                                                           |
| `VITE_PUBLIC_BFF_BASE_URL` | API pública + admin (se não houver `VITE_ADMIN_BFF_BASE_URL`).                     |

## 3. Como validar SEO técnico, cache e roteamento

### SEO técnico

1. Após `yarn build` com `VITE_PUBLIC_SITE_URL` definida: abrir `dist/robots.txt` e `dist/sitemap.xml` — URLs absolutas HTTPS, `Sitemap` presente.
2. Deploy: `curl -sI https://<site>/robots.txt` e `/sitemap.xml` — `200`, `Content-Type` adequado.
3. No browser (página pública): DevTools → Elements → `title`, `meta[name=description]`, `link[rel=canonical]`.
4. **URL Inspection** / **Rich Results** no Google Search Console (após propriedade verificada).
5. `meta noindex` na área `/admin` — já coberto por `useAdminAreaSeo`; confirmar em `/admin/login`.

### Cache

1. `curl -I https://<distribuição>/` — política do default behavior (sem cache longo no HTML).
2. `curl -I https://<distribuição>/assets/<hash>.js` — cache otimizado no comportamento `assets/*` (CloudFront).
3. Novo deploy: após `sync` + `create-invalidation`, HTML e manifestos atualizam.

### Roteamento SPA

1. Refresh em `/eventos`, `/sobre`, `/pontos-turisticos/1` — deve servir a app (CloudFront custom errors → `index.html`).
2. URL pública inexistente continua com **HTTP 200** no edge (SPA), mas a app mostra página 404 com **`meta robots: noindex`**; monitorar cobertura no Search Console.

## 4. Checklist final de go-live (Fase 3)

- [ ] `VITE_PUBLIC_SITE_URL` alinhada ao hostname **público** final (www vs apex).
- [ ] `VITE_PUBLIC_BFF_BASE_URL` HTTPS; CORS da API inclui a origem do site.
- [ ] Build de CI com as variáveis acima + `yarn build` (roda `finalize-public-seo.mjs`).
- [ ] `dist/sitemap.xml` e `dist/robots.txt` conferidos no artefato ou após deploy.
- [ ] GTM: container criado, variável `VITE_PUBLIC_GTM_ID` só se política de privacidade/cookies estiver alinhada.
- [ ] Search Console: sitemap enviado; propriedade verificada.
- [ ] Smoke: home, listagens, ficha, refresh profundo, login admin (API real).
- [ ] `sync --delete` + invalidação `/*` documentados e executados no processo de release.

## 5. Rollback (relembrar)

- **Conteúdo:** redeploy de artefato anterior (S3 + invalidação).
- **Infra:** ver `infra/README.md` (Fase 1/2).

## 6. O que faltaria para um cenário mais robusto (fora desta fase)

- **Sitemap dinâmico** (fichas de evento/cidade/ponto) via API ou build agendado.
- **CSP** no CloudFront (restritiva ou report-only), revisada com GTM e APIs.
- **Logs CloudFront → S3**, **WAF**, alarmes (4xx/5xx, taxa de invalidação).
- **Sentry / OpenTelemetry** no browser com amostragem e PII redatada.
- **SSR ou pré-render** para HTML rico por URL (SEO forte).
- **Separação de ambientes** (staging/prod) com buckets e distribuições distintos.

## Referências

- `docs/architecture/frontend-analytics-constraints.md`
- `docs/architecture/frontend-route-classification.md`
- `docs/operations/production-gate.md`
- `infra/README.md`
