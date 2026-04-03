# Frontend stack standards

## Stack oficial atual

- React
- Vite
- Tailwind CSS
- Vitest

## Organização oficial

- frontend organizado por domínios
- BFF como camada de adaptação para a UI
- área pública separada conceitualmente da área CRM

## Requisitos importantes

- SEO crítico para páginas públicas
- mensuração e tag manager
- simplicidade operacional com espaço para evolução

## Infra oficial

- Terraform
- avaliação de S3 + CloudFront como baseline de publicação
- domínio, HTTPS, cache, invalidation e headers como parte da entrega mínima
