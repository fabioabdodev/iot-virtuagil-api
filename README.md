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
- Dashboard backend (`GET /devices` e histórico)
- Leitura normalizada e agregada por resolução (`/readings`)
- Gestão de clientes (`/clients`)
- Regras de alerta (`/alert-rules`)
- Monitoramento offline + alerta por temperatura
- Base multi-tenant (`clientId`)

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

3. Ajuste variáveis em `.env` (principalmente `DATABASE_URL` e webhooks).

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

6. Rode em desenvolvimento:

```bash
npm run start:dev
```

## Endpoints principais

### Health

- `GET /health`

Resposta:

```json
{
  "status": "ok",
  "timestamp": "2026-03-07T23:00:00.000Z"
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

### Alert Rules

- `POST /alert-rules`
- `GET /alert-rules?clientId=...&deviceId=...&sensorType=temperature&enabled=true|false`
- `GET /alert-rules/:id`
- `PATCH /alert-rules/:id`
- `DELETE /alert-rules/:id`

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
docker network create --driver overlay --attachable traefik-public
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

### 3. DNS no Cloudflare

Criar registros proxied:

- `monitor.virtuagil.com.br` -> IP da VPS
- `api-monitor.virtuagil.com.br` -> IP da VPS

SSL/TLS recomendado:

- Cloudflare: `Full (strict)`
- Traefik com `certresolver=cloudflare` (já definido nas labels do stack)

### 4. Deploy

Push na branch `main` (ou `workflow_dispatch`) dispara:

1. Build + push de imagens para GHCR:
   - `ghcr.io/fabioabdodev/iot-freezer-api/api:latest`
   - `ghcr.io/fabioabdodev/iot-freezer-api/web:latest`
2. Cópia do `stack.prod.yml` para VPS.
3. `docker stack deploy` no Swarm.

## Variáveis de ambiente (resumo)

- `PORT`
- `DATABASE_URL`
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
