---
description: padrao oficial para execucao de estudos de caso no Monitor
applyTo: '**'
---

# UI_FIRST_PATTERN.md

## Objetivo

Padronizar a execucao de estudos de caso para nao depender de explicacao repetida em cada chat.

## Regra principal

Em estudo de caso, a trilha obrigatoria e `UI-first`:

1. cadastrar pelo Monitor
2. operar pelo Monitor
3. observar e registrar friccao de UX/UI
4. usar API/scripts apenas para prova tecnica e diagnostico

## Sequencia operacional recomendada

1. selecionar cliente no filtro do painel
2. habilitar modulos e itens contratados
3. cadastrar equipamentos
4. cadastrar regras ambientais
5. cadastrar atuadores de acionamento
6. simular eventos e comandos
7. validar historico e status no painel
8. validar integracao `API -> n8n -> Evolution -> WhatsApp`

## Evidencias minimas para considerar fechado

- cadastro completo feito no Monitor
- fluxo principal reproduzivel sem depender de terminal
- pontos de melhoria de UI anotados com contexto
- validacao tecnica complementar (API/scripts) sem divergencia com a UI

## Regra de fallback

Quando houver erro no teste tecnico (exemplo: `404 Actuator not found`), revisar primeiro no Monitor:

- se o cadastro realmente existe
- se o `id` digitado bate exatamente com o cadastro
- se o item/modulo contratado esta habilitado para o cliente
