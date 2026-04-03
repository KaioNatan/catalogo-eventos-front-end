Leia e adote como fontes oficiais deste projeto:

- README-ENGINEERING.md
- .cursor/rules
- docs/architecture/frontend-project-constraints.md
- docs/architecture/frontend-route-classification.md, se existir
- docs/architecture/frontend-analytics-constraints.md, se existir
- demais documentos de docs/architecture

Antes de qualquer recomendação de arquitetura, SEO, BFF ou deploy:

- identifique se a mudança afeta área pública, CRM ou ambas
- avalie se a rota ou tela impactada é indexável
- avalie se o conteúdo essencial depende de dados dinâmicos
- avalie impacto em BFF, performance e mensuração
- explique trade-offs antes de implementar
