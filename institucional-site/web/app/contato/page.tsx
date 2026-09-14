import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Bot, Mail, MessageCircleMore, Phone, Workflow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const whatsappUrl =
  process.env.NEXT_PUBLIC_WHATSAPP_URL ?? 'https://wa.me/553171029727';
const contactEmail =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'contato@virtuagil.com.br';

export const metadata: Metadata = {
  title: 'Contato',
  description:
    'Fale com a Virtuagil sobre Atendente IA, automacao de processos e projetos IoT para sua empresa.',
  alternates: { canonical: '/contato' },
  openGraph: {
    title: 'Contato | Virtuagil',
    description:
      'Converse com a Jade sobre o Atendente IA ou fale com a equipe sobre automacao de processos e IoT.',
    url: 'https://www.virtuagil.com.br/contato',
  },
};

export default function ContatoPage() {
  return (
    <main className="pb-20">
      <section className="pt-12 md:pt-18">
        <div className="mx-auto grid w-[min(1240px,calc(100%-32px))] gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <div className="inline-flex rounded-full border border-white/10 bg-white/6 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-300">
              Contato comercial
            </div>
            <h1 className="mt-5 max-w-[11ch] font-serif text-5xl leading-[0.96] tracking-[-0.03em] text-white md:text-7xl">
              Conte o que sua empresa precisa automatizar.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-300 md:text-lg">
              Para conhecer o Atendente IA, converse com a Jade e veja a propria automacao funcionando. Para integracoes de processos ou IoT, nossa equipe avalia o contexto e prepara o proximo passo.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href={whatsappUrl} target="_blank" rel="noreferrer">
                  Falar com a Jade
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <a href={`mailto:${contactEmail}`}>Enviar e-mail</a>
              </Button>
            </div>
          </div>

          <Card className="border-white/10 bg-[linear-gradient(135deg,#171d26,#10151c)] shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
            <CardContent className="grid gap-4">
              <div className="rounded-[24px] border border-white/10 bg-white/6 p-5">
                <div className="mb-3 inline-flex rounded-full bg-white/8 p-3 text-[#d68642]">
                  <MessageCircleMore className="h-5 w-5" />
                </div>
                <h2 className="font-serif text-3xl text-white">Comece pelo canal mais simples</h2>
                <p className="mt-3 text-sm leading-7 text-stone-300">
                  A Jade apresenta o Atendente IA, tira duvidas e identifica interesse. Quando o assunto exigir projeto sob medida, a conversa segue com uma pessoa da equipe.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {[
                  { icon: Bot, label: 'Atendente IA', value: 'Demo com a Jade' },
                  { icon: Workflow, label: 'Projetos', value: 'Automacao sob medida' },
                  { icon: Mail, label: 'E-mail', value: contactEmail },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-[22px] border border-white/10 bg-white/6 p-4">
                      <Icon className="h-4 w-4 text-[#4c9a78]" />
                      <div className="mt-3 text-[11px] uppercase tracking-[0.18em] text-stone-400">{item.label}</div>
                      <div className="mt-2 text-sm font-semibold text-white">{item.value}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="pt-10 md:pt-14">
        <div className="mx-auto w-[min(1240px,calc(100%-32px))]">
          <Card className="bg-[linear-gradient(135deg,#284336,#1f352b)] text-white shadow-[0_28px_90px_rgba(31,52,43,0.24)]">
            <CardContent className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="text-sm uppercase tracking-[0.22em] text-white/70">O que podemos automatizar</div>
                <h2 className="mt-3 max-w-[15ch] font-serif text-4xl leading-tight md:text-5xl">
                  Atendimento, processos digitais e operacoes conectadas.
                </h2>
                <p className="mt-5 max-w-2xl text-sm leading-8 text-white/78 md:text-base">
                  O Atendente IA e nossa oferta pronta para o WhatsApp. Tambem desenvolvemos integracoes entre sistemas e projetos IoT de monitoramento e controle conforme a necessidade da operacao.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild variant="ghost" className="bg-white text-[#1f352b] hover:bg-white/92">
                  <a href={whatsappUrl} target="_blank" rel="noreferrer">
                    <Phone className="h-4 w-4" />
                    Falar com a Jade
                  </a>
                </Button>
                <Button asChild variant="secondary" className="border-white/20 bg-white/10 text-white hover:bg-white/14">
                  <Link href="/solucoes">Ver solucoes</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
