# N8N References

Esta pasta existe para guardar referencias versionadas e sanitizadas dos workflows do n8n.

Objetivo:

- reduzir dependencia de `tmp/workflows-fix/fixed/` como unica fonte local
- permitir revisar estrutura de workflow no Git sem vazar credenciais
- registrar um caminho oficial para gerar copias seguras a partir dos exports reais

## Regras

- nunca commitar o export bruto do n8n com credenciais ou `pinData`
- usar `tmp/workflows-fix/fixed/` apenas como area local de trabalho
- usar esta pasta apenas para copias sanitizadas
- manter os nomes proximos do workflow real para facilitar rastreio

## Comando base

```bash
npm run n8n:sanitize -- --in "tmp/workflows-fix/fixed/Jade - Current Stable - FIXED.json" --out "references/n8n/Jade - Current Stable - SANITIZED.json"
```

## Manifesto opcional

Crie um arquivo JSON com esta estrutura:

```json
{
  "workflows": [
    {
      "input": "tmp/workflows-fix/fixed/Jade - Current Stable - FIXED.json",
      "output": "references/n8n/Jade - Current Stable - SANITIZED.json"
    }
  ]
}
```

Depois rode:

```bash
npm run n8n:sanitize -- --manifest references/n8n/manifest.local.json
```

## O que o sanitizador remove ou mascara

- `credentials`
- `pinData`
- `webhookUrl`
- segredos hardcoded em campos como `apikey`, `token`, `secret`, `password`
- `instanceId` de `meta`

## Observacao operacional

Os workflows reais da Jade e dos alertas ainda continuam em `tmp/workflows-fix/fixed/`.
Esta pasta nao substitui o n8n de producao nem o export bruto local.
Ela serve para criar uma trilha versionada e auditavel da arquitetura sem expor segredo.
