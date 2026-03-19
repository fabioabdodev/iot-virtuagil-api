---
description: regras do frontend web do sistema de monitoramento
applyTo: '**'
---

# FRONTEND_RULES.md - Regras do frontend

## Atualizacao de referencia (2026-03-19)

Direcao para o dashboard:

- tratar `ambiental`, `acionamento` e `energia` como modulos-categoria
- exibir contratacao por itens dentro de cada modulo
- evitar acoplamento da UI a lista fixa de modulos
- manter compatibilidade visual com contas legadas durante transicao

## Stack atual do frontend

- Next.js
- TypeScript
- React Query
- React Hook Form
- Zod
- Recharts
- Lucide React
- date-fns

O projeto usa componentes reutilizaveis proprios em `apps/web/components/ui`.
Bibliotecas extras de UI podem ser adicionadas quando houver ganho claro de
consistencia ou produtividade.

## Estrutura esperada

O frontend fica separado do backend:

```text
apps/
  web/
src/
```

O frontend nao deve ser misturado com `src/` do backend.

## Dominios

- frontend: `monitor.virtuagil.com.br`
- backend: `api-monitor.virtuagil.com.br`

## Objetivo atual do frontend

Entregar um dashboard moderno e util para operacao:

- lista de devices
- status online/offline
- ultima leitura
- historico de temperatura
- gerenciamento de devices
- regras de alerta
- laboratorio de simulacao em `/lab`

## Regras de implementacao

- preferir componentes reutilizaveis
- centralizar chamadas HTTP em `lib/`
- preferir `React Hook Form + Zod` como padrao para formularios novos ou que estejam ficando mais complexos
- evitar refatoracao ampla de todos os formularios de uma vez sem necessidade clara
- priorizar migracao para `React Hook Form + Zod` em fluxos com:
  - validacao mais rica
  - regras condicionais
  - mensagens de erro importantes para operacao
  - risco maior de regressao por uso de muitos `useState`
- graficos devem usar Recharts
- feedback visual deve ser consistente
- a UI deve ser responsiva em desktop e mobile

## Direcao atual para formularios

Direcao combinada neste momento:

- manter formulários simples como estao quando nao houver ganho claro na troca
- usar `React Hook Form + Zod` nos formularios novos
- evoluir gradualmente os formularios mais importantes do dashboard para esse padrao

Prioridade inicial sugerida:

- `clients-panel.tsx`
- `client-profile-panel.tsx`
- formularios administrativos que ganharem mais campos, validacoes e regras condicionais

## Direcao visual

Interface deve parecer produto de operacao, nao painel generico.

Preferir:

- hierarquia visual clara
- cards e tabelas legiveis
- estados vazios e estados de erro bem definidos
- linguagem visual consistente com o mini design system local

Evitar:

- repeticao de classes longas por toda a tela
- componentes de UI duplicados com pequenas variacoes
- acoplamento entre pagina e regra de API

## Evolucao futura

O frontend deve continuar preparado para:

- autenticacao de usuarios
- dashboards por cliente
- multiplos sensores
- filtros mais ricos
- historico e relatorios
