import { NextRequest, NextResponse } from 'next/server';
import { CONTRACT_VERSION } from '@/lib/legal';
import { allowCheckoutAttempt } from '@/lib/checkout-rate-limit';
import {
  HOMOLOGACAO_PLANO,
  HOMOLOGACAO_VALOR,
  tokenHomologacaoValido,
} from '@/lib/homologacao-jade-60';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PAYMENT_WEBHOOK =
  'https://webhookworkflow.virtuagil.com.br/webhook/mercadopago-criar-checkout-jade500';

function checkoutUrlConfiavel(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    const u = new URL(value);
    return u.protocol === 'https:' && !u.username && !u.password &&
      (u.hostname === 'mercadopago.com.br' || u.hostname.endsWith('.mercadopago.com.br') ||
       u.hostname === 'mercadopago.com' || u.hostname.endsWith('.mercadopago.com'));
  } catch {
    return false;
  }
}

function resposta(erro: string, status: number) {
  return NextResponse.json({ ok: false, message: erro }, {
    status, headers: { 'Cache-Control': 'no-store' },
  });
}

/**
 * Homologação isolada: nunca altera valor do catálogo comercial e não aceita
 * preço, plano ou destinatário de pagamento enviados pelo navegador.
 * Sem token válido, este endpoint não consulta catálogo nem n8n.
 */
export async function POST(req: NextRequest) {
  if (Number(req.headers.get('content-length') || 0) > 8192) {
    return resposta('Solicitação inválida.', 413);
  }
  let data: Record<string, unknown>;
  try {
    const parsed: unknown = await req.json();
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return resposta('Solicitação inválida.', 400);
    }
    data = parsed as Record<string, unknown>;
  } catch {
    return resposta('Solicitação inválida.', 400);
  }

  if (!tokenHomologacaoValido(data.token)) {
    return resposta('Página de homologação indisponível.', 404);
  }
  if (String(data.website_url || '').trim()) {
    return resposta('Solicitação inválida.', 400);
  }
  const nomeEmpresa = String(data.nome_empresa ?? '').trim();
  const nomeContato = String(data.nome_contato ?? '').trim();
  const telefone = String(data.telefone ?? '').replace(/\D/g, '');
  const email = String(data.email_acesso ?? '').trim().toLowerCase();
  if (
    nomeEmpresa.length < 2 || nomeEmpresa.length > 120 ||
    nomeContato.length < 2 || nomeContato.length > 120 ||
    telefone.length < 10 || telefone.length > 15 ||
    email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return resposta('Confira empresa, responsável, e-mail e WhatsApp.', 400);
  }
  if (data.aceite_termos !== true || data.termos_versao !== CONTRACT_VERSION) {
    return resposta('Leia e aceite a versão vigente dos Termos de Contratação.', 400);
  }
  if (!allowCheckoutAttempt(email)) {
    return resposta('Muitas tentativas. Aguarde um minuto antes de tentar novamente.', 429);
  }

  const key = process.env.VIRTUAGIL_INTERNAL_KEY?.trim();
  if (!key) return resposta('Homologação temporariamente indisponível.', 503);
  const webhook = process.env.N8N_ASSISTENTE_CHECKOUT_WEBHOOK_URL?.trim() || PAYMENT_WEBHOOK;
  if (!webhook.startsWith('https://')) {
    return resposta('Integração indisponível.', 503);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const upstream = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-virtuagil-key': key },
      body: JSON.stringify({
        nome_empresa: nomeEmpresa,
        nome_contato: nomeContato,
        telefone,
        email_acesso: email,
        plano_codigo: HOMOLOGACAO_PLANO,
        aceite_termos: true,
        termos_versao: CONTRACT_VERSION,
        termos_aceite_em: new Date().toISOString(),
        termos_origem: 'checkout_site_homologacao_controlada',
        origem: 'site_virtuagil',
      }),
      redirect: 'error',
      cache: 'no-store',
      signal: controller.signal,
    });
    const json: unknown = await upstream.json().catch(() => null);
    const result = json && typeof json === 'object' ? json as Record<string, unknown> : null;
    if (!upstream.ok || result?.ok !== true ||
        result.plano_codigo !== HOMOLOGACAO_PLANO ||
        Number(result.valor_total) !== HOMOLOGACAO_VALOR ||
        !checkoutUrlConfiavel(result.checkout_url)) {
      console.error('[homologacao-jade] checkout rejeitado', { status: upstream.status });
      return resposta('Não foi possível validar o checkout de R$ 60. Nenhum pagamento foi iniciado.', 502);
    }
    return NextResponse.json({
      ok: true,
      valor_total: HOMOLOGACAO_VALOR,
      plano_codigo: HOMOLOGACAO_PLANO,
      checkout_url: result.checkout_url,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return resposta('Falha ao preparar o checkout. Nenhum pagamento foi iniciado.', 502);
  } finally {
    clearTimeout(timer);
  }
}
