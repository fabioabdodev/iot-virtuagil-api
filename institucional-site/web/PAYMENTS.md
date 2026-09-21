# Pagamentos — Assistente de IA

## Oferta atual

- produto: Assistente de IA
- ciclo: 6 meses
- valor total: R$ 1.794
- limite comercial: até 500 atendimentos por mês
- checkout: Mercado Pago
- parcelamento: até 6 parcelas, conforme exibido pelo Mercado Pago

## Compra pelo site

A página pública é:

- `/contratar-assistente-ia`

O formulário coleta:

- nome da empresa
- nome do responsável
- WhatsApp com DDD
- e-mail de acesso ao dashboard
- confirmação do e-mail

O navegador **não envia o preço** e não conhece a chave interna.

A rota server-side:

- `POST /api/pagamentos/criar-cobranca`

chama:

- `https://webhookworkflow.virtuagil.com.br/webhook/mercadopago-criar-checkout-jade500`

com o header privado:

- `x-virtuagil-key`

A chave vem de `VIRTUAGIL_INTERNAL_KEY` no runtime do container e nunca deve usar prefixo `NEXT_PUBLIC_`.

## Pós-pagamento

Após aprovação:

1. o Mercado Pago notifica o n8n;
2. o pagamento é consultado/validado;
3. o plano do cliente é ativado;
4. o dashboard é provisionado;
5. o Supabase envia o convite;
6. o cliente cria a própria senha;
7. o acesso acontece em `https://atendente.virtuagil.com.br`.

## Segurança

- dados de cartão não passam pelo site Virtuagil;
- o checkout é hospedado pelo Mercado Pago;
- preço e regras comerciais são definidos pelo backend/n8n;
- tokens e chaves ficam em variáveis de ambiente;
- o site valida se a URL retornada pertence ao domínio do Mercado Pago;
- o e-mail de acesso é confirmado antes da criação do checkout.

## Legado

A rota antiga `/pagamento` redireciona para `/contratar-assistente-ia`. O fluxo antigo de código de cliente e Plano Fundador de R$ 249 não faz mais parte da oferta pública.
