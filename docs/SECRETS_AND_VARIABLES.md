# Secrets e variáveis (GitHub — deploy)

Referência para configurar o repositório do **cliente** antes de rodar [`.github/workflows/deploy-frontend.yml`](../.github/workflows/deploy-frontend.yml) (`workflow_dispatch`).

Relacionados: [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md) · [INFRASTRUCTURE_INVENTORY.md](./INFRASTRUCTURE_INVENTORY.md) · [CLIENT_HANDOVER.md](./CLIENT_HANDOVER.md)

---

## Onde configurar

- **Secrets:** repositório → **Settings → Secrets and variables → Actions → Secrets**.
- **Variables:** mesmo caminho, aba **Variables**.
- **Environment:** o job usa `environment: ${{ vars.DEPLOY_GITHUB_ENVIRONMENT || 'frontend-deploy' }}`. Secrets podem ser por environment; alinhe o nome com o Terraform OIDC (`github_environment_name`).

---

## Secrets obrigatórios (modo OIDC recomendado)

| Secret                       | Descrição                                                                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `AWS_ROLE_ARN`               | ARN da role IAM assumível via GitHub OIDC (`arn:aws:iam::ACCOUNT_ID:role/...`). Gerada pelo módulo `github_oidc_frontend_deploy` ou equivalente. |
| `S3_BUCKET`                  | Nome do bucket (apenas o nome; sem `s3://`). Saída Terraform: `terraform output -raw s3_bucket_name`.                                            |
| `CLOUDFRONT_DISTRIBUTION_ID` | ID da distribuição (ex.: `E...`). Saída: `terraform output -raw cloudfront_distribution_id`.                                                     |
| `VITE_PUBLIC_BFF_BASE_URL`   | URL HTTPS do BFF usada no build (obrigatória na validação de deploy).                                                                            |

---

## Secrets opcionais

| Secret                    | Descrição                                                                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_PUBLIC_SITE_URL`    | URL pública do site (HTTPS); usada em SEO/canonical/robots conforme app. Pode ser exigida com variável `REQUIRE_VITE_PUBLIC_SITE_URL=true`. |
| `VITE_ADMIN_BFF_BASE_URL` | Base URL do BFF admin, se diferente da pública.                                                                                             |
| `VITE_PUBLIC_GTM_ID`      | Google Tag Manager (se usado).                                                                                                              |
| `VITE_PUBLIC_SENTRY_DSN`  | Sentry browser (se usado).                                                                                                                  |

---

## Modo legado (evitar em produção)

Defina **variable** `AWS_AUTH_METHOD` = `access-key` e configure:

| Secret                  | Descrição                                                             |
| ----------------------- | --------------------------------------------------------------------- |
| `AWS_ACCESS_KEY_ID`     | Chave de acesso IAM com permissão no bucket e invalidação CloudFront. |
| `AWS_SECRET_ACCESS_KEY` | Secret correspondente.                                                |

Neste modo, `AWS_ROLE_ARN` não é usado pelo passo OIDC (o workflow ainda valida formato se OIDC for o caminho — seguir documentação do workflow).

---

## Variáveis de repositório (recomendadas)

| Variable                       | Valor típico                  | Efeito                                                                                               |
| ------------------------------ | ----------------------------- | ---------------------------------------------------------------------------------------------------- |
| `DEPLOY_GITHUB_ENVIRONMENT`    | `frontend-deploy`             | Nome do GitHub Environment do job; deve coincidir com trust OIDC se usar `repo:...:environment:...`. |
| `AWS_REGION`                   | `us-east-1`                   | Região dos comandos AWS CLI no runner (S3/CloudFront API).                                           |
| `DEPLOY_S3_BUCKET_PREFIX`      | ex.: `celeiro-front-dev-spa-` | Se definido, o secret `S3_BUCKET` deve começar com esse prefixo (evita deploy no bucket errado).     |
| `REQUIRE_VITE_PUBLIC_SITE_URL` | `true`                        | Exige `VITE_PUBLIC_SITE_URL` no build de deploy.                                                     |
| `DEPLOY_ALLOW_HTTP_BFF`        | `true` (só lab)               | Permite BFF em `http://` na validação (caso contrário só HTTPS).                                     |

Não defina `AWS_AUTH_METHOD` (ou deixe diferente de `access-key`) para usar OIDC.

---

## Validação

1. No GitHub, confirmar que todos os secrets obrigatórios existem no **environment** correto (se usar secrets por environment).
2. Rodar o workflow; o primeiro passo falha com mensagem explícita se algo estiver vazio ou com formato inválido.
3. Se `AssumeRoleWithWebIdentity` falhar: revisar trust da role — com `environment:` no job, o `sub` é `repo:ORG/REPO:environment:NOME`, não `ref:refs/heads/main`.

---

## CI (qualidade) — não confundir com deploy

O workflow [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) não exige os secrets de deploy. Variáveis de build de CI podem existir em `ci.yml`; consulte o ficheiro e [operations/github-governance-and-security.md](./operations/github-governance-and-security.md).
