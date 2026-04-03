# BFF guidelines

## Objetivo

O BFF deve adaptar os dados e fluxos do backend para as necessidades reais da interface, reduzindo acoplamento e simplificando a camada de apresentação.

## Princípios

- entregar para a UI apenas o necessário
- evitar overfetching
- centralizar composição de payloads
- proteger a UI de mudanças desnecessárias em APIs internas
- manter fronteiras claras entre regra de negócio e composição de dados

## Quando usar

- múltiplas fontes de dados para uma mesma tela
- necessidade de payload otimizado para a interface
- necessidade de simplificar a camada cliente
- cenários com áreas públicas e autenticadas com necessidades diferentes

## Integração no front-end (contratos e camada HTTP)

- **Clientes HTTP**: `src/services/public-api/httpPublicApiClient.ts` (rotas `/public/...`) e `src/services/admin-api/httpAdminApiClient.ts` (rotas `/admin/...` e algumas leituras `/public/...` onde o CMS reutiliza dados públicos). A UI obtém dados via fábricas em `createPublicApiClient` / `createAdminApiClient`, não chamando Axios diretamente nas páginas.
- **Envelope**: respostas seguem o contrato tratado por `unwrapResource` / `unwrapCollection` em `src/services/api/httpEnvelope.ts`.
- **Mapeamento BFF → entidades de UI**: funções em `src/services/api/mappers/*` (`*FromApi`) são a fonte única para transformar `Record<string, unknown>` (ou resource já tipado) nos tipos de `@/entities/*`. Evitar duplicar o mesmo mapeamento em domínios.
- **Erros**: após tratar casos especiais (por exemplo 404 → `null`), propagar falhas com `toApiError` de `src/services/api/apiError.ts` para que a UI não dependa de `AxiosError`. Mensagens amigáveis podem usar `message` / `error` no body da resposta quando existirem; cabeçalhos `X-Request-Id` / `x-request-id` são preservados em `ApiError.requestId` para suporte e logs.

Documentação complementar: [Integração front-end ↔ API](frontend-api-integration.md).
