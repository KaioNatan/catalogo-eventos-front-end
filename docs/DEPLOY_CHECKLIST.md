# Checklist de deploy (handover)

Ordem sugerida para **reproduzir o ambiente na conta AWS do cliente** e **ligar o GitHub Actions**. Marque cada item ao concluir.

Índice: [index.md](./index.md) · Detalhe de secrets: [SECRETS_AND_VARIABLES.md](./SECRETS_AND_VARIABLES.md) · Infra: [INFRASTRUCTURE_INVENTORY.md](./INFRASTRUCTURE_INVENTORY.md)

---

## Fase A — Código e repositório

- [ ] Código no GitHub do cliente (novo repo ou transferência de propriedade), branch principal definida (ex.: `main`).
- [ ] `.terraform.lock.hcl` em `infra/terraform/environments/dev/` **commitado** (reprodutibilidade de providers).
- [ ] Decisão: um ambiente Terraform por stage (`dev` / `staging` / `prod`) — copiar pasta `environments/dev` e ajustar `terraform.tfvars` se necessário.
- [ ] Branch protection e required checks alinhados ao [operations/github-governance-and-security.md](./operations/github-governance-and-security.md).

---

## Fase B — AWS (Terraform)

- [ ] Conta AWS, utilizador ou role com permissões para S3, CloudFront, IAM (e Route 53 + ACM se Fase 2).
- [ ] AWS CLI configurado localmente (`aws sts get-caller-identity`).
- [ ] (Recomendado) Backend remoto: `infra/terraform/environments/dev/backend.tf` a partir de `backend.tf.example` (bucket de state + DynamoDB lock).
- [ ] `cp terraform.tfvars.example terraform.tfvars` e ajustar `project_name`, `environment`, `aws_region`.
- [ ] Fase 1: `terraform init`, `plan`, `apply` (CloudFront default hostname).
- [ ] Anotar outputs:
  - `terraform output -raw s3_bucket_name`
  - `terraform output -raw cloudfront_distribution_id`
  - `terraform output -raw s3_bucket_arn`
  - `terraform output -raw cloudfront_distribution_arn`
- [ ] (Opcional) Fase 2: preencher variáveis de domínio em `terraform.tfvars`, `apply`, validar HTTPS nos aliases.
- [ ] (Opcional) OIDC: copiar `github_oidc.tf.example` → `github_oidc.tf`, preencher `github_org`, `github_repo`, `github_environment_name` = nome do Environment no GitHub (ex.: `frontend-deploy`), `create_oidc_provider` conforme já existe provider na conta; `apply`; anotar `role_arn` → secret `AWS_ROLE_ARN`.

---

## Fase C — GitHub (deploy)

- [ ] Criar **Environment** (ex.: `frontend-deploy`) se usar approval rules ou secrets por environment.
- [ ] Configurar [SECRETS_AND_VARIABLES.md](./SECRETS_AND_VARIABLES.md) (mínimo: `AWS_ROLE_ARN`, `S3_BUCKET`, `CLOUDFRONT_DISTRIBUTION_ID`, `VITE_PUBLIC_BFF_BASE_URL`).
- [ ] Variáveis: `DEPLOY_GITHUB_ENVIRONMENT` alinhado ao OIDC; `AWS_REGION`; opcional `DEPLOY_S3_BUCKET_PREFIX`.
- [ ] Confirmar que o trust IAM permite o claim `sub` correto (environment vs branch).

---

## Fase D — Primeiro deploy

- [ ] **Actions → Deploy frontend (S3 + CloudFront) → Run workflow**.
- [ ] Se falhar na validação Vite: ajustar secrets e variáveis conforme mensagem do script.
- [ ] Pós-sucesso: abrir URL pública ([OPERATION_GUIDE.md](./OPERATION_GUIDE.md)), testar SPA em rota profunda, CORS com o BFF.

---

## Fase E — Go-live (se aplicável)

- [ ] [operations/production-gate.md](./operations/production-gate.md)
- [ ] `REQUIRE_VITE_PUBLIC_SITE_URL=true` e `VITE_PUBLIC_SITE_URL` coerente com domínio público.
- [ ] CORS no BFF para o origin final.
