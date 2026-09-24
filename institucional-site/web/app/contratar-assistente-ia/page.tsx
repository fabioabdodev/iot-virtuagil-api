import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  Bot,
  CreditCard,
  LayoutDashboard,
  MailCheck,
  ShieldCheck,
} from 'lucide-react';
import { PaymentForm } from '@/components/payment-form';
import {
  defaultCommercialPlanCode,
  isCommercialPlanCode,
} from '@/lib/plans';

export const metadata: Metadata = {
  title: 'Contratar Assistente de IA | Planos 500 e 500 + Agenda',
  description:
    'Contrate o Assistente de IA Virtuagil no Plano 500 ou Plano 500 + Agenda. Até 500 contatos únicos por mês, implantação assistida e pagamento seguro via Mercado Pago.',
  alternates: { canonical: '/contratar-assistente-ia' },
  openGraph: {
    title: 'Contratar Assistente de IA | Virtuagil',
    description:
      'Escolha entre o Plano 500 e o Plano 500 + Agenda para atendimento inteligente no WhatsApp.',
    url: 'https://www.virtuagil.com.br/contratar-assistente-ia',
  },
};

const afterPayment = [
  {
    icon: MailCheck,
    title: 'Pagamento aprovado',
    text: 'A confirmação do Mercado Pago é processada automaticamente.',
  },
  {
    icon: ShieldCheck,
    title: 'Acesso provisionado',
    text: 'A Virtuagil cria o vínculo da empresa e prepara o acesso ao Painel Administrativo.',
  },
  {
    icon: LayoutDashboard,
    title: 'Você cria sua senha',
    text: 'O convite chega por e-mail para você definir a senha e entrar no painel.',
  },
];

type ContratarPageProps = {
  searchParams: Promise<{ plano?: string | string[] }>;
};

export default async function ContratarAssistenteIaPage({
  searchParams,
}: ContratarPageProps) {
  const params = await searchParams;
  const rawPlan = Array.isArray(params.plano) ? params.plano[0] : params.plano;
  const initialPlan =
    rawPlan && isCommercialPlanCode(rawPlan)
      ? rawPlan
      : defaultCommercialPlanCode;

  return (
    <main className="relative overflow-hidden pb-16 md:pb-20">
      <div className="glow-orb left-[-130px] top-[60px] h-[360px] w-[360px] bg-emerald-400/14" />
      <div className="glow-orb right-[-170px] top-[280px] h-[380px] w-[380px] bg-sky-400/10" />

      <section className="py-12 md:py-16">
        <div className="section-shell">
          <Link
            href="/planos"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para planos
          </Link>
        </div>
      </section>

      <section>
        <div className="section-shell">
          <div className="surface-strong mx-auto max-w-4xl rounded-[32px] p-5 md:p-8">
            <div className="mb-7">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-sky-300/70">
                Escolha o plano e informe seus dados
              </div>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-[-0.03em] text-white md:text-4xl">
                Vamos preparar seu checkout.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                Selecione o Plano 500 ou o Plano 500 + Agenda. O pagamento é
                processado com segurança pelo Mercado Pago.
              </p>
            </div>

            <PaymentForm initialPlan={initialPlan} />
          </div>

          <div className="mx-auto mt-6 grid max-w-4xl gap-3 text-sm text-slate-400 sm:grid-cols-3">
            <div className="flex items-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              <ShieldCheck className="h-5 w-5 flex-none text-emerald-300" />
              <span>Compra em ambiente seguro</span>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              <CreditCard className="h-5 w-5 flex-none text-emerald-300" />
              <span>Pagamento via Mercado Pago</span>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              <Bot className="h-5 w-5 flex-none text-emerald-300" />
              <span>Implantação assistida</span>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-14 md:pt-20">
        <div className="section-shell">
          <div className="mb-7 max-w-3xl">
            <div className="eyebrow">Depois do pagamento</div>
            <h2 className="mt-5 font-display text-3xl font-semibold tracking-[-0.03em] text-white md:text-4xl">
              Da aprovação ao Painel Administrativo com uma implantação assistida.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {afterPayment.map(({ icon: Icon, title, text }) => (
              <div key={title} className="surface-glass rounded-[26px] p-6">
                <div className="grid h-11 w-11 place-items-center rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.07]">
                  <Icon className="h-5 w-5 text-emerald-300" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
