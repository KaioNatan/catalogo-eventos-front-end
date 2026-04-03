# Frontend route classification

## Objetivo

Classificar rotas reais entre área pública, CRM e impactos em SEO, cache e mensuração (Fase 3 alinhada).

---

## Rotas públicas indexáveis (prioridade SEO)

| Rota                     | Conteúdo         | Metadata (v1)                                   |
| ------------------------ | ---------------- | ----------------------------------------------- |
| `/`                      | Home             | title + description + canonical                 |
| `/eventos`               | Lista de eventos | idem                                            |
| `/eventos/:id`           | Ficha evento     | cliente (title/description/canonical dinâmicos) |
| `/pontos-turisticos`     | Lista pontos     | idem                                            |
| `/pontos-turisticos/:id` | Ficha ponto      | cliente                                         |
| `/cidades/:slug`         | Ficha cidade     | cliente                                         |
| `/sobre`                 | Institucional    | idem                                            |

**Sitemap estático (v1):** apenas `/`, `/eventos`, `/pontos-turisticos`, `/sobre` — ver `scripts/finalize-public-seo.mjs`.

---

## Rotas públicas não indexáveis

- Nenhuma rota pública extra além das acima nesta versão.

---

## Rotas CRM (`/admin`)

| Rota                | Notas                                                                                        |
| ------------------- | -------------------------------------------------------------------------------------------- |
| `/admin/login`      | `noindex,nofollow` (`useAdminAreaSeo`)                                                       |
| `/admin/*` (demais) | guard + `noindex`; mensuração operacional **não** misturar com GTM de aquisição sem critério |

---

## Rotas autenticadas / CRM

- Exigem sessão JWT real em produção (ver `AuthProvider` + `production-gate.md`).
- Dependem do BFF para dados; não são alvo de sitemap.
