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

Observacao importante validada em 13/03/2026:

- os workflows atuais nao executam `npx prisma migrate deploy`
- `ci.yml` roda apenas `npx prisma generate --no-engine`, build e testes
- `deploy.yml` faz apenas build/push de imagens e `docker stack deploy` via SSH
- portanto, conflitos recentes de `pg_advisory_lock` do Prisma nao parecem nascer do workflow atual do GitHub Actions por si so
- se migrations forem automatizadas no futuro, criar um passo dedicado e unico para isso

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
3. workflow faz `docker stack deploy` por SSH usando tags imutaveis por release (`sha-xxxxxxx`)

Observacao:

- no Portainer Community Edition, webhook de stack nao e o fluxo padrao
- o caminho principal deste projeto e deploy por SSH
- a stack agora aceita `API_IMAGE` e `WEB_IMAGE`
- o workflow exporta essas variaveis com a tag curta do commit antes do `docker stack deploy`
- isso reduz o risco de pipeline verde com Swarm ainda reaproveitando uma imagem antiga marcada como `latest`
- a stack salva no Portainer pode ficar desatualizada em relacao ao `stack.prod.yml`; quando houver divergencia entre Portainer, VPS e workflow, tratar a copia efetivamente usada no `docker stack deploy` como fonte principal
- variaveis obrigatorias da API, como `AUTH_SECRET`, precisam existir em `.env.prod` e tambem ser repassadas no bloco `environment` do servico `api`

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
