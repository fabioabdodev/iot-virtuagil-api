---
description: Arquitetura técnica do projeto, incluindo componentes, estrutura de pastas e banco de dados.
applyTo: '**'
---
# ARCHITECTURE.md — Arquitetura técnica (NestJS + Prisma + Supabase)

## Visão geral
Sistema de monitoramento IoT via HTTP:

Device (ESP32) -> API (NestJS) -> DB (Supabase/Postgres)
                              -> Monitor (cron) -> Alertas (n8n/WhatsApp)

## Componentes
### 1) Ingest (API)
- Responsável por receber leituras do device (HTTP).
- Endpoint principal (compatibilidade):
  - POST /iot/temperature
- DTO valida input e converte tipos.

Fluxo:
1) Valida DTO
2) Grava leitura (TemperatureLog)
3) Atualiza estado do device (Device.lastSeen, online)

### 2) Persistência (Prisma)
- PrismaService fornece conexão com o Postgres.
- Prisma schema define modelos (Device, TemperatureLog).
- Mudanças de schema devem ser feitas via migrations.

### 3) Monitor (Scheduler/Cron)
- Executa periodicamente (1 min).
- Detecta dispositivos offline comparando lastSeen com cutoff.
- Evita spam usando isOffline (estado).

Fluxo:
1) Buscar devices que passaram do cutoff e isOffline=false
2) Marcar isOffline=true, offlineSince, lastAlertAt
3) Disparar alerta (log e opcional webhook n8n)

### 4) Alertas (n8n / Evolution)
- A API NÃO envia WhatsApp diretamente no MVP.
- A API chama um webhook do n8n (se configurado).
- n8n faz o resto (Evolution/WhatsApp).

Config:
- env: N8N_OFFLINE_WEBHOOK_URL (opcional)

## Estrutura de pastas (alvo)
- src/main.ts
- src/app.module.ts
- src/prisma/*
- src/modules/ingest/*
- src/modules/devices/*
- src/modules/readings/*
- src/modules/monitor/*

## Banco de dados (MVP)
### Device
- id: string (PK)
- lastSeen: DateTime?
- isOffline: boolean (default false)
- offlineSince: DateTime?
- lastAlertAt: DateTime?

### TemperatureLog
- id: uuid
- deviceId: string (FK lógica para Device.id)
- temperature: float
- createdAt: DateTime (default now)
- índice: (deviceId, createdAt)

## Segurança (próximo passo)
- Autenticação do device via API Key (header):
  - x-device-key
- Rate limit simples por IP/device
- Logs sem segredos

## Operação / Deploy (visão)
- Desenvolvimento local:
  - npm run start:dev
- Migrações:
  - npx prisma migrate dev
- Produção:
  - container (Docker)
  - Swarm + Traefik
  - DB: Supabase

## Testes manuais (mínimo)
1) Ingest:
   - POST /iot/temperature
   - body: { "device_id": "freezer_01", "temperature": -12.3 }
   - esperado: { ok: true }
2) Banco:
   - TemperatureLog: novo registro
   - Device: lastSeen atualizado e online
3) Offline:
   - parar de enviar por > minutesOffline
   - esperado: log WARN "Device ficou OFFLINE..." + campos atualizados no banco
   - device volta a enviar: isOffline=false, offlineSince=null