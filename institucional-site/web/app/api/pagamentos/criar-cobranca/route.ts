import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_PAYMENT_WEBHOOK_URL =
  'https://webhookworkflow.virtuagil.com.br/webhook/mercadopago-criar-cobranca';

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isMercadoPagoCheckout(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      (url.hostname === 'mercadopago.com.br' ||
        url.hostname.endsWith('.mercadopago.com.br') ||
        url.hostname === 'mercadopago.com' ||
        url.hostname.endsWith('.mercadopago.com'))
    );
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  let payload: Record<string, unknown>;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Dados de pagamento invalidos.' },
      { status: 400 },
    );
  }

  const clienteId = String(payload.cliente_id ?? '').trim();
  const descricao = String(payload.descricao ?? '').trim();
  const email = String(payload.email ?? '').trim().toLowerCase();
  const valor = Number(payload.valor);

  if (!/^[a-zA-Z0-9_-]{2,80}$/.test(clienteId)) {
    return NextResponse.json(
      { ok: false, message: 'Codigo do cliente invalido.' },
      { status: 400 },
    );
  }

  if (descricao.length < 3 || descricao.length > 180) {
    return NextResponse.json(
      { ok: false, message: 'Descricao da cobranca invalida.' },
      { status: 400 },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { ok: false, message: 'E-mail invalido.' },
      { status: 400 },
    );
  }

  if (!Number.isFinite(valor) || valor <= 0 || valor > 1_000_000) {
    return NextResponse.json(
      { ok: false, message: 'Valor da cobranca invalido.' },
      { status: 400 },
    );
  }

  const webhookUrl =
    process.env.N8N_PAYMENT_WEBHOOK_URL ?? DEFAULT_PAYMENT_WEBHOOK_URL;

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cliente_id: clienteId,
        descricao,
        valor,
        email,
      }),
      cache: 'no-store',
    });

    const data = (await response.json().catch(() => null)) as
      | {
          ok?: boolean;
          checkout_url?: string;
          preference_id?: string;
          message?: string;
        }
      | null;

    if (!response.ok || !data?.checkout_url) {
      console.error('[payments] Falha ao criar cobranca', {
        status: response.status,
        data,
      });

      return NextResponse.json(
        {
          ok: false,
          message: 'Nao foi possivel gerar o pagamento agora. Tente novamente.',
        },
        { status: 502 },
      );
    }

    if (!isMercadoPagoCheckout(data.checkout_url)) {
      console.error('[payments] Checkout retornado com host inesperado');
      return NextResponse.json(
        { ok: false, message: 'Checkout de pagamento invalido.' },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      checkout_url: data.checkout_url,
      preference_id: data.preference_id,
    });
  } catch (error) {
    console.error('[payments] Erro ao chamar webhook de pagamento', error);
    return NextResponse.json(
      {
        ok: false,
        message: 'Nao foi possivel conectar ao servico de pagamento agora.',
      },
      { status: 502 },
    );
  }
}
