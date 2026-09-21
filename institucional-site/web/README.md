# Web Institucional Virtuagil

Aplicação institucional e comercial da Virtuagil.

## Domínio e separação

- site público: `https://virtuagil.com.br`
- site público: `https://www.virtuagil.com.br`
- dashboard do Assistente de IA: `https://atendente.virtuagil.com.br`
- plataforma IoT: `https://monitor.virtuagil.com.br`

O institucional fica em `institucional-site/web` e não deve compartilhar navegação autenticada ou aparência de dashboard.

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- Docker Swarm
- Traefik
- Cloudflare
- GHCR
- GitHub Actions

## Rotas comerciais principais

- `/`
- `/solucoes`
- `/solucoes/atendente-ia` — URL mantida por compatibilidade; produto público = Assistente de IA
- `/planos`
- `/contato`
- `/contratar-assistente-ia`

A rota legada `/pagamento` redireciona para a contratação atual.

## Assistente de IA

Oferta pública vigente:

- R$ 1.794
- 6 meses
- até 500 atendimentos por mês
- Mercado Pago
- até 6 parcelas conforme checkout

O site nunca envia o preço como fonte confiável para o n8n. O backend do site envia apenas os dados comerciais e autentica a chamada com `VIRTUAGIL_INTERNAL_KEY`.

## Ambiente de produção

Arquivo opcional recomendado:

```bash
/opt/virtuagil-site/.env.prod
```

Variáveis:

```bash
NEXT_PUBLIC_WHATSAPP_URL=https://wa.me/553171029727
NEXT_PUBLIC_CONTACT_EMAIL=contato@virtuagil.com.br
NEXT_PUBLIC_MONITOR_URL=https://monitor.virtuagil.com.br
NEXT_PUBLIC_ASSISTENTE_URL=https://atendente.virtuagil.com.br
VIRTUAGIL_INTERNAL_KEY=<segredo>
N8N_ASSISTENTE_CHECKOUT_WEBHOOK_URL=https://webhookworkflow.virtuagil.com.br/webhook/mercadopago-criar-checkout-jade500
```

Nunca versionar o valor de `VIRTUAGIL_INTERNAL_KEY`.

O deploy também pode reaproveitar a mesma chave já carregada em um serviço Virtuagil existente, sem imprimi-la em logs.

## Validação

```bash
npm ci
npm run build
```

A CI do repositório compila o institucional em pull requests antes do merge.
