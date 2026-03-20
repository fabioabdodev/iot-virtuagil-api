---
description: regras do projeto e conceitos do produto no estado atual
applyTo: '**'
---

# PROJECT_RULES.md - Regras e estado atual do projeto

## Atualizacao de referencia (2026-03-19)

Direcao consolidada apos a refatoracao:

- o item `temperatura` foi promovido para modulo-categoria `ambiental`
- `ambiental` agora concentra itens expansivos como:
  - `temperatura`
  - `umidade`
  - `gases`
- `acionamento` segue como modulo-categoria com itens expansivos como:
  - `rele`
  - `status_abertura`
  - `tempo_aberto`
- `energia` foi introduzido como modulo-categoria para:
  - `corrente`
  - `tensao`
  - `consumo`
- contratacao por cliente passa a ser no nivel de item, mantendo leitura por modulo para UX
- a API agora possui ingestao generica em `POST /iot/readings`
- `POST /iot/temperature` permanece ativo como compatibilidade legada
- o projeto de firmware continua separado em `iot-virtuagil-firmware/`

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
   - rotina inicial de backup do banco
   - health com release e features publicadas
   - integracao com n8n e Evolution
5. Gestao
   - clients
   - perfil comercial minimo por cliente
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

## Estado atual do modulo ambiental (item temperatura)

O modulo `ambiental`, no item `temperatura`, esta funcionalmente concluido e operacionalmente validado.

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
- manter o modulo `acionamento` em modo simulado ate a chegada do hardware
- girar a `TURNSTILE_SECRET_KEY` exposta e manter o Turnstile apenas com segredos de ambiente

## O que ainda nao entrou por completo

- recuperacao de senha
- billing / assinaturas
- cobranca automatizada
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
- se o device estava offline, disparar um alerta unico de recuperacao na transicao `offline -> online`

### Offline

O monitor roda de forma periodica.

Se `lastSeen` estiver alem do cutoff:

- marcar o device como offline
- registrar `offlineSince`
- disparar alerta uma unica vez na transicao

Importante:

- o alerta de offline e disparado apenas na transicao `online -> offline`
- se o device ja estiver offline, novos ticks do monitor nao reenfileiram o mesmo alerta
- quando o device volta a comunicar, a recuperacao deve ser sinalizada apenas uma vez na transicao `offline -> online`
- quando houver oscilacao curta e repetida de conectividade dentro da janela configurada, o backend deve trocar a dupla `offline/online` por um aviso unico de `instabilidade`
- enquanto o alerta de `instabilidade` estiver em cooldown, novos `offline/online` do mesmo device devem ficar silenciosos para evitar spam
- se o equipamento ficar alternando entre offline e online em janela curta, a plataforma deve preferir um aviso unico de instabilidade em vez de spammar o cliente com varias mensagens

### Temperatura fora da faixa

Quando existir regra habilitada:

- respeitar temperatura minima e maxima
- respeitar tolerancia configurada
- respeitar cooldown para nao spammar

### Canal principal de notificacao

Direcao operacional atual:

- o dashboard web e a camada de monitoramento e historico
- o canal principal de notificacao ao cliente deve ser `WhatsApp`
- `n8n` e `Evolution` formam a trilha principal de entrega dessas notificacoes
- outros canais podem existir no futuro, mas nao devem competir com o foco atual

Fluxo ponta a ponta esperado nesta fase:

1. a API recebe a leitura ou detecta offline
2. a regra de negocio identifica o evento critico
3. a API envia webhook para o `n8n`
4. o `n8n` monta o fluxo de notificacao
5. o `Evolution` entrega a mensagem no `WhatsApp`
6. o cliente recebe o alerta fora do dashboard

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
- rotas de `devices`, `readings`, `alert-rules` exigem modulo `ambiental` habilitado
- rotas de `actuators` exigem modulo `acionamento` habilitado
- o backend faz scoping por `clientId` do usuario autenticado
- admin de cliente atua apenas dentro do proprio tenant
- admin de plataforma e representado por usuario com `clientId = null`
- direcao de produto aprovada:
  - administrador da plataforma tem acesso total a todos os tenants e pode monitorar tudo
  - administrador do cliente pode monitorar o proprio tenant
  - administrador do cliente deve evoluir para poder alterar regras operacionais do proprio tenant
  - operador deve monitorar, mas nao alterar parametros criticos
- separar responsabilidade de estrutura e operacao:
  - estrutura fica com a plataforma
  - parametros operacionais do negocio ficam com o cliente
- alteracoes criticas de temperatura e alerta devem evoluir com trilha de auditoria
- dados comerciais do cliente permanecem enxutos e manuais:
  - `name`
  - `document`
  - `phone`
  - `billingEmail`
  - `status`
  - `notes`
  - sem gateway de pagamento nesta fase

## Seguranca

- `x-device-key` e obrigatorio no endpoint do device
- a direcao atual de seguranca para runtime IoT e:
  - preferir `deviceApiKey` por cliente
  - manter `DEVICE_API_KEY` global apenas como fallback de transicao
  - sempre que possivel, simuladores e integracoes devem usar a chave da conta em foco
- nunca comitar `.env`
- nunca logar `DATABASE_URL`, tokens ou webhooks sensiveis
- segredos de pipeline devem ficar em GitHub Secrets
- backup do banco deve ser guardado fora da VPS principal
- artefatos locais de execucao como `tmp-*.log` devem ficar em `logs/`, nao soltos na raiz
- `TURNSTILE_SECRET_KEY` deve ficar apenas em segredo de ambiente; se for exposta em chat, screenshot ou ticket, girar no Cloudflare

## Direcao de evolucao

Ver `.github/instructions/ROADMAP.md` para a sequencia de evolucao.

Ver tambem `.github/instructions/ACCESS_POLICY.md` para a politica alvo de acessos e responsabilidade operacional.

## Ferramenta preferida para teste manual rapido

Quando a validacao for manual:

- preferir Insomnia
- usar `.github/instructions/MANUAL_TESTS.md` como roteiro base
- evitar complicar a validacao com processos pesados quando a API puder ser verificada diretamente

## Regra critica de comandos no PowerShell

Para evitar erro recorrente de parser neste ambiente:

- nao usar `&&` para encadear comandos
- usar `;` entre comandos no PowerShell

Exemplo:

```powershell
npm run build; npm run test:e2e -- --runInBand
```

## Higiene operacional de disco na VPS

Em ciclos com muitos deploys, o maior vilao de disco tende a ser Docker:

- imagens antigas acumuladas de `api` e `web`
- tags `sha-*` antigas
- imagens `<none>` de builds anteriores

Regra operacional:

- antes de suspeitar de banco, Git ou codigo-fonte, verificar `docker system df`
- se o crescimento estiver concentrado em `Images`, a limpeza segura inicial e `docker image prune -a`
- evitar `docker volume prune` sem auditoria manual, porque volumes podem guardar dados persistentes do `n8n`, bancos e outras stacks

Registro validado em producao em `16/03/2026`:

- VPS com disco de `194G` chegou a `103G` usados
- `docker system df` mostrou `91.1GB` em imagens, com `74.43GB` reclamaveis
- apos `docker image prune -a`, o uso caiu para `26G`

## Direcao de linguagem para frontend

Ao criar telas novas ou expandir modulos existentes:

- preferir linguagem de produto e operacao real em vez de termos internos de arquitetura
- usar `cliente` em vez de `tenant` na UI
- usar `codigo interno` quando `clientId` precisar aparecer para orientar operacao
- usar `equipamento` quando a interface estiver falando com usuario final ou em contexto comercial
- manter nomes tecnicos como `clientId` e payloads apenas onde forem realmente necessarios para cadastro, suporte ou simulacao
- novos modulos devem nascer alinhados a essa direcao, sem exigir uma rodada posterior de traducao da interface

## Direcao de continuidade por estudo de caso

Quando houver tarefa ligada a cliente real, demonstracao, onboarding ou implantacao:

- consultar primeiro `estudos de caso/README.md`
- abrir depois o arquivo especifico do cliente, como `estudos de caso/cuidare.md`
- tratar cada estudo de caso como base para um roteiro pratico de implantacao dentro do dashboard
- o trabalho esperado nao e apenas revisar copy:
  - deve ensinar a ordem real de uso da plataforma
  - deve mostrar o que cadastrar, habilitar, configurar e simular
  - deve revelar friccoes de layout e onboarding
- cada caso novo deve ajudar a plataforma a responder esta pergunta:
  - `se esse cliente chegasse agora, o que eu faria primeiro, depois e por ultimo dentro do painel?`

Direcao de produto consolidada para proximos agentes:

- os estudos de caso devem virar playbooks operacionais progressivos dentro da UI
- o dashboard deve ajudar a conduzir a implantacao, nao apenas exibir dados
- cada rodada de caso concreto deve gerar:
  - roteiro mais claro
  - melhorias de layout e navegacao
  - registro de continuidade no handoff

## Registro adicional de frontend em 17/03/2026

Aprendizado importante desta rodada:

- quando o dashboard aparentar travar em `Enviando equipamento...`, nao assumir de imediato problema de API
- neste projeto, houve um caso real em que:
  - o diagnostico interno criou e removeu equipamento com sucesso
  - o cadastro por formulario permanecia preso
  - a causa estava no fluxo de submissao do frontend, nao no endpoint `POST /devices`

Direcao pratica para proximos agentes:

- validar primeiro se o problema aparece tambem no diagnostico interno da tela
- se o diagnostico passar e o formulario falhar, tratar como bug de fluxo do frontend
- priorizar feedback explicito no proprio painel antes de partir para ferramentas externas
- evitar estados de loading acoplados a `isFetching` automatico quando a tela tambem faz refetch em background

Direcao atual do formulario de equipamentos:

- validacao de UX continua com `zod`
- validacao de seguranca continua no backend com `class-validator` e `ValidationPipe`
- o fluxo que se mostrou confiavel nesta rodada foi:
  - leitura direta dos campos
  - validacao com `safeParse`
  - envio por chamada direta de API
  - feedback visual claro de sucesso, erro e refresh

## Registro adicional de runtime IoT em 17/03/2026

Direcao consolidada nesta rodada:

- `DEVICE_API_KEY` global nao deve mais ser tratada como modelo final de seguranca
- o runtime IoT deve caminhar para isolamento por cliente
- o primeiro passo implementado foi `deviceApiKey` por cliente, com fallback de transicao

Regras praticas agora:

- novos clientes recebem `deviceApiKey` automaticamente
- o perfil do cliente deve ser a referencia operacional para copiar ou girar essa chave
- `POST /iot/temperature` pode receber `client_id` para autenticar um device novo antes de existir associacao previa no banco
- `scripts/iot-simulator.mjs` deve usar:
  - `--url` para apontar para API remota
  - `--client-id` para incluir `client_id` no payload
- no dashboard, o laboratorio deve preferir comandos da conta em foco e nao exemplos genericos que apontem para `localhost`
- em retomadas futuras, se o fluxo envolver `n8n` e Evolution:
  - primeiro confirmar workflow publicado no `n8n`
  - depois confirmar instancia conectada no Evolution
  - so entao disparar simulacao pela plataforma

## Registro operacional recente

Correcoes validadas em producao:

- stack do `n8n` passou a usar `QUEUE_BULL_REDIS_HOST=redis_redis`
- `N8N_NODE_PATH` do `n8n` foi corrigido para `/home/node/.n8n/nodes`
- `N8N_TEMPERATURE_ALERT_WEBHOOK_URL` foi corrigida para `https://webhookworkflow.virtuagil.com.br/webhook/temperature-alert`
- `N8N_OFFLINE_WEBHOOK_URL` foi corrigida para `https://webhookworkflow.virtuagil.com.br/webhook/device-offline`
- `DATABASE_URL` da API em producao foi migrada da conexao direta IPv6 do Supabase para o `session pooler`
- migrations e verificacoes administrativas agora devem preferir `DIRECT_DATABASE_URL` quando o ambiente usar pooler no `DATABASE_URL`
- o endpoint `/health` agora deve expor `release`, `buildTime` e `features` para facilitar comparacao entre codigo atual e API realmente publicada
- a stack de producao agora deve preferir `API_IMAGE` e `WEB_IMAGE` com tag imutavel por release em vez de depender apenas de `latest`
- o projeto agora possui `npm run health:check:prod` para validacao rapida do `/health` publicado
- em producao, a stack do Swarm e o `.env.prod` da VPS devem permanecer alinhados; variaveis no Portainer isoladamente nao garantem que o deploy por SSH use o mesmo conjunto
- em VPS pequena, o rollout da stack deve preferir `update_config.order = stop-first` para evitar `exit code 137` durante troca de imagem
- Cloudflare configurado no plano `Free`
- `monitor.virtuagil.com.br` validado com proxy ativo no Cloudflare
- `virtuagil.com.br` testado com proxy ativo, mas retornou erro `526 Invalid SSL certificate` por ainda nao existir origem HTTPS valida para esse host
- recomendacao operacional atual: manter o dominio raiz em `DNS only` ate o site institucional existir com rota e certificado valido no Traefik
- recomendacao operacional atual: manter `api-monitor`, `automacao`, `workflow` e `webhookworkflow` em `DNS only` ate rodada dedicada de testes
- Cloudflare mantido com `SSL/TLS = Full (strict)` e `Automatic HTTPS Rewrites` ligado

Observacao importante para continuidade:

- a stack `iot-monitor` so carrega corretamente as variaveis da API quando o deploy e feito no mesmo shell com:
  - `set -a`
  - `. ./.env.prod`
  - `set +a`
  - `docker stack deploy -c deploy/swarm/stack.prod.yml iot-monitor --with-registry-auth`

## Registro de continuidade para proximos agentes

Estado consolidado em 15/03/2026:

- modulo `ambiental` (item `temperatura`) segue encerrado no escopo funcional atual
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
  - o projeto agora possui `npm run backup:db` e `npm run backup:db:dry-run` como base inicial de backup do PostgreSQL
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
  - backend ja valida `turnstileToken` quando `TURNSTILE_SECRET_KEY` estiver configurada
  - frontend ja tenta renderizar o widget do Turnstile quando `NEXT_PUBLIC_TURNSTILE_SITE_KEY` estiver definida
  - houve ajuste recente no widget para evitar crash da tela e usar render mais estavel
  - o login com Turnstile ja foi validado em producao depois dos ajustes finais do widget
  - banco real agora possui tabela `User` e o seed foi executado novamente com sucesso
- modulos por cliente:
  - backend ja possui `/client-modules`
  - seed define modulos habilitados por cliente demo
  - dashboard ja esconde/exibe `temperatura` e `acionamento` conforme contratacao
- dashboard agora explica visualmente quando um modulo nao foi contratado
- blocos administrativos agora mostram mensagem clara quando o usuario nao e admin ou quando falta `clientId`
- estados vazios do dashboard agora orientam onboarding inicial para devices, regras e atuadores
- dashboard agora possui painel de perfil comercial minimo do cliente para operacao manual
- dashboard agora possui um bloco de prontidao comercial que traduz o estado tecnico da conta em narrativa de demonstracao:
  - score de readiness
  - modulos contratados
  - devices, regras e atuadores ja configurados
  - proximos passos sugeridos para onboarding e venda
- dashboard agora possui um bloco de atividade operacional que combina:
  - devices offline ou fora da faixa
  - comandos recentes do modulo `acionamento`
  - leitura rapida para operacao e demonstracao
- banco real agora possui os campos comerciais minimos em `Client`:
  - `document`
  - `phone`
  - `billingEmail`
  - `status`
  - `notes`
  - `updatedAt`
- banco real agora possui tabela `ClientModule` e o seed foi executado novamente com sucesso
- validacoes concluidas localmente:
  - `npm run build` no backend
  - `npm run build` em `apps/web`
  - teste e2e de auth passando
  - teste e2e de atuadores passando
  - teste e2e de usuarios passando
  - teste e2e de client-modules passando
  - teste e2e de devices passando
  - teste e2e de clients passando
  - `npm run db:verify-actuation` confirmou migration e tabelas do `acionamento` no banco real usando `DIRECT_DATABASE_URL`
  - fluxo integrado real validado: `POST /auth/login` -> `POST /actuators` -> `POST /actuators/:id/commands` -> `GET /actuators/:id/commands`
- pendencia imediata:
  - manter `DIRECT_DATABASE_URL` configurado nos ambientes onde houver migrate/verificacao administrativa
  - revisar por que `npx prisma migrate deploy` encontrou timeout no advisory lock mesmo com o schema ja presente
  - revisar a imagem da API para remover o warning atual de Prisma/OpenSSL
  - consolidar o roteiro final de demonstracao comercial dos modulos `ambiental` e `acionamento`
  - definir onde os dumps de backup serao armazenados fora da VPS principal
- restricao importante:
  - ainda nao existem hardwares fisicos disponiveis
  - continuidade deve priorizar simulacao, contratos de API, dashboard e operacao manual
- observacao operacional:
  - em 13/03/2026 o Cloudflare foi ajustado para `Full (strict)`; `monitor.virtuagil.com.br` ficou funcional com proxy e o dominio raiz apresentou `526` por falta de origem HTTPS valida
  - em 13/03/2026 `npm run db:verify-actuation` confirmou no banco real a migration `20260313013000_create_actuation_module` e as tabelas `Actuator` e `ActuationCommand`
  - em 13/03/2026 as estruturas faltantes de `User` e `ClientModule` foram alinhadas diretamente no banco real e registradas em `_prisma_migrations`; o seed voltou a rodar com sucesso
  - em 13/03/2026 a migration `20260313170000_expand_clients_business_profile` foi aplicada por `prisma db execute` e registrada manualmente em `_prisma_migrations`, porque `prisma migrate deploy` continuou batendo no advisory lock
  - em 13/03/2026 os clientes `virtuagil` e `cliente_teste` foram confirmados no Supabase com `document`, `phone`, `billingEmail` e `status` populados
  - em 13/03/2026 foi revisado o GitHub Actions atual: `ci.yml` nao roda migrations e `deploy.yml` nao roda `prisma migrate deploy`, entao o advisory lock do Prisma nao parece vir do workflow atual por si so
  - em 13/03/2026 foi criada uma base inicial de backup com documentacao interna e script `npm run backup:db` usando `pg_dump`
  - em 14/03/2026 o `/health` passou a expor `release`, `buildTime` e `features`, e o projeto ganhou `npm run health:check:prod`
  - em 14/03/2026 o deploy em Swarm foi ajustado para consumir `API_IMAGE` e `WEB_IMAGE` por release, reduzindo a dependencia de `latest`
  - em 14/03/2026 os logs temporarios locais passaram a ter pasta dedicada em `logs/`
  - em 14/03/2026 a publicacao da API nova em producao exigiu alinhar tres pontos:
    - a stack antiga salva no Portainer
    - o `stack.prod.yml` da VPS
    - o `.env.prod` da VPS
  - em 14/03/2026 a API nova subiu com sucesso em producao apos incluir `AUTH_*`, `APP_RELEASE`, `APP_BUILD_TIME`, `API_IMAGE` e `WEB_IMAGE` no `.env.prod` e repassar `AUTH_*` no bloco `environment` do servico `api`
  - em 14/03/2026 `npm run health:check:prod` confirmou `release`, `buildTime` e todas as `features` novas publicadas
  - em 14/03/2026 foi validado em producao:
    - `POST /auth/login` respondendo com token e usuario
    - `GET /actuators/commands/recent` deixando de retornar `404` e passando a exigir bearer token
  - em 15/03/2026 o deploy passou a usar com sucesso:
    - pasta `/opt/iot-virtuagil-api` na VPS
    - imagens `ghcr.io/fabioabdodev/iot-virtuagil-api/api:sha-...`
    - imagens `ghcr.io/fabioabdodev/iot-virtuagil-api/web:sha-...`
  - em 15/03/2026 o `.env.prod` da VPS foi alinhado com:
    - `API_IMAGE=ghcr.io/fabioabdodev/iot-virtuagil-api/api:latest`
    - `WEB_IMAGE=ghcr.io/fabioabdodev/iot-virtuagil-api/web:latest`
    - `TURNSTILE_SECRET_KEY`
    - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
  - em 15/03/2026 o monitor voltou a abrir em producao apos ajuste defensivo no widget do Turnstile
  - em 15/03/2026 o login com Turnstile foi validado em producao apos corrigir no widget:
    - reset indevido no primeiro carregamento
    - remocao acidental do widget apos o `render`

## Limite de escopo para proximos chats

Para evitar confusao de contexto:

- `institucional-site/` tem regras e material de outro projeto, o futuro site institucional da Virtuagil
- `iot-virtuagil-firmware/` tem README e handoff proprios de outro projeto, o futuro repositorio de firmware
- `estudos de caso/` na raiz do projeto guarda material local de proposta, onboarding, implantacao e revisao de UX por cliente
- essa pasta pode nao estar no Git e deve ser tratada como contexto local complementar, nao como documentacao oficial versionada
- quando a tarefa mencionar estudo de caso, jornada do cliente, proposta ou implantacao, consultar primeiro `estudos de caso/README.md` e depois o caso especifico
- o uso esperado dessa pasta e apoiar simulacoes de uso real do sistema, como se a equipe tivesse chegado ao cliente, para conhecer melhor as telas e levantar melhorias de UI/UX com base em contexto concreto
- quando a tarefa for sobre a API ou o dashboard, nao misturar decisoes desses dois escopos paralelos

