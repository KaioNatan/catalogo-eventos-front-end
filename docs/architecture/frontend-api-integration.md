# Integração front-end ↔ API (BFF)

## Regra geral

- A área de **apresentação** (páginas, hooks de domínio que orquestram telas) consome dados através dos **clientes** em `src/services/public-api` e `src/services/admin-api`, ou de abstrações que estes expõem.
- **Não** introduzir chamadas HTTP ad hoc (Axios/fetch) dentro de `src/domains/*` salvo exceções documentadas abaixo.

## Mocks até o BFF integrar com a API

- `VITE_USE_API_MOCKS=true` (default em `.env.development` versionado) força **clientes in-memory** para público e admin, **mesmo** com `VITE_PUBLIC_BFF_BASE_URL` / `VITE_ADMIN_BFF_BASE_URL` definidos.
- Login admin: com mocks forçados, usa o fluxo **mock** de desenvolvimento (não chama `loginWithPassword` no BFF). Ver `resolveAdminUsesRealHttp` em `adminBffConfig.ts`.
- Para testar contra o BFF real: em `.env.local` use `VITE_USE_API_MOCKS=false` e a URL HTTPS do BFF.
- **Produção:** definir `VITE_USE_API_MOCKS=false` (ou omitir) e injetar a URL do BFF no build; nunca publicar com mocks forçados.

## Base URL (`VITE_PUBLIC_BFF_BASE_URL`)

- Deve apontar para o **prefixo da API** (ex.: `https://host/api` ou, só em dev local, `http://host/api`).
- O cliente público concatena `/public/...`; o admin concatena `/admin/...`; login e refresh usam `/auth/login` e `/auth/refresh-token` na mesma base.
- Exemplo dev (ALB): `http://celeiro-api-dev-alb-….elb.amazonaws.com/api` — **produção** exige HTTPS no deploy (validação no workflow).

## Autenticação admin (contrato `data`)

- **POST** `{baseURL}/auth/login` — corpo `{ email, password }`.
- Resposta no envelope padrão: `data` com **`token`** (ou `accessToken`) + **`refreshToken`** + **`user`** (`id`, `name`, `email`, `role`).
- O front normaliza para `IAdminAuthSession` (`accessToken` interno + Bearer) em `mapAdminAuthFromApi.ts`.
- Perfis aceites como admin: `admin`, `administrator`, `administrador` (case-insensitive).
- **POST** `{baseURL}/auth/refresh-token` — corpo `{ refreshToken }`; `data` deve trazer **`token`** ou **`accessToken`**.
- Erros no formato `{ error: { message }, meta: { correlationId } }` são mapeados para `ApiError` (mensagem + `requestId` quando existir `correlationId`).

## Exceções (importar de `services` ou nativo com critério)

- **Auth / sessão admin**: tokens e persistência em `src/domains/admin-cms/auth/*` permanecem no domínio; o refresh e login usam `adminAuth.api` na camada `services`.
- **Cache de sessão pública** (`sessionFetchCache` e similares): podem encapsular o cliente público já injetado; não duplicar URLs do BFF fora de `services/public-api`.

## Inventário de endpoints (baseline)

Valores são paths relativos à base URL do BFF configurada no cliente.

### Público (`httpPublicApiClient`)

| Método | Path                            | Uso resumido                       |
| ------ | ------------------------------- | ---------------------------------- |
| GET    | `/public/cities`                | Lista cidades                      |
| GET    | `/public/cities/:slug`          | Cidade por slug                    |
| GET    | `/public/events`                | Lista / filtros (incl. por cidade) |
| GET    | `/public/events/:id`            | Evento por id                      |
| GET    | `/public/tourist-points`        | Lista pontos turísticos            |
| GET    | `/public/tourist-points/:id`    | Ponto por id                       |
| GET    | `/public/institutional-content` | Conteúdo institucional             |
| GET    | `/public/social-links`          | Links sociais                      |
| GET    | `/public/home-content`          | Banners e destaques da home        |

### Admin (`httpAdminApiClient`)

| Método                | Path                                | Uso resumido                                 |
| --------------------- | ----------------------------------- | -------------------------------------------- |
| GET/PATCH             | `/admin/institutional-content`      | Ler / atualizar institucional                |
| GET/POST/PATCH/DELETE | `/admin/social-links` (+ `/:id`)    | CRUD links sociais                           |
| GET/POST/PATCH/DELETE | `/admin/cities` (+ `/:id`)          | CRUD cidades                                 |
| GET                   | `/public/cities/:slug`              | Leitura pública por slug (formulários admin) |
| GET/POST/PATCH/DELETE | `/admin/events` (+ `/:id`)          | CRUD eventos                                 |
| GET/POST/PATCH/DELETE | `/admin/tourist-points` (+ `/:id`)  | CRUD pontos turísticos                       |
| GET/POST/PATCH/DELETE | `/admin/home-banners` (+ `/:id`)    | CRUD banners                                 |
| GET/POST/PATCH/DELETE | `/admin/home-highlights` (+ `/:id`) | CRUD destaques                               |

## Arquivos de referência

- `src/services/api/httpEnvelope.ts` — envelope de resposta.
- `src/services/api/apiError.ts` — `ApiError`, `toApiError`.
- `src/services/api/mappers/*` — mapeadores compartilhados.
- `src/services/public-api/mappers/mapPublicHomeContent.ts` — composição do payload da home pública.

## Evolução

- Novos endpoints: adicionar no cliente adequado, reutilizar ou estender mappers em `services/api/mappers`, atualizar esta tabela.
- DTOs explícitos por domínio, quando existirem, devem documentar-se junto ao cliente ou em `dto/README.md` na pasta do serviço.
