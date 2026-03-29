---
description: regras de versionamento, CI/CD e deploy com GitHub Actions
applyTo: '**'
---

# CI_CD_RULES.md - Regras de CI/CD e versionamento

## Versionamento

- O codigo fonte deve ficar no GitHub
- Nunca versionar `.env`
- Nunca versionar chaves privadas, tokens ou credenciais
- Mudancas grandes devem ser separadas em commits coesos quando fizer sentido

Arquivos sensiveis devem ser configurados via:

- GitHub Secrets
- `.env.prod` na VPS
- variaveis de ambiente do Docker Swarm

## Pipelines atuais

O projeto usa GitHub Actions com dois workflows:

- `ci.yml`
  - `npm ci`
  - `prisma generate`
  - `npm run build`
  - testes unitarios
  - testes e2e
- `deploy.yml`
  - build e push das imagens `api` e `web` para GHCR
  - deploy da stack no Swarm

Observacao importante atualizada em 15/03/2026:

- `ci.yml` roda `npx prisma generate --no-engine`, build e testes
- `deploy.yml` faz build/push de imagens e deploy via SSH no Swarm
- `deploy.yml` agora executa `docker run --rm --env-file .env.prod "${API_IMAGE}" npx prisma migrate deploy` antes do `docker stack deploy`
- se houver erro de migration em producao, investigar primeiro conectividade/lock real do banco e nao assumir que o workflow deixou de rodar esse passo

## Deploy atual

Ambiente de producao:

- VPS na Hostinger
- Docker Swarm
- Traefik
- GHCR como registry
- Portainer Community Edition

Fluxo padrao:

1. push para `main`
2. GitHub Actions publica as imagens
3. workflow copia `deploy/swarm/stack.prod.yml` para `/opt/iot-virtuagil-api`
4. workflow entra em `/opt/iot-virtuagil-api`, carrega `.env.prod`, roda `prisma migrate deploy` e faz `docker stack deploy`
5. a stack `iot-monitor` passa a usar tags imutaveis por release (`sha-xxxxxxx`)

Observacao:

- no Portainer Community Edition, webhook de stack nao e o fluxo padrao
- o caminho principal deste projeto e deploy por SSH
- a stack agora aceita `API_IMAGE` e `WEB_IMAGE`
- o workflow exporta essas variaveis com a tag curta do commit antes do `docker stack deploy`
- isso reduz o risco de pipeline verde com Swarm ainda reaproveitando uma imagem antiga marcada como `latest`
- a stack salva no Portainer pode ficar desatualizada em relacao ao `stack.prod.yml`; quando houver divergencia entre Portainer, VPS e workflow, tratar a copia efetivamente usada no `docker stack deploy` como fonte principal
- variaveis obrigatorias da API, como `AUTH_SECRET`, precisam existir em `.env.prod` e tambem ser repassadas no bloco `environment` do servico `api`
- regra operacional correta para env em producao:
  - o valor fica em `/opt/iot-virtuagil-api/.env.prod`
  - o `deploy/swarm/stack.prod.yml` precisa declarar a variavel no bloco `services.api.environment`
  - o Portainer/stack nao deve virar segunda fonte de valor com segredo hardcoded
  - se a variavel existir no `.env.prod`, mas nao estiver declarada no `stack.prod.yml`, ela nao chega ao container
- quando o update da stack for feito pelo editor do Portainer:
  - a secao `Environment variables` da stack precisa conter o valor real usado na interpolacao
  - deixar `${VARIAVEL}` no campo `value` dessa secao nao resolve a interpolacao
  - no Portainer CE, a stack pode subir com placeholders literais como `${APP_RELEASE}` ou `${DEVICE_API_KEY}` se o `value` nao estiver preenchido
- caso confirmado em `29/03/2026`:
  - `JADE_COMMERCIAL_GATEWAY_KEY` estava correta no `.env.prod`
  - mas nao aparecia em `docker service inspect iot-monitor_api`
  - causa: a chave nao estava declarada em `deploy/swarm/stack.prod.yml`
  - depois de declarar no YAML, a stack do Portainer ainda nao interpolava enquanto `Environment variables -> JADE_COMMERCIAL_GATEWAY_KEY` estava com `${JADE_COMMERCIAL_GATEWAY_KEY}` em vez do valor real `farm2809`
- a VPS atual esperada pelo workflow usa o caminho `/opt/iot-virtuagil-api`
- o namespace de imagens atual e `ghcr.io/fabioabdodev/iot-virtuagil-api`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` entra no build do web via GitHub Secrets
- `TURNSTILE_SECRET_KEY` e `NEXT_PUBLIC_TURNSTILE_SITE_KEY` tambem devem existir em `/opt/iot-virtuagil-api/.env.prod`
- para cada novo modulo com notificacao externa, incluir tambem no `/opt/iot-virtuagil-api/.env.prod`:
  - variavel de webhook de producao correspondente (ex.: `N8N_*_WEBHOOK_URL`)
  - flags de controle de ruido/cooldown quando aplicavel
- regra de deploy: modulo com alerta novo so entra em go-live apos confirmar:
  - workflow publicado no n8n
  - variavel de webhook presente no `.env.prod`
  - stack recebendo a variavel no servico `api`

## Regras de seguranca

Nunca colocar no repositorio:

- `DATABASE_URL`
- `DEVICE_API_KEY`
- `GHCR_TOKEN`
- tokens do Supabase
- webhooks sensiveis
- credenciais da VPS

Sempre usar:

- GitHub Secrets
- `.env.prod` fora do Git
- environment variables no Swarm

## Regras para agentes

Ao sugerir automacao, deploy ou pipeline:

- considerar GitHub Actions como padrao
- considerar Docker Swarm como ambiente de producao
- considerar `api` e `web` como servicos independentes
- nao sugerir segredos hardcoded
