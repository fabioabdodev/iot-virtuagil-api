---
description: regras praticas de backup e restauracao para a fase atual do projeto
applyTo: '**'
---

# BACKUP_RULES.md - Backup e restauracao

## Objetivo nesta fase

Como o negocio ainda esta no inicio, a estrategia deve ser:

- simples
- repetivel
- barata
- documentada
- testavel

## O que precisa de backup

### Prioridade maxima

- banco PostgreSQL do Supabase

### Prioridade alta

- `.env.prod` da VPS
- lista de dominios e subdominios
- webhooks importantes
- segredos operacionais fora do Git

### Prioridade media

- volumes persistentes de `n8n`
- configuracoes relevantes do Portainer / Swarm

### Prioridade complementar

- snapshot semanal da Hostinger

Importante:

- snapshot da VPS nao substitui backup proprio do banco
- backup dentro da mesma VPS nao conta como estrategia suficiente

## Regra pratica atual

Manter pelo menos duas copias:

1. copia local controlada por voce
2. copia fora da VPS principal

Exemplos:

- sua maquina local
- OneDrive
- Google Drive
- bucket S3 ou compativel

## Frequencia recomendada

### Banco

- diario

### Arquivos operacionais

- sempre que houver mudanca importante

### Snapshot da VPS

- manter o semanal da Hostinger como camada extra

## Comando atual do projeto

Para gerar um dump do banco usando `DIRECT_DATABASE_URL` ou `DATABASE_URL`:

```bash
npm run backup:db
```

Para testar sem executar:

```bash
npm run backup:db:dry-run
```

Observacoes:

- o script gera arquivo `.dump` em `backups/db`
- o formato e compativel com `pg_restore`
- preferir `DIRECT_DATABASE_URL` para backup

## Restore minimo esperado

Antes de confiar no backup, o time deve saber responder:

1. onde esta o ultimo dump valido
2. em qual banco ele sera restaurado para teste
3. quem executa o restore
4. como verificar se o restore funcionou

## Regra para agentes

Quando mudancas afetarem banco, deploy ou operacao:

- considerar se a documentacao de backup precisa ser atualizada
- nao assumir que backup da Hostinger cobre dados do Supabase
- evitar automacoes de backup destrutivas ou nao testadas
