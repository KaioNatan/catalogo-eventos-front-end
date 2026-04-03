# Documentação — índice

Ponto de entrada para **entrega ao cliente**, **deploy** e **operação**. A arquitetura e decisões técnicas detalhadas continuam em [`../README-ENGINEERING.md`](../README-ENGINEERING.md) e em [`architecture/`](./architecture/).

## Handover e entrega

| Documento                                                            | Uso                                                                         |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [**EXECUTIVE_HANDOVER_SUMMARY.md**](./EXECUTIVE_HANDOVER_SUMMARY.md) | Resumo executivo (uma página): entrega, posse, automação vs manual, riscos. |
| [**CLIENT_HANDOVER.md**](./CLIENT_HANDOVER.md)                       | Visão executiva: transferir repositório, AWS e responsabilidades.           |
| [**DEPLOY_CHECKLIST.md**](./DEPLOY_CHECKLIST.md)                     | Ordem prática: Terraform → GitHub → primeiro deploy.                        |
| [**SECRETS_AND_VARIABLES.md**](./SECRETS_AND_VARIABLES.md)           | Secrets e variáveis do GitHub Actions (deploy).                             |
| [**INFRASTRUCTURE_INVENTORY.md**](./INFRASTRUCTURE_INVENTORY.md)     | O que o Terraform cria vs. o que é manual (auditável).                      |

## Operação e governança

| Documento                                                                                            | Uso                                                    |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| [**OPERATION_GUIDE.md**](./OPERATION_GUIDE.md)                                                       | Dia a dia, validação pós-deploy, rollback de conteúdo. |
| [**operations/production-gate.md**](./operations/production-gate.md)                                 | Critérios antes de produção.                           |
| [**operations/github-governance-and-security.md**](./operations/github-governance-and-security.md)   | CI, Dependabot, Dependency Review.                     |
| [**operations/fase3-public-delivery-hardening.md**](./operations/fase3-public-delivery-hardening.md) | SEO técnico mínimo no bundle.                          |

## Infraestrutura (Terraform)

- [`../infra/README.md`](../infra/README.md) — Fase 1 (`*.cloudfront.net`), Fase 2 (domínio próprio), comandos e riscos.
- Módulos: `infra/terraform/modules/spa_static_site`, `infra/terraform/modules/github_oidc_frontend_deploy`.
- Ambiente de exemplo: `infra/terraform/environments/dev/` (`terraform.tfvars.example`, `backend.tf.example`, `github_oidc.tf.example`).

## Raiz do repositório

- [`../README.md`](../README.md) — desenvolvimento, variáveis Vite, fluxo de publicação resumido.
- [`../SECURITY.md`](../SECURITY.md) — reporte de vulnerabilidades.
