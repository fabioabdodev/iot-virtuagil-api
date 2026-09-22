import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Bot, CalendarDays, Cpu, Workflow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { products } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Soluções de Automação',
  description:
    'Conheça as soluções da Virtuagil em Assistente de IA, Agenda integrada, automação de processos e IoT para atendimento, integrações, monitoramento e controle.',
  alternates: { canonical: '/solucoes' },
  openGraph: {
    title: 'Soluções de Automação | Virtuagil',
    description:
      'Assistente de IA com Agenda opcional, automação de processos e soluções IoT para empresas que querem reduzir trabalho manual e operar melhor.',
    url: 'https://www.virtuagil.com.br/solucoes',
  },
};

const pillars = [
  {
    icon: Bot,
    title: 'Automação com IA',
    text: 'Assistente de IA no WhatsApp para responder, qualificar, fazer follow-up e encaminhar oportunidades.',
  },
  {
    icon: CalendarDays,
    title: 'Agenda integrada',
    text: 'Módulo opcional para disponibilidade real, agendamento, reagendamento, cancelamento e confirmação.',
  },
  {
    icon: Workflow,
    title: 'Automação de Processos',
    text: 'Integrações e fluxos sob medida para reduzir tarefas manuais e conectar sua operação.',
  },
  {
    icon: Cpu,
    title: 'Automação IoT',
    text: 'Monitoramento e controle de equipamentos, ambientes e utilidades com dados em tempo real.',
  },
];

export default function SolucoesPage() {
  return (
    <main className="pb-20">
      <section className="relative py-14 md:py-20">
        <div className="glow-orb left-[-120px] top-[20px] h-[320px] w-[320px] bg-emerald-400/10" />
        <div className="section-shell">
          <div className="eyebrow">Soluções Virtuagil</div>
          <h1 className="mt-5 max-w-[14ch] font-display text-5xl font-semibold leading-[0.96] tracking-[-0.04em] text-white md:text-6xl">
            Automação para atender, agendar, integrar, monitorar e crescer.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 md:text-lg">
            Comece pelo problema real da operação. A Virtuagil combina inteligência artificial,
            integrações e IoT para reduzir trabalho manual e dar mais continuidade aos processos.
          </p>
        </div>
      </section>

      <section className="pb-10">
        <div className="section-shell grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map(({ icon: Icon, title, text }) => (
            <Card key={title} className="h-full">
              <CardContent className="h-full">
                <div className="grid h-11 w-11 place-items-center rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.07]">
                  <Icon className="h-5 w-5 text-emerald-300" />
                </div>
                <h2 className="mt-5 text-lg font-bold text-white">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">{text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="section-shell">
          <div className="mb-8 max-w-3xl">
            <div className="eyebrow">Portfólio</div>
            <h2 className="mt-5 font-display text-4xl font-semibold tracking-[-0.035em] text-white md:text-5xl">
              Soluções prontas para começar e módulos para expandir.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-400 md:text-base">
              O Assistente de IA possui contratação direta. Automação de processos e IoT são
              avaliados conforme escopo. A Agenda é um módulo opcional do Assistente para operações
              com horário marcado.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {products.map((product) => (
              <article
                key={product.slug}
                className="group relative min-h-[390px] overflow-hidden rounded-[32px] border border-white/[0.08] bg-[#0b1219] shadow-[0_30px_90px_rgba(0,0,0,0.24)] transition duration-300 hover:-translate-y-1 hover:border-emerald-300/20"
                style={{
                  backgroundImage: `url(${product.image}), linear-gradient(180deg,#15202c,#081017)`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,12,0.08),rgba(4,8,12,0.92))]" />
                <div className="relative flex min-h-[390px] flex-col justify-end p-7">
                  <div className="inline-flex w-fit rounded-full border border-white/15 bg-black/30 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/85 backdrop-blur-md">
                    {product.category}
                  </div>
                  <h3 className="mt-4 font-display text-3xl font-semibold text-white md:text-4xl">
                    {product.title}
                  </h3>
                  <p className="mt-3 max-w-[44ch] text-sm leading-7 text-white/75">{product.summary}</p>
                  <ul className="mt-5 grid gap-2 text-sm text-white/75">
                    {product.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2">
                        <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-emerald-300" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <Link
                      href={`/solucoes/${product.slug}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 transition group-hover:gap-3"
                    >
                      Conhecer solução
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="section-shell">
          <div className="relative overflow-hidden rounded-[30px] border border-emerald-300/15 bg-[linear-gradient(135deg,rgba(12,53,42,0.95),rgba(7,19,28,0.98))] p-7 md:p-9">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-100/60">
                  Não sabe por onde começar?
                </div>
                <h2 className="mt-3 font-display text-3xl font-semibold text-white">
                  Conte o processo que hoje mais toma tempo da sua equipe.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                  A conversa começa pelo problema. A tecnologia e o escopo vêm depois.
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
