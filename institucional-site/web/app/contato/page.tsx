import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Bot,
  Mail,
  MessageCircleMore,
  Phone,
  Workflow,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const whatsappUrl =
  process.env.NEXT_PUBLIC_WHATSAPP_URL ?? 'https://wa.me/553171029727';
const contactEmail =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'contato@virtuagil.com.br';

export const metadata: Metadata = {
  title: 'Contato',
  description:
    'Fale com a Virtuagil sobre Assistente de IA, automação de processos e projetos IoT para sua empresa.',
  alternates: { canonical: '/contato' },
  openGraph: {
    title: 'Contato | Virtuagil',
    description:
      'Converse com a Jade sobre o Assistente de IA ou fale com a equipe sobre automação de processos e IoT.',
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
              Conte o que sua empresa precisa automatizar.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
              Para conhecer o Assistente de IA, converse com a Jade e veja a automação funcionando.
              Para integrações de processos ou IoT, nossa equipe avalia o contexto e prepara o
              próximo passo.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href={whatsappUrl} target="_blank" rel="noreferrer">
                  <MessageCircleMore className="h-4 w-4" />
                  Falar com a Jade
                </a>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <a href={`mailto:${contactEmail}`}>
                  <Mail className="h-4 w-4" />
                  Enviar e-mail
                </a>
              </Button>
            </div>
          </div>

          <Card className="border-emerald-300/10">
            <CardContent>
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.07]">
                <Bot className="h-5 w-5 text-emerald-300" />
              </div>
              <h2 className="mt-5 font-display text-3xl font-semibold text-white">
                Quer contratar o Assistente de IA?
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                Você pode contratar diretamente pelo site. Se quiser entender melhor antes,
                a Jade responde dúvidas pelo WhatsApp.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Button asChild>
                  <Link href="/contratar-assistente-ia">
                    Contratar agora
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <a href={whatsappUrl} target="_blank" rel="noreferrer">
                    Tirar dúvidas
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="section-shell grid gap-4 md:grid-cols-3">
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

      <section className="py-8 md:py-12">
        <div className="section-shell">
          <div className="rounded-[30px] border border-white/[0.08] bg-white/[0.025] p-7 md:p-8">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Contato direto
                </div>
                <h2 className="mt-3 font-display text-3xl font-semibold text-white">
                  Prefere falar com uma pessoa?
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                  Escreva para {contactEmail}. Projetos sob medida seguem por avaliação comercial e
                  técnica antes da proposta.
                </p>
              </div>
              <Button asChild variant="secondary">
                <a href={`mailto:${contactEmail}`}>
                  <Mail className="h-4 w-4" />
                  {contactEmail}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
