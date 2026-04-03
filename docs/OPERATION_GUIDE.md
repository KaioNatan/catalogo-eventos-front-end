# Guia de operação (pós-deploy)

Para quem **não participou do desenvolvimento**: o que monitorizar, como validar um deploy e como reverter conteúdo sem derrubar a infraestrutura.

Relacionados: [index.md](./index.md) · [INFRASTRUCTURE_INVENTORY.md](./INFRASTRUCTURE_INVENTORY.md) · [`../infra/README.md`](../infra/README.md)

---

## 1. Componentes em runtime

| Componente         | Função                                                                          |
| ------------------ | ------------------------------------------------------------------------------- |
| **S3**             | Armazena ficheiros estáticos do `yarn build` (privado; leitura via CloudFront). |
| **CloudFront**     | CDN, TLS, cache; SPA fallback 403/404 → `index.html`.                           |
| **GitHub Actions** | Build + `s3 sync` + invalidação `/*` no workflow de deploy.                     |
| **BFF/API**        | Fora deste repositório; o browser chama URLs configuradas em build (`VITE_*`).  |

---

## 2. Deploy de nova versão (rotina)

1. Garantir que `main` (ou branch política) está verde no CI.
2. **Actions → Deploy frontend (S3 + CloudFront) → Run workflow**.
3. Aguardar conclusão (invalidação pode levar alguns minutos a propagar).

**Não** é necessário `terraform apply` para cada release de front, salvo mudança de infra (domínio, aliases, etc.).

---

## 3. Validação após deploy

Use também a secção “Validar após deploy” em [`../infra/README.md`](../infra/README.md).

- Abrir `terraform output public_https_urls` (ou URL do CloudFront / domínio próprio).
- Navegação cliente: home, rota profunda (ex. `/eventos`), refresh — deve carregar SPA.
- DevTools: erros de rede para o BFF; corrigir CORS ou URL do BFF se necessário.
- Opcional: `curl -sI https://<host> | grep -i strict-transport` se HSTS estiver ativo (Fase 2).

---

## 4. Rollback de **conteúdo** (não infra)

A forma mais segura é **manter artefatos de build** (pasta `dist/` ou ZIP) por versão.

1. Fazer checkout do commit desejado **ou** extrair artefato guardado.
2. `yarn install --frozen-lockfile && yarn build` (se rebuild) ou usar `dist/` guardado.
3. `aws s3 sync dist/ s3://NOME_DO_BUCKET/ --delete` com credenciais adequadas.
4. `aws cloudfront create-invalidation --distribution-id ID --paths "/*"`.

Isto **não** reverte mudanças de DNS/TLS no Terraform; ver [`../infra/README.md`](../infra/README.md) secção Rollback.

---

## 5. Observabilidade e erros

- **Erros JavaScript no browser:** configurar Sentry (`VITE_PUBLIC_SENTRY_DSN`) se política do cliente permitir.
- **Erros 403/401 na API:** BFF, tokens, CORS — fora do escopo deste repo; ver documentação da API.
- **Página em branco após deploy:** verificar se ficheiros `assets/*` foram publicados e se a invalidação concluiu; limpar cache do browser.

Métricas CloudFront e logs S3 access (se ativados no futuro) ficam no console AWS — o Terraform atual **não** cria bucket de logs dedicado.

---

## 6. Segurança operacional

- Preferir **OIDC** em vez de chaves de acesso de longa duração no GitHub.
- Revisar periodicamente **IAM** e **secrets** (rotação se usar access keys legadas).
- Dependências: Dependabot e revisão de PRs — [operations/github-governance-and-security.md](./operations/github-governance-and-security.md).

---

## 7. SEO e área pública

- Conteúdo indexável e canonical dependem de `VITE_PUBLIC_SITE_URL` e da estratégia documentada em `docs/architecture/` e [operations/fase3-public-delivery-hardening.md](./operations/fase3-public-delivery-hardening.md).
