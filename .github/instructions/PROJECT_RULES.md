---
description: regras do projeto e conceitos do produto no estado atual
applyTo: '**'
---

# PROJECT_RULES.md - Regras e estado atual do projeto

## Escopo atual do projeto

Funcionalidades ja implementadas:

1. Ingestao de temperatura via HTTP
   - `POST /iot/temperature`
2. Persistencia
   - leituras de temperatura
   - estado do device (`lastSeen`, `isOffline`, `offlineSince`)
3. Monitoramento
   - deteccao de offline
   - alerta por temperatura fora da faixa
   - cooldown e tolerancia
   - webhook de temperatura e offline
4. Operacao
   - ambiente local
   - deploy em Docker Swarm
   - banco no Supabase
   - integracao com n8n e Evolution
5. Gestao
   - clients
   - devices
   - alert rules
   - dashboard web
   - actuators
   - actuation commands
6. Multi-tenant basico
   - isolamento por `clientId`

## Estado atual do modulo temperatura

O modulo `temperatura` esta funcionalmente concluido e operacionalmente validado.

Ja foi validado:

- cadastro de cliente
- cadastro de device
- cadastro de regra
- historico
- temperatura fora da faixa
- online/offline
- filtro por cliente
- feedback principal do dashboard
- webhook de temperatura ponta a ponta
- webhook de offline ponta a ponta
- n8n processando execucoes apos ajuste de Redis
- API em producao usando Supabase com session pooler

Pendencias principais restantes:

- reduzir ruido operacional do deploy em Swarm
- revisar a imagem da API para incluir OpenSSL e reduzir warnings do Prisma
- aplicar a migration do modulo `acionamento` no banco real
- validar o fluxo manual de acionamento em ambiente integrado
- manter o modulo `acionamento` em modo simulado ate a chegada do hardware

## O que ainda nao entrou por completo

- autenticacao de usuarios
- billing / assinaturas
- dashboards por perfil de usuario
- multiplos tipos reais de sensor no mesmo fluxo de ingestao
- app mobile
- integracao com hardware fisico de acionamento

## Conceitos principais

### Client

Representa a empresa ou operacao dona dos dispositivos.

### Device

Representa o equipamento monitorado, por exemplo `freezer_01`.

Campos importantes:

- `id`
- `clientId`
- `lastSeen`
- `isOffline`
- `offlineSince`
- `lastAlertAt`

### Reading

Leitura de sensor armazenada no historico. Hoje o foco e temperatura, mas a
arquitetura deve continuar preparada para futura extensao.

### Alert Rule

Define os limites, tolerancia, cooldown e habilitacao do alerta por device,
cliente e tipo de sensor.

### Actuator

Representa uma carga controlavel no modulo `acionamento`, por exemplo
`sauna_main`.

Campos importantes:

- `id`
- `clientId`
- `deviceId`
- `currentState`
- `lastCommandAt`
- `lastCommandBy`

### Actuation Command

Representa um comando registrado no historico do atuador.

Campos importantes:

- `actuatorId`
- `desiredState`
- `source`
- `note`
- `executedAt`

## Regras de negocio atuais

### Ingestao

Ao receber uma leitura valida:

- salvar a temperatura
- atualizar `lastSeen`
- marcar o device como online
- limpar `offlineSince`

### Offline

O monitor roda de forma periodica.

Se `lastSeen` estiver alem do cutoff:

- marcar o device como offline
- registrar `offlineSince`
- disparar alerta uma unica vez na transicao

Importante:

- o alerta de offline e disparado apenas na transicao `online -> offline`
- se o device ja estiver offline, novos ticks do monitor nao reenfileiram o mesmo alerta

### Temperatura fora da faixa

Quando existir regra habilitada:

- respeitar temperatura minima e maxima
- respeitar tolerancia configurada
- respeitar cooldown para nao spammar

### Acionamento sem hardware

Enquanto nao houver hardware fisico:

- o modulo `acionamento` deve ser validado por dashboard e API
- `POST /actuators/:id/commands` atualiza estado e historico no backend
- nao assumir confirmacao eletrica real da carga
- tratar `currentState` como estado operacional registrado pela plataforma
- integracao com rele, ESP32 ou retorno fisico fica para fase posterior

## Seguranca

- `x-device-key` e obrigatorio no endpoint do device
- nunca comitar `.env`
- nunca logar `DATABASE_URL`, tokens ou webhooks sensiveis
- segredos de pipeline devem ficar em GitHub Secrets

## Direcao de evolucao

Ver `.github/instructions/ROADMAP.md` para a sequencia de evolucao.

## Registro operacional recente

Correcoes validadas em producao:

- stack do `n8n` passou a usar `QUEUE_BULL_REDIS_HOST=redis_redis`
- `N8N_NODE_PATH` do `n8n` foi corrigido para `/home/node/.n8n/nodes`
- `N8N_TEMPERATURE_ALERT_WEBHOOK_URL` foi corrigida para `https://webhookworkflow.virtuagil.com.br/webhook/temperature-alert`
- `N8N_OFFLINE_WEBHOOK_URL` foi corrigida para `https://webhookworkflow.virtuagil.com.br/webhook/device-offline`
- `DATABASE_URL` da API em producao foi migrada da conexao direta IPv6 do Supabase para o `session pooler`

Observacao importante para continuidade:

- a stack `iot-monitor` so carrega corretamente as variaveis da API quando o deploy e feito no mesmo shell com:
  - `set -a`
  - `. ./.env.prod`
  - `set +a`
  - `docker stack deploy -c deploy/swarm/stack.prod.yml iot-monitor --with-registry-auth`

## Registro de continuidade para proximos agentes

Estado em 13/03/2026:

- modulo `temperatura` segue encerrado no escopo funcional atual
- modulo `acionamento` foi iniciado no backend e no dashboard
- backend do `acionamento` ja possui:
  - modelagem `Actuator` e `ActuationCommand`
  - endpoints CRUD basicos para atuadores
  - endpoint de comando manual `POST /actuators/:id/commands`
  - historico em `GET /actuators/:id/commands`
- dashboard web ja possui:
  - cadastro de atuadores
  - edicao e exclusao de atuadores
  - botoes de ligar e desligar
  - historico recente de comandos
- validacoes concluidas localmente:
  - `npm run build` no backend
  - `npm run build` em `apps/web`
  - teste e2e de atuadores passando
- pendencia imediata:
  - aplicar `npx prisma migrate deploy` no banco conectado ao ambiente desejado
  - confirmar no banco real se as tabelas `Actuator` e `ActuationCommand` foram criadas
- restricao importante:
  - ainda nao existem hardwares fisicos disponiveis
  - continuidade deve priorizar simulacao, contratos de API, dashboard e operacao manual
- observacao operacional:
  - em 13/03/2026 houve tentativa de `npx prisma migrate deploy` contra o banco configurado, mas o comando excedeu o tempo de execucao e nao confirmou conclusao
