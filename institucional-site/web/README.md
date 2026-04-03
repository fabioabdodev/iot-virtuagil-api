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
