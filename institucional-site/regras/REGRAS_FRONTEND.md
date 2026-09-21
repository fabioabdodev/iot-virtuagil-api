# FRONTEND_RULES.md

## Stack do institucional

- Next.js
- TypeScript
- App Router
- Tailwind CSS
- componentes reutilizáveis
- Framer Motion apenas para animações discretas
- Lucide React para ícones

## Separação

O site institucional:

- vive em `institucional-site/web`
- não reutiliza a shell do monitor
- não deve parecer sistema administrativo
- não mistura menus administrativos
- publica em stack própria

## Direção visual atual

O site deve parecer:

- moderno
- premium
- confiável
- comercial
- rápido de ler
- responsivo

Base visual:

- fundo navy/preto
- emerald/verde como acento principal
- azul como apoio
- tipografia Manrope + Sora
- cards com vidro discreto
- gradientes suaves
- sem excesso de efeitos

## Jornada principal

O CTA público prioritário é:

- **Contratar Assistente de IA**

Rota:

- `/contratar-assistente-ia`

CTA secundário:

- **Falar com a Jade**

O usuário não deve precisar conhecer `cliente_id`, códigos internos, nomes de workflow ou termos de infraestrutura.

Na comunicação com clientes, usar **Painel Administrativo** em vez de `dashboard`.

## Segurança do checkout

- preço nunca vem do navegador como fonte confiável
- segredo nunca usa prefixo `NEXT_PUBLIC_`
- chamadas ao n8n autenticadas acontecem apenas server-side
- validar dados antes de gerar o checkout
- validar que a URL retornada é do Mercado Pago
- não manipular dados de cartão no site

## Produtos

- Assistente de IA Virtuagil: oferta padronizada com compra direta; forma curta pública: Assistente de IA
- Automação de Processos: proposta sob medida
- IoT: proposta conforme escopo/hardware

## Validação obrigatória

Antes de merge:

- `npm ci`
- `npm run build`

A CI deve compilar `institucional-site/web`.
