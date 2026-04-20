'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Bot, Building2, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OfferCarousel, type Offer } from '@/components/ui/offer-carousel';
import { HeroIllustration } from '@/components/site/hero-illustration';
import { products } from '@/lib/products';

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M19.05 4.91A9.82 9.82 0 0 0 12.03 2C6.62 2 2.22 6.4 2.22 11.82c0 1.73.45 3.42 1.31 4.92L2 22l5.4-1.47a9.78 9.78 0 0 0 4.63 1.18h.01c5.41 0 9.81-4.4 9.82-9.82a9.75 9.75 0 0 0-2.81-6.98Zm-7.01 15.14h-.01a8.16 8.16 0 0 1-4.16-1.14l-.3-.18-3.2.87.86-3.12-.2-.32a8.18 8.18 0 0 1-1.25-4.34c0-4.51 3.68-8.19 8.2-8.19 2.19 0 4.25.85 5.8 2.4a8.14 8.14 0 0 1 2.39 5.79c0 4.52-3.68 8.2-8.18 8.2Zm4.49-6.13c-.25-.13-1.47-.73-1.7-.82-.23-.08-.4-.12-.57.13-.17.25-.65.82-.79.98-.15.17-.29.19-.54.07-.25-.13-1.04-.38-1.98-1.22-.73-.65-1.22-1.46-1.37-1.7-.14-.25-.02-.38.11-.5.12-.12.25-.29.38-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.57-1.37-.78-1.88-.21-.49-.42-.42-.57-.42h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.23.9 2.42 1.02 2.59.13.17 1.78 2.72 4.31 3.81.6.26 1.08.42 1.45.54.61.2 1.16.17 1.6.1.49-.08 1.47-.6 1.68-1.18.21-.59.21-1.09.15-1.19-.06-.1-.23-.17-.48-.29Z" />
    </svg>
  );
}

const segments = [
  'Restaurantes, cozinhas e cadeia fria',
  'Clinicas, laboratorios e ambientes sensiveis',
  'Reservatorios, bombas e utilidades',
  'Operacoes que precisam vender melhor e operar melhor',
];

const plans = [
  {
    name: 'Essencial',
    text: 'Entrada rapida com foco em monitoramento e ganho operacional direto.',
  },
  {
    name: 'Operacao Local',
    text: 'Monitoramento com mais regra, acionamento e rotina padronizada.',
  },
  {
    name: 'Gestao Completa',
    text: 'Combinacao modular para operacoes que querem mais controle e mais valor.',
  },
];

const rise = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: 'easeOut' as const },
};

const productCarouselImages: Record<string, string> = {
  temperatura:
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1974&auto=format&fit=crop',
  acionamento:
    'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1974&auto=format&fit=crop',
  consumo:
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=1974&auto=format&fit=crop',
  gases:
    'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?q=80&w=1974&auto=format&fit=crop',
};

type HomePageProps = {
  whatsappUrl: string;
  contactEmail: string;
};

export function HomePage({ whatsappUrl, contactEmail }: HomePageProps) {
  const productOffers: Offer[] = products.map((item) => ({
    id: item.slug,
    imageSrc: productCarouselImages[item.slug] ?? item.image,
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
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(circle_at_top_left,rgba(214,134,66,0.14),transparent_34%),radial-gradient(circle_at_top_right,rgba(76,154,120,0.1),transparent_30%),linear-gradient(180deg,rgba(6,8,12,0.98),rgba(6,8,12,0))]" />

      <section className="relative pb-14 pt-12 md:pb-20 md:pt-20">
        <div className="mx-auto grid w-[min(1240px,calc(100%-32px))] items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div {...rise}>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-300 shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
              <Sparkles className="h-3.5 w-3.5 text-[#d68642]" />
              Automacao comercial
            </div>

            <h1 className="max-w-[11ch] font-serif text-5xl leading-[0.94] tracking-[-0.03em] text-white md:text-7xl">
              Solucoes em monitoramento de equipamentos.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-300 md:text-lg">
              Temperaturas, gases, acionamentos e consumo de forma automatica,
              diminuindo muito os custos operacionais do seu negocio.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href={whatsappUrl} target="_blank" rel="noreferrer">
                  <WhatsAppIcon className="h-4 w-4" />
                  Falar com a Jade
                </a>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/contato">
                  Solicitar proposta
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-10 grid gap-3 md:grid-cols-3">
              {[
                [
                  'Reducao de custos',
                  'Controle tudo remotamente 24 horas por dia.',
                ],
                [
                  'Tenha o controle',
                  'Receba alertas via WhatsApp e monitore tudo de maneira simples e eficaz.',
                ],
                ['Crescimento modular', 'Economia e gestao simples'],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[26px] border border-white/10 bg-white/6 px-5 py-5 shadow-[0_18px_50px_rgba(0,0,0,0.2)] backdrop-blur-sm"
                >
                  <div className="text-[11px] uppercase tracking-[0.18em] text-stone-400">
                    {label}
                  </div>
                  <strong className="mt-2 block text-[17px] leading-6 text-white">
                    {value}
                  </strong>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            {...rise}
            transition={{ ...rise.transition, delay: 0.08 }}
          >
            <div className="relative rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,22,29,0.94),rgba(10,13,18,0.98))] p-4 shadow-[0_30px_120px_rgba(0,0,0,0.28)] md:p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/6 px-3 py-2 text-sm text-stone-300">
                  <Bot className="h-4 w-4 text-[#d68642]" />
                  Jade como assistente comercial
                </div>
                <div className="rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs uppercase tracking-[0.18em] text-stone-400">
                  atendimento inicial
                </div>
              </div>

              <HeroIllustration />

              <div className="mt-5 rounded-[28px] border border-white/10 bg-white/6 p-6">
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d68642]">
                  Primeira conversa
                </div>
                <h2 className="font-serif text-3xl text-white">
                  Como posso ajudar?
                </h2>
                <p className="mt-3 text-sm leading-7 text-stone-300">
                  A Jade apresenta os modulos, entende a principal dor da
                  operacao e orienta o visitante para o proximo passo comercial
                  com uma linguagem leve, simples e humana.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="pb-10 pt-2 md:pb-14">
        <div className="mx-auto w-[min(1240px,calc(100%-32px))]">
          <motion.div {...rise}>
            <OfferCarousel offers={productOffers} />
          </motion.div>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="mx-auto grid w-[min(1240px,calc(100%-32px))] gap-4 lg:grid-cols-[1.02fr_0.98fr]">
          <motion.div {...rise}>
            <Card className="border-white/10 bg-[linear-gradient(180deg,#171d26,#10151c)]">
              <CardContent>
                <div className="mb-3 inline-flex items-center gap-2 text-sm uppercase tracking-[0.22em] text-stone-400">
                  <Building2 className="h-4 w-4 text-[#4c9a78]" />
                  Segmentos
                </div>
                <h2 className="max-w-[13ch] font-serif text-4xl leading-tight text-white md:text-5xl">
                  Onde atuamos
                </h2>
                <ul className="mt-6 grid gap-3 text-sm leading-7 text-stone-300">
                  {segments.map((segment) => (
                    <li key={segment} className="flex items-start gap-3">
                      <Zap className="mt-1 h-4 w-4 flex-none text-[#d68642]" />
                      <span>{segment}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            {...rise}
            transition={{ ...rise.transition, delay: 0.08 }}
          >
            <Card className="bg-[linear-gradient(135deg,#284336,#1f352b)] text-white shadow-[0_28px_90px_rgba(31,52,43,0.24)]">
              <CardContent>
                <div className="text-sm uppercase tracking-[0.22em] text-white/70">
                  Posicionamento
                </div>
                <h2 className="mt-3 max-w-[14ch] font-serif text-4xl leading-tight md:text-5xl">
                  Beleza, clareza e proposta comercial antes da complexidade
                  tecnica.
                </h2>
                <p className="mt-5 text-sm leading-8 text-white/78">
                  O institucional precisa transmitir valor, confianca e vontade
                  de conversar. O painel tecnico fica para dentro. Aqui, a marca
                  precisa vender seguranca, ganho operacional e proximo passo
                  claro.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    asChild
                    variant="ghost"
                    className="bg-white text-[#1f352b] hover:bg-white/92"
                  >
                    <a href={whatsappUrl} target="_blank" rel="noreferrer">
                      <WhatsAppIcon className="h-4 w-4" />
                      Conversar com a Jade
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="secondary"
                    className="border-white/20 bg-white/10 text-white hover:bg-white/14"
                  >
                    <Link href="/planos">Ver pacotes</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="mx-auto w-[min(1240px,calc(100%-32px))]">
          <motion.div {...rise} className="mb-7">
            <div className="text-sm uppercase tracking-[0.22em] text-stone-400">
              Planos e pacotes
            </div>
            <h2 className="mt-3 max-w-[15ch] font-serif text-4xl leading-tight text-white md:text-5xl">
              Pacotes com leitura simples para acelerar a decisao.
            </h2>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                {...rise}
                transition={{ ...rise.transition, delay: index * 0.05 }}
              >
                <Card
                  className={
                    plan.name === 'Operacao Local'
                      ? 'border-[#3f2f24] bg-[linear-gradient(180deg,#1a212b,#121821)] shadow-[0_24px_70px_rgba(0,0,0,0.24)]'
                      : 'border-white/10 bg-[linear-gradient(180deg,#171d26,#10151c)]'
                  }
                >
                  <CardContent>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-stone-400">
                      Pacote comercial
                    </div>
                    <h3 className="mt-3 font-serif text-3xl text-white">
                      {plan.name}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-stone-300">
                      {plan.text}
                    </p>
                    <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-2 text-sm font-semibold text-[#d68642]">
                      Sob consulta
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-18 pt-10 md:pb-24 md:pt-14">
        <div className="mx-auto w-[min(1240px,calc(100%-32px))]">
          <motion.div {...rise}>
            <Card className="overflow-hidden border-white/10 bg-[linear-gradient(135deg,#171d26,#10151c)] shadow-[0_32px_110px_rgba(0,0,0,0.24)]">
              <CardContent className="grid gap-6 lg:grid-cols-[1.1fr_auto] lg:items-center">
                <div>
                  <div className="text-sm uppercase tracking-[0.22em] text-stone-400">
                    Contato comercial
                  </div>
                  <h2 className="mt-3 max-w-[14ch] font-serif text-4xl leading-tight text-white md:text-5xl">
                    Vamos transformar isso em proposta comercial.
                  </h2>
                  <p className="mt-5 max-w-2xl text-sm leading-8 text-stone-300 md:text-base">
                    Se fizer sentido para a sua operacao, a Jade abre a conversa
                    agora e ajuda a identificar a melhor entrada entre
                    temperatura, acionamento, consumo, gases ou um projeto
                    personalizado.
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
