import { NextRequest, NextResponse } from 'next/server';
import {
  commercialPlans,
  defaultCommercialPlanCode,
  isCommercialPlanCode,
} from '@/lib/plans';

export const runtime = 'nodejs';

const DEFAULT_PAYMENT_WEBHOOK_URL =
  'https://webhookworkflow.virtuagil.com.br/webhook/mercadopago-criar-checkout-jade500';

type CheckoutRequest = {
  nome_empresa?: string;
  nome_contato?: string;
  telefone?: string;
  email_acesso?: string;
  website_url?: string;
  plano_codigo?: string;
};

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
  const internalKey = process.env.VIRTUAGIL_INTERNAL_KEY?.trim() ?? '';

  if (!internalKey) {
    console.error('[assistente-checkout] VIRTUAGIL_INTERNAL_KEY ausente');
    return NextResponse.json(
      {
        ok: false,
        message: 'O checkout está temporariamente indisponível.',
      },
      { status: 503 },
    );
  }

  let payload: CheckoutRequest;

  try {
    payload = (await request.json()) as CheckoutRequest;
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Dados da contratação inválidos.' },
      { status: 400 },
    );
  }

  if (String(payload.website_url ?? '').trim()) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const nomeEmpresa = String(payload.nome_empresa ?? '').trim();
  const nomeContato = String(payload.nome_contato ?? '').trim();
  const telefone = String(payload.telefone ?? '').replace(/\D/g, '');
  const emailAcesso = String(payload.email_acesso ?? '').trim().toLowerCase();
  const requestedPlanCode = String(
    payload.plano_codigo ?? defaultCommercialPlanCode,
  ).trim();

  if (!isCommercialPlanCode(requestedPlanCode)) {
    return NextResponse.json(
      { ok: false, message: 'Selecione um plano válido.' },
      { status: 400 },
    );
  }

  const requestedPlan = commercialPlans[requestedPlanCode];

  if (nomeEmpresa.length < 2 || nomeEmpresa.length > 120) {
    return NextResponse.json(
      { ok: false, message: 'Informe o nome da empresa.' },
      { status: 400 },
    );
  }

  if (nomeContato.length < 2 || nomeContato.length > 120) {
    return NextResponse.json(
      { ok: false, message: 'Informe o nome do responsável.' },
      { status: 400 },
    );
  }

  if (telefone.length < 10 || telefone.length > 15) {
    return NextResponse.json(
      { ok: false, message: 'Informe um WhatsApp válido com DDD.' },
      { status: 400 },
    );
  }

  if (!isValidEmail(emailAcesso)) {
    return NextResponse.json(
      { ok: false, message: 'Informe um e-mail válido para acesso ao painel.' },
      { status: 400 },
    );
  }

  const webhookUrl =
    process.env.N8N_ASSISTENTE_CHECKOUT_WEBHOOK_URL?.trim() ||
    DEFAULT_PAYMENT_WEBHOOK_URL;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-virtuagil-key': internalKey,
      },
      body: JSON.stringify({
        nome_empresa: nomeEmpresa,
        nome_contato: nomeContato,
        telefone,
        email_acesso: emailAcesso,
        plano_codigo: requestedPlan.code,
        origem: 'site_virtuagil',
      }),
      cache: 'no-store',
      signal: controller.signal,
    });

    const text = await response.text();
    let data:
      | {
          ok?: boolean;
          checkout_url?: string;
          preference_id?: string;
          plano_codigo?: string;
          valor_total?: number;
          message?: string;
          error?: string;
        }
      | null = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    const responsePlanCode = String(data?.plano_codigo ?? '');
    const responseTotal = Number(data?.valor_total);
    const planMatches =
      responsePlanCode === requestedPlan.code &&
      Number.isFinite(responseTotal) &&
      Math.abs(responseTotal - requestedPlan.total) < 0.001;

    if (
      !response.ok ||
      data?.ok !== true ||
      !data.checkout_url ||
      !isMercadoPagoCheckout(data.checkout_url) ||
      !planMatches
    ) {
      console.error('[assistente-checkout] Falha ao criar checkout', {
        status: response.status,
        error: data?.error,
        requestedPlan: requestedPlan.code,
        responsePlan: responsePlanCode,
        responseTotal,
      });

      return NextResponse.json(
        {
          ok: false,
          message:
            requestedPlan.includesAgenda && !planMatches
              ? 'O checkout do plano com Agenda está sendo atualizado. Fale com a equipe da Virtuagil para concluir a contratação.'
              : 'Não foi possível gerar o checkout agora. Tente novamente.',
        },
        { status: 502 },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        checkout_url: data.checkout_url,
        preference_id: data.preference_id,
        plano_codigo: responsePlanCode,
        valor_total: responseTotal,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (error) {
    console.error('[assistente-checkout] Erro de integração', {
      name: error instanceof Error ? error.name : 'unknown',
    });

    return NextResponse.json(
      {
        ok: false,
        message: 'Não foi possível conectar ao pagamento agora.',
      },
      { status: 502 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
