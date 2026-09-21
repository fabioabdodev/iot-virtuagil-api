import Link from 'next/link';
import {
  ArrowRight,
  CircleAlert,
  CircleCheckBig,
  Clock3,
  MailCheck,
  MessageCircleMore,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const whatsappUrl =
  process.env.NEXT_PUBLIC_WHATSAPP_URL ?? 'https://wa.me/553171029727';

type Status = 'success' | 'pending' | 'error';

const content = {
  success: {
    icon: CircleCheckBig,
    eyebrow: 'Pagamento confirmado',
    title: 'Seu pagamento foi confirmado.',
    text: 'A Virtuagil processa a ativação automaticamente. O e-mail informado na contratação receberá as instruções para criar a senha e acessar o Painel Administrativo.',
    accent: 'text-emerald-300',
  },
  pending: {
    icon: Clock3,
    eyebrow: 'Pagamento em processamento',
    title: 'Seu pagamento ainda está sendo confirmado.',
    text: 'Alguns meios de pagamento podem levar alguns instantes. Não é necessário gerar uma nova cobrança enquanto o Mercado Pago estiver processando esta transação.',
    accent: 'text-amber-300',
  },
  error: {
    icon: CircleAlert,
    eyebrow: 'Pagamento não concluído',
    title: 'O pagamento não foi finalizado.',
    text: 'Você pode voltar à contratação e gerar um novo checkout ou falar com a Virtuagil pelo WhatsApp se precisar de ajuda.',
    accent: 'text-red-300',
  },
} as const;

export function PaymentStatus({ status }: { status: Status }) {
  const item = content[status];
  const Icon = item.icon;

  return (
    <main className="py-16 md:py-20">
      <div className="mx-auto w-[min(760px,calc(100%-32px))]">
        <Card className="border-white/[0.08]">
          <CardContent className="py-10 text-center md:py-14">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.035]">
              <Icon className={`h-7 w-7 ${item.accent}`} />
            </div>

            <div className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              {item.eyebrow}
            </div>

            <h1 className="mx-auto mt-3 max-w-[16ch] font-display text-4xl font-semibold leading-tight text-white md:text-5xl">
              {item.title}
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-8 text-slate-400 md:text-base">
              {item.text}
            </p>

            {status === 'success' ? (
              <div className="mx-auto mt-6 flex max-w-xl items-start gap-3 rounded-2xl border border-emerald-300/12 bg-emerald-300/[0.05] p-4 text-left text-xs leading-6 text-slate-300">
                <MailCheck className="mt-1 h-4 w-4 flex-none text-emerald-300" />
                Confira também a caixa de spam. O convite de acesso é enviado para o e-mail do Painel Administrativo informado na contratação.
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {status === 'error' ? (
                <Button asChild>
                  <Link href="/contratar-assistente-ia">
                    Tentar novamente
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/">
                    Voltar ao site
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}

              <Button asChild variant="secondary">
                <a href={whatsappUrl} target="_blank" rel="noreferrer">
                  <MessageCircleMore className="h-4 w-4" />
                  Falar no WhatsApp
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
