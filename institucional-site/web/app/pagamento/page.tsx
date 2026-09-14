import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, BadgeCheck, CreditCard, MessageCircleMore } from 'lucide-react';
import { PaymentForm } from '@/components/payment-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const whatsappUrl =
  process.env.NEXT_PUBLIC_WHATSAPP_URL ?? 'https://wa.me/553171029727';

export const metadata: Metadata = {
  title: 'Pagamento Atendente IA',
  description: 'Pagamento seguro do Plano Fundador do Atendente IA da Virtuagil via Mercado Pago.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function PagamentoPage() {
  return (
    <main className="pb-20 pt-12 md:pt-18">
      <div className="mx-auto grid w-[min(1120px,calc(100%-32px))] gap-7 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-300">
            <CreditCard className="h-3.5 w-3.5 text-[#d68642]" />
            Pagamento seguro
          </div>

          <h1 className="mt-5 max-w-[11ch] font-serif text-5xl leading-[0.98] tracking-[-0.03em] text-white md:text-6xl">
            Ative seu Plano Fundador pelo Mercado Pago.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-stone-300">
            Esta pagina e para quem ja falou com a Virtuagil e recebeu seu codigo de cliente. O valor do Plano Fundador e fixo em R$ 249 por mes para as 10 primeiras vagas.
          </p>

          <div className="mt-8 grid gap-3 text-sm text-stone-300">
            <div className="flex items-start gap-3">
              <BadgeCheck className="mt-0.5 h-4 w-4 flex-none text-[#4c9a78]" />
              <span>Ate 500 atendimentos por mes.</span>
            </div>
            <div className="flex items-start gap-3">
              <BadgeCheck className="mt-0.5 h-4 w-4 flex-none text-[#4c9a78]" />
              <span>Implantacao gratuita durante a oferta de lancamento.</span>
            </div>
            <div className="flex items-start gap-3">
              <BadgeCheck className="mt-0.5 h-4 w-4 flex-none text-[#4c9a78]" />
              <span>O pagamento acontece diretamente no ambiente do Mercado Pago.</span>
            </div>
            <div className="flex items-start gap-3">
              <BadgeCheck className="mt-0.5 h-4 w-4 flex-none text-[#4c9a78]" />
              <span>A confirmacao e processada automaticamente pela Virtuagil.</span>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link href="/planos">
                <ArrowLeft className="h-4 w-4" />
                Voltar para planos
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <a href={whatsappUrl} target="_blank" rel="noreferrer">
                <MessageCircleMore className="h-4 w-4" />
                Ainda nao tenho codigo
              </a>
            </Button>
          </div>
        </div>

        <Card className="border-white/10 bg-[linear-gradient(180deg,#171d26,#10151c)] shadow-[0_30px_100px_rgba(0,0,0,0.28)]">
          <CardContent>
            <div className="mb-6">
              <div className="text-sm uppercase tracking-[0.22em] text-stone-400">Plano Fundador</div>
              <h2 className="mt-2 font-serif text-3xl text-white">Gerar checkout</h2>
              <p className="mt-3 text-sm leading-7 text-stone-400">
                Informe somente seu codigo de cliente e e-mail. O preco nao pode ser alterado no navegador.
              </p>
            </div>

            <PaymentForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
