# Site comercial — auditoria e publicação segura (28/10/2026)

**Escopo:** somente `institucional-site/web` no repositório público misto IoT/site. Regras de agente em `AGENTS.md` na raiz. Release do Dashboard pertence ao repositório privado `virtuagil-atendente`.

## Estado verificado

- Domínios: `https://virtuagil.com.br` e `https://www.virtuagil.com.br`; ambos retornaram HTTP200 na auditoria de produção. Serviço `virtuagil-site_virtuagil-site` no Swarm da VPS `srv2080409`, 1/1.
- O site foi implantado isoladamente em 28/10 por [GitHub Actions 40622679521](https://github.com/fabioabdodev/iot-virtuagil-api/actions/runs/40622679521). Arquivo de workflow histórico `.github/workflows/site-only-codex.yml`. **A branch de revisão Codex não deve publicar produção**; somente main, sem cancelar release em andamento.
- Código de checkout em `app/api/pagamentos/criar-cobranca/route.ts`, usa catálogo live em `lib/live-plans.ts`, valida códigos/forma/termos e chama n8n via chave interna no servidor. Não é prova de pagamento aprovado nem implantação de cliente.
- Catálogo no Supabase em 28/10:
  - `jade_500_semestral` — R$ 1.794,00 total / até 6x de R$ 299,00;
  - `jade_500_agenda_semestral` — R$ 2.394,00 total / até 6x de R$ 399,00;
  - `jade_500_hospedagem_semestral` — R$ 2.394,00 total / até 6x de R$ 399,00.
  Preço e parcelas devem ser consultados dinamicamente; não reutilizar valores estáticos do README antigo (que citava R$2.388 e omitia Hospedagem). Confirmar condições reais do Mercado Pago e taxa suportada antes de anunciar `sem juros`.
- No repositório público havia um dump com **zero bytes** em `backups/db/db.npjmadrtstatwfcqqmei.supabase.co_postgres_2026-03-13_13-37-03.dump`; arquivo vazio excluído. Não há conteúdo de banco naquele objeto Git; esta constatação **não** certifica ausência de segredos em todo histórico Git.
- `NEXT_PUBLIC_WHATSAPP_URL` estava hardcoded no workflow como `https://wa.me/553171029727` e contato e-mail `contato@virtuagil.com.br`. **Destinos ainda não confirmados pelo responsável**; não anunciar o WhatsApp nem marcar conversão válida sem conferir que chegam à Jade/atendimento correto. O número de TVTrade é outro produto e não deve ser usado como substituto.
- `NEXT_PUBLIC_MONITOR_URL` relaciona-se a IoT; não apontar clientes da Jade para painel IoT.
- O checkout possui rate limit por instância de processo, não garantia distribuída contra robôs; avaliar regra no edge Cloudflare e webhook.

## Matriz mínima para comercial (não executada ponta a ponta)

1. Navegação mobile/desktop no site; rota /planos; três planos exibidos; preço em BRL coincidente com Supabase atualizado. Tags SEO/robots/canonical e textos legais.
2. Link WhatsApp leva exatamente ao atendente definido e resposta chega ao agente certo, com tenant Jade; clicar botão nunca inicia conversa de Rafaela ou TVTrade.
3. E-mail de contato tem caixa existente e recebe formulário, sem revelar lead em logs.
4. Termos vigentes: checkbox obrigatório, versão e data, consentimento LGPD; política/contato/exclusão de dados acessíveis.
5. Checkout sandbox para cada plano com preço, seis parcelas/juros, recebedor, expiração e proteção a falsificação. Resultados pendente/aprovado/recusado/duplicado.
6. Falha n8n/MP: página explica indisponibilidade sem gerar cobrança duplicada nem `ok:true` falso para venda.
7. Pagamento aprovado gera acesso por pagamento persistido verificado no Dashboard e notificação uma única vez; nunca liberar apenas por return_url `/pagamento/sucesso`.
8. Roteiro de rollback do site sem afetar IoT, Dashboard e bancos; teste de restore de dados externos ao Git.

**Condição atual:** HTTP200 e CI verde ≠ campanha pronta. A auditoria do Atendente `docs/PRE-LANCAMENTO-AUDITORIA-2026-10-28.md` registra P0 em checkout, provisionamento, isolamento de tenants e backup.

## Passo a passo seguro de mudança

- Trabalhar em PR sem qualquer credencial; `cd institucional-site/web && npm ci && node --test tests/*.test.cjs && npm run lint && npm run build`.
- Conferir os dados no **catálogo vivo** e correspondência de moeda/parcelas. Não editar preços no front.
- Merge na main; workflow isolado constrói imagem por SHA e atualiza só `virtuagil-site_virtuagil-site`, mantendo infra IoT e Prisma intactos.
- Conferir release, réplica 1/1, /, www, preços, contato, checkout de teste inofensivo (sem pagamento), rollback só do site.
- Registrar evidência com data/versão. Não publicar automaticamente a partir de branch de revisão.

Para qualquer agente novo, o ponto de entrada técnico obrigatório é `AGENTS.md`; revisão do produto no repo privado, não em prompts soltos.
