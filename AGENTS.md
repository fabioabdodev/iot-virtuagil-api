# AGENTS.md — fronteiras para agentes no repositório público IoT + site

**Atenção:** este repositório é **PÚBLICO** e mistura dois produtos que não devem sofrer deploy conjunto.

## Mapa de responsabilidades

- Raiz / `src`, Prisma, IoT web e serviços `iot-monitor_*`: monitoramento IoT. Consultar `.github/instructions/PRODUCT_RULES.md` e o README IoT. **Não tocar nesses sistemas em tarefas de vendas Virtuagil.**
- `institucional-site/web`: **site comercial oficial Virtuagil**, publicado em `https://virtuagil.com.br` e `https://www.virtuagil.com.br`, serviço Swarm `virtuagil-site_virtuagil-site` na VPS `srv2080409`. API IoT e Prisma não participam da venda da Jade.
- Dashboard administrativo e APIs de assinatura/tenant: repositório privado **`fabioabdodev/virtuagil-atendente`**, arquivo `AGENTS.md` e documentos `docs/PRE-LANCAMENTO-AUDITORIA-2026-10-28.md` e `docs/REGRAS-PRODUTO-E-AGENTES.md`.
- n8n e Mercado Pago: webhook privado, checagem do recebedor, assinatura e idempotência, nunca credenciais no site cliente. Site só gera solicitação de checkout validada pelo servidor.

## Regras obrigatórias

1. **Nunca publicar dumps de banco, arquivos `.env`, tokens, chaves de API, dados de lead ou webhooks contendo segredos.** O arquivo vazio de `backups/db` foi removido na auditoria; backup verdadeiro deve ser criptografado fora do Git.
2. Alterar o site exige CI `institucional-site/web` (testes, lint, build) e **apenas** workflow `.github/workflows/site-only-codex.yml` na `main` (nome histórico do arquivo). É proibido usar o deploy completo da API IoT que aplica migrations Prisma. A branch `review/codex-site-20261027` não pode disparar produção.
3. Catálogo de preço verdadeiro é `public.planos_virtuagil` no Supabase `rctberwplbfzhwqrzkht` — não valores de docs ou variáveis `NEXT_PUBLIC_*`. Em 28/10 o total é R$ 1.794 Jade 500 e R$ 2.394 Jade + Agenda/Hospedagem, até 6 parcelas; verificar novamente antes de campanha.
4. Proibir criação de checkout para plano não ativo, valor diferente, moeda/recebedor errado ou termos sem versão. Não enviar cobrança real de teste, não simular aprovação em produção.
5. Variáveis **públicas** como telefone WhatsApp e e-mail são embutidas no build e podem estar incorretas. Validar com o responsável comercial antes de promover a campanha. `NEXT_PUBLIC_WHATSAPP_URL` no workflow tem valor histórico que não foi verificado como destino da Jade; não afirmar que está homologado.
6. Não criar credenciais em `NEXT_PUBLIC_*`, não imprimir cookies/headers, não registrar telefone e e-mail de leads em logs; rate limit por processo é mitigação parcial, exigir limite no edge/CDN para carga pública.
7. Antes de alterar infra/deploy: conferir hostname exato, imagem anterior, Swarm 1/1, DNS raiz + www e rollback da **mesma** stack; concorrência de release sem cancelamento em andamento.
8. Toda alteração comercial deve atualizar `institucional-site/web/README.md`, `docs/SITE-COMERCIAL-PRE-LANCAMENTO-2026-10-28.md` e documentação canônica no Atendente. Não deixar duas tabelas de preço contraditórias.

## Critério de aceitação

Sem prova do ciclo sandbox compra→webhook→pagamento validado→provisionamento→convite→acesso e sem restore de backup verificado, o produto está **NO-GO** para campanha de cinco clientes, embora o site possa estar disponível em HTTP200.

Data de referência: 28/10/2026. A fotografia é histórica; verificar o ambiente real antes de futuras alterações.
