import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Bot, Cpu, CalendarDays, MessageCircleMore, RadioTower, Gauge, Power, Thermometer } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Soluções | Virtuagil',
  description:
    'Conheça as duas linhas de soluções da Virtuagil: Assistente de IA para atendimento e Automação IoT para monitoramento e controle.',
  alternates: { canonical: '/solucoes' },
  openGraph: {
    title: 'Soluções | Virtuagil',
    description:
      'Escolha entre Assistente de IA para atendimento e Automação IoT para monitoramento e controle de operações.',
    url: 'https://www.virtuagil.com.br/solucoes',
  },
};

const solutionLines = [
  {
    eyebrow: 'Atendimento inteligente',
    title: 'Assistente de IA',
    description:
      'Automatize o atendimento no WhatsApp, responda dúvidas, qualifique oportunidades, faça follow-up e transfira para uma pessoa quando necessário.',
    href: '/solucoes/atendente-ia',
    cta: 'Conhecer Assistente de IA',
    icon: Bot,
    features: [
      { icon: MessageCircleMore, text: 'Atendimento e qualificação no WhatsApp' },
      { icon: CalendarDays, text: 'Agenda como módulo adicional' },
      { icon: Bot, text: 'Follow-up, transferência humana e painel' },
    ],
    accent: 'emerald',
  },
  {
    eyebrow: 'Monitoramento e controle',
    title: 'Soluções de Automação IoT',
    description:
      'Conecte equipamentos e ambientes para monitorar dados, receber alertas e executar ações com mais previsibilidade operacional.',
    href: '/solucoes/iot',
    cta: 'Conhecer soluções IoT',
    icon: Cpu,
    features: [
      { icon: Thermometer, text: 'Temperatura e monitoramento ambiental' },
      { icon: Power, text: 'Acionamento e controle de equipamentos' },
      { icon: Gauge, text: 'Consumo, gases e expansão por sensores' },
    ],
    accent: 'sky',
  },
] as const;

export default function SolucoesPage() {
  return (
    <main className="pb-20">
      <section className="relative py-16 md:py-24">
        <div className="glow-orb left-[-120px] top-[20px] h-[320px] w-[320px] bg-emerald-400/10" />
        <div className="section-shell text-center">
          <div className="eyebrow mx-auto">Soluções Virtuagil</div>
          <h1 className="mx-auto mt-5 max-w-[18ch] font-display text-5xl font-semibold leading-[0.96] tracking-[-0.04em] text-white md:text-6xl">
            Duas linhas de solução. Escolha o que sua operação precisa.
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-300 md:text-lg">
            A Virtuagil atua em duas frentes distintas: atendimento inteligente com Assistente de IA
            e automação física com IoT. Entre na solução certa para conhecer seus recursos e módulos.
          </p>
        </div>
      </section>

      <section className="pb-14 md:pb-20">
        <div className="section-shell grid gap-6 lg:grid-cols-2">
          {solutionLines.map((solution) => {
            const Icon = solution.icon;
            const isAi = solution.accent === 'emerald';
            return (
              <article
                key={solution.title}
                className={
                  'group relative overflow-hidden rounded-[34px] border p-7 shadow-[0_34px_100px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 md:p-9 ' +
                  (isAi
                    ? 'border-emerald-300/20 bg-[linear-gradient(145deg,rgba(8,61,48,0.68),rgba(6,18,25,0.98)_62%)] hover:border-emerald-300/40'
                    : 'border-sky-300/20 bg-[linear-gradient(145deg,rgba(8,48,73,0.72),rgba(6,18,25,0.98)_62%)] hover:border-sky-300/40')
                }
              >
                <div className={"absolute right-[-70px] top-[-70px] h-64 w-64 rounded-full blur-3xl " + (isAi ? 'bg-emerald-300/10' : 'bg-sky-300/10')} />
                <div className="relative flex min-h-[470px] flex-col">
                  <div className={"grid h-14 w-14 place-items-center rounded-2xl border " + (isAi ? 'border-emerald-300/20 bg-emerald-300/[0.08]' : 'border-sky-300/20 bg-sky-300/[0.08]')}>
                    <Icon className={"h-7 w-7 " + (isAi ? 'text-emerald-300' : 'text-sky-300')} />
                  </div>
                  <div className={"mt-7 text-xs font-bold uppercase tracking-[0.18em] " + (isAi ? 'text-emerald-200/70' : 'text-sky-200/70')}>
                    {solution.eyebrow}
                  </div>
                  <h2 className="mt-3 max-w-[13ch] font-display text-4xl font-semibold tracking-[-0.035em] text-white md:text-5xl">
                    {solution.title}
                  </h2>
                  <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 md:text-base">
                    {solution.description}
                  </p>
                  <div className="mt-7 grid gap-3">
                    {solution.features.map(({ icon: FeatureIcon, text }) => (
                      <div key={text} className="flex items-center gap-3 text-sm text-slate-200">
                        <div className={"grid h-9 w-9 flex-none place-items-center rounded-xl " + (isAi ? 'bg-emerald-300/[0.07]' : 'bg-sky-300/[0.07]')}>
                          <FeatureIcon className={"h-4 w-4 " + (isAi ? 'text-emerald-300' : 'text-sky-300')} />
                        </div>
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto pt-9">
                    <Button asChild size="lg" variant={isAi ? 'primary' : 'secondary'} className="w-full sm:w-auto">
                      <Link href={solution.href}>
                        {solution.cta}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="py-6 md:py-10">
        <div className="section-shell">
          <div className="relative overflow-hidden rounded-[30px] border border-white/[0.08] bg-white/[0.025] p-7 md:p-9">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Ainda não sabe qual caminho?
                </div>
                <h2 className="mt-3 font-display text-3xl font-semibold text-white">
                  Conte o problema da sua operação. A gente identifica a linha adequada.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                  Atendimento e relacionamento ficam na linha de Assistente de IA. Monitoramento,
                  sensores e controle de equipamentos ficam na linha de Automação IoT.
                </p>
              </div>
              <Button asChild size="lg" variant="secondary">
                <Link href="/contato">
                  Falar com a Virtuagil
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
