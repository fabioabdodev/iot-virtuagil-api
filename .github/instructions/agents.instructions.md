---
applyTo: '**'
description: conceito
---
# AGENTS.md — Regras do projeto IoT Freezer (SaaS)

## Objetivo
Construir um sistema de monitoramento inteligente (MVP) para sensores (começando por temperatura),
com backend NestJS + Prisma + Postgres (Supabase), pronto para crescer para um SaaS.

## Princípios
- Simplicidade primeiro (MVP), mas com arquitetura escalável.
- Separar responsabilidades: Controller (HTTP) -> Service (regras) -> Prisma (persistência).
- Evitar “lógica” em controller; controller só valida e encaminha.
- Código legível, nomes claros, sem “atalhos” mágicos.

## Estrutura de pastas
- src/modules/ingest: endpoints que recebem dados de dispositivos
- src/modules/devices: regras e estado do device (lastSeen, online/offline)
- src/modules/readings: persistência de leituras (temperatura hoje; outros sensores depois)
- src/modules/monitor: cron/monitoramento e disparo de alertas
- src/prisma: PrismaService e PrismaModule

## Padrões de API
- Rotas mantêm compatibilidade: POST /iot/temperature (entrada do device)
- DTOs com class-validator e class-transformer
- Respostas simples: { ok: true } no ingest
- Não expor detalhes sensíveis (DATABASE_URL etc)

## Banco / Prisma
- Sempre rodar migrations (npx prisma migrate dev) para mudanças de schema.
- Models principais:
  - Device: id, lastSeen, isOffline, offlineSince, lastAlertAt
  - TemperatureLog: deviceId, temperature, createdAt

## Monitoramento
- Cron roda a cada 1 minuto
- Não spammar alerta: alertar apenas na transição online -> offline
- Preparar integração por webhook (n8n) quando existir N8N_OFFLINE_WEBHOOK_URL

## Qualidade
- Se criar/editar código, também atualizar testes básicos ou ao menos manual test steps.
- Antes de finalizar: indicar comandos para rodar (start, migrate, generate).