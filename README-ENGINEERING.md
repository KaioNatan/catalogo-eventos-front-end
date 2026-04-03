# README-ENGINEERING

## Organização da aplicação (SPA)

- **Área pública** e **CRM** partilham o mesmo deploy, mas a sessão admin (`AuthProvider`) monta **apenas** sob `/admin` (`AdminAuthBoundary`), com code-splitting das páginas admin.
- Mapa pastas ↔ rotas: `docs/architecture/frontend-domain-route-map.md`.
- Eventos analytics no público: `src/analytics/publicAnalytics.ts`.

---

## Observabilidade e mensuração

O projeto deve considerar observabilidade e mensuração desde cedo.

Regras obrigatórias:

- tratar analytics e tag manager com governança mínima
- evitar scripts espalhados sem padrão
- definir pontos claros de integração para eventos e rastreamento
- considerar separação entre mensuração da área pública e da área CRM
- considerar impacto dos scripts em performance e indexação

---

## Infraestrutura e publicação

Terraform é o padrão oficial de infraestrutura.

Toda estratégia de publicação deve considerar:

- simplicidade operacional
- impacto em SEO
- domínio e HTTPS
- cache
- invalidation
- headers de segurança
- roteamento de SPA
- rollback simples
- separação de ambientes

Regras obrigatórias:

- não assumir automaticamente que deploy estático é suficiente
- avaliar se a área pública e a área CRM exigem estratégias diferentes
- toda decisão de publicação deve explicitar trade-offs entre SEO, custo, simplicidade e operação
- preferir **OIDC** (GitHub → AWS IAM role) no deploy em vez de chaves de acesso de longa duração — isto é **só CI/CD**; login do utilizador no CRM é outro fluxo (BFF + JWT, ver `docs/operations/production-gate.md`)

---

## Variáveis de ambiente

Regras obrigatórias:

- mapear claramente variáveis de build
- não expor segredos no front-end
- distinguir valores públicos de valores sensíveis
- documentar variáveis necessárias para build e deploy
- manter coerência entre ambientes

---

## Automação local e governança no GitHub

- **Husky:** após `yarn install`, os hooks registam **pre-commit** (`lint-staged`: Prettier + ESLint nos ficheiros em stage) e **pre-push** (`yarn typecheck`). Ver `docs/operations/github-governance-and-security.md` para branch protection, CODEOWNERS e segurança no GitHub.
- **CI/CD:** workflows em `.github/workflows/` (incl. execução manual do **CI** via `workflow_dispatch`); Dependabot em `.github/dependabot.yml`; política de vulnerabilidades em `SECURITY.md`; modelo de PR em `.github/pull_request_template.md`.

---

## Critério de pronto para mudanças relevantes

Uma mudança relevante só deve ser considerada pronta quando:

1. a solução respeita a organização por domínios
2. o impacto no BFF foi avaliado
3. o impacto em SEO foi avaliado quando houver páginas públicas envolvidas
4. o impacto em performance foi avaliado
5. os testes relevantes foram criados ou atualizados
6. a instrumentação necessária foi avaliada
7. os impactos em publicação e infraestrutura foram considerados quando aplicável

---

## Regra para o agente de IA

Ao analisar ou alterar este projeto, o agente deve obrigatoriamente:

1. identificar o domínio impactado
2. identificar se a mudança afeta área pública, CRM ou ambas
3. avaliar impacto em BFF
4. avaliar impacto em SEO, metadata e indexação quando aplicável
5. avaliar impacto em performance
6. avaliar impacto em mensuração e tag manager
7. avaliar impacto em build, deploy e infraestrutura quando aplicável
8. não considerar a tarefa concluída sem considerar os itens acima
