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

### Regras obrigatorias de cadastro (antirruido operacional)

Direcao consolidada para todos os modulos de cadastro:

- nao permitir salvar cadastro estrutural sem campos minimos obrigatorios
- bloquear duplicidade por nome no mesmo cliente quando o item representa o mesmo recurso operacional
- aplicar comparacao normalizada para duplicidade:
  - ignorar maiusculas/minusculas
  - ignorar acentos
  - tratar `_` e `-` como separadores equivalentes
  - compactar espacos
- garantir que os campos textuais relevantes sejam `trim()` antes de persistir

Aplicacao minima obrigatoria nesta fase:

- `devices`: `clientId` e `name` obrigatorios; nome unico por cliente
- `actuators`: `clientId` e `name` obrigatorios; nome unico por cliente
- `alert-rules`: obrigatorio informar ao menos um limite (`minValue` ou `maxValue`)

Objetivo:

- evitar duplicidades que geram paines incoerentes (`online` e `offline` para o mesmo ativo)
- impedir cadastro "vazio" que vira `Sem dados`, `Sem leitura` ou `undefined` na operacao

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

Regra obrigatoria para novos modulos:

- sempre que um modulo novo exigir notificacao ao cliente, criar fluxo dedicado no `n8n`
- antes de publicar em producao, incluir a URL do webhook correspondente no `.env.prod` da VPS
- sem variavel de webhook configurada no ambiente de producao, o modulo nao deve ser tratado como pronto para go-live comercial

### Acionamento sem hardware

Enquanto nao houver hardware fisico:

- o modulo `acionamento` deve ser validado por dashboard e API
- `POST /actuators/:id/commands` atualiza estado e historico no backend
- nao assumir confirmacao eletrica real da carga
- tratar `currentState` como estado operacional registrado pela plataforma

Webhook opcional de acionamento (pacote comercial):

- `N8N_ACTUATION_WEBHOOK_URL` habilita envio de evento de comando para n8n
- para evitar spam, usar:
  - `ACTUATION_NOTIFY_ENABLED=true`
  - `ACTUATION_NOTIFY_SOURCES=dashboard`
  - `ACTUATION_NOTIFY_COOLDOWN_SECONDS=900`
- quando desabilitado, o acionamento continua funcional no painel/historico sem notificacao externa
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

## Banco e migrations (regra obrigatoria)

Diretriz oficial para qualquer mudanca estrutural no banco:

- usar Prisma como caminho padrao (`prisma/migrations`)
- evitar aplicar schema diretamente no SQL Editor do Supabase como solucao definitiva
- excecao operacional (emergencia): se for necessario aplicar SQL manual para destravar producao, registrar no mesmo ciclo uma migration Prisma equivalente
- sem migration correspondente no repositorio, a mudanca nao deve ser tratada como concluida
- validar sempre com:
  - `npx prisma migrate deploy`
  - `npx prisma migrate status`

Atualizacao consolidada (Jade):

- as tabelas `jade_*` agora devem ser tratadas como parte oficial do schema versionado
- migration oficial: `prisma/migrations/20260324193000_create_jade_tables/migration.sql`

## Regra de artefatos n8n locais

Para fluxos n8n deste projeto:

- manter `workflowsN8N/` na raiz como referencia local oficial dos workflows operacionais
- ao ajustar workflow no n8n UI, refletir a versao final dentro de `workflowsN8N/`
- evitar editar/copiar JSON intermediario fora de `workflowsN8N/` como se fosse versao final
- ao retomar um incidente, priorizar sempre o arquivo correspondente em `workflowsN8N/`
- arquivo canonico atual da Jade:
  - `workflowsN8N/Jade assistente WhatsApp.json`
- quando a Jade voltar a falhar apenas para imagem, verificar primeiro o no `Set Image Message`
  - no estado estavel desta rodada, ele nao deve ficar como `Set`
  - ele deve ficar como `Code` node
  - a extracao do texto da imagem deve considerar payload embrulhado em `wrapped['0']`
- nao reintroduzir bloqueio anti-spam na Jade sem validacao isolada
  - nesta rodada, a camada de anti-spam foi retirada para preservar estabilidade do fluxo principal
- arquivos auxiliares atuais:
  - `workflowsN8N/IoT acionamento WhatsApp.json`
  - `workflowsN8N/IoT alerta de temperatura WhatsApp.json`
  - `workflowsN8N/IoT dispositivo offline WhatsApp.json`
  - `workflowsN8N/IoT dispositivo online WhatsApp.json`
  - `workflowsN8N/IoT energia WhatsApp.json`
- nao usar `tmp/workflows-fix/fixed/` como fonte oficial nova
- nao usar `Knowledge Sync` como parte obrigatoria do caminho principal da Jade enquanto o fluxo atual permanecer sem dependência operacional de vector store/RAG

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

## Nomenclatura real dos cards no Monitor (evitar erro de orientacao)

Para suporte, onboarding e estudos de caso, usar exatamente os nomes atuais da UI:

- `Clientes`
- `Modulos do cliente`
- `Equipamentos`
- `Regras de alerta`
- `Acionamento`
- `Perfil do cliente`
- `Laboratorio`
- `Auditoria`

Importante para o modulo `ambiental`:

- o modulo `ambiental` aparece como contratacao em `Modulos do cliente`
- leituras de `temperatura`, `umidade` e `gases` aparecem em `Equipamentos`
- configuracao de regras ambientais aparece em `Regras de alerta`
- evitar instruir usuario a procurar um card principal chamado `Ambiental` quando a tela estiver no layout atual

## Registro de UX consolidado (2026-03-20)

Melhorias aplicadas para reduzir friccao operacional:

- conflito de telefone no perfil do cliente agora informa:
  - nome e `id` do cliente duplicado
  - campo de origem do conflito
- frontend do `Perfil do cliente` agora destaca em vermelho o campo com conflito de telefone
- acao `Gerar nova chave` no perfil do cliente agora exige confirmacao explicita:
  - `Tem certeza que deseja criar uma nova chave?`

## Direcao de notificacao para cliente multiunidade

Regra de produto a partir de 20/03/2026:

- um mesmo cliente (mesmo CNPJ) pode possuir duas ou mais unidades
- cada unidade pode ter gerente operacional e WhatsApp proprios
- alertas devem identificar unidade no texto e priorizar envio ao responsavel local

Padrao operacional atual:

- fase imediata: roteamento por `device_id` ou `device_location` no `n8n`
- fase nativa: evoluir dominio para `Client -> Unit -> Device`
- documento de referencia: `.github/instructions/case-studies/MULTI_UNIT_WHATSAPP_PATTERN.md`

Padrao de mensagem no n8n para eventos de conectividade:

- tratar `device_back_online` e `device_connectivity_instability` no mesmo template
- incluir contexto `cliente + unidade + equipamento`
- usar fallback robusto de campos (`camelCase` + `snake_case`)
- formatar datas em `pt-BR` com timezone `America/Sao_Paulo`
- evitar texto final com `nao informado` quando houver fallback confiavel

## Direcao de continuidade por estudo de caso

Quando houver tarefa ligada a cliente real, demonstracao, onboarding ou implantacao:

- consultar primeiro `estudos de caso/README.md`
- abrir depois o arquivo especifico do cliente, como `estudos de caso/cuidare.md`
- seguir o padrao versionado em `.github/instructions/case-studies/UI_FIRST_PATTERN.md`
- executar em modo `UI-first`:
  - cadastro e configuracao primeiro pelo Monitor
  - validacao de usabilidade, navegacao e linguagem no proprio painel
  - API/scripts apenas para evidenciar integracao, diagnosticar falhas e automatizar repeticao
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
  - no fechamento de 15/03/2026 ainda nao havia hardware fisico disponivel
  - naquele momento, a continuidade precisava priorizar simulacao, contratos de API, dashboard e operacao manual
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

## Diretriz de infraestrutura para projeto institucional

Direcao registrada em 21/03/2026:

- o site institucional deve ser implementado em `Next.js`
- o deploy pode usar a mesma VPS e o mesmo ecossistema operacional (`Docker Swarm`, `Traefik`, `Cloudflare`)
- mesmo compartilhando infraestrutura, o institucional deve rodar em stack separada, com dominio/rotas e variaveis proprias
- nao acoplar deploy do institucional ao deploy do monitor/API no mesmo ciclo automatizado

## Regra transversal para novos modulos de cadastro

Padrao oficial a reaplicar em todos os modulos novos (ambiental, acionamento, energia e proximos):

- formularios de cadastro devem priorizar campo `Nome` como entrada principal de identificacao
- `codigo tecnico (imutavel)` e `codigo interno do cliente` nao devem ser exigidos manualmente quando puderem ser derivados com seguranca
- o codigo tecnico deve ser gerado automaticamente a partir do nome informado, com:
  - normalizacao para `snake_case`
  - remocao de acentos e caracteres especiais
  - bloqueio de caracteres tecnicamente invalidos
  - garantia de unicidade por sufixo incremental quando houver colisao
- o codigo tecnico gerado deve permanecer imutavel apos criacao
- filtros operacionais devem priorizar busca por `Nome`, mantendo compatibilidade por codigo
- labels visiveis ao usuario devem permanecer em portugues e alinhados ao texto oficial da UI

## Regra de release e versionamento visual

Para fechamento de cada ciclo pronto para inauguracao/comercializacao:

- aplicar versao semantica no formato `vX.Y.Z` (exemplo inicial: `v1.0.0`)
- registrar release notes com resumo funcional e validacoes executadas
- exibir no rodape da UI:
  - versao publicada
  - data/hora de build
  - identificador de release (commit/tag)
- essa exibicao global no rodape deve ser feita apenas no fechamento final, para evitar ruido durante implementacoes em andamento

## Inicio da fase de hardware real (2026-03-21)

Estado registrado:

- kit fisico recebido (ESP32, sensor de temperatura, caixa, fios e itens de bancada)
- objetivo imediato: iniciar teste residencial controlado em geladeira/freezer

Direcao pratica:

- manter primeiro ciclo de testes com foco em seguranca e estabilidade de leitura
- validar envio real para API em `POST /iot/readings` com `x-device-key`
- usar ambiente controlado antes de qualquer instalacao em cliente

## Regra operacional de commits para proximos agents

- fazer commits pequenos e progressivos por etapa concluida, em vez de acumular alteracoes grandes
- apos cada etapa estavel e validada, preferir `git commit` e `git push` para manter o historico rastreavel
- nao fazer alteracoes grandes, estruturais ou com risco operacional sem consultar o usuario antes
- quando houver duvida entre seguir e agrupar muitas mudancas, parar no menor recorte util e registrar um commit intermediario
- objetivo dessa regra:
  - facilitar rollback
  - facilitar auditoria
  - facilitar localizar a etapa exata quando surgir erro em CI, deploy, n8n ou producao

