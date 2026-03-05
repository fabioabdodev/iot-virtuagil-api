---
description: regras do projeto
applyTo: '**'
---
# PROJECT_RULES.md — Regras e conceitos do produto (MVP -> SaaS)

## Visão do produto
Construir um **monitoramento inteligente** para equipamentos usando sensores IoT.
O primeiro caso (MVP) é **temperatura de freezer** (vacinas, alimentos, laboratórios).

O produto deve ser vendável como serviço:
- alertas (WhatsApp)
- histórico
- status online/offline
- dashboard básico

## MVP (o que entra agora)
### Funcionalidades obrigatórias
1. Ingestão de temperatura via HTTP:
   - POST /iot/temperature
2. Persistência:
   - salvar logs de temperatura
   - manter estado do device (lastSeen)
3. Monitoramento:
   - detectar device OFFLINE por inatividade
   - alertar uma única vez por evento (sem spam)
4. Operação:
   - rodar local (dev) e em servidor (Swarm)
   - banco: Supabase (Postgres)

### Funcionalidades que NÃO entram no MVP (por enquanto)
- multi-tenant (vários clientes)
- billing / assinaturas
- dashboard avançado
- streaming de câmera
- regras complexas (automação de múltiplos sensores)
- app mobile

## Conceitos principais (domínio)
### Device
Representa o equipamento/instalação monitorada (ex.: freezer_01).
Campos essenciais:
- id (string)
- lastSeen (Date)
- isOffline (bool)
- offlineSince (Date?)
- lastAlertAt (Date?)

### Reading
Uma leitura de sensor (ex.: temperatura).
No MVP: TemperatureLog com:
- deviceId
- temperature
- createdAt

No futuro (SaaS): generalizar para múltiplos tipos:
- sensorType (temperature, humidity, voltage, current, door, motion, camera_event)
- value (number/string/json)
- unit (C, %, V, A)

### Alert
Evento de alerta (ex.: offline, temperatura fora do limite).
No MVP: log via console + webhook n8n opcional.
No futuro: tabela AlertEvent + histórico + ack.

## Regras de negócio (MVP)
### Ingest
- Ao receber leitura:
  - salvar TemperatureLog
  - atualizar Device:
    - lastSeen = agora
    - isOffline = false
    - offlineSince = null

### Offline detection
- Rodar a cada 1 minuto.
- minutesOffline: 5 minutos (produção) / pode ser ajustado para testes
- Se lastSeen < cutoff OU lastSeen null:
  - se isOffline = false:
    - marcar isOffline=true
    - offlineSince=agora
    - lastAlertAt=agora
    - disparar alerta (log + webhook)

### Não spammar
- Nunca alertar offline toda vez.
- Alertar uma única vez por transição ONLINE->OFFLINE.

## Segurança (MVP)
- O endpoint do device deve ter autenticação simples (próximo passo):
  - API Key por device (header: x-device-key)
- Nunca comitar `.env`.
- Logs não devem imprimir DATABASE_URL/tokens.

## Roadmap sugerido (ordem)
1) MVP sólido: ingest + offline + alerta n8n
2) Limites de temperatura por device (min/max) + alerta fora do limite
3) Dashboard simples (status + gráfico)
4) API Key por device (segurança)
5) Multi-tenant (SaaS real)
6) Múltiplos sensores (humidity, door, energy)
7) Relatórios e auditoria