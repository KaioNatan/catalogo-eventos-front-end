# Governança e segurança no GitHub (recomendações)

Este documento lista ações **no GitHub** (UI ou API) que complementam o que já está versionado (workflows, Dependabot, Husky). Não substitui políticas internas da organização.

---

## Branch protection (`main`)

Recomenda-se, no repositório: **Settings → Branches → Branch protection rule** para `main`:

1. **Require a pull request before merging** (sem push direto).
2. **Require status checks to pass** — marcar pelo menos o job `quality` do workflow **CI** (nome típico na UI do GitHub: `CI / quality`). Inclua `integration-build` só se quiserem gate obrigatório quando as variáveis de staging estiverem definidas (o job pode ficar skipped e nesse caso o check pode aparecer como neutro — validar o comportamento na vossa org).
3. **Require conversation resolution** (opcional, útil em revisões com threads).
4. **Require linear history** ou **squash merge** (opcional; alinhar com convenção do time).
5. **Do not allow bypassing** para utilizadores que não devam contornar gates.

---

## Revisões e aprovações

- **Require approvals**: mínimo 1 (ou 2 para mudanças sensíveis).
- **Dismiss stale pull request approvals when new commits are pushed**: ativar quando quiserem que novos commits invalidem aprovações antigas.
- **Require review from Code Owners**: útil depois de preencher `.github/CODEOWNERS` com equipas reais.

---

## Secret scanning e dependabot alerts

- **Settings → Code security** (ou **Security**): ativar **Secret scanning** e **Dependabot alerts** se ainda não estiverem (depende do plano GitHub).
- Tratar **Dependabot security updates** com prioridade; merge após revisão e CI verde.

### Dependency graph e workflow “Dependency review”

O workflow `.github/workflows/dependency-review.yml` usa `actions/dependency-review-action`, que **só funciona** com o **Dependency graph** ligado:

1. Abrir **Settings** do repositório → **Code security and analysis** (ou **Security** → **Advanced security**, conforme a UI).
2. Ativar **Dependency graph** (em orgs privadas pode exigir plano / GitHub Advanced Security).

Enquanto o gráfico não estiver disponível, o passo no Actions pode registar erro; no nosso workflow o passo está com **`continue-on-error: true`** para **não bloquear merges** em PRs. Depois de ativar o gráfico e confirmar que o passo fica verde, podem remover `continue-on-error` nesse passo se quiserem falha bloqueante em vulnerabilidades detectadas na PR.

---

## CODEOWNERS

O ficheiro `.github/CODEOWNERS` pode ser preenchido com `@org/team` ou `@username` por pasta. Enquanto não houver ownership definido, o ficheiro serve como modelo comentado.

---

## Workflows e secrets

- PRs que alterem `.github/workflows/**` e usem **secrets** devem ser revistos por alguém com contexto de infra/segurança.
- Preferir **OIDC** em deploy (já documentado em `deploy-frontend.yml`) em vez de chaves de longa duração.

---

## Automação local (Husky)

- Após `git clone`, executar `yarn install` para instalar hooks (`prepare` → `husky`).
- **pre-commit**: `lint-staged` (Prettier + ESLint nos ficheiros staged).
- **pre-push**: `yarn typecheck`.
- Em CI, `HUSKY=0` no `yarn install` evita executar o Husky no runner.

---

## Relação com CI

- **CI** (`ci.yml`): dispara em **pull request**, em **push** a `main`/`master` e manualmente via **Actions → CI → Run workflow** (`workflow_dispatch`). O mesmo ficheiro garante **gates idênticos** em PR e na branch principal, sem duplicar jobs nem alterar nomes de checks entre fluxos.
- Passos: install (`HUSKY=0`), audit informativo (não bloqueia), Prettier check, ESLint, typecheck, coverage, validação Vite (smoke), build smoke.
- **Dependency review** (`dependency-review.yml`): PRs contra `main`/`master` (requer **Dependency graph**; ver secção acima).
- **Dependabot** (`.github/dependabot.yml`): PRs semanais agrupados (produção vs desenvolvimento). O projeto usa **Yarn** e só **`yarn.lock`**; na configuração do Dependabot o ecosistema continua a chamar-se `npm` (requisito da API), mas os PRs atualizam o `yarn.lock`.

## Modelos de PR e issues

- **Pull requests:** `.github/pull_request_template.md` — checklist alinhada a `README-ENGINEERING.md`.
- **Issues:** `.github/ISSUE_TEMPLATE/` — modelo de bug; `blank_issues_enabled: true` mantém issues livres disponíveis.

---

## Editor e formatação

- **`.editorconfig`** — convenções básicas (UTF-8, LF, indentação 2) para editores que o respeitem; o gate oficial continua a ser **Prettier** + **ESLint** no CI e no Husky.

---

## Melhorias futuras (fora de quick wins / maior risco)

Itens **funcionais hoje**, candidatos só quando houver tempo e critério de produto:

- Reduzir boilerplate duplicado entre páginas de listagem do catálogo público (ex. eventos vs pontos turísticos) — refatoração transversal em UI e testes.
- Generalizar o padrão “fetch por id + estados loading/erro/404” além da validação de id já centralizada em `isValidPublishedCatalogId` — risco de regressão em fichas de detalhe.
- Lazy-loading adicional na área pública e evoluções de SEO/SSR — ver `docs/architecture/frontend-architecture-post-refactor-review.md`.
- Tornar **`yarn audit --level high`** bloqueante no CI quando a árvore de dependências de desenvolvimento estiver sem vulnerabilidades conhecidas relevantes (hoje o passo é só informativo).
