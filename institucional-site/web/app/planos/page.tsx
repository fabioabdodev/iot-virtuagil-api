import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Bot,
  CalendarDays,
  CheckCircle2,
  Cpu,
  MessageCircleMore,
  ShieldCheck,
  Workflow,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { commercialPlans, formatBrl } from '@/lib/plans';
import { CardBrands } from '@/components/card-brands';

const whatsappUrl =
  process.env.NEXT_PUBLIC_WHATSAPP_URL ?? 'https://wa.me/553171029727';

export const metadata: Metadata = {
  title: 'Planos do Assistente de IA | Plano 500 e 500 + Agenda',
  description:
    'Compare os dois planos do Assistente de IA Virtuagil: Plano 500 por R$ 1.794/semestre e Plano 500 + Agenda por R$ 2.388/semestre. Até 500 contatos únicos por mês.',
  alternates: { canonical: '/planos' },
  openGraph: {
    title: 'Planos do Assistente de IA | Virtuagil',
    description:
      'Plano 500 e Plano 500 + Agenda para atendimento inteligente no WhatsApp, com implantação assistida.',
    url: 'https://www.virtuagil.com.br/planos',
  },
};

export default function PlanosPage() {
  const planList = Object.values(commercialPlans);

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Assistente de IA Virtuagil',
    description:
      'Assistente de IA para atendimento no WhatsApp com follow-up, transferência humana e opção de Agenda integrada.',
    brand: {
      '@type': 'Brand',
      name: 'Virtuagil',
    },
    offers: planList.map((plan) => ({
      '@type': 'Offer',
      name: plan.publicName,
      priceCurrency: 'BRL',
      price: plan.total.toFixed(2),
      availability: 'https://schema.org/InStock',
      url: `https://www.virtuagil.com.br/contratar-assistente-ia?plano=${plan.code}`,
    })),
  };

  return (
    <main className="pb-16 md:pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <section className="relative py-14 md:py-20">
        <div className="glow-orb right-[-120px] top-0 h-[320px] w-[320px] bg-emerald-400/10" />
        <div className="section-shell">
          <div className="eyebrow">Planos e contratação</div>
          <h1 className="mt-5 max-w-[16ch] font-display text-5xl font-semibold leading-[0.96] tracking-[-0.04em] text-white md:text-6xl">
            Escolha o Assistente de IA com ou sem Agenda integrada.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 md:text-lg">
            Os dois planos são semestrais, incluem até 500 contatos únicos por mês e
            implantação assistida. A diferença é a operação de agendamentos pelo WhatsApp.
          </p>
        </div>
      </section>

      <section className="py-6 md:py-10">
        <div className="section-shell">
          <div className="grid gap-5 lg:grid-cols-2">
            {planList.map((plan) => (
              <article
                key={plan.code}
                className={`relative overflow-hidden rounded-[32px] border p-6 shadow-[0_30px_90px_rgba(0,0,0,0.3)] md:p-8 ${
                  plan.includesAgenda
                    ? 'border-sky-300/25 bg-[linear-gradient(135deg,rgba(7,38,52,.96),rgba(5,20,27,.98))]'
                    : 'border-emerald-300/25 bg-[linear-gradient(135deg,rgba(13,58,45,.96),rgba(7,19,28,.98))]'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-white">
                      {plan.includesAgenda ? (
                        <CalendarDays className="h-4 w-4 text-sky-300" />
                      ) : (
                        <Bot className="h-4 w-4 text-emerald-300" />
                      )}
                      {plan.badge}
                    </div>
                    <h2 className="mt-5 font-display text-4xl font-semibold text-white">
                      {plan.name}
                    </h2>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
                      {plan.description}
                    </p>
                  </div>
                  {plan.includesAgenda ? (
                    <span className="rounded-full bg-sky-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[.12em] text-sky-200">
                      Com Agenda
                    </span>
                  ) : null}
                </div>

                <div className="mt-7 rounded-[24px] border border-white/10 bg-black/20 p-5">
                  <div className="text-xs font-bold uppercase tracking-[.16em] text-slate-500">
                    Plano semestral
                  </div>
                  <div className="mt-2 flex items-end gap-2 text-white">
                    <span className="pb-2 text-2xl font-bold">
                      {plan.installments}x de
                    </span>
                    <span className="font-display text-5xl font-semibold tracking-[-.05em] text-emerald-300">
                      {formatBrl(plan.installmentValue).replace(',00', '')}
                    </span>
                  </div>
                  <div className="mt-3 inline-flex rounded-lg border border-emerald-300/30 bg-emerald-300/[0.09] px-3 py-1.5 text-sm font-black uppercase tracking-[0.06em] text-emerald-200">
                    SEM JUROS NO CARTÃO
                  </div>
                  <div className="mt-3 text-xs text-slate-500">
                    Total semestral: {formatBrl(plan.total)}
                  </div>
                  <CardBrands className="mt-4" />
                </div>

                <ul className="mt-6 grid gap-3 text-sm leading-6 text-slate-200">
                  {plan.features.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2
                        className={`mt-1 h-4 w-4 flex-none ${
                          plan.includesAgenda ? 'text-sky-300' : 'text-emerald-300'
                        }`}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <Button asChild size="lg" className="w-full">
                    <Link href={`/contratar-assistente-ia?plano=${plan.code}`}>
                      Contratar {plan.name}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="secondary" className="w-full">
                    <a href={whatsappUrl} target="_blank" rel="noreferrer">
                      <MessageCircleMore className="h-4 w-4" />
                      Tirar dúvidas
                    </a>
                  </Button>
                </div>

                <div className="mt-5 flex items-start gap-3 border-t border-white/[0.08] pt-5 text-xs leading-6 text-slate-400">
                  <ShieldCheck className="mt-1 h-4 w-4 flex-none text-emerald-300" />
                  <span>
                    Pagamento processado pelo Mercado Pago. A Virtuagil não recebe nem
                    armazena os dados do seu cartão.
                  </span>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.025] px-5 py-4 text-xs leading-6 text-slate-400">
            <strong className="text-slate-200">Como funciona o limite:</strong> cada
            número de telefone é contabilizado uma única vez por mês, independentemente
            da quantidade de mensagens ou conversas. A contagem reinicia a cada mês.
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="section-shell">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <div className="eyebrow">
                <CalendarDays className="h-3.5 w-3.5" />
                Plano 500 + Agenda
              </div>
              <h2 className="mt-5 font-display text-4xl font-semibold tracking-[-0.035em] text-white md:text-5xl">
                Agendamento integrado para negócios com hora marcada.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
                No Plano 500 + Agenda, o Assistente consulta disponibilidade real e
                conduz agendamentos, reagendamentos, cancelamentos e confirmações pelo WhatsApp.
              </p>
              <p className="mt-4 text-sm text-slate-400">
                O adicional da Agenda é de <strong className="text-white">R$ 594 por semestre</strong>,
                levando o plano completo a <strong className="text-white">R$ 2.388</strong>.
              </p>
            </div>

            <Card>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    'Serviços e durações configuráveis',
                    'Profissionais e vínculos por serviço',
                    'Horários, intervalos e bloqueios',
                    'Disponibilidade real com prevenção de conflito',
                    'Agendamento após confirmação do cliente',
                    'Consulta e reagendamento',
                    'Cancelamento e confirmação',
                    'Histórico de status no Painel Administrativo',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-300">
                      <CheckCircle2 className="mt-1 h-4 w-4 flex-none text-sky-300" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-2xl border border-sky-300/10 bg-sky-300/[0.05] p-4 text-xs leading-6 text-slate-400">
                  Integrações com Google Calendar, ERP, agenda externa ou sistema proprietário
                  continuam sujeitas a avaliação técnica e não fazem parte automaticamente do módulo padrão.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="section-shell">
          <div className="mb-7 max-w-3xl">
            <div className="eyebrow">Projetos sob medida</div>
            <h2 className="mt-5 font-display text-4xl font-semibold tracking-[-0.035em] text-white md:text-5xl">
              Automação de Processos e IoT seguem por escopo.
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
                bullets: ['Mapeamento do processo', 'Integrações e APIs', 'Fluxos e notificações automáticas'],
                href: '/solucoes/automacao-processos',
              },
              {
                icon: Cpu,
                title: 'IoT e operação conectada',
                text: 'Monitoramento e controle de equipamentos, ambientes, consumo e utilidades conforme a necessidade da operação.',
                bullets: ['Monitoramento remoto', 'Histórico e alertas', 'Módulos expansíveis por operação'],
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
    </main>
  );
}
