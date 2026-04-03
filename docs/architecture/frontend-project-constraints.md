# Frontend project constraints

- uso de tag manager
- uso de ferramentas que otimizam a presença e mensuração web
- necessidade de boa governança para scripts e instrumentação

### Regras obrigatórias

- não espalhar lógica de analytics diretamente por componentes sem padrão
- definir pontos claros de integração com analytics e tag manager
- separar, quando necessário, a mensuração da área pública e da área CRM
- avaliar impacto de scripts de terceiros em performance e indexação

### Implicação arquitetural

A instrumentação não pode ser tratada apenas como detalhe operacional; ela deve ser considerada na arquitetura de páginas públicas e na decisão de publicação.

---

## 8. Restrições de testes e qualidade

### Situação oficial

- Vitest é a ferramenta de testes do projeto

### Regras obrigatórias

- toda mudança relevante deve considerar verificabilidade
- testar fluxos críticos da área pública e da área CRM
- testar transformações de dados e hooks relevantes
- testar comportamentos que impactem SEO técnico, renderização, carregamento e integração com BFF quando fizer sentido

---

## 9. Restrições de organização da codebase

### Regras obrigatórias

- preservar organização por domínios
- evitar criação de pastas genéricas sem responsabilidade clara
- evitar acoplamento desnecessário entre área pública e CRM
- preservar clareza entre componentes, hooks, serviços, contratos e testes
- evitar soluções que piorem evolução futura do projeto

---

## 10. Perguntas que o agente deve responder antes de propor mudanças grandes

Antes de propor mudanças arquiteturais, de SEO ou de deploy, o agente deve responder explicitamente:

1. A mudança afeta área pública, CRM ou ambas?
2. A página ou fluxo impactado é indexável?
3. O conteúdo essencial da tela depende de carregamento dinâmico?
4. O BFF está entregando dados de forma adequada para a tela?
5. A estratégia atual de SPA pura é suficiente para esse caso específico?
6. A mudança impacta metadata, performance ou mensuração?
7. A estratégia de publicação continua válida após essa mudança?

---

## 11. Critério de pronto para mudanças relevantes no front

Uma mudança relevante só pode ser considerada pronta quando:

- o domínio afetado está claro
- foi identificado se a mudança impacta área pública, CRM ou ambas
- o impacto em SEO foi avaliado quando aplicável
- o impacto em performance foi avaliado
- o impacto em BFF foi avaliado
- o impacto em instrumentação foi avaliado
- o impacto em publicação/infra foi avaliado quando necessário
- os testes relevantes foram considerados
