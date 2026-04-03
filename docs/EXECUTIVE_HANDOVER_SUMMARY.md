# Resumo executivo — entrega e transferência

Documento de **uma página** para decisores e gestores de projeto. O detalhe técnico está nos guias ligados abaixo.

**Índice da documentação:** [index.md](./index.md) · **Passos práticos:** [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md) · **Inventário técnico:** [INFRASTRUCTURE_INVENTORY.md](./INFRASTRUCTURE_INVENTORY.md)

---

## O que foi entregue

- **Aplicação web** (área pública e área administrativa) em React, pronta para build e publicação como site estático.
- **Infraestrutura como código (Terraform)** que pode criar, na conta AWS do cliente: armazenamento privado do site (**S3**), rede de entrega (**CloudFront**), controlo de acesso entre CloudFront e S3 (**OAC**), políticas e cabeçalhos de segurança na CDN, e — opcionalmente — certificado **TLS** e registos **DNS** (**ACM + Route 53**) para domínio próprio.
- **Pipeline de publicação** no GitHub Actions: após configuração, publica cada versão no S3 e pede atualização da cache do CloudFront (deploy manual acionado no GitHub).
- **Documentação de handover**: checklists, lista de secrets, inventário do que é criado automaticamente versus manual, e guia de operação pós-go-live.

Em resumo: **código + receita de infraestrutura + automação de deploy**, não uma “conta AWS já ligada” nem domínio já registado no nome do cliente.

---

## Como o cliente assume a posse

1. **Repositório:** o código passa a residir num repositório GitHub **da organização do cliente** (novo repositório ou transferência), com políticas de branch e revisão que o cliente definir.
2. **Nuvem:** o cliente executa o Terraform na **sua própria conta AWS**, gerindo o ficheiro de estado (recomenda-se armazenamento remoto e bloqueio, descrito no repositório). Assim, buckets, distribuição CloudFront e certificados passam a ser **recursos do cliente**.
3. **CI/CD:** o cliente configura no GitHub os **secrets e variáveis** indicados na documentação (nome do bucket, ID da CloudFront, URL da API, credenciais ou role de deploy). Opcionalmente aplica também o módulo que cria uma **função IAM** para o GitHub autenticar sem chaves permanentes (**OIDC**).
4. **Operação:** equipas do cliente disparam o workflow de deploy quando quiserem publicar uma versão; o dia a dia (validações, rollback de conteúdo) segue o guia de operação.

Até estes passos estarem concluídos na conta e no GitHub **do cliente**, a posse não está completa: o que mudou foi a **capacidade** de assumir, não a titularidade automática dos recursos na AWS.

---

## O que está automatizado

| Área                           | O que a automação faz                                                                                                                                                        |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Terraform**                  | Cria e atualiza o stack de site estático (S3, CloudFront, OAC, políticas relevantes) e, se ativado, certificado e DNS para domínio próprio na zona já existente no Route 53. |
| **GitHub Actions (deploy)**    | Compila a aplicação, envia os ficheiros para o bucket correto e solicita invalidação da cache global da distribuição.                                                        |
| **GitHub Actions (qualidade)** | Verifica formato, testes e build em condições controladas (fluxo de CI do repositório).                                                                                      |

O deploy **não** cria bucket nem CloudFront em cada execução: assume que a infraestrutura **já foi** criada pelo Terraform (ou equivalente) nessa conta.

---

## O que exige configuração manual

- **Conta AWS**, faturação e limites de serviço.
- **Execução do Terraform** localmente ou em pipeline interno, com ficheiros de variáveis e backend de estado preenchidos para o ambiente (desenvolvimento, homologação, produção).
- **Domínio e DNS** fora do Terraform: registo do domínio, delegação de nameservers e — na fase com TLS customizado — zona pública no Route 53 acessível à conta onde corre o Terraform.
- **Repositório GitHub**: criação, permissões, ambiente de deploy, secrets e variáveis.
- **Confiança entre GitHub e AWS** (política da role OIDC alinhada ao nome exato do repositório e do ambiente de deploy).
- **API / BFF**: URLs, certificados, CORS e regras de autenticação do lado do servidor — o front apenas consome essas URLs em tempo de build.

---

## Riscos

- **Erro de configuração OIDC** — o deploy falha na autenticação; é a causa mais comum quando se muda de organização ou de nome de repositório sem atualizar a política na AWS.
- **Secrets apontando para outro ambiente** — publicação no bucket ou distribuição errados; mitigação: prefixos de nome de bucket validados no workflow e revisão humana na primeira vez.
- **Dependência da API** — site publicado mas funcionalidade limitada se o BFF estiver indisponível ou com CORS incorreto para o novo endereço do site.
- **Estado Terraform apenas local** — risco de perda ou conflito; mitigação: backend remoto versionado e políticas de acesso ao estado.
- **Mudanças na CloudFront** — atualizações de configuração podem demorar a propagar; janelas de manutenção podem ser necessárias em alterações grandes de infraestrutura.

---

## Recomendações futuras

1. **Primeiro ciclo em ambiente de teste** — repetir Terraform + GitHub + um deploy completo numa conta ou stack de staging antes de produção.
2. **Versionar o ficheiro de lock do Terraform** no repositório, para que todos obtenham as mesmas versões de fornecedores.
3. **Backend remoto do estado** desde o primeiro ambiente partilhado pela equipa.
4. **Documentar** URLs finais do site, da API, responsáveis e procedimento de reporte de segurança ([SECURITY.md](../SECURITY.md)).
5. **Rever o gate de produção** interno ([production-gate.md](./operations/production-gate.md)) antes de go-live com domínio próprio e tráfego real.

---

_Última orientação: quem for executar a transferência deve seguir [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md) na ordem indicada._
