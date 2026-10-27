# Pagamentos — Assistente de IA Virtuagil

## Oferta atual

| Plano | Código | Valor total | Parcelamento | Limite |
| --- | --- | ---: | ---: | --- |
| Plano 500 | `jade_500_semestral` | R$ 1.794 | até 6x de R$ 299 sem juros | 500 contatos únicos/mês |
| Plano 500 + Agenda | `jade_500_agenda_semestral` | R$ 2.394 | até 6x de R$ 399 sem juros | 500 contatos únicos/mês |
| Plano 500 + Hospedagem | `jade_500_hospedagem_semestral` | R$ 2.394 | até 6x de R$ 399 sem juros | 500 contatos únicos/mês |

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

Isso impede que qualquer módulo especializado seja cobrado pelo preço do plano base caso o backend esteja desatualizado.

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

## Proteção de tentativas e limites da idempotência

`POST /api/pagamentos/criar-cobranca` valida objeto JSON, campos e aceite antes
de consultar o catálogo. Há proteção local com memória limitada, sem polling:
até 3 tentativas por e-mail normalizado por minuto e 30 tentativas globais por
processo por minuto. Os identificadores de e-mail ficam apenas como hash na
memória; não são registrados em log. A resposta 429 inclui `Retry-After: 60`.

Esse controle **não é distribuído**: reinícios e múltiplas réplicas exigem
limite compartilhado na borda ou infraestrutura existente. O endpoint não
confia em cabeçalhos arbitrários de IP enviados pelo cliente.

Idempotência financeira continua pendente de revisão do workflow n8n vigente:
deve haver uma referência única por intenção de compra, com snapshot de
oferta/preço/moeda/termos e deduplicação persistida, incluindo retry após
timeout remoto. Nenhuma chave ou parâmetro n8n não documentado foi inventado
nesta alteração. Não assumir que timeout significa que a preferência não foi
criada; não implementar retry cego de criação de checkout.

Regressão local, sem serviços externos:

```sh
node --test tests/checkout-resilience.test.cjs tests/price-source.test.cjs
```

## Legado

A rota `/pagamento` redireciona para `/contratar-assistente-ia`. O antigo Plano Fundador de R$ 249 não faz parte da oferta pública atual.
