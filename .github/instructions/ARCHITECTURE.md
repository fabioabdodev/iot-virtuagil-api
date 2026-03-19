---
description: arquitetura tecnica do projeto, componentes e fluxo do sistema
applyTo: '**'
---

# ARCHITECTURE.md - Arquitetura tecnica

## Atualizacao de referencia (2026-03-19)

A arquitetura de dominio agora considera:

- modulos-categoria (`ambiental`, `acionamento`, `energia`)
- itens por modulo (capabilities contrataveis por cliente)
- ingestao IoT generica por `POST /iot/readings`
- compatibilidade legada mantida em `POST /iot/temperature`
- historico de leitura preparado para sensor multi-tipo

## Stack principal

- NestJS
- Prisma ORM
- PostgreSQL (Supabase)
- Next.js
- Docker Swarm + Traefik
- n8n para automacao
- Evolution para mensageria
- Redis como infraestrutura de suporte
- GHCR para imagens

## Visao geral

Fluxo principal:

Device -> API -> Database -> Monitor -> Queue -> n8n -> Evolution -> WhatsApp

Tambem existe o fluxo operacional do dashboard:

Dashboard web -> API -> Database

## Componentes principais

### Device

ESP32 ou simulador HTTP que envia leituras periodicas.

Endpoint atual:

- `POST /iot/temperature`

### API

Responsavel por:

- validar ingestao
- persistir leituras
- atualizar estado do device
- expor endpoints para dashboard e administracao

Observacao operacional importante:

- em produção, o Prisma deve usar `DATABASE_URL` do Supabase via `session pooler`
- a conexão direta IPv6 do Supabase nao foi adequada para a API containerizada nessa VPS

### Dashboard web

Responsavel por:

- listar devices
- exibir historico
- editar cadastro
- configurar alertas
- orientar testes via `/lab`

### Monitor

Processo agendado que:

- detecta offline
- avalia regras de temperatura
- evita spam com cooldown e transicao de estado

### Fila de entrega de alertas

Responsavel por desacoplar a deteccao do envio do webhook.

Estado atual:

- a fila da API ainda e em memoria local
- existe previsao de migracao futura para Redis
- o ambiente ja possui Redis por causa do n8n
- o n8n usa Redis proprio na mesma VPS e ja foi ajustado para o host correto `redis_redis`

## Modulos do backend

- `src/modules/ingest`
  - recebe dados do device
- `src/modules/devices`
  - cadastro e estado operacional
- `src/modules/readings`
  - historico e agregacoes
- `src/modules/alert-rules`
  - configuracao de limites e tolerancias
- `src/modules/clients`
  - base multi-tenant
- `src/modules/monitor`
  - jobs periodicos e processamento de alertas

## Modelo atual de dominio

Entidades centrais:

- `Client`
- `Device`
- `TemperatureLog`
- `AlertRule`

O sistema ja opera com isolamento por `clientId`, embora a autenticacao de
usuarios ainda nao exista.

## Seguranca

- `x-device-key` obrigatorio para ingestao
- rate limit por device
- segredos fora do Git
- logs operacionais sem valores sensiveis

## Deploy

Producao:

- `api` e `web` em servicos separados
- imagens publicadas no GHCR
- deploy via GitHub Actions + SSH
- roteamento por Traefik

Dominios atuais:

- `monitor.virtuagil.com.br`
- `api-monitor.virtuagil.com.br`
- `workflow.virtuagil.com.br`
- `webhookworkflow.virtuagil.com.br`
- `evolution.virtuagil.com.br`

## Validacao manual minima

1. enviar leitura via simulador
2. confirmar leitura no dashboard
3. testar `/health`
4. simular offline
5. simular temperatura fora da faixa
6. confirmar chegada do webhook no n8n

Estado validado recentemente:

- leitura fora da faixa chegando ao workflow `Alerta de Temperatura`
- transicao `online -> offline` chegando ao workflow `Alerta de Offline`
