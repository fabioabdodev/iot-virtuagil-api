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
- a VPS atual esperada pelo workflow usa o caminho `/opt/iot-virtuagil-api`
- o namespace de imagens atual e `ghcr.io/fabioabdodev/iot-virtuagil-api`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` entra no build do web via GitHub Secrets
- `TURNSTILE_SECRET_KEY` e `NEXT_PUBLIC_TURNSTILE_SITE_KEY` tambem devem existir em `/opt/iot-virtuagil-api/.env.prod`

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
