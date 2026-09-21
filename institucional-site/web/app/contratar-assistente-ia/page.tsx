import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  Clock3,
  LayoutDashboard,
  MailCheck,
  MessageCircleMore,
  ShieldCheck,
} from 'lucide-react';
import { PaymentForm } from '@/components/payment-form';
import { Button } from '@/components/ui/button';

const whatsappUrl =
  process.env.NEXT_PUBLIC_WHATSAPP_URL ?? 'https://wa.me/553171029727';

export const metadata: Metadata = {
  title: 'Contratar Assistente de IA',
  description:
    'Contrate o Assistente de IA da Virtuagil para atendimento inteligente no WhatsApp. Plano semestral, até 500 atendimentos por mês e pagamento seguro via Mercado Pago.',
  alternates: { canonical: '/contratar-assistente-ia' },
  openGraph: {
    title: 'Contratar Assistente de IA | Virtuagil',
    description:
      'Plano semestral com atendimento no WhatsApp, qualificação, follow-up, transferência humana e Painel Administrativo.',
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

export default function ContratarAssistenteIaPage() {
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
        <div className="section-shell grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <div className="eyebrow">
              <Bot className="h-3.5 w-3.5" />
              Contratação direta
            </div>

            <h1 className="mt-5 max-w-[12ch] font-display text-5xl font-semibold leading-[0.96] tracking-[-0.045em] text-white md:text-6xl">
              Coloque o Assistente de IA para trabalhar na sua empresa.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300">
              Preencha os dados da empresa e confirme o e-mail que será usado no
              Painel Administrativo. Em seguida, você será direcionado ao checkout oficial do
              Mercado Pago.
            </p>

            <div className="mt-7 grid gap-3 text-sm text-slate-300">
              {[
                'Atendimento inteligente no WhatsApp',
                'Qualificação e follow-up automático',
                'Transferência para atendimento humano',
                'Painel Administrativo de contatos, uso e resultados',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-emerald-300" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-[24px] border border-white/[0.08] bg-white/[0.025] p-5">
              <div className="flex items-center gap-3">
                <Clock3 className="h-5 w-5 text-sky-300" />
                <div>
                  <div className="text-sm font-bold text-white">Plano semestral</div>
                  <div className="text-xs text-slate-500">Até 500 atendimentos por mês</div>
                </div>
              </div>
              <div className="mt-4 text-sm font-semibold text-emerald-200">Por apenas</div>
              <div className="mt-1 flex items-end gap-2 text-white">
                <span className="pb-1 text-base font-semibold">6x de</span>
                <span className="font-display text-4xl font-semibold tracking-[-0.04em]">R$ 299</span>
              </div>
              <p className="mt-2 text-xs leading-6 text-slate-500">
                Valor total do plano semestral: R$ 1.794,00. Pix ou cartão; parcelamento disponível no checkout.
              </p>
            </div>

            <div className="mt-5 rounded-[24px] border border-amber-300/15 bg-amber-300/[0.045] p-5 text-xs leading-6 text-slate-400">
              <strong className="text-slate-200">Estrutura simples:</strong> recomendamos uma linha exclusiva para o Assistente de IA. Você não precisa comprar um celular caro: pode usar um aparelho básico compatível ou, para economizar, colocar a nova linha em um celular dual SIM/eSIM que já utilize. Linha, chip/eSIM, plano da operadora e aparelho não estão incluídos. A Virtuagil orienta a configuração na implantação.
              <div className="mt-2"><Link href="/termos-assistente-ia" className="font-semibold text-emerald-300 underline">Ver condições completas da contratação</Link></div>
            </div>

            <div className="mt-5">
              <Button asChild variant="ghost">
                <a href={whatsappUrl} target="_blank" rel="noreferrer">
                  <MessageCircleMore className="h-4 w-4" />
                  Tenho uma dúvida antes de contratar
                </a>
              </Button>
            </div>
          </div>

          <div className="surface-strong rounded-[32px] p-5 md:p-7">
            <div className="mb-6">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Seus dados
              </div>
              <h2 className="mt-2 font-display text-3xl font-semibold text-white">
                Vamos preparar seu checkout.
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                Nenhum dado de cartão é informado aqui. O pagamento acontece
                diretamente no Mercado Pago.
              </p>
            </div>

            <PaymentForm />
          </div>
        </div>
      </section>

      <section className="pt-14 md:pt-20">
        <div className="section-shell">
          <div className="mb-7 max-w-3xl">
            <div className="eyebrow">Depois do pagamento</div>
            <h2 className="mt-5 font-display text-3xl font-semibold tracking-[-0.03em] text-white md:text-4xl">
              Da aprovação ao Painel Administrativo sem precisar criar senha para o cliente.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {afterPayment.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="surface-glass rounded-[26px] p-6"
              >
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
