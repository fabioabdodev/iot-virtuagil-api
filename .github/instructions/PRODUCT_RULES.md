---
description: regras de produto, visao do sistema e evolucao modular da plataforma
applyTo: '**'
---

# PRODUCT_RULES.md - Regras de produto

## Atualizacao de referencia (2026-03-19)

Refatoracao comercial consolidada:

- o produto deixa de tratar `temperatura` como modulo isolado
- `temperatura` passa a ser item do modulo-categoria `ambiental`
- novos itens de `ambiental`: `umidade` e `gases`
- `acionamento` evolui para modulo-categoria com itens como `rele`, `status_abertura` e `tempo_aberto`
- `energia` entra como modulo-categoria para `corrente`, `tensao` e `consumo`
- contratacao deve ser feita por item dentro de cada modulo-categoria
- a ingestao IoT deve aceitar sensores genericos por `POST /iot/readings`
- `POST /iot/temperature` permanece por compatibilidade durante a transicao

Este projeto implementa uma plataforma modular de automacao e monitoramento
usando IoT. O primeiro modulo e `temperatura`, com caso inicial focado em
freezer, mas a base deve permitir evolucao para novos modulos.

## Estado atual do produto

O MVP expandido ja entrega:

- cadastro de clients
- cadastro de devices
- ingestao de temperatura por HTTP
- historico de leituras
- dashboard web
- monitoramento de offline
- alerta por temperatura
- integracao por webhook com n8n
- integracao operacional com Evolution
- webhooks de temperatura e offline validados em produção

## Regras de produto

- o sistema deve suportar varios devices por cliente
- alertas devem ser desacoplados via webhook
- o backend nao deve enviar mensagens diretamente
- o dashboard deve focar em operacao rapida e leitura clara
- a base deve continuar preparada para novos sensores e atuadores
- a evolucao deve ocorrer modulo por modulo
- a plataforma deve separar claramente administracao estrutural e parametrizacao operacional
- o administrador da plataforma deve manter acesso total a todos os clientes
- o administrador do cliente deve poder monitorar o proprio tenant
- o administrador do cliente deve evoluir para assumir a autoria das regras operacionais do proprio negocio
- alteracoes criticas de regra devem ser auditaveis
- regra-mae do produto:
  - a plataforma entrega a estrutura inicial do cliente
  - o cliente pode ajustar apenas as regras operacionais que forem autorizadas
  - esse padrao deve ser reaproveitado em todos os modulos da Virtuagil

## Integracao de alertas

Fluxo correto:

Backend -> webhook -> n8n -> Evolution API -> WhatsApp

## Estrategia modular

Plataforma base compartilhada:

- clients
- devices
- historico
- alertas
- dashboard
- multi-tenant

Modulo atual:

- `temperatura`

Proximo modulo sugerido:

- `acionamento`

Regra de evolucao:

- nao abrir o proximo modulo antes de aceitar conscientemente o estado do modulo atual

Estado atual dessa regra:

- o modulo `ambiental` no item `temperatura` ja pode ser tratado como encerrado para abrir o modulo `acionamento`

## Evolucao esperada

Ver `.github/instructions/ROADMAP.md` para a sequencia planejada de fases.
