# Pagamentos

A Virtuagil utilizara Mercado Pago para recebimentos do site institucional.

Nesta fase, o site trabalha com link oficial de pagamento, sem expor e-mail de conta ou credenciais no frontend.

Configure o link em:

`NEXT_PUBLIC_MERCADO_PAGO_PAYMENT_URL`

Enquanto a variavel estiver vazia, o site mostra o CTA de solicitacao de proposta em vez do botao de pagamento.

Uma integracao futura via API/webhook deve usar credenciais somente no backend e nunca em variaveis `NEXT_PUBLIC_*`.
