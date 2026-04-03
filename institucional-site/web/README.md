# Web Institucional Virtuagil

Este app e o MVP do site institucional da Virtuagil.

## Regras desta pasta

- este app e separado do monitor
- nao reutiliza shell, rotas ou componentes do dashboard
- deve ser publicado em stack propria no `Portainer`
- deve ser exposto por `Traefik`
- deve usar `Cloudflare` na borda

## Comandos locais

```bash
npm install
npm run dev
```

## Build local

```bash
npm run build
npm run start
```

## Deploy esperado

- stack propria do institucional
- imagem publicada no `GHCR`
- stack do `Portainer` apontando para `institucional-site/web/portainer-stack.yml`
- dominio principal `www.virtuagil.com.br`
- proxy por `Traefik`
- DNS e borda por `Cloudflare`

## Regra de release em producao

- nao usar `latest` como referencia efetiva da stack
- publicar a imagem com tag imutavel `sha-xxxxxxx`
- preencher `SITE_IMAGE` com essa tag no deploy
- expor `APP_RELEASE` e `APP_BUILD_TIME` no container
- validar a release ativa em `https://www.virtuagil.com.br/api/health`

## Ambiente de producao do institucional

Na VPS, manter um arquivo proprio em:

```bash
/opt/virtuagil-site/.env.prod
```

Campos minimos:

```bash
NEXT_PUBLIC_WHATSAPP_URL=https://wa.me/553171029727
NEXT_PUBLIC_CONTACT_EMAIL=contato@virtuagil.com.br
```

O workflow de deploy do repositório:

- copia `institucional-site/web/portainer-stack.yml` para `/opt/virtuagil-site/`
- exige que `/opt/virtuagil-site/.env.prod` exista
- carrega esse arquivo antes do `docker stack deploy`
- injeta automaticamente `SITE_IMAGE`, `APP_RELEASE` e `APP_BUILD_TIME`
