# ADR: Publicação na AWS (baseline) e estratégia de SEO para área pública

## Status

Proposto

## Contexto

O projeto define Terraform como padrão de infraestrutura, S3 + CloudFront como baseline para conteúdo estático, e SEO crítico nas páginas públicas (`frontend-stack-standards.md`, `frontend-project-specific-decisions.md`, `.cursor/rules/frontend-infra-aws.mdc`).

O registro `adr-2026-03-27-public-routes-static-vs-async-data.md` documenta que, no código atual, **o conteúdo principal das rotas públicas de catálogo e fichas depende de carregamento assíncrono no cliente**; o `index.html` da SPA não traz título, descrição nem corpo indexável por URL.

A pergunta de `frontend-deployment-decision-record.md` resume o dilema: **publicar como front estático simples sem comprometer SEO das páginas públicas**.

## Decisão

1. **Baseline de publicação (Fase 1 — infraestrutura)**  
   Publicar o artefato gerado pelo Vite (`yarn build` → assets estáticos + `index.html`) em **Amazon S3**, entregue via **Amazon CloudFront**, com **Terraform** como IaC. Incluir **ACM** para TLS e **Route 53** (ou DNS equivalente) para o domínio, com **ambientes separados** (ex.: staging e produção) quando a operação exigir.

2. **Comportamento de roteamento SPA**  
   Configurar o CloudFront/S3 (ou origem) para que **rotas de aplicação** (`/eventos`, `/eventos/:id`, `/admin/...`, etc.) retornem **`index.html`** com status adequado à política escolhida (tipicamente 200 para fallback de SPA ou 404 customizado que sirva o mesmo documento), evitando que caminhos profundos quebrem em refresh direto.

3. **SEO da área pública — não equivaler “SPA estática” a “SEO crítico atendido”**  
   Para as URLs públicas em que o conteúdo indexável é obtido **após** JavaScript (conforme ADR de mapeamento), **a publicação apenas como SPA estática não é suficiente** para cumprir o objetivo declarado de SEO crítico. Essa limitação é **aceita de forma explícita na Fase 1** até existir a Fase 2.

4. **Fase 2 — requisito para alinhar produto ao SEO crítico**  
   Implementar **complemento de renderização ou entrega de HTML rico** para rotas públicas indexáveis prioritárias (mínimo: fichas de evento, ponto turístico e cidade, e páginas institucionais conforme prioridade de negócio). A escolha concreta de tecnologia (SSR com Node, edge rendering, pré-render sob demanda, geração estática incremental via pipeline, etc.) fica para **ADR ou spike subsequente**, desde que o critério de aceite seja: **HTML inicial da resposta HTTP contém texto e metadados essenciais por URL**, compatíveis com crawlers e compartilhamento social.

5. **Área CRM (`/admin`)**  
   Pode permanecer **100% SPA** no mesmo artefato e mesma distribuição CloudFront, **sem** o mesmo requisito de indexação orgânica da área pública. Recomenda-se **noindex** ou bloqueio por `robots.txt` para URLs administrativas quando fizer sentido operacional.

## Alternativas consideradas

| Alternativa                                                         | Por que não foi escolhida como solução única                                                                       |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Somente SPA estática, sem Fase 2**                                | Contradiz o requisito de SEO crítico dado o mapa de dados assíncronos no ADR de rotas.                             |
| **SSR de todo o app (público + admin) desde o início**              | Aumenta custo, complexidade operacional e superfície de deploy sem benefício proporcional no CRM.                  |
| **Dois domínios ou dois buckets desde a Fase 1** (público vs admin) | Possível evolução futura; não obrigatória para o baseline se políticas de cache e segurança forem claras por path. |
| **Adiar qualquer deploy até existir SSR**                           | Retém valor de entrega (CRM, homologação, métricas) e atrasa feedback operacional; rejeitada em favor de fases.    |

## Trade-offs

- **Simplicidade operacional e custo (Fase 1):** S3 + CloudFront + Terraform atendem bem a artefato estático, rollback por versão de build e escala de leitura.
- **SEO e rich previews:** permanecem **subatendidos** na Fase 1 para conteúdo dinâmico; a Fase 2 troca complexidade por indexação e metadados corretos por URL.
- **Manutenibilidade:** um único repositório e um pipeline de build continuam válidos; a Fase 2 pode introduzir segundo processo (ex.: worker de render) sem obrigar fork completo do produto, dependendo da opção técnica escolhida.

## Consequências

- O time de produto e engenharia deve tratar **Fase 2 como dependência explícita** se o go-live público depender de ranqueamento/conversão orgânica nas fichas.
- Testes manuais ou automatizados com **fetch do HTML sem executar JS** devem ser usados como gate para validar Fase 2.
- O ADR de mapeamento de rotas deve ser **revisitado** quando a estratégia de renderização mudar ou quando novas rotas indexáveis forem adicionadas.

---

## 1. Arquitetura sugerida (baseline)

- **Build:** `tsc -b && vite build` → diretório `dist/` versionado por commit ou tag.
- **Origem:** bucket S3 (privado); **CloudFront** como único ponto público de leitura.
- **DNS/TLS:** Route 53 (ou delegação) + certificado ACM na região suportada pelo CloudFront.
- **IaC:** módulos Terraform por ambiente (variáveis para nomes de bucket, IDs de distribuição, domínios).

## 2. Trade-offs (resumo operacional)

- Ganho: simplicidade, custo previsível, alinhamento ao padrão oficial do projeto.
- Custo: SPA pura não resolve HTML rico para SEO nas fichas até a Fase 2.

## 3. Riscos operacionais

- **Cache:** configuração incorreta pode servir `index.html` antigo após deploy; exige **invalidação** documentada no pipeline.
- **Fallback SPA:** erro de configuração pode retornar 403/404 em deep links.
- **Segredos:** chaves de API no front só via `VITE_*` conscientes (exposição ao browser); dados sensíveis pertencem ao BFF.

## 4. Estratégia de cache

- Objetos com hash no nome (`assets/*`): **cache longo** no CloudFront (`max-age` alto, `immutable` quando aplicável).
- **`index.html`:** cache **curto** ou revalidação, para não fixar shell antigo após releases.
- Definir política explícita de **invalidação** pós-deploy (ex.: invalidar `/*` ou prefixos mínimos necessários).

## 5. Estratégia de rollback

- Manter **artefato de build** (zip ou commit tag) por release.
- Rollback = redistribuir versão anterior do conteúdo no bucket + invalidação CloudFront (ou troca de versão se usar versionamento de bucket como cópia de segurança).

## 6. Impacto em SEO e produção

- **Fase 1:** produção estável para usuários humanos com JS; **SEO e snippets** para URLs dinâmicas permanecem fracos até Fase 2 (coerente com o ADR de mapeamento de rotas).
- **Fase 2:** alinha entrega HTTP ao requisito de SEO crítico; pode exigir coordenação com BFF para dados e metadados por rota.

## Referências internas

- `docs/architecture/adr-2026-03-27-fase-1-publicacao-estatica-decisao-formal.md` (decisão Fase 1 executável: artefato único, variáveis, BFF)
- `infra/README.md`
- `docs/architecture/adr-2026-03-27-public-routes-static-vs-async-data.md`
- `docs/architecture/frontend-deployment-decision-record.md`
- `docs/architecture/seo-and-public-web-guidelines.md`
- `docs/architecture/frontend-stack-standards.md`
- `docs/architecture/adr-template.md`

## Data

2026-03-27
