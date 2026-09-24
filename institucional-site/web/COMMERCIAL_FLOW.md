# Fluxo comercial do site institucional

## Assistente de IA Virtuagil

Oferta comercial atual:

| Plano | Código interno | Semestre | Parcelamento | Limite |
| --- | --- | ---: | ---: | --- |
| Plano 500 | `jade_500_semestral` | R$ 1.794 | até 6x de R$ 299 sem juros | 500 contatos únicos/mês |
| Plano 500 + Agenda | `jade_500_agenda_semestral` | R$ 2.388 | até 6x de R$ 398 sem juros | 500 contatos únicos/mês |

A Agenda integrada faz parte do **Plano 500 + Agenda**. Integrações com Google Calendar, ERP, agendas externas ou sistemas proprietários continuam sujeitas a avaliação técnica.

### Entrada 1 — compra direta pelo site

1. O visitante conhece o Assistente em `virtuagil.com.br`.
2. Em `/planos`, escolhe Plano 500 ou Plano 500 + Agenda.
3. O CTA abre `/contratar-assistente-ia?plano=<codigo>`.
4. O cliente confirma o plano e informa empresa, responsável, WhatsApp e e-mail de acesso.
5. A rota server-side valida o código do plano e chama o webhook seguro do n8n com `VIRTUAGIL_INTERNAL_KEY`.
6. O n8n cria a preferência no Mercado Pago.
7. Antes de redirecionar, o site confirma que `plano_codigo` e `valor_total` retornados correspondem exatamente ao plano escolhido.
8. O cliente conclui o pagamento no ambiente do Mercado Pago.
9. O webhook de pagamento aprovado registra o pagamento, ativa/provisiona a empresa e prepara o Painel Administrativo.
10. O cliente recebe o convite por e-mail e segue para a implantação assistida.

### Entrada 2 — venda conduzida pela Jade

1. O interessado conversa com a assistente pelo WhatsApp.
2. A assistente consulta a base oficial, explica os dois planos e registra interesse quando houver intenção clara.
3. Após confirmação dos dados e do e-mail, solicita um checkout novo para o plano escolhido.
4. O fluxo de pagamento e provisionamento passa a ser o mesmo da contratação pelo site.

## Segurança comercial

- O navegador nunca define preço.
- O código do plano deve pertencer à lista permitida.
- O backend do site valida código e valor retornados pelo n8n.
- Checkout criado não significa pagamento aprovado.
- Plano ativo depende do fluxo de confirmação do pagamento.

## Separação de sistemas

- `virtuagil.com.br`: site institucional, comercial e contratação pública.
- `atendente.virtuagil.com.br`: autenticação, criação/recuperação de senha e Painel Administrativo.
- `monitor.virtuagil.com.br`: plataforma IoT.
- n8n: checkout, confirmação de pagamento, integrações e automações.

## Automação de Processos e IoT

Continuam sob avaliação de escopo e proposta. Não publicar preço fixo sem decisão comercial específica.
