# Fluxo comercial do site institucional

## Assistente de IA

Oferta comercial atual:

- produto público: **Assistente de IA**
- plano: semestral
- valor: **R$ 1.794**
- até 500 atendimentos por mês
- pagamento via Mercado Pago
- até 6 parcelas, conforme opções exibidas no checkout

### Entrada 1 — compra direta pelo site

1. O visitante conhece o Assistente de IA em `virtuagil.com.br`.
2. O CTA **Contratar Assistente de IA** abre `/contratar-assistente-ia`.
3. O cliente informa empresa, responsável, WhatsApp e e-mail de acesso ao dashboard.
4. A rota server-side do site chama o webhook seguro do n8n usando `VIRTUAGIL_INTERNAL_KEY`.
5. O n8n cria uma nova preferência de checkout no Mercado Pago.
6. O cliente é redirecionado ao ambiente oficial do Mercado Pago.
7. O webhook de pagamento aprovado atualiza o plano e executa o provisionamento já validado.
8. O cliente recebe o convite por e-mail, cria a própria senha e acessa `atendente.virtuagil.com.br`.

### Entrada 2 — venda conduzida pela Jade

1. O interessado conversa com a Jade no WhatsApp.
2. A Jade explica a solução, qualifica o interesse e confirma os dados necessários.
3. Ao decidir concluir a contratação, a Jade solicita um novo checkout.
4. A partir do Mercado Pago, o fluxo de aprovação e provisionamento é o mesmo da compra pelo site.

## Separação de sistemas

- `virtuagil.com.br`: site institucional, comercial e contratação pública.
- `atendente.virtuagil.com.br`: autenticação, criação/recuperação de senha e dashboard do cliente.
- `monitor.virtuagil.com.br`: plataforma IoT.
- n8n: checkout, confirmação de pagamento, integrações e automações.

## Automação de Processos e IoT

Essas soluções continuam sob avaliação de escopo e proposta. Não publicar preço fixo sem uma decisão comercial específica.
