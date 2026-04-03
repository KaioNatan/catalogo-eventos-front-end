# ADR: Fase 1 — Publicação estática (decisão formal), variáveis de build e BFF

## Status

Aprovado (Fase 1 — escopo apenas publicação estática única; sem Fase 2 SEO/SSR neste ADR)

## 1. Avaliação arquitetural (resumo)

- O front é uma **SPA React + Vite**: um único `index.html` e assets estáticos após `yarn build`.
- **Páginas públicas** e **área CRM** (`/admin`) compartilham o **mesmo bundle** e a **mesma origem**; diferenciam-se por **rota e políticas de produto** (auth, SEO, mensuração), não por tipo de artefato de deploy.
- **SEO crítico** no sentido de “conteúdo indexável no primeiro HTML” **não é resolvido** pelo hosting estático sozinho (já documentado em `adr-2026-03-27-public-routes-static-vs-async-data.md` e `adr-2026-03-27-frontend-deploy-aws-and-public-seo-strategy.md`). Isso é **dívida de produto/renderização**, não obriga **dois stacks de hosting** na Fase 1.
- **BFF/API** é **separado** do bucket do front: o browser chama URLs configuradas em tempo de **build** (`VITE_*`). O CloudFront desta fase **não** faz proxy obrigatório para a API.

## 2. Decisão formal: estática única vs estratégia diferente público/CRM

| Pergunta                                                               | Decisão Fase 1                                                                                                                                                    |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A aplicação inteira pode seguir como **estática**?                     | **Sim.** Um artefato `dist/` servido por **S3 + CloudFront**.                                                                                                     |
| A área pública precisa de **infra/host distinto** do CRM nesta fase?   | **Não.** Mesma distribuição; separação lógica por rota. Evita duplicar pipeline, bucket e DNS.                                                                    |
| A área pública precisa de **estratégia diferente** para **SEO forte**? | **Sim, em fase posterior** (SSR/pré-render/edge HTML ou equivalente), **sem** mudar a decisão de Fase 1 de um único site estático até que o time priorize Fase 2. |

## 3. Critérios técnicos da decisão

1. **Tipo de artefato:** apenas arquivos estáticos — S3+CloudFront é adequado e padrão do projeto.
2. **Deep linking SPA:** exige fallback `index.html` para 403/404 — coberto na infra Terraform.
3. **Custo e operação:** uma distribuição reduz superfície operacional frente a dois sites.
4. **Segurança CRM:** não depende de bucket separado; depende de **auth no BFF**, headers, e futuro `noindex`/robots em `/admin`.
5. **SEO:** critério **fora** do escopo de “tipo de hosting” na Fase 1; rastreado como Fase 2 explícita.
6. **CORS e API:** a API/BFF deve permitir a origem do front (CloudFront/domínio); não é responsabilidade do módulo Terraform do front.

## 4. Arquitetura recomendada (Fase 1)

```text
Usuário → CloudFront (HTTPS, headers mínimos) → S3 (privado, OAC)
                ↑
           yarn build → dist/ → aws s3 sync + invalidation
                ↓
           BFF/API (ALB/API Gateway, fora deste Terraform) ← browser via VITE_PUBLIC_BFF_BASE_URL
```

- **TLS:** certificado **default** CloudFront (`*.cloudfront.net`) nesta base; ACM custom + Route 53 ficam **fora** da Fase 1 atual (próxima solicitação).
- **Cache:** comportamento dedicado para `assets/*` (cache longo); default com política desabilitada ou TTL curto para não “grudar” `index.html` antigo.

## 5. Variáveis de build (mapeamento)

| Variável                          | Obrigatória | Onde é lida                                              | Comportamento                                                                                                                                  |
| --------------------------------- | ----------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_PUBLIC_BFF_BASE_URL`        | Não         | `src/services/public-api/client.ts`, `src/vite-env.d.ts` | Se **definida** (ex.: `https://host/api`), o cliente público usa **HTTP**; se **vazia/ausente**, usa **in-memory** (útil só para dev sem API). |
| `VITE_*` futuras (ex.: analytics) | —           | —                                                        | **Não existem** no código hoje; ao adicionar, documentar aqui e em `.env.example`.                                                             |

**Build:** `yarn build` embute `import.meta.env` no bundle — cada ambiente (dev CI, staging, prod) deve injetar o `.env` ou equivalente do CI **antes** do build.

**Segurança:** tudo em `VITE_*` é **público** no browser; segredos **não** entram no front.

## 6. Dependência do BFF / API

- **Runtime:** o portal público depende de API acessível do browser na URL configurada em `VITE_PUBLIC_BFF_BASE_URL` (ex.: path `/api` incluído na base URL, conforme contrato da API).
- **CORS:** o backend deve autorizar `Origin` do front (URL CloudFront ou domínio futuro).
- **Disponibilidade:** indisponibilidade da API não é mitigada pelo CloudFront do front; UX de erro é responsabilidade da aplicação.
- **Admin:** ainda **mock** no código; integração HTTP admin/auth é **fora** desta Fase 1 infra — quando existir, novas variáveis `VITE_*` ou mesmo host com paths `/admin` devem ser documentadas.

## 7. Estratégia de publicação inicial

1. `yarn build` com `VITE_PUBLIC_BFF_BASE_URL` apontando para o ambiente alvo.
2. `aws s3 sync dist/ s3://<bucket> --delete` (ou equivalente).
3. `aws cloudfront create-invalidation --distribution-id <id> --paths "/*"` (ou caminhos mínimos).
4. Validar HTTPS na URL CloudFront, rotas profundas e chamadas à API (CORS).

## 8. Checklist de validação (pós-deploy)

- [ ] `https://<distribution>.cloudfront.net/` carrega a home.
- [ ] Refresh em `/eventos`, `/sobre`, `/admin/login` retorna a SPA (não erro XML S3).
- [ ] Asset em `assets/*` com cache hit em segundo carregamento (DevTools / `curl -I`).
- [ ] Após novo deploy, alteração em `index.html` ou JS reflete após sync + invalidação.
- [ ] Bucket **não** permite listagem pública anônima.
- [ ] Com `VITE_PUBLIC_BFF_BASE_URL` correta no build, listagens públicas chamam a API sem erro de CORS (teste manual).
- [ ] Nenhum segredo sensível visível em “Sources” do browser.

## 9. Riscos e trade-offs

| Risco / trade-off                                       | Mitigação Fase 1                                                 |
| ------------------------------------------------------- | ---------------------------------------------------------------- |
| `index.html` cacheado após release                      | Invalidação no deploy; TTL curto no default behavior.            |
| SEO fraco para fichas dinâmicas                         | Aceito na Fase 1; Fase 2 de renderização quando priorizado.      |
| Um único bucket: vazamento de escopo “público vs admin” | Mitigação é **aplicação + BFF**, não segundo bucket obrigatório. |
| URL CloudFront longa                                    | Aceitável para laboratório; domínio próprio = fase seguinte.     |
| State Terraform local perdido                           | Usar backend remoto quando o time crescer.                       |

## 10. Referências

- `infra/README.md`
- `infra/terraform/`
- `adr-2026-03-27-frontend-deploy-aws-and-public-seo-strategy.md`
- `.cursor/rules/frontend-infra-aws.mdc`

## Data

2026-03-27
