# Frontend project specific decisions

## 1. Stack oficial

- React
- Vite
- Tailwind CSS
- Vitest

## 2. Organização do front

- organização por domínios
- uso de BFF para entregar apenas o necessário à interface

## 3. Tipos de área

- área pública indexável
- área CRM autenticada

## 4. SEO

SEO é requisito crítico nas páginas públicas.
Toda decisão de arquitetura, renderização e deploy deve considerar indexação, metadata, performance e mensuração.

## 5. Infraestrutura

Terraform é o padrão oficial de infraestrutura.
A publicação deve priorizar simplicidade operacional, desde que não comprometa objetivos de SEO.

## 6. Decisão a ser validada pelo agente

O agente deve avaliar se:

- a aplicação inteira pode seguir como SPA estática
- ou se a área pública precisa de estratégia diferente da área CRM por causa do SEO e do conteúdo dinâmico
