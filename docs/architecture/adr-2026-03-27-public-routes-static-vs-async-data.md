# ADR: Mapeamento público — conteúdo estático vs dados assíncronos (base para SEO e deploy)

## Status

Proposto

## Contexto

O projeto declara SEO crítico nas páginas públicas e prevê avaliação se uma SPA estática basta (`frontend-deployment-decision-record.md`, `seo-and-public-web-guidelines.md`). Este registro documenta **somente o estado atual da codebase**: o que o HTML/JS inicial já contém versus o que depende de execução assíncrona no cliente (`useEffect`, hooks que chamam `publicApiClient`).

**Escopo:** rotas definidas em `src/app/routes.tsx`. **Fonte de dados atual:** `publicApiClient` (facade sobre `adminApiClient` mock in-process); o padrão de carregamento permanece válido quando a implementação passar a HTTP/BFF.

## Decisão

Nenhuma decisão arquitetural final de renderização (SSR/SSG/pré-render) é tomada aqui. **Decisão deste ADR:** registrar o inventário rota a rota para subsidiar a decisão de publicação (SPA estática vs estratégia enriquecida para indexação).

## Alternativas consideradas

- Não documentar o mapa e decidir deploy apenas por intuição — rejeitado; contradiz `frontend-project-specific-decisions.md` (validação explícita).
- Unificar público e CRM num único critério de SEO — rejeitado para este ADR; o CRM não é foco de indexação orgânica no mesmo nível.

## Trade-offs

- **Ganho:** base factual para ADR de deploy/SEO, testes de crawler e priorização de metadata.
- **Custo:** o documento precisa ser revisado quando rotas novas ou caminhos de dados mudarem.

## Consequências

- Qualquer nova rota pública indexável deve atualizar esta tabela ou um ADR derivado.
- Implementações futuras (metadata por rota, sitemap) devem referenciar as linhas “assíncrono” abaixo como candidatas a pré-cálculo no servidor ou HTML enriquecido.

## Data

2026-03-27

---

## Legenda

| Termo                    | Significado                                                                                               |
| ------------------------ | --------------------------------------------------------------------------------------------------------- |
| **Shell estático**       | Estrutura de layout/markup presente no bundle; títulos genéricos de seção podem aparecer antes dos dados. |
| **Dados em bundle**      | Constantes ou módulos importados (ex.: lista fixa no JS), sem `fetch` naquele trecho.                     |
| **Assíncrono (cliente)** | Conteúdo relevante para SEO ou UX só após Promise/`useEffect` (hoje via `publicApiClient`).               |

---

## Área pública (`/`, layout `PublicLayout`)

### `/` — `HomePage`

| Bloco               | Tipo           | Detalhe (arquivo / contrato)                                                                   |
| ------------------- | -------------- | ---------------------------------------------------------------------------------------------- |
| Estrutura da página | Shell estático | `HomePage.tsx` compõe três seções.                                                             |
| Hero / carrossel    | Assíncrono     | `HomeHeroCarousel.tsx` — `useEffect` → `publicApiClient.getHomeContent()` (banners/destaques). |
| Intro “Quem somos”  | Assíncrono     | `CeleiroIntroSection.tsx` → `useInstitutionalContent` → `getInstitutionalContent()`.           |
| Grade de cidades    | Assíncrono     | `CitiesGridSection.tsx` → `usePublicCities` → `listPublishedCities()`.                         |

**Nota:** há fallbacks de texto no hero institucional quando `content` é null (`AboutPage` / intro); ainda assim o conteúdo “oficial” CMS/mock chega de forma assíncrona.

### `/eventos` — `EventosPage`

| Bloco                                     | Tipo                             | Detalhe                                                                                                                                             |
| ----------------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Título da seção (“Eventos em …”)          | Shell + **assíncrono (cidades)** | `useCatalogoCidade` carrega cidades via `publicApiClient.listPublishedCities()`; o slug efetivo usa query `?cidade=` após a lista estar disponível. |
| Lista de cidades no filtro                | Assíncrono                       | Mesma fonte que o restante do portal publicado (`listPublishedCities`).                                                                             |
| Grade de eventos, totais, “carregar mais” | Assíncrono                       | `useCatalogoPublicoPaginado` → `fetchEventosCatalogo` → `publicApiClient.listPublishedEvents()`.                                                    |

### `/eventos/:id` — `EventoDetailsPage`

| Bloco                                               | Tipo       | Detalhe                                                                                                                  |
| --------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------ |
| Conteúdo da ficha (título, descrição, imagem, `h1`) | Assíncrono | `useEffect` → `getPublishedEventById(id)`. Até carregar: mensagem de loading; HTML inicial não contém o texto do evento. |

### `/pontos-turisticos` — `PontosTuristicosPage`

| Bloco                     | Tipo               | Detalhe                                                                                |
| ------------------------- | ------------------ | -------------------------------------------------------------------------------------- |
| Título / filtro de cidade | Igual a `/eventos` | `useCatalogoCidade` + `publicApiClient.listPublishedCities()`.                         |
| Grade de pontos           | Assíncrono         | `useCatalogoPublicoPaginado` → `fetchPontosCatalogo` → `listPublishedTouristPoints()`. |

### `/pontos-turisticos/:id` — `PontoTuristicoDetailsPage`

| Bloco                                 | Tipo       | Detalhe                                           |
| ------------------------------------- | ---------- | ------------------------------------------------- |
| Ficha completa (`h1`, textos, imagem) | Assíncrono | `useEffect` → `getPublishedTouristPointById(id)`. |

### `/cidades/:slug` — `CityDetailsPage`

| Bloco                                | Tipo       | Detalhe                                       |
| ------------------------------------ | ---------- | --------------------------------------------- |
| Ficha da cidade (`h1`, resumo, etc.) | Assíncrono | `useEffect` → `getPublishedCityBySlug(slug)`. |

### `/sobre` — `AboutPage`

| Bloco                        | Tipo  | Detalhe                                                                                                                                                                              |
| ---------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Hero e textos institucionais | Misto | `HeroSection` usa fallbacks **estáticos** quando `content` é null; corpo “Missão/Visão/Valores” depende de `useInstitutionalContent` → `getInstitutionalContent()` (**assíncrono**). |

---

## Área CRM (`/admin/*`)

| Rota (exemplos)      | Tipo (resumo)                                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/admin/login`       | Shell + auth simulada no cliente (`AuthProvider`); sem SEO público.                                                                               |
| `/admin` (dashboard) | Conteúdo majoritariamente **estático** no bundle (`AdminDashboardPage` — números fixos no markup).                                                |
| Demais telas CRUD    | Padrão típico: carregamento/submissão via `adminApiClient` em handlers ou efeitos (detalhamento omitido aqui por não impactar indexação pública). |

---

## Síntese para decisão de SEO / deploy

1. **Nenhuma rota pública de catálogo ou ficha** entrega no HTML inicial o texto principal indexável; tudo passa por **cliente assíncrono** (incluindo a lista de cidades do filtro do catálogo; exceção: fallbacks parciais em `/sobre`).
2. **`index.html`** permanece genérico (título único, sem metadata por URL); não há sitemap/robots no repositório no momento da análise.
3. Conclusão **derivada deste mapa** (alinhada às guidelines do projeto): para **descoberta orgânica** das fichas e listagens dinâmicas, **a SPA estática sozinha não evidencia no primeiro HTML** o conteúdo que interessa ao SEO; a decisão de deploy e fases SEO está registrada em `adr-2026-03-27-frontend-deploy-aws-and-public-seo-strategy.md`.

## Referências internas

- `src/app/routes.tsx`
- `docs/architecture/adr-2026-03-27-frontend-deploy-aws-and-public-seo-strategy.md`
- `docs/architecture/frontend-deployment-decision-record.md`
- `docs/architecture/seo-and-public-web-guidelines.md`
- `docs/architecture/adr-template.md`
