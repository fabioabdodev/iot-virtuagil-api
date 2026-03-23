# N8N WhatsApp Playbook (2026-03-22)

Este documento consolida o fechamento operacional dos fluxos n8n + Evolution + WhatsApp para evitar retrabalho em novos chats/agentes.

## 1) Fluxos oficiais

Workflows obrigatorios:

- `IoT - Alerta de Temperatura - WhatsApp`
- `IoT - Device Offline - WhatsApp`
- `IoT - Device Online - WhatsApp`
- `IoT - Acionamento - WhatsApp`

Webhooks de referencia:

- `https://webhookworkflow.virtuagil.com.br/webhook/temperature-alert`
- `https://webhookworkflow.virtuagil.com.br/webhook/device-offline`
- `https://webhookworkflow.virtuagil.com.br/webhook/device-online`
- `https://webhookworkflow.virtuagil.com.br/webhook/actuation-command`

Validacao de webhook:

- usar `POST` (nao `GET`)
- resposta de referencia: `{"message":"Workflow was started"}`

## 2) Ordem oficial de teste (Laboratorio)

Usar exatamente os nomes da UI:

1. `Carga normal`
2. `Pre-alerta`
3. `Cenario critico`
4. `Ensaio de offline`
5. retorno para `Carga normal`

Observacao importante:

- se rodar com `2` devices, mensagens de conectividade tendem a chegar em dobro (1 por device). Isso e esperado.

## 3) Padrao tecnico obrigatorio de cada workflow

Estrutura recomendada:

- `Webhook` -> `Edit Fields` -> `IF Phone Present` -> `HTTP Request` (Evolution)

Regra de envio:

- nunca chamar Evolution quando o telefone estiver vazio
- `IF Phone Present` deve validar `recipient_phone` `notEmpty`

## 4) Regra obrigatoria para recipient_phone

No `Edit Fields`, usar fallback robusto (ordem pode variar):

- `recipient_phone`
- `recipientPhone`
- `alert_phone`
- `alertPhone`
- `admin_phone`
- `adminPhone`
- `client_phone`
- `clientPhone`
- `phone`

Normalizacao:

- remover nao digitos
- prefixar `55` quando necessario

## 5) Regra obrigatoria para mensagens (humanizadas)

Diretriz consolidada com usuario:

- mensagens com emojis e linguagem humana
- remover exibicao tecnica de `device_id` no texto final (ex.: nao mostrar `(...freezer_02)` junto do nome)
- usar `Local:` (nao `Unidade/Local:`)
- no acionamento, usar `LIGADO`/`DESLIGADO` (nao `on`/`off`)
- datas em formato amigavel `pt-BR` (`America/Sao_Paulo`) sempre que possivel

Fallback de payload:

- preferir `body.payload`, depois `body`, depois raiz

Campos minimos no texto final:

- cliente
- local
- equipamento
- contexto do evento (temperatura/offline/online/instabilidade/acionamento)

## 6) Erros comuns e diagnostico rapido

### A) Evolution `400 exists:false` com `number=""`

Causa:

- `recipient_phone` vazio

Correcao:

- revisar fallback de telefone no `Edit Fields`
- manter `IF Phone Present` antes do `HTTP Request`

### B) Mensagem com `undefined` / `nao informado` em bloco inteiro

Causa:

- template lendo caminho de campo errado (payload em `body`/`body.payload`)

Correcao:

- usar fallback em cascata (`body.payload` -> `body` -> raiz)

### C) Mensagens duplicadas

Causa comum:

- testes com mais de 1 device

Correcao:

- para validar mensagem unica, testar com 1 device apenas

### D) Sem execucao no n8n

Causa comum:

- workflow nao publicado/ativo
- webhook URL ausente na API

## 7) Evidencia de fechamento desta rodada

Validacoes tecnicas repetidas em producao com sucesso:

- ping real dos 4 webhooks (`200` + `Workflow was started`)
- ingestao no laboratorio (`200`)
- acionamento `on/off` (`201`)
- transicao `offline -> online` observada
- entrega no WhatsApp confirmada pelo usuario

## 8) Arquivos de apoio local

Versoes locais de importacao n8n:

- `tmp/workflows-fix/fixed/IoT - Device Offline - WhatsApp - FIXED.json`
- `tmp/workflows-fix/fixed/IoT - Device Online - WhatsApp - FIXED.json`
- `tmp/workflows-fix/fixed/IoT - Alerta de Temperatura - WhatsApp (1) - FIXED.json`
- `tmp/workflows-fix/fixed/IoT - Acionamento - WhatsApp - FIXED.json`

Nota:

- arquivos fora de `tmp/workflows-fix/fixed` podem estar desatualizados/intermediarios

## 9) Ajuste final de copy (2026-03-23)

No workflow de acionamento:

- quando `client_name` vier vazio e existir apenas `client_id` tecnico (ex.: `cadeia_fria_demo`), o template deve humanizar automaticamente para `Cadeia Fria Demo`
- `Comando` deve exibir `LIGADO`/`DESLIGADO`
- `Executado em` deve ser formatado em `pt-BR` com timezone `America/Sao_Paulo`
- remover sufixo tecnico `(<device_id>)` do campo de equipamento no texto final
