---
applyTo: '**'
description: conceito
---
# AGENTS.md — Regras para agentes neste repositório

Este repositório implementa um MVP de **monitoramento inteligente** para dispositivos IoT (começando por temperatura de freezer),
com backend em **NestJS + Prisma + Postgres (Supabase)**, preparado para evoluir para um **SaaS**.

## Como trabalhar (obrigatório)
- Sempre preferir mudanças pequenas e seguras.
- Controller deve ser fino (somente HTTP/DTO/validação).
- Regras de negócio ficam em Services.
- Persistência via Prisma em Services (evitar Prisma no Controller quando possível).
- Antes de finalizar, inclua passos de teste manual (curl/Insomnia) e comandos (migrate/start).

## Padrão de pastas (alvo)
- src/modules/ingest
  - Entrada de dados do device (ex.: POST /iot/temperature)
- src/modules/devices
  - Estado do device (lastSeen, online/offline, metadata)
- src/modules/readings
  - Gravação de leituras (temperatura hoje; outros sensores amanhã)
- src/modules/monitor
  - Cron de verificação e disparo de alertas
- src/prisma
  - PrismaService/PrismaModule

## Regras de API (MVP)
- Manter compatibilidade do endpoint: POST /iot/temperature
- Payload do device:
  - { "device_id": "freezer_01", "temperature": -12.3 }
- Resposta do ingest: { "ok": true }
- Validar DTO com class-validator e transformar tipos (string -> number) com class-transformer.
- Não expor segredos (DATABASE_URL, tokens, webhooks) em logs.

## Regras de monitoramento (MVP)
- Offline: device fica offline se lastSeen < (agora - X minutos) OU lastSeen = null.
- Evitar spam: alertar apenas na transição ONLINE -> OFFLINE (marcar isOffline).
- Quando o device voltar a enviar, marcar ONLINE (isOffline=false, offlineSince=null).

## Integrações (quando habilitadas)
- n8n: enviar webhook quando OFFLINE (apenas 1x por evento).
- Evolution/WhatsApp: responsabilidade do n8n.

## Prisma / Banco
- Alterou schema.prisma? -> rodar migration (preferível) e garantir generate.
- Comandos esperados:
  - npx prisma migrate dev
  - npx prisma generate
- Models principais no MVP:
  - Device (id, lastSeen, isOffline, offlineSince, lastAlertAt)
  - TemperatureLog (deviceId, temperature, createdAt)

## Qualidade
- Prefira código legível a código “esperto”.
- Sempre tratar erros de integração externa com try/catch e logs claros.
- Atualize docs (ARCHITECTURE.md / PROJECT_RULES.md) se mudar conceitos.