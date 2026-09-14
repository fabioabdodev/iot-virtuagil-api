'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Cpu,
  MessageCircleMore,
  Sparkles,
  Workflow,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OfferCarousel, type Offer } from '@/components/ui/offer-carousel';
import { products } from '@/lib/products';

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M19.05 4.91A9.82 9.82 0 0 0 12.03 2C6.62 2 2.22 6.4 2.22 11.82c0 1.73.45 3.42 1.31 4.92L2 22l5.4-1.47a9.78 9.78 0 0 0 4.63 1.18h.01c5.41 0 9.81-4.4 9.82-9.82a9.75 9.75 0 0 0-2.81-6.98Zm-7.01 15.14h-.01a8.16 8.16 0 0 1-4.16-1.14l-.3-.18-3.2.87.86-3.12-.2-.32a8.18 8.18 0 0 1-1.25-4.34c0-4.51 3.68-8.19 8.2-8.19 2.19 0 4.25.85 5.8 2.4a8.14 8.14 0 0 1 2.39 5.79c0 4.52-3.68 8.2-8.18 8.2Z" />
    </svg>
  );
}

const rise = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: 'easeOut' as const },
};

type HomePageProps = {
  whatsappUrl: string;
  contactEmail: string;
};

export function HomePage({ whatsappUrl, contactEmail }: HomePageProps) {
  const productOffers: Offer[] = products.map((item) => ({
    id: item.slug,
    imageSrc: item.image,
    imageAlt: item.title,
    tag: item.shortLabel,
    title: item.title,
    description: item.summary,
    brandLogoSrc: '/brand/favicon-192x192.png',
    brandName: 'Virtuagil',
    promoCode: item.category,
    href: `/solucoes/${item.slug}`,
  }));

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[720px] bg-[radial-gradient(circle_at_top_left,rgba(214,134,66,0.16),transparent_34%),radial-gradient(circle_at_top_right,rgba(76,154,120,0.12),transparent_30%),linear-gradient(180deg,rgba(6,8,12,0.98),rgba(6,8,12,0))]" />

      <section className="relative pb-14 pt-12 md:pb-20 md:pt-20">
        <div className="mx-auto grid w-[min(1240px,calc(100%-32px))] items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div {...rise}>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-300">
              <Sparkles className="h-3.5 w-3.5 text-[#d68642]" />
              Tecnologia em automação
            </div>

            <h1 className="max-w-[12ch] text-5xl font-bold leading-[0.94] tracking-[-0.035em] text-white md:text-7xl">
              Automação inteligente para empresas que querem fazer mais.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-300 md:text-lg">
              Criamos soluções com Inteligência Artificial, automação de processos e IoT para reduzir tarefas manuais, melhorar o atendimento e dar mais controle à sua operação.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href={whatsappUrl} target="_blank" rel="noreferrer">
                  <WhatsAppIcon className="h-4 w-4" />
                  Falar com a Jade
                </a>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/solucoes">
                  Conhecer soluções
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone-400">
              {['Atendimento 24h', 'Integrações sob medida', 'Automação IoT'].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#4c9a78]" />
                  {item}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div {...rise} transition={{ ...rise.transition, delay: 0.08 }}>
            <div className="relative rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,22,29,0.94),rgba(10,13,18,0.98))] p-4 shadow-[0_30px_120px_rgba(0,0,0,0.28)] md:p-6">
              <div className="overflow-hidden rounded-[24px] border border-white/10">
                <Image
                  src="/solucoes/atendente-ia.svg"
                  alt="Atendente IA da Virtuagil para atendimento no WhatsApp"
                  width={1200}
                  height={800}
                  className="h-auto w-full object-cover"
                  priority
                />
              </div>
              <div className="mt-5 rounded-[28px] border border-white/10 bg-white/6 p-6">
                <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d68642]">
                  <MessageCircleMore className="h-4 w-4" />
                  Conheça a Jade
                </div>
                <h2 className="font-serif text-3xl text-white">Nossa IA também é nossa vendedora.</h2>
                <p className="mt-3 text-sm leading-7 text-stone-300">
                  Converse com a Jade e veja na prática como o Atendente IA pode responder dúvidas, identificar oportunidades e apoiar o atendimento da sua empresa.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 pb-8">
        <div className="mx-auto grid w-[min(1240px,calc(100%-32px))] gap-3 md:grid-cols-3">
          {[
            [Bot, 'Atendente IA', 'Atendimento, qualificação e follow-up no WhatsApp.', '/solucoes/atendente-ia'],
            [Workflow, 'Automação de Processos', 'Integramos sistemas e eliminamos tarefas repetitivas.', '/solucoes/automacao-processos'],
            [Cpu, 'Automação IoT', 'Monitoramento e controle de equipamentos e ambientes.', '/solucoes'],
          ].map(([Icon, title, description, href]) => {
            const I = Icon as typeof Bot;
            return (
              <Link
                key={String(title)}
                href={String(href)}
                className="group rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,33,0.9),rgba(12,17,24,0.88))] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-1 hover:border-white/20"
              >
                <I className="h-6 w-6 text-[#d68642]" />
                <h2 className="mt-4 text-xl font-bold text-white">{String(title)}</h2>
                <p className="mt-2 text-sm leading-7 text-stone-300">{String(description)}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition group-hover:text-white">
                  Saiba mais <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="py-10 md:py-16">
        <div className="mx-auto w-[min(1240px,calc(100%-32px))]">
          <motion.div {...rise}>
            <div className="mb-7">
              <div className="text-sm uppercase tracking-[0.22em] text-stone-400">Soluções Virtuagil</div>
              <h2 className="mt-3 max-w-3xl font-serif text-4xl text-white md:text-5xl">
                Automação do atendimento ao mundo físico.
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-8 text-stone-300 md:text-base">
                Comece por um produto pronto, como o Atendente IA, ou fale conosco sobre uma automação personalizada para o seu processo.
              </p>
            </div>
            <OfferCarousel offers={productOffers} />
          </motion.div>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="mx-auto w-[min(1240px,calc(100%-32px))]">
          <motion.div {...rise}>
            <Card className="border-[#3a2c24] bg-[linear-gradient(135deg,#2a1f1b,#161c24)] text-white">
              <CardContent className="grid gap-6 lg:grid-cols-[1.1fr_auto] lg:items-center">
                <div>
                  <div className="text-sm uppercase tracking-[0.22em] text-stone-400">Atendente IA</div>
                  <h2 className="mt-3 max-w-[16ch] font-serif text-4xl leading-tight md:text-5xl">
                    Seu WhatsApp atendendo mesmo quando você não está disponível.
                  </h2>
                  <p className="mt-5 max-w-2xl text-sm leading-8 text-stone-300 md:text-base">
                    A IA aprende as informações do seu negócio, responde clientes, identifica interessados, faz follow-up e chama uma pessoa quando o atendimento humano realmente é necessário.
                  </p>
                </div>
                <Button asChild size="lg">
                  <Link href="/solucoes/atendente-ia">
                    Conhecer o Atendente IA
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <section className="pb-24 pt-10 md:pt-14">
        <div className="mx-auto w-[min(1240px,calc(100%-32px))]">
          <motion.div {...rise}>
            <Card className="border-white/10 bg-[linear-gradient(135deg,#171d26,#10151c)]">
              <CardContent className="grid gap-6 lg:grid-cols-[1.1fr_auto] lg:items-center">
                <div>
                  <div className="text-sm uppercase tracking-[0.22em] text-stone-400">Vamos conversar</div>
                  <h2 className="mt-3 max-w-[15ch] font-serif text-4xl leading-tight text-white md:text-5xl">
                    Qual parte do seu negócio ainda depende de trabalho manual demais?
                  </h2>
                  <p className="mt-5 max-w-2xl text-sm leading-8 text-stone-300 md:text-base">
                    A Jade pode mostrar como funciona o Atendente IA. Para outros projetos, nossa equipe avalia o processo e desenha uma automação adequada à sua operação.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button asChild size="lg">
                    <a href={whatsappUrl} target="_blank" rel="noreferrer">
                      <WhatsAppIcon className="h-4 w-4" />
                      Falar com a Jade
                    </a>
                  </Button>
                  <Button asChild size="lg" variant="secondary">
                    <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
