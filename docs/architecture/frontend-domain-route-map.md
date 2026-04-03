# Mapa domínios ↔ rotas (SPA)

Complementa `frontend-route-classification.md` com **pastas** da codebase. Útil onboarding e revisões arquiteturais.

| Rota(s)                      | Pasta(s) `src/domains` / `shell`                                                                   |
| ---------------------------- | -------------------------------------------------------------------------------------------------- |
| `/`, home                    | `home-institucional` (páginas/componentes), hooks de dados em `public-portal`                      |
| `/sobre`                     | `institucional`, `public-portal/institutional` (hook)                                              |
| `/eventos`, `/eventos/:id`   | `catalogo-publico/eventos`, `catalogo-publico/shared`                                              |
| `/pontos-turisticos`, `/:id` | `catalogo-publico/pontos`, `catalogo-publico/shared`                                               |
| `/cidades/:slug`             | `cidades-institucional`                                                                            |
| `*` (404 público)            | `shell/public/pages`, SEO em `shell/public/seo`                                                    |
| `/admin/*`                   | `admin-cms/*`, layouts em `shell/admin`, **`AdminAuthBoundary`** isola `AuthProvider` + `Suspense` |
| Navegação / footer público   | `shell/public`                                                                                     |

**Serviços**

- Área pública: `services/public-api` (`publicApiClient` → BFF `/public/...` ou in-memory).
- CRM: `services/admin-api` (`adminApiClient`).

**`public-portal`**

- Concentra hooks de leitura pública reutilizáveis (`useInstitutionalContent`, `usePublicCities`) e cache de sessão em `public-portal/cache`.

**Analytics**

- Eventos públicos: `src/analytics/publicAnalytics.ts` (`trackPublicEvent`) — não usar `dataLayer.push` solto em domínios.
