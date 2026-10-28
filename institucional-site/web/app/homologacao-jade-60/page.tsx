import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { tokenHomologacaoValido } from '@/lib/homologacao-jade-60';
import { CheckoutHomologacaoForm } from './checkout-form';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'Homologação privada | Virtuagil',
  description: 'Área reservada para a validação de um pagamento de homologação.',
  robots: { index: false, follow: false, nocache: true },
  referrer: 'no-referrer',
};

type Props = { searchParams: Promise<{ t?: string | string[] }> };

export default async function HomologacaoJade60({ searchParams }: Props) {
  const params = await searchParams;
  const token = Array.isArray(params.t) ? '' : params.t;
  if (!tokenHomologacaoValido(token)) notFound();

  return (
    <main className="section-shell py-14 md:py-20">
      <div className="mx-auto max-w-2xl rounded-[28px] border border-emerald-300/25 bg-slate-950 p-6 shadow-xl md:p-9">
        <div className="text-xs font-bold uppercase tracking-widest text-emerald-300">Uso exclusivo da homologação Virtuagil</div>
        <h1 className="mt-3 text-3xl font-bold text-white">Compra controlada da Jade 500</h1>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          Esta é uma operação de teste da contratação, integração Mercado Pago e ativação da Jade.
          Não é uma promoção pública nem altera o preço normal dos planos.
        </p>
        <div className="my-6 rounded-xl border border-emerald-300/20 bg-emerald-300/5 p-5">
          <div className="text-xs text-slate-300">Valor TOTAL do teste</div>
          <div className="mt-1 text-4xl font-bold text-emerald-300">R$ 60,00</div>
          <p className="mt-2 text-sm text-slate-300">
            Até 6x de R$ 10,00, se o Mercado Pago disponibilizar. A quantidade de parcelas
            e eventuais juros são confirmados na página de pagamento.
          </p>
        </div>
        <CheckoutHomologacaoForm token={token!} />
      </div>
    </main>
  );
}
