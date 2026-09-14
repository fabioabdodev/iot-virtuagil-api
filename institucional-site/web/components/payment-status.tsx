import Link from 'next/link';
import { ArrowRight, CircleAlert, CircleCheckBig, Clock3, MessageCircleMore } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const whatsappUrl =
  process.env.NEXT_PUBLIC_WHATSAPP_URL ?? 'https://wa.me/553171029727';

type Status = 'success' | 'pending' | 'error';

const content = {
  success: {
    icon: CircleCheckBig,
    eyebrow: 'Pagamento confirmado',
    title: 'Recebemos a confirmacao do seu pagamento.',
    text: 'O Mercado Pago concluiu a transacao. A Virtuagil processa a confirmacao automaticamente e segue com a ativacao combinada na proposta.',
    accent: 'text-[#4c9a78]',
  },
  pending: {
    icon: Clock3,
    eyebrow: 'Pagamento em processamento',
    title: 'Seu pagamento ainda esta sendo confirmado.',
    text: 'Alguns meios de pagamento podem levar alguns instantes para serem confirmados. Nao e necessario criar uma nova cobranca enquanto o Mercado Pago estiver processando esta transacao.',
    accent: 'text-[#d68642]',
  },
  error: {
    icon: CircleAlert,
    eyebrow: 'Pagamento nao concluido',
    title: 'O pagamento nao foi finalizado.',
    text: 'Voce pode tentar novamente ou falar com a Jade para confirmar os dados da proposta e receber ajuda com o pagamento.',
    accent: 'text-red-300',
  },
} as const;

export function PaymentStatus({ status }: { status: Status }) {
  const item = content[status];
  const Icon = item.icon;

  return (
    <main className="pb-20 pt-14 md:pt-20">
      <div className="mx-auto w-[min(760px,calc(100%-32px))]">
        <Card className="border-white/10 bg-[linear-gradient(180deg,#171d26,#10151c)] shadow-[0_30px_100px_rgba(0,0,0,0.28)]">
          <CardContent className="py-10 text-center md:py-14">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/6">
              <Icon className={`h-7 w-7 ${item.accent}`} />
            </div>
            <div className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">
              {item.eyebrow}
            </div>
            <h1 className="mx-auto mt-3 max-w-[16ch] font-serif text-4xl leading-tight text-white md:text-5xl">
              {item.title}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-8 text-stone-300 md:text-base">
              {item.text}
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {status === 'error' ? (
                <Button asChild>
                  <Link href="/pagamento">
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
                  Falar com a Jade
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
