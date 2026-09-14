# Fluxo comercial do site institucional

## Atendente IA

1. O visitante conhece o produto e o preco no site.
2. A oferta inicial e o Plano Fundador por R$ 249/mes, com ate 500 atendimentos/mes, implantacao gratuita e limite de 10 clientes.
3. O CTA principal leva para a Jade no WhatsApp.
4. A Jade apresenta o Atendente IA, responde duvidas e qualifica o interesse.
5. A Virtuagil cria/confirma o codigo do cliente e prepara a ativacao.
6. O cliente acessa `/pagamento`, informa codigo e e-mail e gera o checkout oficial do Mercado Pago.
7. O valor nao vem do navegador: o backend do site define o preco fixo do plano.
8. O pagamento confirmado pelo Mercado Pago e processado pelo n8n e ativa o plano do cliente.
9. Enquanto houver poucos clientes, a renovacao mensal pode ser acompanhada manualmente antes de implementar recorrencia automatica.

## Automacao de Processos

Automacoes sob medida continuam por avaliacao de escopo e proposta quando nao se encaixarem no produto padronizado Atendente IA.

## IoT

IoT permanece com preco sob consulta. O valor pode variar conforme hardware, quantidade de pontos, instalacao, conectividade e escopo da operacao.

## Separacao de sistemas

- `virtuagil.com.br`: site institucional e comercial.
- `monitor.virtuagil.com.br`: plataforma IoT. Nao alterar a partir deste projeto comercial.
- `api.virtuagil.com.br`: API da plataforma IoT. Nao alterar a partir deste projeto comercial.
