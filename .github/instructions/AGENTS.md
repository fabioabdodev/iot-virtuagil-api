---
applyTo: '**'
description: regras globais para agentes de IA neste repositorio
---

# AGENTS.md - Regras para agentes neste repositorio

Este repositorio implementa a API e o dashboard do produto IoT da Virtuagil,
com foco inicial em monitoramento de temperatura e expansao para automacao.

Stack atual:

- NestJS no backend
- Prisma ORM
- PostgreSQL (Supabase)
- Next.js no frontend
- Docker Swarm + Traefik em producao
- GitHub Actions para CI/CD

Identidade tecnica atual:

- repositorio principal: `iot-virtuagil-api`
- API: `iot-virtuagil-api`
- web: `iot-virtuagil-web`
- imagens: `ghcr.io/fabioabdodev/iot-virtuagil-api/...`

## Escopo deste repositorio

O escopo principal deste repositorio e:

- backend NestJS
- dashboard Next.js
- deploy, observabilidade e documentacao operacional desse produto

Importante para continuidade:

- `institucional-site/` e um rascunho local de outro projeto, o futuro site institucional
- `iot-virtuagil-firmware/` e a base local de outro projeto, o futuro repositorio de firmware/hardware
- `estudos de caso/` na raiz do projeto e uma pasta local de apoio comercial e operacional
- essas pastas nao devem guiar mudancas do backend/dashboard, a menos que o pedido do usuario seja explicitamente sobre elas
- quando a tarefa envolver helper comercial por `WhatsApp`, bot de atendimento, FAQ institucional, onboarding conversacional ou agente de IA voltado a apresentar a Virtuagil e seus servicos, considerar tambem `institucional-site/` como fonte principal de estrategia futura
- esse tipo de helper pode nascer operacionalmente em fluxos `n8n + Evolution + OpenAI`, mas a frente comercial e institucional dele pode evoluir como parte do projeto separado do site institucional
- quando esse helper tocar runtime embarcado, polling de hardware, onboarding de device ou automacao fisica, considerar tambem `iot-virtuagil-firmware/` como contexto complementar
- quando a tarefa envolver proposta comercial, onboarding, implantacao, jornada real de uso ou revisao de UX por cliente, consultar primeiro `estudos de caso/`
- essa pasta e local, pode nao estar no Git e nao deve ser tratada como documentacao versionada do produto
- o objetivo pratico dessa pasta e simular a chegada a um cliente real, percorrer o sistema como se a implantacao estivesse acontecendo e usar isso para conhecer as telas e sugerir melhorias de UI/UX
- quando a tarefa for sobre um desses escopos, tratar as regras e documentos internos dessas pastas como fonte principal daquele contexto
- ao criar ou evoluir modulos novos no frontend, preferir linguagem orientada ao cliente e a operacao real
- evitar expor na UI termos internos como `tenant`, `clientId`, `device` ou nomes de arquitetura quando houver equivalente mais claro para negocio
- usar termos como `cliente`, `conta`, `equipamento`, `codigo interno` e `painel` quando isso nao esconder uma necessidade tecnica real

## Regra principal de colaboracao

Antes de editar arquivos, o agente deve:

1. Explicar o que pretende alterar
2. Dizer por que a mudanca e necessaria
3. Listar os arquivos que devem ser modificados

Depois disso, pode seguir com a implementacao sem exigir nova confirmacao quando
a direcao ja estiver clara no pedido do usuario.

## Como trabalhar no projeto

Preferir sempre:

- mudancas pequenas e coesas
- codigo legivel
- baixo risco de regressao
- compatibilidade com deploy em Docker Swarm

Evitar:

- refatoracoes grandes sem necessidade
- mover arquivos sem motivo claro
- espalhar regra de negocio em controllers

## Regra critica de shell (PowerShell)

Neste repositorio, os comandos locais rodam em PowerShell.

Regra obrigatoria para agentes:

- nunca usar `&&` para encadear comandos
- usar `;` entre comandos

Exemplo correto:

```powershell
git add .; git commit -m "mensagem"
```

## Regras de backend

- Controllers devem ser finos
- Regras de negocio devem ficar em services
- Acesso ao banco deve acontecer via Prisma em services/infra
- Nunca expor segredos em logs
- Sempre considerar `clientId` quando o fluxo for multi-tenant

## Regras de API atuais

Fluxo principal de ingestao:

- `POST /iot/temperature`
- header obrigatorio: `x-device-key`

Payload esperado:

```json
{
  "device_id": "freezer_01",
  "temperature": -12.3
}
```

Resposta esperada:

```json
{
  "ok": true
}
```

## Regras de monitoramento

- Device offline e detectado por inatividade
- Alerta deve ocorrer apenas na transicao `online -> offline`
- Quando o device volta a enviar dados, o estado offline deve ser limpo
- Alertas de temperatura devem respeitar tolerancia e cooldown configurados

## Integracoes externas

O backend nao envia WhatsApp diretamente.

Fluxo correto:

Backend -> webhook -> n8n -> Evolution API -> WhatsApp

## Documentacao obrigatoria

Se a mudanca alterar fluxo, deploy, simulacao ou arquitetura, atualizar tambem o
documento relevante em `.github/instructions/`.

Arquivos mais importantes:

- `ARCHITECTURE.md`
- `PROJECT_RULES.md`
- `CI_CD_RULES.md`
- `FRONTEND_RULES.md`
- `SIMULATED_DEVICE.md`
- `HANDOFF.md`

## Testes e validacao

Sempre indicar como validar a mudanca. Prioridade:

1. `npm run build`
2. `npm test -- --runInBand`
3. `npm run test:e2e -- --runInBand`
4. validacao manual quando envolver dashboard, ingestao ou deploy

## Higiene operacional de deploy

Em VPS com muitos deploys seguidos, o aumento de uso em disco tende a vir de
imagens Docker acumuladas, nao de commits Git.

Regras praticas:

- ao investigar crescimento rapido de disco, verificar primeiro `docker system df`
- imagens antigas de `api` e `web` com tags `sha-*` costumam ser a principal causa
- a limpeza inicial mais segura e `docker image prune -a`
- evitar `docker volume prune` sem revisar antes, porque volumes podem conter dados persistentes
