import { createHash, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { CONTRACT_VERSION } from '@/lib/legal';
import { allowCheckoutAttempt } from '@/lib/checkout-rate-limit';

export const runtime = 'nodejs';

const TEST_PLAN = 'jade_500_homologacao_60';
const EXPECTED_TOTAL = 60;
const TEST_TOKEN_SHA256 = '1b5f9911e696196868fc806c83f5e0e5b7b39d28af2315c8dbedce76398284b5';
const END_AT = Date.parse('2026-10-30T03:00:00.000Z'); // 29/10, 23:59 BRT
const PAYMENT_WEBHOOK = 'https://webhookworkflow.virtuagil.com.br/webhook/mercadopago-criar-checkout-jade500';

function authorized(key: unknown): boolean {
  if (Date.now() >= END_AT || typeof key !== 'string' || key.length < 40 || key.length > 200) return false;
  const received = createHash('sha256').update(key).digest();
  const expected = Buffer.from(TEST_TOKEN_SHA256, 'hex');
  return timingSafeEqual(received, expected);
}
function mercadopagoUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' &&
      (url.hostname === 'mercadopago.com.br' || url.hostname.endsWith('.mercadopago.com.br') ||
       url.hostname === 'mercadopago.com' || url.hostname.endsWith('.mercadopago.com'));
  } catch { return false; }
}

/** Restricted, short-lived homologation checkout. Does NOT modify public plans. */
export async function POST(request: NextRequest) {
  const key = process.env.VIRTUAGIL_INTERNAL_KEY?.trim();
  if (!key) return NextResponse.json({ ok:false, message:'Checkout indisponível.' }, {status:503});
  let p: Record<string, unknown>;
  try {
    const value: unknown = await request.json();
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('BAD_INPUT');
    p = value as Record<string, unknown>;
  } catch {
    return NextResponse.json({ok:false,message:'Dados inválidos.'},{status:400});
  }
  if (!authorized(p.chave)) return NextResponse.json({ok:false,message:'Teste de homologação indisponível ou expirado.'},{status:403});
  const nomeEmpresa = String(p.nome_empresa || '').trim();
  const nomeContato = String(p.nome_contato || '').trim();
  const telefone = String(p.telefone || '').replace(/\D/g,'');
  const email = String(p.email_acesso || '').trim().toLowerCase();
  if (nomeEmpresa.length < 2 || nomeEmpresa.length > 120 ||
      nomeContato.length < 2 || nomeContato.length > 120 ||
      telefone.length < 10 || telefone.length > 15 ||
      email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      p.aceite_termos !== true || p.termos_versao !== CONTRACT_VERSION) {
    return NextResponse.json({ok:false,message:'Revise os dados e aceite os termos.'},{status:400});
  }
  if (!allowCheckoutAttempt(email)) {
    return NextResponse.json({ok:false,message:'Muitas tentativas. Tente novamente mais tarde.'},
      {status:429,headers:{'Retry-After':'60'}});
  }
  try {
    const response = await fetch(process.env.N8N_ASSISTENTE_CHECKOUT_WEBHOOK_URL?.trim() || PAYMENT_WEBHOOK, {
      method:'POST', redirect:'error', cache:'no-store', signal:AbortSignal.timeout(15000),
      headers:{'Content-Type':'application/json','x-virtuagil-key':key},
      body:JSON.stringify({
        nome_empresa:nomeEmpresa, nome_contato:nomeContato, telefone, email_acesso:email,
        plano_codigo:TEST_PLAN, aceite_termos:true, termos_versao:CONTRACT_VERSION,
        termos_aceite_em:new Date().toISOString(), termos_origem:'checkout_site_homologacao_restrita',
        origem:'site_virtuagil'
      })
    });
    const raw = await response.text();
    let value: {ok?:boolean;checkout_url?:string;plano_codigo?:string;valor_total?:unknown;preference_id?:string}|null = null;
    try { value = JSON.parse(raw); } catch { /* invalid response */ }
    if (!response.ok || value?.ok !== true || value.plano_codigo !== TEST_PLAN ||
        Number(value.valor_total) !== EXPECTED_TOTAL || !mercadopagoUrl(value.checkout_url)) {
      console.error('[homologacao-checkout] Rejeitado: HTTP '+response.status);
      return NextResponse.json({ok:false,message:'Não foi possível validar o checkout de R$ 60. Nenhum pagamento foi efetuado.'},{status:502});
    }
    return NextResponse.json({ok:true,checkout_url:value.checkout_url,valor_total:EXPECTED_TOTAL,
      plano_codigo:TEST_PLAN}, {headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
  } catch {
    return NextResponse.json({ok:false,message:'Integração temporariamente indisponível.'},{status:502});
  }
}
