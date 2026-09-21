import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Cpu,
  MessageCircleMore,
  ShieldCheck,
  Workflow,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const whatsappUrl =
  process.env.NEXT_PUBLIC_WHATSAPP_URL ?? 'https://wa.me/553171029727';

export const metadata: Metadata = {
  title: 'Planos e Contratação',
  description:
    'Contrate o Assistente de IA da Virtuagil no plano semestral ou fale com a equipe sobre automação de processos e projetos IoT.',
  alternates: { canonical: '/planos' },
  openGraph: {
    title: 'Planos e Contratação | Virtuagil',
    description:
      'Assistente de IA com contratação direta pelo site e soluções sob medida de automação e IoT.',
    url: 'https://www.virtuagil.com.br/planos',
  },
};

const assistantItems = [
  'Até 500 atendimentos por mês',
  'Atendimento no WhatsApp com IA',
  'Qualificação de oportunidades',
  'Follow-up automático',
  'Transferência para atendimento humano',
  'Painel Administrativo de contatos, uso e resultados',
  'Implantação inicial assistida',
];

export default function PlanosPage() {
  return (
    <main className="pb-16 md:pb-20">
      <section className="relative py-14 md:py-20">
        <div className="glow-orb right-[-120px] top-0 h-[320px] w-[320px] bg-emerald-400/10" />
        <div className="section-shell">
          <div className="eyebrow">Planos e contratação</div>
          <h1 className="mt-5 max-w-[14ch] font-display text-5xl font-semibold leading-[0.96] tracking-[-0.04em] text-white md:text-6xl">
            Comece com uma solução pronta ou monte a automação certa para sua operação.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 md:text-lg">
            O Assistente de IA possui contratação direta pelo site. Projetos de automação de
            processos e IoT são dimensionados conforme escopo, integrações, hardware e operação.
          </p>
        </div>
      </section>

      <section className="py-6 md:py-10">
        <div className="section-shell">
          <div className="relative overflow-hidden rounded-[34px] border border-emerald-300/18 bg-[linear-gradient(135deg,rgba(13,58,45,0.96),rgba(8,22,31,0.98)_58%,rgba(7,19,28,0.98))] p-7 shadow-[0_36px_120px_rgba(0,0,0,0.34)] md:p-10">
            <div className="absolute right-[-90px] top-[-110px] h-[320px] w-[320px] rounded-full bg-emerald-300/10 blur-3xl" />

            <div className="relative grid gap-9 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/15 bg-emerald-200/[0.06] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">
                  <Bot className="h-4 w-4" />
                  Assistente de IA
                </div>

                <h2 className="mt-5 max-w-[14ch] font-display text-4xl font-semibold leading-tight tracking-[-0.035em] text-white md:text-5xl">
                  Atendimento inteligente pronto para entrar na rotina da sua empresa.
                </h2>

                <p className="mt-5 max-w-2xl text-sm leading-8 text-slate-300 md:text-base">
                  Plano semestral para empresas que querem responder melhor, organizar oportunidades e
                  reduzir trabalho repetitivo no WhatsApp.
                </p>

                <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                  {assistantItems.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-200">
                      <CheckCircle2 className="mt-1 h-4 w-4 flex-none text-emerald-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-black/20 p-6 md:p-7">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Plano semestral
                </div>
                <div className="mt-3 font-display text-5xl font-semibold tracking-[-0.045em] text-white">
                  R$ 1.794
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Pagamento único via Pix ou cartão, com até 6 parcelas disponíveis no checkout.
                </p>

                <div className="mt-6 grid gap-3">
                  <Button asChild size="lg" className="w-full">
                    <Link href="/contratar-assistente-ia">
                      Contratar Assistente de IA
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="secondary" className="w-full">
                    <a href={whatsappUrl} target="_blank" rel="noreferrer">
                      <MessageCircleMore className="h-4 w-4" />
                      Tirar dúvidas com a Jade
                    </a>
                  </Button>
                </div>

                <div className="mt-5 flex items-start gap-3 border-t border-white/[0.08] pt-5 text-xs leading-6 text-slate-400">
                  <ShieldCheck className="mt-1 h-4 w-4 flex-none text-emerald-300" />
                  <span>
                    O pagamento é processado pelo Mercado Pago. A Virtuagil não recebe nem armazena
                    os dados do seu cartão.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-18">
        <div className="section-shell">
          <div className="mb-7 max-w-3xl">
            <div className="eyebrow">Projetos sob medida</div>
            <h2 className="mt-5 font-display text-4xl font-semibold tracking-[-0.035em] text-white md:text-5xl">
              Quando o problema é específico, a solução também pode ser.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-400 md:text-base">
              Integrações e IoT variam conforme sistemas, quantidade de pontos, hardware,
              instalação e criticidade da operação. Por isso, esses projetos seguem por diagnóstico
              e proposta.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {[
              {
                icon: Workflow,
                title: 'Automação de Processos',
                text: 'Integrações entre sistemas, APIs, notificações e rotinas para eliminar tarefas manuais e reduzir erros.',
                bullets: [
                  'Mapeamento do processo',
                  'Integrações e APIs',
                  'Fluxos e notificações automáticas',
                ],
                href: '/solucoes/automacao-processos',
              },
              {
                icon: Cpu,
                title: 'IoT e operação conectada',
                text: 'Monitoramento e controle de equipamentos, ambientes, consumo e utilidades conforme a necessidade da operação.',
                bullets: [
                  'Monitoramento remoto',
                  'Histórico e alertas',
                  'Módulos expansíveis por operação',
                ],
                href: '/solucoes',
              },
            ].map(({ icon: Icon, title, text, bullets, href }) => (
              <Card key={title} className="h-full">
                <CardContent className="flex h-full flex-col">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl border border-sky-300/15 bg-sky-300/[0.06]">
                    <Icon className="h-5 w-5 text-sky-300" />
                  </div>
                  <h3 className="mt-5 font-display text-3xl font-semibold text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{text}</p>
                  <ul className="mt-5 grid gap-2 text-sm text-slate-300">
                    {bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2">
                        <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-sky-300" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-7">
                    <Button asChild variant="secondary">
                      <Link href={href}>
                        Conhecer solução
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="section-shell">
          <Card className="border-emerald-300/12 bg-[linear-gradient(135deg,rgba(12,38,32,0.92),rgba(9,18,26,0.96))]">
            <CardContent className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Precisa conversar antes?
                </div>
                <h2 className="mt-3 font-display text-3xl font-semibold text-white">
                  A Jade pode explicar o Assistente de IA antes da contratação.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                  Para projetos personalizados, a equipe da Virtuagil assume a conversa e avalia o
                  escopo.
                </p>
              </div>
              <Button asChild size="lg" variant="secondary">
                <a href={whatsappUrl} target="_blank" rel="noreferrer">
                  Falar no WhatsApp
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
