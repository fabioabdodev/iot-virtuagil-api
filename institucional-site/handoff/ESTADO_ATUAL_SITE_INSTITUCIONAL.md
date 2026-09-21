# Estado Atual do Site Institucional

## Referência — setembro de 2026

O site institucional está em:

- repositório: `fabioabdodev/iot-virtuagil-api`
- aplicação: `institucional-site/web`
- domínio: `virtuagil.com.br` / `www.virtuagil.com.br`
- stack própria: `virtuagil-site`

## Separação obrigatória

- `virtuagil.com.br`: site institucional, marketing, vendas e contratação pública.
- `atendente.virtuagil.com.br`: login, criação/recuperação de senha e Painel Administrativo do Assistente de IA.
- `monitor.virtuagil.com.br`: produto IoT.
- não mover a contratação pública para o subdomínio `atendente`.

## Produto comercial padronizado

Nome do produto:

- nome oficial: **Assistente de IA Virtuagil**
- forma curta: **Assistente de IA**

Nome Jade:

- Jade continua sendo a assistente comercial da própria Virtuagil e pode ser usada em CTAs como **Falar com a Jade**.
- não usar **Contratar Jade** como nome da oferta.

Oferta vigente:

- R$ 1.794
- 6 meses
- até 500 atendimentos/mês
- checkout Mercado Pago
- até 6 parcelas, conforme checkout

## Compra direta

Rota pública:

- `/contratar-assistente-ia`

Fluxo:

1. cliente informa empresa, responsável, WhatsApp e e-mail de acesso ao Painel Administrativo;
2. backend do site chama n8n com `VIRTUAGIL_INTERNAL_KEY`;
3. n8n cria checkout Mercado Pago;
4. pagamento aprovado segue pelo mesmo fluxo de provisionamento já usado pela Jade;
5. Supabase envia convite;
6. cliente cria a própria senha;
7. cliente entra em `atendente.virtuagil.com.br`.

## Direção visual

A versão atual adota:

- fundo escuro premium;
- verde/emerald como acento principal;
- azul como acento secundário;
- tipografia Manrope + Sora;
- glass cards discretos;
- CTAs claros;
- aparência comercial, não de sistema administrativo.

## Deploy

- GitHub Actions
- GHCR
- Docker Swarm
- Traefik
- Cloudflare

O institucional é compilado na CI e a imagem de produção é publicada com tag imutável por commit.
