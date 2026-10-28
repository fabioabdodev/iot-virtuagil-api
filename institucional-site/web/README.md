# Site comercial Virtuagil

Site **em produção** em https://virtuagil.com.br e https://www.virtuagil.com.br. Código Next.js em `institucional-site/web`, publicado separadamente das APIs IoT; Dashboard de clientes em https://atendente.virtuagil.com.br (outro repositório, privado).

**Documentos de leitura obrigatória para agente novo:** `../../AGENTS.md` e `../../docs/SITE-COMERCIAL-PRE-LANCAMENTO-2026-10-28.md`. Fonte de preços: banco Supabase `public.planos_virtuagil`, não este README. O produto permanece **NO-GO** para campanha até homologar compra, cobrança aprovada, provisionamento, convite e suporte ponta a ponta.

## Rotas

`/`, `/solucoes`, `/solucoes/atendente-ia` (URL legada), `/planos`, `/contato`, `/contratar-assistente-ia`, `/termos-de-contratacao`, `/politica-de-privacidade`, `/exclusao-de-dados`. `/pagamento` é compatibilidade de redirecionamento.

## Planos comerciais (fotografia em 28/10/2026)

| Código | Oferta | Total 6 meses | Máx. parcelas |
| --- | --- | ---: | ---: |
| `jade_500_semestral` | Jade 500 | R$ 1.794,00 | 6 x R$ 299 |
| `jade_500_agenda_semestral` | Jade 500 + Agenda | R$ 2.394,00 | 6 x R$ 399 |
| `jade_500_hospedagem_semestral` | Jade 500 + Hospedagem | R$ 2.394,00 | 6 x R$ 399 |

Todos configurados para até 500 contatos únicos por mês. A UI carrega preço/parcelamento live; a promessa `sem juros` só deve ser feita após verificar as configurações da conta recebedora no Mercado Pago e os custos assumidos. **Não** usar preço de documentação antiga (Agenda R$ 2.388).

## Checkout e segurança

O navegador envia código do plano, dados mínimos e aceite de termos versionados. Servidor valida JSON, plano e dados, consulta catálogo ativo e chama n8n para criar checkout na conta autorizada. Webhook financeiro e persistência de pagamento/provisionamento ocorrem fora deste frontend. Resposta de checkout não prova compra aprovada. Não revelar `VIRTUAGIL_INTERNAL_KEY`, tokens, chaves ou dados de lead em `NEXT_PUBLIC_*`/logs.

Variáveis públicas de contato (`NEXT_PUBLIC_WHATSAPP_URL`, `NEXT_PUBLIC_CONTACT_EMAIL`) são inseridas no build: **validar destino real com a equipe antes da campanha**; histórico de site usa `https://wa.me/553171029727`, ainda não homologado como número comercial correto. `NEXT_PUBLIC_MONITOR_URL` é do produto IoT, não do painel Jade. O endpoint real de checkout deve vir de variável privada `N8N_ASSISTENTE_CHECKOUT_WEBHOOK_URL`.

A limitação de requisições atual do checkout é por processo; para campanha, acrescentar rate limiting na borda/API distribuída conforme o volume, preservando preços e termos. Confirmação/duplicação/expiração financeira ainda requerem teste E2E.

## Desenvolvimento e release

```bash
cd institucional-site/web
npm ci
node --test tests/*.test.cjs
npm run lint
npm run build
```

`.github/workflows/site-only-codex.yml` (caminho legado) publica **só** `virtuagil-site_virtuagil-site` na VPS `srv2080409` após commit na `main`. Não cancelar deploy em andamento nem usar `.github/workflows/deploy.yml` (IoT/Prisma) para modificar o site. Verificar HTTPS raiz+www, imagem por SHA e rollback; nenhuma mensagem/cobrança real como smoke test.

Para a fotografia atual da produção, riscos e checklist, ver os dois documentos iniciais.
