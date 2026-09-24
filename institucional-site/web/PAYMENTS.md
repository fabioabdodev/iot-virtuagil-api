# Pagamentos — Assistente de IA Virtuagil

## Oferta atual

| Plano | Código | Valor total | Parcelamento | Limite |
| --- | --- | ---: | ---: | --- |
| Plano 500 | `jade_500_semestral` | R$ 1.794 | até 6x de R$ 299 sem juros | 500 contatos únicos/mês |
| Plano 500 + Agenda | `jade_500_agenda_semestral` | R$ 2.388 | até 6x de R$ 398 sem juros | 500 contatos únicos/mês |

## Compra pelo site

Página pública:

- `/contratar-assistente-ia`
- o plano pode ser pré-selecionado por `?plano=<codigo>`

O formulário coleta nome da empresa, responsável, WhatsApp com DDD, e-mail de acesso, confirmação do e-mail e o código do plano escolhido.

O navegador não define preço. A rota server-side `POST /api/pagamentos/criar-cobranca` valida o código contra a lista permitida e chama o webhook seguro do n8n com `VIRTUAGIL_INTERNAL_KEY`.

Antes de redirecionar ao Mercado Pago, o site exige que o n8n retorne:

- `plano_codigo` exatamente igual ao plano solicitado;
- `valor_total` exatamente igual ao valor definido no servidor;
- `checkout_url` em domínio oficial do Mercado Pago.

Isso impede que o Plano 500 + Agenda seja cobrado pelo preço do plano base caso o backend esteja desatualizado.

## Pós-pagamento

Após aprovação:

1. o Mercado Pago notifica o n8n;
2. assinatura e pagamento são validados;
3. o pagamento é registrado;
4. o plano do cliente é ativado;
5. o Painel Administrativo é provisionado;
6. o usuário recebe convite por e-mail;
7. a implantação assistida é concluída.

## Segurança

- dados do cartão não passam pelo site Virtuagil;
- checkout hospedado pelo Mercado Pago;
- plano e preço validados no servidor;
- tokens e chaves em variáveis de ambiente;
- `VIRTUAGIL_INTERNAL_KEY` nunca usa prefixo `NEXT_PUBLIC_`;
- checkout criado não equivale a pagamento aprovado.

## Legado

A rota `/pagamento` redireciona para `/contratar-assistente-ia`. O antigo Plano Fundador de R$ 249 não faz parte da oferta pública atual.
