# Pagamentos

A Virtuagil utiliza Mercado Pago para o Atendente IA no site institucional.

## Oferta inicial

Plano Fundador:

- R$ 249 por mes
- ate 500 atendimentos por mes
- implantacao gratuita
- limitado aos 10 primeiros clientes

## Fluxo

1. O visitante conhece o plano em `/planos`.
2. O CTA principal leva para a Jade para qualificacao e criacao/confirmacao do codigo do cliente.
3. Quem ja possui codigo acessa `/pagamento`.
4. O formulario envia somente `cliente_id`, `email` e o identificador do plano.
5. A rota server-side `/api/pagamentos/criar-cobranca` define descricao e valor de forma fixa.
6. O backend chama o webhook n8n `mercadopago-criar-cobranca`.
7. O cliente e redirecionado ao checkout oficial do Mercado Pago.
8. O webhook de notificacao do Mercado Pago confirma o pagamento no n8n e atualiza o plano do cliente.

## Regra de seguranca

O navegador nunca define o valor final da cobranca. O preco fica em uma tabela de planos no backend do site. Isso evita que o visitante altere o valor antes de gerar o checkout.

Credenciais do Mercado Pago permanecem somente no backend/n8n. Nunca publicar token, e-mail pessoal ou credencial em variaveis `NEXT_PUBLIC_*`.

## Renovacao inicial

Nesta fase de validacao, a cobranca e criada como pagamento avulso pelo checkout. A renovacao mensal pode ser acompanhada manualmente enquanto a operacao tiver poucos clientes. Recorrencia automatica deve ser implementada apenas quando for necessario escalar esse processo.

## IoT

Projetos IoT nao usam preco fixo publico neste momento. Hardware, quantidade de pontos, instalacao e escopo variam por projeto e seguem por proposta comercial.
