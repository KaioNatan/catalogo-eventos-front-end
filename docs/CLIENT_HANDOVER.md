# Handover ao cliente — visão executiva

Este pacote descreve como **transferir propriedade** do front-end (código + pipeline + infra como código) para a **conta AWS** e **organização GitHub** do cliente, com previsibilidade e auditoria.

Navegação: [index.md](./index.md) · [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md) · [INFRASTRUCTURE_INVENTORY.md](./INFRASTRUCTURE_INVENTORY.md) · [OPERATION_GUIDE.md](./OPERATION_GUIDE.md)

---

## 1. O que está incluído neste repositório

- **Aplicação:** React + TypeScript + Vite (área pública + admin).
- **Infraestrutura (Terraform):** módulos para site estático SPA (S3 privado, OAC, CloudFront, políticas, headers); opcional ACM + Route 53; opcional role IAM + OIDC para GitHub Actions.
- **CI/CD:** qualidade em `.github/workflows/ci.yml`; publicação em `.github/workflows/deploy-frontend.yml` (manual `workflow_dispatch`).

O deploy **não** provisiona AWS pelo Actions: ele publica artefatos num bucket e distribuição **já criados** pelo Terraform (ou equivalente).

---

## 2. Fluxo de transferência do código (viável?)

**Sim**, com ressalvas operacionais:

1. Entregar o código (arquivo compactado, clone, ou transferência de repo).
2. Cliente cria **repositório GitHub** (ou importa).
3. Cliente configura **Secrets e Variables** conforme [SECRETS_AND_VARIABLES.md](./SECRETS_AND_VARIABLES.md).
4. Cliente executa **Terraform** na **própria conta AWS** e grava outputs (bucket, CloudFront ID, role ARN).
5. Cliente ajusta **trust OIDC** com `github_org` / `github_repo` / **Environment** corretos.
6. Cliente dispara o workflow de deploy.

**O que pode impedir “funcionar de primeira”:**

- Trust OIDC com `sub` incorreto (ex.: typo na org; uso de `environment:` no job exige claim `repo:ORG/REPO:environment:NOME`).
- Secrets com bucket ou distribution ID de **outra** conta ou stack antiga.
- BFF inacessível ou CORS incorreto para o novo hostname.
- `terraform.tfvars` ou state ainda a apontar para recursos do fornecedor anterior (resolver com `apply` na conta do cliente e novos outputs).

---

## 3. Responsabilidades recomendadas

| Área                                           | Dono típico (cliente)        |
| ---------------------------------------------- | ---------------------------- |
| Conta AWS, faturação, limites de serviço       | Cliente                      |
| Estado Terraform (backend S3 + lock)           | Cliente                      |
| Domínio DNS e delegação                        | Cliente                      |
| Repositório GitHub, branch protection, secrets | Cliente                      |
| BFF/API, certificados de API, CORS             | Cliente / outro fornecedor   |
| Build e conteúdo publicado no S3               | Pipeline + aprovação cliente |

---

## 4. Documentação de apoio (ordem de leitura)

1. [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md) — passos na ordem certa.
2. [INFRASTRUCTURE_INVENTORY.md](./INFRASTRUCTURE_INVENTORY.md) — o que é Terraform vs manual.
3. [SECRETS_AND_VARIABLES.md](./SECRETS_AND_VARIABLES.md) — configuração GitHub.
4. [OPERATION_GUIDE.md](./OPERATION_GUIDE.md) — após go-live.
5. [`../infra/README.md`](../infra/README.md) — detalhe técnico Fase 1 / Fase 2.
6. [`../README.md`](../README.md) e [`../README-ENGINEERING.md`](../README-ENGINEERING.md) — desenvolvimento e stack.

---

## 5. Artefatos que o cliente deve guardar

- URL do repositório GitHub e política de branches.
- Localização do backend Terraform (bucket/key da state).
- Outputs: nome do bucket S3, ID CloudFront, ARN da role de deploy.
- URLs finais: site público, BFF, admin (se separado).
- Contacto para reporte de segurança: [`../SECURITY.md`](../SECURITY.md).

---

## 6. Veredito de prontidão (resumo)

O projeto está **estruturalmente pronto** para handover técnico **se** o cliente completar Terraform na própria conta, configurar GitHub corretamente e validar OIDC + BFF. Não há “botão único” que substitua conta AWS, domínio e secrets — ver secção final do índice e [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md).
