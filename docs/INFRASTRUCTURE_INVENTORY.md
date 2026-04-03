# Inventário de infraestrutura (auditável)

Este documento descreve **o que o repositório provisiona via Terraform** e **o que permanece manual ou externo**, com base no código em `infra/terraform/` (não é uma promessa genérica de “deve existir na AWS”).

Ver também: [index.md](./index.md) · [SECRETS_AND_VARIABLES.md](./SECRETS_AND_VARIABLES.md) · [infra/README.md](../infra/README.md)

---

## 1. Criado automaticamente via Terraform

### 1.1 Módulo `spa_static_site` (`infra/terraform/modules/spa_static_site/`)

| Recurso                                    | Descrição                                                                                                                                                                                                                              |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **S3 bucket**                              | Bucket com prefixo derivado de `project_name` + `environment` (nome final atribuído pela AWS).                                                                                                                                         |
| **S3 public access block**                 | Bloqueio total de acesso público ao bucket.                                                                                                                                                                                            |
| **S3 server-side encryption**              | Criptografia em repouso **SSE-S3 (AES256)**.                                                                                                                                                                                           |
| **CloudFront Origin Access Control (OAC)** | Acesso do CloudFront ao S3 via assinatura SigV4 (não é OAI legado).                                                                                                                                                                    |
| **CloudFront response headers policy**     | Headers de segurança (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, XSS Protection, Permissions-Policy; HSTS opcional quando há certificado customizado).                                                                  |
| **CloudFront distribution**                | SPA: `default_root_object` = `index.html`; comportamento default (cache policy _CachingDisabled_); `assets/*` com _CachingOptimized_; `403`/`404` → `200` + `/index.html`; certificado default `*.cloudfront.net` ou ACM (ver Fase 2). |
| **S3 bucket policy**                       | Permite `s3:GetObject` apenas ao serviço CloudFront com condição no ARN da distribuição.                                                                                                                                               |

**Não** são criados por este módulo: WAF, Lambda@Edge, logs de acesso dedicados, buckets de log separados, Route 53, ACM (exceto via Fase 2 no ambiente `dev`).

### 1.2 Ambiente `dev` — Fase 2 opcional (`infra/terraform/environments/dev/phase2_custom_domain.tf`)

Ativa quando `enable_phase2_custom_domain = true` **e** variáveis obrigatórias estão preenchidas (zona DNS, aliases, domínio ACM). Caso contrário, estes recursos **não** existem.

| Recurso                          | Descrição                                                                              |
| -------------------------------- | -------------------------------------------------------------------------------------- |
| **ACM certificate**              | Região **us-east-1** (requisito CloudFront), validação **DNS**.                        |
| **Route 53 records (validação)** | CNAMEs de validação do ACM na zona pública referenciada.                               |
| **ACM certificate validation**   | Aguarda certificado emitido.                                                           |
| **Route 53 A + AAAA (alias)**    | Um par por hostname em `cloudfront_aliases`, apontando para a distribuição CloudFront. |

Pré-requisito: **hosted zone pública** no Route 53 na mesma conta (ou delegação NS do registrador para ela). O Terraform **não** cria a zona nem compra domínio.

### 1.3 Módulo `github_oidc_frontend_deploy` (opcional, não aplicado por padrão)

Arquivo de exemplo: `infra/terraform/environments/dev/github_oidc.tf.example` (copiar para `github_oidc.tf` e aplicar).

| Recurso               | Descrição                                                                                                                           |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **IAM OIDC provider** | Opcional (`create_oidc_provider`); URL `token.actions.githubusercontent.com`.                                                       |
| **IAM role**          | Trust policy para `sts:AssumeRoleWithWebIdentity` com claim `sub` restrito (main, environment do GitHub, ou padrão customizado).    |
| **IAM inline policy** | `s3:PutObject`, `GetObject`, `DeleteObject`, `ListBucket` no ARN do bucket; `cloudfront:CreateInvalidation` no ARN da distribuição. |

---

## 2. Ainda manual ou externo ao Terraform

| Item                              | Motivo / onde configurar                                                                                                                                               |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Conta AWS do cliente**          | Dono dos recursos; credenciais locais ou CI.                                                                                                                           |
| **Backend do estado Terraform**   | Por padrão comentado; copiar `backend.tf.example` → `backend.tf` para S3 + DynamoDB (recomendado em time).                                                             |
| **`terraform.tfvars`**            | Cópia local a partir de `terraform.tfvars.example` (gitignored).                                                                                                       |
| **Hosted zone Route 53** (Fase 2) | Domínio e delegação NS no registrador.                                                                                                                                 |
| **Repositório GitHub**            | Criar repo, push do código, branch protection, environments.                                                                                                           |
| **GitHub Secrets e Variables**    | Ver [SECRETS_AND_VARIABLES.md](./SECRETS_AND_VARIABLES.md).                                                                                                            |
| **Trust OIDC**                    | Deve refletir **org/repo reais** e, com `environment:` no workflow, o claim `repo:ORG/REPO:environment:NOME`. Erro de `sub` é causa frequente de falha de assume role. |
| **BFF / API**                     | Fora deste stack; CORS e URLs em `VITE_PUBLIC_BFF_BASE_URL` etc.                                                                                                       |
| **Conteúdo do site**              | `yarn build` + `aws s3 sync` ou pipeline `deploy-frontend.yml`.                                                                                                        |

---

## 3. O que o GitHub Actions faz (não é Terraform)

O workflow [`.github/workflows/deploy-frontend.yml`](../.github/workflows/deploy-frontend.yml) **assume** que bucket e distribuição **já existem**. Ele:

1. Valida secrets/variáveis e ambiente Vite (`scripts/validate-vite-build-env.mjs`).
2. Faz build (`yarn build`).
3. Autentica na AWS (OIDC recomendado ou chaves legadas).
4. Sincroniza `dist/` para o bucket (`aws s3 sync --delete`).
5. Cria invalidação CloudFront `/*`.

Não cria S3, CloudFront nem IAM via Actions.

---

## 4. Acoplamentos a “uma conta ou repo específicos”

Nada no Terraform fixa **account ID** no código-fonte; o estado e os ARNs são gerados na conta onde se roda `apply`.

Acoplamento real:

- **`terraform.tfvars`**: `project_name`, `environment`, Fase 2 (domínios).
- **Módulo OIDC**: `github_org`, `github_repo`, `github_environment_name` / `allowed_ref_pattern` devem bater com o repositório e o Environment do workflow.
- **Secrets do GitHub**: nomes de bucket e ID de distribuição devem ser os **outputs** do Terraform na conta do cliente.

---

## 5. Alterações recentes relevantes ao inventário

- Criptografia **SSE-S3** explícita no bucket do módulo `spa_static_site`.
- Outputs `s3_bucket_arn` e `cloudfront_distribution_arn` no ambiente `dev` para integração com o módulo OIDC e documentação de IAM.
- `infra/terraform/environments/dev/.terraform.lock.hcl` passa a poder ser versionado (removido ignore global do lock em `.gitignore`).
