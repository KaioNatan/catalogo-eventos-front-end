# Frontend analytics constraints

## Objetivo

Este documento registra restrições e decisões práticas sobre analytics, tag manager e mensuração da aplicação.

---

## Diretrizes oficiais

- usar tag manager com governança mínima
- evitar scripts espalhados diretamente nos componentes sem padrão
- centralizar integração com analytics em pontos claros
- avaliar impacto de scripts em performance e indexação
- diferenciar mensuração da área pública e da área CRM quando fizer sentido

---

## O que deve ser mapeado neste arquivo

### Área pública

- páginas mais importantes para aquisição
- eventos mais importantes de conversão
- páginas que exigem rastreamento de campanha
- scripts de terceiros já existentes
- riscos de performance e governança

### Área CRM

- eventos importantes de operação
- ações críticas que merecem mensuração
- dependências de analytics interno, se existirem

---

## Restrições obrigatórias

- não instrumentar sem plano
- não duplicar eventos sem necessidade
- não introduzir scripts sem avaliar impacto em performance
- não misturar mensuração de aquisição com eventos internos de operação sem critério

---

## Integração no código (ponto único)

- **Fachada pública:** `src/analytics/publicAnalytics.ts` — `trackPublicEvent(name, payload?)` envia para `window.dataLayer` quando existir. Não usar `dataLayer.push` direto em páginas ou domínios.
- Ver uso de exemplo em `PublicNotFoundPage` (`public_404`).

## Fase 3 — Tag Manager no build

- **Integração:** variável de build opcional `VITE_PUBLIC_GTM_ID`. Quando definida, o Vite injeta o snippet padrão do Google Tag Manager no `index.html` (head + noscript no body).
- **Governança:** definir no GTM apenas tags aprovadas (ambiente público); evitar disparar tags pesadas na área `/admin` quando possível (filtros de URL no próprio GTM ou consent mode, conforme política do produto).
- **Performance:** revisar tags de terceiros no GTM (async, triggers) antes do go-live.
- **CRM:** eventos internos de operação não devem poluir o mesmo container sem convenção explícita (ver seção “Área CRM” acima).
