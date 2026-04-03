# Gate antes de produção ou Fase 2 (SEO)

Checklist derivada da revisão de production-readiness. Itens **já tratados** no repositório aparecem como concluídos na medida do possível no front/infra; o restante depende de API, DNS e processo.

## Já endereçado no front / Terraform Fase 1

- [x] Headers de segurança básicos no CloudFront (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `X-XSS-Protection`, `Permissions-Policy`).
- [x] `robots.txt` com `Disallow: /admin`.
- [x] Meta `noindex, nofollow` na área admin (layouts CRM).
- [x] `index.html`: `lang="pt-BR"`, meta description, favicon SVG válido.
- [x] Workflow GitHub Actions para build + S3 + invalidação (manual), com validação de bucket/HTTPS e fila de concorrência.
- [x] Exemplo de backend Terraform remoto (`backend.tf.example`) com passos numerados.
- [x] Rotas públicas desconhecidas: página 404 com `meta robots noindex` (não redireciona mais para `/` — mitigação parcial a soft 404/SPA).

## Ainda obrigatório antes de “produção” real

- [x] **API apenas HTTPS** no build de CI — o workflow falha se `VITE_PUBLIC_BFF_BASE_URL` ou `VITE_ADMIN_BFF_BASE_URL` estiverem definidos e **não** começarem com `https://`. (CORS e política do BFF continuam do lado da API.)
- [ ] **CORS** na API para a origem exata do front (CloudFront ou domínio) — não é configurável só no front.
- [x] **Auth CRM via API** — com URL de BFF no build, login usa `POST .../auth/login` + JWT; **mock só em `import.meta.env.DEV` sem URL**. Build de produção sem URL **não** autentica com credenciais falsas.
- [x] **Deploy GitHub Actions** — workflow valida bucket/HTTPS; **OIDC** recomendado (`AWS_ROLE_ARN`). Módulo Terraform `github_oidc_frontend_deploy` com trust **padrão só em `main`** (`allow_all_branches=false`); laboratório: `allow_all_branches=true` explícito.
- [ ] **Backend Terraform** S3 + lock ativado quando mais de uma pessoa gerir infra (copiar `backend.tf.example` → `backend.tf`).
- [ ] **Domínio próprio + ACM** quando sair do hostname `*.cloudfront.net`.
- [x] **Cliente HTTP público** alinhado ao contrato da API (envelope, paths) — manter testes ao evoluir o BFF.
- [ ] **GitHub Environment** `frontend-deploy` (ou o nome em `DEPLOY_GITHUB_ENVIRONMENT`) — criar em **Settings → Environments** se o job falhar; opcional: requerentes aprovadores e secrets por ambiente.

## Fase 3 — entrega pública (v1) — concluído no repositório

- [x] `robots.txt` / `sitemap.xml` gerados no build quando `VITE_PUBLIC_SITE_URL` está definida (`scripts/finalize-public-seo.mjs`).
- [x] Metadata e canonical por rota pública (hook `usePublicPageMetadata` + env canônica).
- [x] GTM opcional via `VITE_PUBLIC_GTM_ID` (único ponto de injeção no HTML).
- [x] Erros globais em produção encaminhados a `reportPublicError` (extensível).

Ver checklist operacional: `docs/operations/fase3-public-delivery-hardening.md`.

## Fase posterior (SEO forte) — quando priorizado

- HTML rico por URL (SSR/pré-render/edge) conforme ADRs de arquitetura; sitemap dinâmico para fichas.

## Revisão periódica

- Política **CSP** no CloudFront (começar restritiva em staging).
- **WAF** e logs de acesso CloudFront para tráfego público relevante.

---

## Checklist manual (validação na tua conta / equipa)

Marca à medida que concluíres. Itens que **não** são automatizados só no repositório.

### GitHub

#### Diagnóstico rápido: “OIDC parou” vs outras falhas

- **OIDC aqui =** autenticação **GitHub → AWS** no job de deploy (secret `AWS_ROLE_ARN`, `permissions: id-token: write`). **Não** é o login do painel `/admin` (esse é JWT no BFF).
- O workflow corre **validação** e **`yarn build` antes** de obter credenciais AWS. Se o job falha cedo (ex.: `VITE_PUBLIC_BFF_BASE_URL` inválido, build quebrado), o passo **Configure AWS credentials (OIDC)** **não executa** — o log pode parecer “OIDC”, mas a causa é anterior.
- **Trust IAM:** a role OIDC do módulo Terraform costuma permitir só `refs/heads/main`. Deploy a partir de outra branch pode falhar em `AssumeRoleWithWebIdentity` até ajustar `allow_all_branches` / `allowed_ref_pattern` no Terraform.
- **BFF em HTTP (dev):** o workflow exige HTTPS por defeito. Para ALB sem TLS só em laboratório, use a variável de repositório **`DEPLOY_ALLOW_HTTP_BFF=true`** (ver README Parte B).

- [ ] **Environment** `frontend-deploy` criado (**Settings → Environments**) ou variável `DEPLOY_GITHUB_ENVIRONMENT` aponta para um environment existente.
- [ ] (Recomendado em produção) **Required reviewers** nesse environment antes do job de deploy.
- [ ] Secrets corretos: `S3_BUCKET`, `CLOUDFRONT_DISTRIBUTION_ID`, `AWS_ROLE_ARN` (OIDC), `VITE_PUBLIC_BFF_BASE_URL` (HTTPS).
- [ ] (Go-live SEO) `VITE_PUBLIC_SITE_URL` preenchido (HTTPS, sem barra final) e variável `REQUIRE_VITE_PUBLIC_SITE_URL=true`.
- [ ] (Opcional) `DEPLOY_S3_BUCKET_PREFIX` igual ao prefixo real dos buckets de front (reduz risco de bucket errado).
- [ ] **Dependabot** ativo (**Settings → Code security → Dependabot**) para receber PRs de `.github/dependabot.yml`.
- [ ] Revisar **trust policy** da role IAM de deploy na AWS: idealmente só `refs/heads/main` (ou aplicar módulo `github_oidc_frontend_deploy`).

### AWS — IAM

- [ ] Role de deploy **sem** permissões extra (ex.: não precisa de `s3:PutObjectAcl` com bucket moderno); alinhar política manual com o módulo Terraform se tiveres divergência.
- [ ] **ListBucket** no ARN do bucket + objetos em `/*` na mesma política.

### AWS — Terraform

- [ ] Com **2+ pessoas** ou CI a aplicar infra: `backend.tf` a partir de `backend.tf.example` (S3 state + DynamoDB lock).
- [ ] `terraform plan` limpo antes de merges que toquem em `infra/`.

### API (BFF)

- [ ] **CORS** permite apenas a origem do site (CloudFront ou domínio final), não `*`.
- [ ] Endpoints sensíveis com **autenticação/autorização** corretas; nada de segredos em `VITE_*` no front.

### Pós-deploy / produto

- [ ] Smoke: home, listagens, ficha, **refresh** em rota profunda, `/admin/login`, chamada API real.
- [ ] `curl -sI https://<site>/robots.txt` e `/sitemap.xml` (quando `VITE_PUBLIC_SITE_URL` existir no build).
- [ ] Search Console: propriedade + sitemap (quando aplicável).
