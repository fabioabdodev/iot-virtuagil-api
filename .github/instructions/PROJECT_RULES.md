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
   - auth de usuarios
   - autorizacao por sessao, role e modulo contratado
   - protecao de login por rate limit
   - modulos habilitados por cliente
6. Multi-tenant basico
   - isolamento por `clientId` no backend e no dashboard

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

- recuperacao de senha
- billing / assinaturas
- refinamento de dashboards por perfil de usuario
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

### Autenticacao e autorizacao

O acesso administrativo e operacional agora depende de sessao autenticada.

Regras atuais:

- `POST /auth/login` emite token para usuarios ativos
- `POST /auth/login` agora aplica limite por e-mail + IP e bloqueio temporario
- `GET /auth/me` restaura a sessao do frontend
- rotas administrativas usam sessao autenticada
- rotas de `users`, `clients` e `client-modules` exigem role `admin`
- rotas de `devices`, `readings`, `alert-rules` exigem modulo `temperature` habilitado
- rotas de `actuators` exigem modulo `actuation` habilitado
- o backend faz scoping por `clientId` do usuario autenticado
- admin de cliente atua apenas dentro do proprio tenant
- admin de plataforma e representado por usuario com `clientId = null`

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
- apoio operacional atual:
  - `npm run db:seed` agora tambem prepara atuadores demo e comandos iniciais
  - laboratorio web possui comandos prontos para validar schema, cadastro, comando e historico do `acionamento`
- base de frontend atual:
  - `React Query` segue como camada principal para dados remotos
  - `Context API` foi introduzido para sessao/token do frontend
  - o contexto de auth ja expoe `user`, `isAuthenticated`, `login()` e `logout()`
- auth atual:
  - backend ja possui `POST /auth/login` e `GET /auth/me`
  - usuarios demo sao criados pelo seed
  - frontend ja consome login real e restaura sessao via `GET /auth/me`
  - usuarios agora possuem `phone`, `isActive` e `lastLoginAt`
  - backend ja possui CRUD basico em `/users`
  - dashboard ja possui painel inicial de gestao de usuarios por cliente
  - backend agora protege rotas por sessao autenticada, role e modulo contratado
  - `clientId` do usuario autenticado agora limita consultas e mutacoes sensiveis
  - login agora usa rate limit e bloqueio temporario contra brute force
  - backend ja esta preparado para `Cloudflare Turnstile` quando `TURNSTILE_SECRET_KEY` for configurada
- modulos por cliente:
  - backend ja possui `/client-modules`
  - seed define modulos habilitados por cliente demo
  - dashboard ja esconde/exibe `temperatura` e `acionamento` conforme contratacao
  - dashboard agora explica visualmente quando um modulo nao foi contratado
  - blocos administrativos agora mostram mensagem clara quando o usuario nao e admin ou quando falta `clientId`
- validacoes concluidas localmente:
  - `npm run build` no backend
  - `npm run build` em `apps/web`
  - teste e2e de auth passando
  - teste e2e de atuadores passando
  - teste e2e de usuarios passando
  - teste e2e de client-modules passando
  - teste e2e de devices passando
  - teste e2e de clients passando
- pendencia imediata:
  - aplicar `npx prisma migrate deploy` no banco conectado ao ambiente desejado
  - confirmar no banco real se as tabelas `Actuator` e `ActuationCommand` foram criadas
  - usar `npm run db:verify-actuation` como verificacao rapida apos a migration
  - usar o checklist do README para validar criacao, comando e historico no ambiente integrado
  - avaliar se o proximo refinamento do dashboard deve incluir CTA comercial ou onboarding quando um modulo nao estiver contratado
- restricao importante:
  - ainda nao existem hardwares fisicos disponiveis
  - continuidade deve priorizar simulacao, contratos de API, dashboard e operacao manual
- observacao operacional:
  - em 13/03/2026 houve tentativa de `npx prisma migrate deploy` contra o banco configurado, mas o comando excedeu o tempo de execucao e nao confirmou conclusao
