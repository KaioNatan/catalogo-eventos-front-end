# Frontend deployment decision record

## Pergunta principal

A aplicação atual em React + Vite pode ser publicada como front estático simples sem comprometer o SEO das páginas públicas?

## O agente deve avaliar

- o que é público e indexável
- o que depende de dados carregados dinamicamente
- se o conteúdo essencial está disponível cedo o suficiente para indexação
- se o CRM pode seguir SPA independentemente do público
- se a separação entre público e CRM é vantajosa
- se S3 + CloudFront basta para esta fase

## Critério de decisão

A solução escolhida deve equilibrar:

- SEO
- simplicidade operacional
- custo
- performance
- manutenibilidade
