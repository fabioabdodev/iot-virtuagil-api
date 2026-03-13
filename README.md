# API de Monitoramento IoT (Freezer)

Backend em NestJS para monitoramento de dispositivos IoT, com ingestão de temperatura, detecção de offline, regras de alerta configuráveis e integração por webhook.

## Stack

- Node.js + NestJS
- Prisma ORM
- PostgreSQL (Supabase)
- Scheduler (cron)
- Integração de alertas via webhook (n8n)

## Funcionalidades atuais

- Ingestão de temperatura via `POST /iot/temperature`
- Autenticação de device por `x-device-key`
- Rate limit por device
- Gestão de devices (`POST/GET/PATCH/DELETE`)
- Gestão de atuadores e comandos manuais (`/actuators`)
- Dashboard backend (`GET /devices` e histórico)
- Leitura normalizada e agregada por resolução (`/readings`)
- Gestão de clientes (`/clients`)
- Autenticacao de usuarios (`/auth`)
- Protecao de login por rate limit e bloqueio temporario
- Regras de alerta (`/alert-rules`)
- Monitoramento offline + alerta por temperatura
- Base multi-tenant (`clientId`)

## Direcao do produto

O projeto esta evoluindo para uma plataforma modular de automacao e monitoramento.

Modulo atual:

- `temperatura`

Proximo modulo planejado:

- `acionamento`

Resumo da estrategia:

- consolidar um modulo por vez
- validar o uso real
- evoluir a plataforma reaproveitando a mesma base

Mais detalhes em `.github/instructions/PRODUCT_RULES.md` e `.github/instructions/ROADMAP.md`.

## Arquitetura operacional atual

Servicos em uso hoje:

- `monitor.virtuagil.com.br`: dashboard web
- `api-monitor.virtuagil.com.br`: API principal
- `workflow.virtuagil.com.br`: `n8n` para webhooks e automacoes
- `evolution.virtuagil.com.br`: camada de mensageria e integracoes de comunicacao
- `Redis` no ambiente Docker: suporte operacional para fluxos e filas do `n8n`

Fluxo esperado para alertas:

1. device envia leitura para a API
2. a API detecta evento de temperatura ou offline
3. a API envia webhook para o `n8n`
4. o `n8n` pode orquestrar notificacoes e integracoes
5. o `Evolution` pode ser usado para entrega de mensagens, como WhatsApp

Observacao de infraestrutura:

- hoje o `Redis` apoia principalmente os fluxos do `n8n`
- no medio prazo ele tambem pode ser reaproveitado pela API para fila de alertas e cache compartilhado
- quando o Supabase estiver usando pooler no `DATABASE_URL`, migrations devem usar a conexao direta em `DIRECT_DATABASE_URL`

## Requisitos

- Node.js 20+
- npm 10+
- Banco PostgreSQL acessível

## Configuração

1. Instale dependências:

```bash
npm ci
```

2. Copie o arquivo de exemplo de ambiente:

```bash
cp .env.example .env
```

3. Ajuste variáveis em `.env` (principalmente `DATABASE_URL`, `DIRECT_DATABASE_URL` e webhooks).

Observação importante: se a senha do banco tiver caracteres especiais (`@`, `:`, `/`, etc.), faça URL encode.
Exemplo: `@` vira `%40`.

4. Gere o Prisma Client:

```bash
npx prisma generate
```

5. Aplique migrations:

```bash
npx prisma migrate deploy
```

Observacao importante para Supabase:

- `DATABASE_URL` pode continuar apontando para o pooler usado pela aplicacao
- `DIRECT_DATABASE_URL` deve apontar para a conexao direta do banco
- migrations e verificacoes administrativas devem preferir `DIRECT_DATABASE_URL`

6. Opcionalmente confirme se o modulo `acionamento` entrou no banco:

```bash
npm run db:verify-actuation
```

7. Rode em desenvolvimento:

```bash
npm run start:dev
```

8. Opcional: popule dados de demonstracao:

```bash
npm run db:seed
```

## Banco e backup

O projeto usa PostgreSQL no Supabase.

Observacoes praticas:

- no plano Free do Supabase existe backup automatico diario, mas com acesso e operacao mais limitados do que nos planos pagos
- por isso, para ambiente importante, nao e recomendavel depender apenas do backup nativo do plano Free
- o recomendado e manter tambem um processo proprio de export do banco com `pg_dump` ou `supabase db dump`
- esse dump deve ser armazenado fora do Supabase

Rotina inicial recomendada neste projeto:

```bash
npm run backup:db
```

Teste sem executar:

```bash
npm run backup:db:dry-run
```

Notas praticas:

- o script prefere `DIRECT_DATABASE_URL`
- o dump e salvo por padrao em `backups/db`
- o arquivo deve ser copiado para fora da VPS principal
- backup sem teste de restauracao nao deve ser tratado como confiavel

Guia interno complementar:

- `.github/instructions/BACKUP_RULES.md`

Uso de webhook no banco:

- o Supabase possui suporte a Database Webhooks
- mesmo assim, neste projeto a estrategia principal continua sendo disparar alertas pela API e orquestrar fluxos no `n8n`
- isso preserva melhor a regra de negocio fora do banco e facilita evolucao da plataforma

## Endpoints principais

### Health

- `GET /health`

Resposta:

```json
{
  "status": "ok",
  "timestamp": "2026-03-07T23:00:00.000Z",
  "uptimeSeconds": 1234,
  "environment": "production",
  "alertQueueDepth": 0
}
```

### Ingestão

- `POST /iot/temperature`
- Header obrigatório: `x-device-key`

Payload:

```json
{
  "device_id": "freezer_01",
  "temperature": -12.3
}
```

### Devices

- `POST /devices`
- `GET /devices?clientId=...&limit=...`
- `GET /devices/:id?clientId=...`
- `PATCH /devices/:id?clientId=...`
- `DELETE /devices/:id?clientId=...`
- `GET /devices/:id/readings?clientId=...&limit=...`

### Readings

- `GET /readings/:deviceId?clientId=...&sensor=temperature&limit=...&resolution=5m|15m|1h|1d`

### Clients

- `POST /clients`
- `GET /clients`
- `GET /clients/:id`
- `PATCH /clients/:id`
- `DELETE /clients/:id`

### Auth

- `POST /auth/login`
- `GET /auth/me`

Protecoes atuais do login:

- limite de tentativas por combinacao de e-mail + IP
- bloqueio temporario apos excesso de tentativas invalidas
- uso de `CF-Connecting-IP` quando a API estiver atras do Cloudflare
- suporte opcional a `Cloudflare Turnstile` quando `TURNSTILE_SECRET_KEY` estiver configurada

### Alert Rules

- `POST /alert-rules`
- `GET /alert-rules?clientId=...&deviceId=...&sensorType=temperature&enabled=true|false`
- `GET /alert-rules/:id`
- `PATCH /alert-rules/:id`
- `DELETE /alert-rules/:id`

### Actuators

- `POST /actuators`
- `GET /actuators?clientId=...&deviceId=...&state=on|off`
- `GET /actuators/:id?clientId=...`
- `PATCH /actuators/:id`
- `DELETE /actuators/:id`
- `POST /actuators/:id/commands`
- `GET /actuators/:id/commands?limit=...`

## Testes

Unitários:

```bash
npm test -- --runInBand
```

E2E:

```bash
npm run test:e2e -- --runInBand
```

Build:

```bash
npm run build
```

## Simulador IoT

Para testar a API e o dashboard sem hardware real:

```bash
npm run simulate:iot -- --device freezer_01 --api-key CHANGE_ME
```

Exemplos uteis:

```bash
# envia temperaturas aleatorias entre -18 e -12
npm run simulate:iot -- --device freezer_01 --api-key CHANGE_ME

# faz a temperatura subir e descer continuamente
npm run simulate:iot -- --device freezer_02 --api-key CHANGE_ME --mode ramp --min -25 --max -8

# a cada 10 envios gera um pico para testar alerta
npm run simulate:iot -- --device freezer_03 --api-key CHANGE_ME --mode spike --spike-value 12 --interval-ms 2000

# envia varios devices em paralelo para movimentar o dashboard
npm run simulate:iot -- --devices freezer_01,freezer_02,freezer_03 --api-key CHANGE_ME --mode ramp

# usa um preset pronto para simular temperatura entrando em alerta
npm run simulate:iot -- --devices freezer_01,freezer_02 --api-key CHANGE_ME --preset alerta

# cadastra/atualiza os devices antes de iniciar a simulacao
npm run simulate:iot -- --devices freezer_01,freezer_02 --preset normal --client-id virtuagil --ensure-devices --api-key CHANGE_ME
```

Opcoes principais:

- `--url`: URL base da API, padrao `http://localhost:3000`
- `--device`: identificador do device simulado
- `--devices`: lista separada por virgula para simular varios devices de uma vez
- `--preset`: `normal`, `alerta`, `critico` ou `geladeira`
- `--ensure-devices`: cadastra ou atualiza os devices automaticamente via API
- `--api-key`: valor do header `x-device-key`
- `--interval-ms`: intervalo entre leituras
- `--min` e `--max`: faixa de temperatura
- `--mode`: `random`, `ramp` ou `spike`
- `--count`: quantidade de envios antes de encerrar

Presets disponiveis:

- `normal`: freezer operando dentro da faixa esperada
- `alerta`: freezer oscilando perto do limite superior
- `critico`: freezer fora da faixa para testar alertas mais agressivos
- `geladeira`: faixa positiva para equipamentos refrigerados, nao congelados

## Seed de dados

Para popular a base com clientes, devices, regras e historico inicial:

```bash
npm run db:seed
```

O seed e idempotente:

- atualiza clientes e devices demo existentes
- recria configuracao esperada das regras
- cria usuarios demo para autenticacao
- cria atuadores demo do modulo `acionamento`
- cria historico inicial de comandos quando ainda nao existir
- so cria historico de temperatura se o device ainda nao tiver leituras

Usuarios demo criados pelo seed:

- `admin@virtuagil.com.br` / `virtuagil123`
- `operator@virtuagil.com.br` / `operador123`

## Verificacao do modulo acionamento

Para confirmar se a migration do `acionamento` foi aplicada no banco configurado:

```bash
npm run db:verify-actuation
```

Resultado esperado:

- migration `20260313013000_create_actuation_module` encontrada
- tabela `Actuator` encontrada
- tabela `ActuationCommand` encontrada

Checklist rapido no Supabase:

1. rode `npx prisma migrate deploy`
2. rode `npm run db:verify-actuation`
3. se a verificacao passar, suba a API com `npm run start:dev`
4. crie um atuador:

```bash
curl -X POST http://localhost:3000/actuators -H "Content-Type: application/json" -d "{\"id\":\"sauna_main\",\"clientId\":\"virtuagil\",\"name\":\"Sauna principal\"}"
```

5. envie um comando manual:

```bash
curl -X POST http://localhost:3000/actuators/sauna_main/commands -H "Content-Type: application/json" -d "{\"desiredState\":\"on\",\"source\":\"checklist\"}"
```

6. confirme o historico:

```bash
curl http://localhost:3000/actuators/sauna_main/commands
```

Se os passos 2, 5 e 6 responderem corretamente, o modulo `acionamento` esta funcional no banco atual.

## Docker

Build da imagem:

```bash
docker build -t iot-freezer-api:latest .
```

Execução:

```bash
docker run --rm -p 3000:3000 --env-file .env iot-freezer-api:latest
```

Healthcheck do container usa `GET /health`.

## CI

Pipeline GitHub Actions em `.github/workflows/ci.yml`:

- install (`npm ci`)
- prisma generate
- build
- testes unitários
- testes e2e

## Deploy (Swarm + Traefik + Cloudflare)

Arquivos adicionados:

- `deploy/swarm/stack.prod.yml`
- `deploy/swarm/.env.prod.example`
- `.github/workflows/deploy.yml`
- `apps/web/Dockerfile`

### 1. Preparar VPS (uma vez)

1. Garantir Docker Swarm ativo no manager.
2. Garantir rede externa do Traefik:

```bash
docker network create --driver overlay --attachable network_public
```

3. Criar pasta de deploy:

```bash
mkdir -p /opt/iot-freezer-api/deploy/swarm
```

4. Criar `/opt/iot-freezer-api/.env.prod` com base em `deploy/swarm/.env.prod.example`.

### 2. Segredos do GitHub Actions

Configurar em `Settings > Secrets and variables > Actions`:

- `VPS_HOST`
- `VPS_PORT`
- `VPS_USER`
- `VPS_SSH_KEY`
- `GHCR_USERNAME`
- `GHCR_TOKEN` (PAT com `read:packages`; se for publicar por outro usuário, incluir `write:packages`)
- `PORTAINER_WEBHOOK_URL` (opcional, quando o deploy for disparado pelo Portainer em vez de SSH)

### 3. DNS no Cloudflare

Criar registros proxied:

- `monitor.virtuagil.com.br` -> IP da VPS
- `api-monitor.virtuagil.com.br` -> IP da VPS

SSL/TLS recomendado:

- Cloudflare: `Full (strict)`
- Traefik com `certresolver=cloudflare` (já definido nas labels do stack)

Estado operacional validado em 13/03/2026:

- conta Cloudflare atual: plano `Free`
- `monitor.virtuagil.com.br`: `Proxied` e validado com sucesso
- `virtuagil.com.br`: tentativa de `Proxied` retornou erro `526 Invalid SSL certificate`
- causa do erro no dominio raiz: ainda nao existe origem HTTPS valida para `virtuagil.com.br`
- recomendacao atual para o dominio raiz: manter `DNS only` ate o site institucional existir no Traefik com certificado valido
- `api-monitor.virtuagil.com.br`: manter `DNS only` ate fazer uma rodada dedicada de testes
- `automacao.virtuagil.com.br`: manter `DNS only`
- `workflow.virtuagil.com.br`: manter `DNS only`
- `webhookworkflow.virtuagil.com.br`: manter `DNS only`

Configuracao recomendada no Cloudflare para o estado atual:

- `SSL/TLS`: `Full (strict)`
- `TLS 1.3`: ligado
- `Automatic HTTPS Rewrites`: ligado
- `Always Use HTTPS`: recomendado ligado
- proxy habilitado apenas nos hosts que ja possuem origem HTTPS valida

### 4. Deploy

Push na branch `main` (ou `workflow_dispatch`) dispara:

1. Build + push de imagens para GHCR:
   - `ghcr.io/fabioabdodev/iot-freezer-api/api:latest`
   - `ghcr.io/fabioabdodev/iot-freezer-api/web:latest`
2. Se `PORTAINER_WEBHOOK_URL` estiver vazio: cópia do `stack.prod.yml` para VPS e `docker stack deploy` no Swarm.
3. Se `PORTAINER_WEBHOOK_URL` estiver configurado: GitHub Actions chama o webhook do Portainer para atualizar a stack.

Observação: o frontend usa `NEXT_PUBLIC_API_BASE_URL` no build da imagem web. O workflow já publica a imagem com `https://api-monitor.virtuagil.com.br` embutido no bundle.

## Variáveis de ambiente (resumo)

- `PORT`
- `DATABASE_URL`
- `DIRECT_DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_TOKEN_TTL_HOURS`
- `AUTH_LOGIN_RATE_LIMIT_WINDOW_SECONDS`
- `AUTH_LOGIN_RATE_LIMIT_MAX_ATTEMPTS`
- `AUTH_LOGIN_RATE_LIMIT_MAX_TRACKED_KEYS`
- `AUTH_LOGIN_LOCK_MINUTES`
- `TURNSTILE_SECRET_KEY`
- `TURNSTILE_VERIFY_URL`
- `DEVICE_API_KEY`
- `DEVICE_OFFLINE_MINUTES`
- `MONITOR_INTERVAL_SECONDS`
- `TEMPERATURE_ALERT_COOLDOWN_MINUTES`
- `DEVICE_RATE_LIMIT_WINDOW_SECONDS`
- `DEVICE_RATE_LIMIT_MAX_REQUESTS`
- `DEVICE_RATE_LIMIT_MAX_TRACKED_DEVICES`
- `CACHE_TTL_SECONDS`
- `N8N_OFFLINE_WEBHOOK_URL`
- `N8N_TEMPERATURE_ALERT_WEBHOOK_URL`
- `ALERT_QUEUE_BATCH_SIZE`
- `ALERT_QUEUE_RETRY_MAX`
- `ALERT_QUEUE_RETRY_DELAY_MS`

## Observações de produção

- Backend e frontend devem rodar como serviços separados.
- Não versionar segredos (`.env` já está no `.gitignore`).
- Preferir deploy containerizado (Docker/Swarm).
- Se usar Cloudflare proxy, manter `SSL/TLS = Full (strict)`.
- Se ativar `Cloudflare Turnstile`, configure a chave publica no frontend e a chave secreta na API.
- Se um host retornar `526 Invalid SSL certificate`, isso indica que a origem ainda nao apresenta certificado valido para aquele dominio; nesse caso, volte o host para `DNS only` ate corrigir a origem.

## Protecao recomendada para login

Ordem sugerida para endurecer o acesso sem piorar muito a experiencia:

1. rate limit e bloqueio temporario no backend
2. logs de tentativa de login
3. `Cloudflare Turnstile` no frontend e validacao no backend

Quando for ativar o Turnstile:

1. crie o widget no Cloudflare
2. configure a chave secreta em `TURNSTILE_SECRET_KEY` na API
3. configure a chave publica no frontend como `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
4. envie o token do Turnstile em `POST /auth/login` no campo `turnstileToken`

## Checklist de pós-deploy

Depois de um deploy em produção, valide nesta ordem:

1. GitHub Actions:
   - workflow `deploy` com `build-and-push` e `deploy-swarm` em verde
2. Portainer:
   - stack `iot-monitor`
   - serviços `iot-monitor_api` e `iot-monitor_web` em `1/1`
3. Health checks:
   - `https://monitor.virtuagil.com.br/api/health`
   - `https://api-monitor.virtuagil.com.br/health`
4. Aplicação:
   - abrir o dashboard web
   - validar carregamento de dispositivos

## Rotação de segredos

Se alguma credencial for exposta, troque nesta ordem:

1. Senha do banco no provedor (`Supabase` ou equivalente)
2. `DEVICE_API_KEY`
3. `GHCR_TOKEN`
4. Atualize os valores em:
   - `Settings > Secrets and variables > Actions` no GitHub
   - `/opt/iot-freezer-api/.env.prod` na VPS
5. Rode o workflow `deploy` novamente

## Comandos úteis na VPS

```bash
docker service ls
docker service ps iot-monitor_web
docker service ps iot-monitor_api
docker service logs iot-monitor_web --tail 100
docker service logs iot-monitor_api --tail 100
cat /opt/iot-freezer-api/.env.prod
```

## Nota sobre Portainer CE

No `Portainer Community Edition`, `stack webhooks` não ficam disponíveis. Neste projeto, o fluxo recomendado é:

1. build e push da imagem no GitHub Actions
2. deploy da stack por `SSH`

O uso de `PORTAINER_WEBHOOK_URL` so faz sentido se a stack for gerenciada por uma edicao do Portainer que suporte webhook.
