# Catálogo de eventos — front-end

Aplicação **React + TypeScript + Vite** (área pública + CRM). Este README concentra **como deixar o front publicado e operável**: AWS, GitHub Actions, Terraform e variáveis de build. Detalhes de engenharia: [`README-ENGINEERING.md`](./README-ENGINEERING.md). Infra Terraform aprofundada: [`infra/README.md`](./infra/README.md). **Handover / entrega ao cliente:** [`docs/index.md`](./docs/index.md).

---

## Pré-requisitos na máquina do desenvolvedor

| Ferramenta                       | Uso                                                             |
| -------------------------------- | --------------------------------------------------------------- |
| **Node.js** (ex.: 20) + **Yarn** | Desenvolvimento e build local                                   |
| **Terraform** ≥ 1.5              | Provisionar S3 + CloudFront (opcional se a infra já existir)    |
| **AWS CLI**                      | `terraform` com backend S3, `aws s3 sync`, inspeção de recursos |

---

## AWS CLI — instalação e configuração

### Instalação

- **Linux (pacote oficial):** siga [Installing the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) (ex.: instalador bundled ou gestor de pacotes da distro).
- **macOS:** `brew install awscli` ou instalador da AWS.
- **Windows:** instalador MSI da AWS ou `winget install Amazon.AWSCLI`.

Confirme: `aws --version`.

### Credenciais (`aws configure`)

Após criar um utilizador IAM (ou perfil SSO) com permissões adequadas na conta:

```bash
aws configure
```

Informe:

- **AWS Access Key ID** e **AWS Secret Access Key** (ou use **profiles** e `AWS_PROFILE` se preferir).
- **Default region name** — ex.: `us-east-1` (CloudFront e muitos recursos usam esta região para chamadas de API).
- **Default output format** — `json` costuma ser o mais prático.

Para múltiplos perfis:

```bash
aws configure --profile celeiro-dev
export AWS_PROFILE=celeiro-dev
```

**Nota:** o deploy via **GitHub Actions** usa **OIDC** (role IAM), não estas chaves na CI. O `aws configure` é sobretudo para **Terraform local** e comandos manuais na sua máquina.

---

## Parte A — Configurações na AWS

### A1. Infraestrutura (S3 + CloudFront)

**Onde:** no repositório, `infra/terraform/environments/<ambiente>/` (ex.: `dev`).

**O que entrega (resumo):** bucket S3 (conteúdo do build), distribuição CloudFront na frente do bucket (SPA: erros 403/404 → `index.html`), cache e headers conforme o módulo.

**Primeiro uso (exemplo dev):**

```bash
cd infra/terraform/environments/dev
cp terraform.tfvars.example terraform.tfvars
# Edite terraform.tfvars conforme o ambiente
terraform init
terraform plan
terraform apply
```

Valores que você vai precisar depois para **GitHub Secrets** ou deploy manual:

- Nome do bucket → secret **`S3_BUCKET`**
- ID da distribuição CloudFront → secret **`CLOUDFRONT_DISTRIBUTION_ID`**
- URL pública → ver secção **Terraform — outputs** abaixo

---

### A2. Provedor de identidade OIDC (GitHub → AWS)

**Caminho no console:** **IAM → Identity providers → Add provider** (OpenID Connect).

| Campo            | Valor                                         |
| ---------------- | --------------------------------------------- |
| **Provider URL** | `https://token.actions.githubusercontent.com` |
| **Audience**     | `sts.amazonaws.com`                           |

Isto permite que o GitHub Actions obtenha um token que a AWS aceita para **assumir uma IAM Role** sem chaves de longa duração no GitHub.

---

### A3. IAM Role para o deploy (ex.: `celeiro-front`)

**Caminho:** **IAM → Roles →** criar/editar a role usada pelo workflow.

**Terraform (recomendado):** módulo `infra/terraform/modules/github_oidc_frontend_deploy` — trust **padrão** só em `refs/heads/main` (`allow_all_branches=false`). Exemplo de wiring: copie `infra/terraform/environments/dev/github_oidc.tf.example` para `github_oidc.tf`, preencha org/repo e faça `terraform apply`. Se o OIDC provider GitHub já existir na conta, use `create_oidc_provider = false`.

**Dois tipos de documento (não confundir):**

1. **Trust policy** — aba **Trust relationships** **da role**
   - Contém `Principal` (Federated → ARN do OIDC provider) e ação `sts:AssumeRoleWithWebIdentity`.
   - Condições: `token.actions.githubusercontent.com:aud` = `sts.amazonaws.com` e `...:sub` alinhado ao **repositório e branch** (ex.: `repo:ORG/REPO:ref:refs/heads/main`).
   - **Não** cole isto em **IAM → Policies** avulsas: políticas de identidade **não** podem ter `Principal`.

2. **Identity policy** — aba **Permissions** **da mesma role**
   - Apenas `Effect`, `Action`, `Resource` (sem `Principal`).

**Erro comum:** trust policy restrita à `main` mas o workflow corre noutra branch → `Not authorized to perform sts:AssumeRoleWithWebIdentity`. Ajuste o `sub` ou execute o deploy na branch permitida.

---

### A4. Permissões da role (S3 + CloudFront)

**Caminho:** **IAM → Roles →** sua role → **Permissions**.

**S3** (necessário para `aws s3 sync`):

| Ação                                              | Recurso                                  |
| ------------------------------------------------- | ---------------------------------------- |
| `s3:ListBucket`, `s3:GetBucketLocation`           | `arn:aws:s3:::NOME_DO_BUCKET` (sem `/*`) |
| `s3:GetObject`, `s3:PutObject`, `s3:DeleteObject` | `arn:aws:s3:::NOME_DO_BUCKET/*`          |

Sem `ListBucket` no ARN do **bucket**, o sync falha com `AccessDenied` em `ListObjectsV2`.

**CloudFront:**

| Ação                            | Recurso                                                       |
| ------------------------------- | ------------------------------------------------------------- |
| `cloudfront:CreateInvalidation` | `arn:aws:cloudfront::ACCOUNT_ID:distribution/DISTRIBUTION_ID` |

Use o **ID completo** da distribuição; ARN incompleto ou placeholder inválido impede a política de funcionar como esperado.

O **nome do bucket** na policy IAM deve ser **idêntico** ao secret **`S3_BUCKET`** no GitHub (apenas o nome, sem `s3://`).

---

### A5. Endereço público do site (CloudFront)

**Console:** **CloudFront → Distributions →** sua distribuição → **Domain name** (`https://dxxxxxxxx.cloudfront.net`).

Com domínio próprio (Fase 2 do Terraform), os aliases aparecem em **Alternate domain names (CNAMEs)**; até lá, o URL de teste é o **domain name** gerado pela AWS.

---

## Terraform — comandos úteis e outputs

Execute a partir da raiz do repositório (ajuste `dev` se usar outro ambiente).

### Ver todos os outputs

```bash
terraform -chdir=infra/terraform/environments/dev output
```

### Valores individuais (úteis para secrets e browser)

```bash
terraform -chdir=infra/terraform/environments/dev output -raw s3_bucket_name
terraform -chdir=infra/terraform/environments/dev output -raw cloudfront_distribution_id
terraform -chdir=infra/terraform/environments/dev output -raw cloudfront_domain_name
terraform -chdir=infra/terraform/environments/dev output -raw cloudfront_url
```

### Lista de URLs HTTPS públicas (quando definidas no módulo)

```bash
terraform -chdir=infra/terraform/environments/dev output public_https_urls
```

### Estado e diagnóstico

```bash
terraform -chdir=infra/terraform/environments/dev output
terraform -chdir=infra/terraform/environments/dev state list
```

**Quem clona o projeto:** após `terraform init` + `apply` (ou apontar para um **backend remoto** partilhado pela equipa), estes comandos devolvem o **bucket**, **distribution id** e **URL CloudFront** **desse ambiente** — não copie outputs de outra conta ou de outro estado.

---

## Parte B — Configurações no GitHub

### B1. Workflow

**Ficheiro:** `.github/workflows/deploy-frontend.yml`.

**Fluxo:** checkout → **validação** (nome do bucket, HTTPS nas URLs de API quando definidas, opcional prefixo do bucket e exigência de `VITE_PUBLIC_SITE_URL`) → Node/Yarn → `yarn build` → credenciais AWS → `aws s3 sync dist/ ... --delete` → `aws cloudfront create-invalidation ... --paths "/*"`.

**Concorrência:** `concurrency` com `cancel-in-progress: false` evita dois deploys simultâneos no mesmo repositório terminarem em estado incoerente.

**Environment GitHub:** o job usa o environment **`frontend-deploy`** por defeito (ou o nome em `DEPLOY_GITHUB_ENVIRONMENT`). Crie-o em **Settings → Environments** na primeira falha; pode adicionar **required reviewers** e secrets por ambiente.

**Permissões OIDC:** o workflow define `permissions: id-token: write` (e `contents: read`).

**Condições `if:`:** não é permitido usar `secrets` em expressões `if`. O modo de autenticação legado por **chaves** é selecionado com a **variável de repositório** `AWS_AUTH_METHOD` = `access-key`. Com OIDC, **não** defina essa variável (ou use qualquer valor diferente de `access-key`).

---

### B2. Secrets (Settings → Secrets and variables → Actions)

**Caminho:** repositório GitHub → **Settings → Secrets and variables → Actions → New repository secret**.

| Secret                       | Descrição                                                                                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AWS_ROLE_ARN`               | ARN da IAM Role para OIDC (ex.: `arn:aws:iam::ACCOUNT:role/nome-da-role`)                                                                         |
| `S3_BUCKET`                  | **Somente** o nome do bucket (letras minúsculas/números/hífen conforme regras S3; **sem** `s3://`, **sem** barra final, **sem** espaços ao colar) |
| `CLOUDFRONT_DISTRIBUTION_ID` | ID da distribuição (ex.: `E...`)                                                                                                                  |
| `VITE_PUBLIC_BFF_BASE_URL`   | URL HTTPS da API pública usada no build                                                                                                           |
| `VITE_PUBLIC_SITE_URL`       | Opcional até haver domínio estável: URL pública HTTPS **sem** barra final (canonical, robots, sitemap)                                            |
| `VITE_ADMIN_BFF_BASE_URL`    | Opcional                                                                                                                                          |
| `VITE_PUBLIC_GTM_ID`         | Opcional (Google Tag Manager)                                                                                                                     |

**Erro comum:** `S3_BUCKET` com `s3://...` ou URL → falha de validação do CLI (`Invalid bucket name`). O workflow também rejeita nomes inválidos **antes** do `sync`.

O mesmo passo de validação exige **`CLOUDFRONT_DISTRIBUTION_ID`** com formato plausível e, em modo OIDC (padrão), um **`AWS_ROLE_ARN`** com prefixo `arn:aws:iam::` + conta de 12 dígitos + `:role/`.

---

### B3. Variáveis (Settings → Variables)

| Variable                       | Uso                                                                                                                                                                      |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `AWS_REGION`                   | Opcional; padrão do workflow: `us-east-1`                                                                                                                                |
| `AWS_AUTH_METHOD`              | Defina `access-key` **apenas** se usar chaves IAM no GitHub (legado); para OIDC, omita                                                                                   |
| `DEPLOY_S3_BUCKET_PREFIX`      | Opcional; se definida, o secret `S3_BUCKET` **tem** de começar por esse texto (reduz risco de `sync --delete` no bucket errado)                                          |
| `REQUIRE_VITE_PUBLIC_SITE_URL` | Defina `true` em go-live para **falhar** o job se `VITE_PUBLIC_SITE_URL` estiver vazio                                                                                   |
| `DEPLOY_GITHUB_ENVIRONMENT`    | Opcional; nome do GitHub Environment do job (padrão: `frontend-deploy`)                                                                                                  |
| `DEPLOY_ALLOW_HTTP_BFF`        | **`true` só em laboratório.** Se definida, o secret `VITE_PUBLIC_BFF_BASE_URL` pode ser `http://` (ex.: ALB dev sem certificado). Em produção, omita e use sempre HTTPS. |

**Termo “OIDC” neste repositório:** no deploy, refere-se a **GitHub Actions → AWS IAM** (`aws-actions/configure-aws-credentials` com `role-to-assume`), **não** a login OAuth no browser. O CRM continua com **email/senha + JWT** via `POST .../auth/login` no BFF.

---

### B4. Executar o deploy

**Caminho:** **Actions →** workflow **Deploy frontend (S3 + CloudFront) → Run workflow**.

Escolha a **branch** compatível com a **trust policy** da role (ex.: `main`). Se a policy só permitir `refs/heads/main`, runs noutras branch falham no passo `configure-aws-credentials`.

---

## Parte C — Build sem domínio próprio (`VITE_PUBLIC_SITE_URL`)

Se **não** definir `VITE_PUBLIC_SITE_URL` no build:

- O bundle **não assume** um host fixo; o utilizador acede pelo URL real (ex.: `https://d....cloudfront.net`).
- **Canonical** (`link rel="canonical"`): não é definido nas páginas públicas quando a base está vazia.
- **Pós-build** (`scripts/finalize-public-seo.mjs`): `robots.txt` mantém regras básicas, mas **não** inclui `Sitemap:`; **não** gera `sitemap.xml` com URLs absolutas (ou remove o ficheiro em `dist/`).

Quando tiver **domínio + HTTPS** apontando para o CloudFront, defina `VITE_PUBLIC_SITE_URL` no secret do GitHub (HTTPS, sem barra final) e faça um **novo** build/deploy.

---

## Desenvolvimento local (rápido)

```bash
yarn install
cp .env.example .env.local   # ajuste VITE_* para a sua API local/remota
yarn dev
```

Build de produção local:

```bash
yarn build
```

Servir `dist` localmente (opcional): `npx serve -s dist`.

---

## Documentação relacionada

- [`README-ENGINEERING.md`](./README-ENGINEERING.md) — visão técnica do projeto
- [`infra/README.md`](./infra/README.md) — Fase 1/2, rollback, domínio próprio
- [`docs/operations/fase3-public-delivery-hardening.md`](./docs/operations/fase3-public-delivery-hardening.md) — SEO técnico mínimo, checklist go-live
- [`docs/operations/production-gate.md`](./docs/operations/production-gate.md) — gate de produção
