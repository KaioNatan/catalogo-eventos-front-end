# Infraestrutura — front estático (Terraform)

Documentação de entrega e inventário auditável: [`../docs/index.md`](../docs/index.md) · [`../docs/INFRASTRUCTURE_INVENTORY.md`](../docs/INFRASTRUCTURE_INVENTORY.md) · [`../docs/DEPLOY_CHECKLIST.md`](../docs/DEPLOY_CHECKLIST.md).

## Objetivo

Provisionar **S3 (privado) + CloudFront + OAC**, **fallback SPA** (403/404 → `index.html`), **cache** (`assets/*` otimizado, default sem cache agressivo), **headers de segurança** e, na **Fase 2 opcional**, **ACM (us-east-1) + Route 53** para **HTTPS no domínio próprio** e **HSTS**.

> **Fase 2 (este documento, infra):** domínio, TLS e DNS.  
> **Fase 2 SEO / renderização** (SSR, pré-render, etc.) é **outra linha de trabalho** — não faz parte deste Terraform.

## Pré-requisitos

- Terraform `>= 1.5`
- AWS CLI (`aws configure` ou env)
- Permissões: S3, CloudFront, Route 53, ACM; IAM para bucket policy
- **Fase 2:** hosted zone **pública** no Route 53 na mesma conta (ou delegação NS apontando para ela)

## Layout

```text
infra/terraform/
  modules/spa_static_site/     # bucket + OAC + CloudFront + headers
  environments/dev/            # exemplo: Fase 1 default; Fase 2 via variáveis
```

## Fase 1 — laboratório (`*.cloudfront.net`)

```bash
cd infra/terraform/environments/dev
cp terraform.tfvars.example terraform.tfvars   # manter enable_phase2_custom_domain = false (omitido)
terraform init
terraform plan
terraform apply
```

## Fase 2 — domínio próprio (mínimo)

### Arquitetura

```text
Usuário → Route 53 (A/AAAA alias) → CloudFront (certificado ACM us-east-1, SNI)
              → S3 origem (OAC, sem acesso público)
Build: yarn build → aws s3 sync dist/ → create-invalidation
API/BFF: fora deste stack; browser chama URL em VITE_PUBLIC_BFF_BASE_URL (CORS deve permitir o hostname do front).
```

### Variáveis (`terraform.tfvars`)

Defina:

- `enable_phase2_custom_domain = true`
- `dns_hosted_zone_name` — ex.: `"exemplo.com.br."` (com ponto final)
- `cloudfront_aliases` — ex.: `["app.exemplo.com.br"]` (deve bater com o certificado)
- `acm_primary_domain_name` — FQDN primário do certificado (ex.: mesmo `app.exemplo.com.br`)
- `acm_subject_alternative_names` — opcional (ex.: `www`)
- `hsts_max_age_sec` — padrão `31536000` (1 ano); use `0` só se precisar desligar HSTS

Depois:

```bash
terraform plan
terraform apply
```

O fluxo cria o pedido **ACM na região `us-east-1`**, registros **CNAME de validação** na zona Route 53, aguarda **validação**, atualiza o **CloudFront** com **aliases + ACM**, cria **A/AAAA alias** para cada hostname em `cloudfront_aliases`.

### Ajustes no projeto (build / env)

| Item                           | Ação                                                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------------------------------- |
| **CORS / API**                 | No BFF, incluir `https://<seu-alias>` em `Access-Control-Allow-Origin` (ou regra equivalente).          |
| **`VITE_PUBLIC_BFF_BASE_URL`** | Continua apontando para a API (pode ser outro hostname). Mixed content: API em HTTPS.                   |
| **CI (GitHub Actions)**        | Secrets `S3_BUCKET` e `CLOUDFRONT_DISTRIBUTION_ID` **não mudam**; o sync e a invalidação seguem iguais. |
| **Canonical / SEO**            | Quando usar domínio próprio, alinhar metadados/canonical na aplicação (fora do Terraform).              |

Ver também `.env.example`.

## Publicar build Vite (Fase 1 e 2)

Na raiz do repositório:

```bash
export VITE_PUBLIC_BFF_BASE_URL="https://sua-api.../api"   # se necessário
yarn install --frozen-lockfile
yarn build

aws s3 sync dist/ "s3://$(terraform -chdir=infra/terraform/environments/dev output -raw s3_bucket_name)/" --delete

aws cloudfront create-invalidation \
  --distribution-id "$(terraform -chdir=infra/terraform/environments/dev output -raw cloudfront_distribution_id)" \
  --paths "/*"
```

## Validar após deploy

1. Abrir `terraform output public_https_urls` e testar cada URL com HTTPS.
2. Hard refresh em rotas profundas (`/eventos`, `/admin/login`): deve carregar a SPA.
3. `curl -sI "https://<alias>" | grep -i strict-transport` — com Fase 2 e HSTS > 0, header presente.
4. Segundo carregamento: assets sob `assets/*` com cache (DevTools / `curl -I` em um `.js`).
5. API: fluxo público sem erro de CORS a partir do novo origin.

## Comandos úteis

```bash
terraform -chdir=infra/terraform/environments/dev output
terraform -chdir=infra/terraform/environments/dev state list
```

## Checklist (Fase 2)

- [ ] Zona Route 53 pública correta e delegação NS no registrador (se aplicável).
- [ ] `acm_primary_domain_name` + SANs cobrem todos os `cloudfront_aliases`.
- [ ] `terraform apply` conclui sem erro; certificado ACM em **Issued**.
- [ ] Registros A/AAAA alias apontam para o distribution domain do CloudFront.
- [ ] HTTPS no navegador sem aviso de certificado.
- [ ] SPA em rotas profundas após refresh.
- [ ] CORS da API atualizado para o domínio do front.
- [ ] Pipeline de deploy (sync + invalidation) executado após mudança de `VITE_*`.

## Critérios de aceite (Fase 2 infra)

- CloudFront serve o site nos **aliases** definidos com **TLS válido** (ACM).
- **Route 53** resolve os hostnames para a distribuição (IPv4 e IPv6).
- **OAC + bucket privado** mantidos; sem listagem pública no S3.
- **403/404** continuam retornando `index.html` para o roteador da SPA.
- **HSTS** configurável; padrão recomendado com domínio estável (valor > 0).
- Documentação e variáveis permitem repetir o processo em outro ambiente.

## Riscos

| Risco                                                  | Mitigação                                                                |
| ------------------------------------------------------ | ------------------------------------------------------------------------ |
| Propagação DNS / validação ACM lenta                   | Aguardar; não remover registros CNAME de validação até `apply` concluir. |
| Certificado não cobre um alias                         | Planejar FQDN + SANs antes do `apply`.                                   |
| CORS não atualizado                                    | Checklist pós-deploy; testar chamada real do browser.                    |
| `terraform apply` atualiza CloudFront (vários minutos) | Janela de manutenção se necessário.                                      |
| Estado local perdido                                   | Usar backend remoto (`backend.tf.example`).                              |

## Rollback

1. **Somente conteúdo:** redeploy de um artefato anterior (`s3 sync` de build guardado + invalidation). Não reverte DNS/TLS.
2. **Reverter Fase 2 (voltar a só `*.cloudfront.net`):** em `terraform.tfvars` definir `enable_phase2_custom_domain = false` e limpar `dns_hosted_zone_name` / aliases / ACM vars (ou valores vazios conforme `variables.tf`); `terraform plan` deve remover aliases, certificado no CF, registros alias e recursos ACM (atenção: **emissão nova** de certificado gera novo ARN se reativar depois).
3. **Emergência:** no console CloudFront, desabilitar distribuição é último recurso (indisponibilidade).

## Estado e lock

Backend remoto: copie `backend.tf.example` → `backend.tf`. O ficheiro `environments/dev/.terraform.lock.hcl` deve ser **versionado** no Git para reprodutibilidade de providers (handover e CI local).

## Deploy via GitHub Actions

`.github/workflows/deploy-frontend.yml` (`workflow_dispatch`).

- **Preferido:** secret `AWS_ROLE_ARN` (IAM role com trust para GitHub OIDC: `token.actions.githubusercontent.com`) + permissões `s3:*` no bucket alvo e `cloudfront:CreateInvalidation`. O job usa `id-token: write`. Não defina a variável `AWS_AUTH_METHOD` (ou qualquer valor diferente de `access-key`).
- **Legado:** variável de repositório `AWS_AUTH_METHOD` = `access-key` e secrets `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` (evitar em produção). Expressões `if:` no workflow não podem usar `secrets`; por isso o modo chave é selecionado por variável, não por “secret vazio”.

Demais secrets: `S3_BUCKET`, `CLOUDFRONT_DISTRIBUTION_ID`, `VITE_PUBLIC_BFF_BASE_URL` (obrigatório para CRM real), `VITE_PUBLIC_SITE_URL` (robots/sitemap + canonical). Opcional: `VITE_ADMIN_BFF_BASE_URL`, `VITE_PUBLIC_GTM_ID`.

Variáveis de repositório úteis: `DEPLOY_S3_BUCKET_PREFIX` (prefixo obrigatório do nome do bucket), `REQUIRE_VITE_PUBLIC_SITE_URL=true` em go-live, `DEPLOY_GITHUB_ENVIRONMENT` (padrão `frontend-deploy`). Role OIDC gerível pelo módulo `infra/terraform/modules/github_oidc_frontend_deploy` (ver `environments/dev/github_oidc.tf.example`). A política do módulo **não** inclui `s3:PutObjectAcl` (desnecessário com buckets modernos); alinhe políticas IAM manuais ao mesmo princípio.

Atualizações de dependências: `.github/dependabot.yml` (ativar Dependabot no repositório se ainda não estiver).

**Fase 3 (SEO técnico mínimo no bundle):** ver `docs/operations/fase3-public-delivery-hardening.md`.

## Gate de produção

Ver `docs/operations/production-gate.md`.

## Referências

- `docs/architecture/adr-2026-03-27-fase-1-publicacao-estatica-decisao-formal.md`
- `.cursor/rules/frontend-infra-aws.mdc`
