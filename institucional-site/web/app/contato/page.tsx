import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Bot,
  CalendarDays,
  MessageCircleMore,
  Phone,
  Workflow,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const whatsappUrl =
  process.env.NEXT_PUBLIC_WHATSAPP_URL ?? 'https://wa.me/553171029727';

export const metadata: Metadata = {
  title: 'Contato',
  description:
    'Fale com a Virtuagil sobre Assistente de IA, Agenda integrada, automação de processos e projetos IoT para sua empresa.',
  alternates: { canonical: '/contato' },
  openGraph: {
    title: 'Contato | Virtuagil',
    description:
      'Converse com a Virtuagil sobre Assistente de IA, Agenda, automação de processos e projetos IoT.',
    url: 'https://www.virtuagil.com.br/contato',
  },
};

export default function ContatoPage() {
  return (
    <main className="pb-16 md:pb-20">
      <section className="relative py-14 md:py-20">
        <div className="glow-orb right-[-100px] top-[20px] h-[300px] w-[300px] bg-sky-400/10" />
        <div className="section-shell grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <div className="eyebrow">Contato comercial</div>
            <h1 className="mt-5 max-w-[12ch] font-display text-5xl font-semibold leading-[0.96] tracking-[-0.04em] text-white md:text-6xl">
              Conte o que hoje mais toma tempo da sua equipe.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
              Atendimento no WhatsApp, agendamentos, follow-up, integrações ou monitoramento:
              começamos entendendo o processo atual para indicar o próximo passo sem prometer
              uma solução que não combina com a operação.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href={whatsappUrl} target="_blank" rel="noreferrer">
                  <MessageCircleMore className="h-4 w-4" />
                  Falar no WhatsApp
                </a>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/solucoes">Ver soluções</Link>
              </Button>
            </div>
          </div>

          <Card className="border-emerald-300/10">
            <CardContent>
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.07]">
                <Bot className="h-5 w-5 text-emerald-300" />
              </div>
              <h2 className="mt-5 font-display text-3xl font-semibold text-white">
                Quer começar pelo Assistente de IA?
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                O Plano 500 e o Plano 500 + Agenda podem ser contratados diretamente pelo site.
                Integrações adicionais continuam sujeitas a avaliação técnica.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Button asChild>
                  <Link href="/planos">
                    Ver planos
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <a href={whatsappUrl} target="_blank" rel="noreferrer">Tirar dúvidas</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="section-shell grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Bot,
              title: 'Assistente de IA',
              text: 'Atendimento, qualificação, follow-up e suporte humano pelo WhatsApp.',
              action: 'Ver solução',
              href: '/solucoes/atendente-ia',
              external: false,
            },
            {
              icon: CalendarDays,
              title: 'Plano 500 + Agenda',
              text: 'Assistente de IA com disponibilidade, agendamento, reagendamento, cancelamento e controle administrativo.',
              action: 'Ver plano com Agenda',
              href: '/planos',
              external: false,
            },
            {
              icon: Workflow,
              title: 'Automação de Processos',
              text: 'Integrações entre sistemas, APIs, rotinas e notificações automáticas.',
              action: 'Conhecer projetos',
              href: '/solucoes/automacao-processos',
              external: false,
            },
            {
              icon: Phone,
              title: 'Projetos IoT',
              text: 'Monitoramento e controle de equipamentos, ambientes e utilidades.',
              action: 'Falar com a equipe',
              href: whatsappUrl,
              external: true,
            },
          ].map(({ icon: Icon, title, text, action, href, external }) => (
            <Card key={title} className="h-full">
              <CardContent className="flex h-full flex-col">
                <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.035]">
                  <Icon className="h-5 w-5 text-sky-300" />
                </div>
                <h2 className="mt-5 text-xl font-bold text-white">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">{text}</p>
                <div className="mt-auto pt-6">
                  {external ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 hover:text-emerald-200"
                    >
                      {action}
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  ) : (
                    <Link
                      href={href}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 hover:text-emerald-200"
                    >
                      {action}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
