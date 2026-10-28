> **Estado em 28/10/2026:** valores conferidos no catálogo Supabase, mas `sem juros` depende de conferir condições reais do Mercado Pago; pagamentos e provisionamento ainda não possuem evidência E2E. Ver `../../docs/SITE-COMERCIAL-PRE-LANCAMENTO-2026-10-28.md`. **Não promover campanha antes dos gates.**

# Site comercial Virtuagil

Aplicação institucional publicada em:

- `https://virtuagil.com.br`
- `https://www.virtuagil.com.br`

Projeto:

- `institucional-site/web`

## Papel do site

O site apresenta três frentes:

1. **Assistente de IA Virtuagil**
   - produto padronizado em três planos: 500, 500 + Agenda e 500 + Hospedagem
   - contratação direta pelo site
   - Jade como persona/canal de atendimento e pré-venda

2. **Automação de Processos**
   - projetos sob medida
   - escopo e proposta comercial

3. **IoT**
   - monitoramento e controle
   - escopo e proposta conforme hardware/operação

## Compra direta do Assistente de IA

Rota:

- `/contratar-assistente-ia`

Oferta:

- **Plano 500** — R$ 1.794 por 6 meses, até 6x de R$ 299 sem juros
- **Plano 500 + Agenda** — R$ 2.394 por 6 meses, até 6x de R$ 399 sem juros
- **Plano 500 + Hospedagem** — R$ 2.394 por 6 meses, até 6x de R$ 399 sem juros
- os três planos com até **500 contatos únicos/mês**
- Mercado Pago

Após pagamento aprovado e validado, **o fluxo deverá** provisionar o usuário, conferir a conta recebedora e liberar o primeiro acesso de modo idempotente. **Essa cadeia completa ainda requer homologação ponta a ponta antes da campanha**. O Painel Administrativo é:

- `https://atendente.virtuagil.com.br`

Esse subdomínio não é o site comercial; é a aplicação autenticada do cliente.

## Direção visual

O institucional deve continuar:

- moderno
- premium sem excesso de efeitos
- comercial
- responsivo
- sem aparência de sistema administrativo
- com CTA claro para contratação e para conversa com a Jade
