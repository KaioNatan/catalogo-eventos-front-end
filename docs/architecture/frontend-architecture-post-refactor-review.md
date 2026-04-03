# Revisão pós-refatoração (arquitetura front — 2026)

Documento de **validação** após quick wins e plano incremental **fases A–C parcial** descritos na revisão de `frontend-architect`. Não substitui ADRs nem o gate de produção.

## O que foi endereçado na codebase

| Ponto original                                   | Tratamento                                                                                                                                                           |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AuthProvider` no root (CRM acoplado ao público) | `AuthProvider` + `Suspense` apenas em **`AdminAuthBoundary`** sob `/admin`; `AppProviders` só `BrowserRouter`.                                                       |
| Bundle inicial com código admin                  | **Code-splitting**: páginas admin via `React.lazy` em `app/adminLazyPages.tsx`; chunks separados no build.                                                           |
| Deduplicação de fetch (institucional / cidades)  | **`sessionFetchCache`** + `getOrCreateSessionPromise` em hooks `useInstitutionalContent` e `usePublicCities`; `clearSessionFetchCache` no `setupTests` entre testes. |
| Analytics espalhado / sem fachada                | **`trackPublicEvent`** em `src/analytics/publicAnalytics.ts`; exemplo de uso em **`PublicNotFoundPage`** (`public_404`).                                             |
| Mapa mental domínio ↔ rota                       | **`frontend-domain-route-map.md`** (este repositório).                                                                                                               |
| `usePublicCities` — `setCities` duplicado        | Corrigido: uma única atualização com lista **filtrada** por `published`.                                                                                             |

## O que **não** foi alterado (ainda recomendado)

| Tema                                                     | Motivo / próximo passo                                                                         |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Lazy routes na área pública**                          | Reduziria mais o chunk principal; exige `Suspense` no outlet público e coordenação com SEO/UX. |
| **React Query / TanStack**                               | Cache de sessão cobre o caso atual; evoluir se invalidação/TTL fino forem necessários.         |
| **SSR / pré-render / sitemap dinâmico**                  | Fase D — produto + BFF + infra; ver ADRs de deploy/SEO.                                        |
| **CSP / WAF / logs**                                     | Infra e segurança; ver `production-gate.md`.                                                   |
| **Separar GTM por rota no build**                        | Continua dependente de GTM/consent; doc em `frontend-analytics-constraints.md`.                |
| **Renomear pastas** (`institucional` vs `public-portal`) | Apenas documentado no mapa; rename físico seria PR grande.                                     |
| **Observabilidade além de `reportPublicError`**          | Sentry/OTel — decisão de produto.                                                              |

## Critérios de “corrigido” vs “parcial”

- **Corrigido:** fronteira runtime público/CRM no provider de auth; admin em chunks lazy; dedup explícito para dois hooks públicos quentes; padrão de analytics com fachada; bug de cidades; documentação de mapa.
- **Parcial:** SEO forte em HTML inicial, mensuração CRM isolada no código, performance LCP de home (múltiplos fetches ainda existem, só deduplicados quando a chave coincide).

## Manutenção

- Nova rota pública indexável: atualizar **`frontend-route-classification.md`** e **`frontend-domain-route-map.md`**.
- Novo evento GTM disparado do código: preferir **`trackPublicEvent`** (ou extensão acordada em `analytics/`).
