---
description: padrao para clientes com multiplas unidades e destinatarios de whatsapp diferentes
applyTo: '**'
---

# MULTI_UNIT_WHATSAPP_PATTERN.md

## Objetivo

Evitar ambiguidade de alertas quando um mesmo cliente (mesmo CNPJ) possui duas ou mais unidades operacionais.

## Problema de negocio

Sem identificacao de unidade e roteamento por responsavel local:

- o alerta pode chegar para a pessoa errada
- o texto pode nao deixar claro qual restaurante/unidade apresentou evento
- a operacao perde tempo confirmando origem do incidente

## Regra funcional obrigatoria

Cada alerta deve responder duas perguntas no texto:

1. qual cliente?
2. qual unidade/equipamento?

E o envio deve ir para o responsavel da unidade correta sempre que houver cadastro.

## Fase 1 (imediata, sem migracao estrutural)

Usar roteamento no `n8n` por contexto do payload:

- prioridade de chave:
  1. `device_id`
  2. `device_location`
  3. fallback para `recipient_phone` do cliente

Campos que ja devem ser lidos do payload atual:

- `client_name` / `clientName`
- `client_document` / `clientDocument`
- `device_name` / `deviceName`
- `device_location` / `deviceLocation`
- `establishment_label` / `establishmentLabel`
- `recipient_phone` / `recipientPhone`

Matriz minima de roteamento no n8n:

- `adega_vinhos_01` -> `whatsapp_gerente_unidade_1`
- `camara_fria_01` -> `whatsapp_gerente_unidade_2`
- `*` -> `recipient_phone` (fallback do cliente)

## Fase 2 (evolucao nativa do produto)

Introduzir entidade de unidade no dominio:

- `Client (CNPJ)` -> `Establishment/Unit` -> `Device`

Dados recomendados por unidade:

- nome da unidade
- identificador interno
- endereco/localizacao operacional
- whatsapp do gerente operacional
- status operacional

Regra de envio:

1. se equipamento possuir unidade com whatsapp, enviar para esse whatsapp
2. senao, usar `alertPhone` do cliente
3. registrar no payload a fonte do destinatario usada

## Template de mensagem recomendado (online/offline/critico)

- incluir sempre:
  - cliente
  - unidade
  - equipamento
  - horario do evento
  - acao recomendada

Exemplo de cabecalho:

`Cliente: {{client_name}} | Unidade: {{establishment_label}} | Equipamento: {{device_name || device_id}}`

## Criterio de aceite

Considerar pronto quando:

- duas unidades do mesmo cliente recebem alertas em numeros diferentes de forma consistente
- mensagem de cada alerta identifica corretamente a unidade
- fallback para contato principal funciona quando unidade nao possui contato
