'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Bot,
  Building2,
  ChevronRight,
  Gauge,
  Power,
  Sparkles,
  Thermometer,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { HeroIllustration } from '@/components/site/hero-illustration';

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

const modules = [
  {
    title: 'Temperatura',
    icon: Thermometer,
    subtitle: 'Entrada comercial mais simples',
    text: 'Monitoramento continuo para proteger equipamentos, insumos e operacoes sensiveis sem complicar a leitura.',
    bullets: [
      'Alertas no momento certo',
      'Historico por equipamento',
      'Leitura simples para a equipe',
    ],
  },
  {
    title: 'Acionamento',
    icon: Power,
    subtitle: 'Resposta operacional',
    text: 'Comandos e rotinas para agir com rapidez, menos improviso e mais controle do que foi feito.',
    bullets: [
      'Acionamentos registrados',
      'Mais padrao na rotina',
      'Valor percebido maior',
    ],
    featured: true,
  },
  {
    title: 'Consumo',
    icon: Gauge,
    subtitle: 'Camada premium de gestao',
    text: 'Leitura eletrica para enxergar desperdicios, prever manutencao e apoiar decisoes com mais clareza.',
    bullets: [
      'Corrente, tensao e consumo',
      'Diagnostico mais profundo',
      'Mais previsibilidade',
    ],
  },
];

const capabilities = [
  {
    title: 'Temperatura',
    text: 'Proteja o que nao pode sair da faixa ideal.',
    image:
      'url(https://images.pexels.com/photos/17630214/pexels-photo-17630214.jpeg?auto=compress&cs=tinysrgb&w=1200)',
  },
  {
    title: 'Acionamento',
    text: 'Controle operacional com resposta mais rapida.',
    image:
      'url(https://images.pexels.com/photos/7662853/pexels-photo-7662853.jpeg?auto=compress&cs=tinysrgb&w=1200)',
  },
  {
    title: 'Consumo',
    text: 'Acompanhe energia para reduzir desperdicios.',
    image:
      'url(https://images.pexels.com/photos/11924298/pexels-photo-11924298.jpeg?auto=compress&cs=tinysrgb&w=1200)',
  },
  {
    title: 'Gases',
    text: 'Monitore ambiente e utilidades com mais previsibilidade.',
    image:
      'url(https://images.pexels.com/photos/29102280/pexels-photo-29102280.jpeg?auto=compress&cs=tinysrgb&w=1200)',
  },
];

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

type HomePageProps = {
  whatsappUrl: string;
  contactEmail: string;
};

export function HomePage({ whatsappUrl, contactEmail }: HomePageProps) {
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(circle_at_top_left,rgba(229,122,65,0.18),transparent_36%),radial-gradient(circle_at_top_right,rgba(31,132,90,0.14),transparent_32%),linear-gradient(180deg,rgba(255,248,241,0.95),rgba(255,248,241,0))]" />

      <header className="sticky top-0 z-40 border-b border-black/5 bg-[rgba(255,248,241,0.82)] backdrop-blur-xl">
        <div className="mx-auto grid min-h-[88px] w-[min(1240px,calc(100%-32px))] grid-cols-[auto_1fr_auto] items-center gap-4">
          <Link
            href="/"
            aria-label="Virtuagil"
            className="inline-flex flex-col items-start"
          >
            <Image
              src="/brand/logomarca.png"
              alt="Virtuagil"
              width={176}
              height={48}
              className="h-auto w-[158px] md:w-[176px]"
            />
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-500 md:text-[11px]">
              Tecnologia em automacao
            </span>
          </Link>

          <nav className="hidden justify-center gap-7 text-sm font-medium text-stone-600 md:flex">
            <Link href="/solucoes" className="transition hover:text-stone-950">
              Solucoes
            </Link>
            <Link href="/planos" className="transition hover:text-stone-950">
              Planos
            </Link>
            <Link href="/contato" className="transition hover:text-stone-950">
              Contato
            </Link>
          </nav>

          <Button asChild className="hidden md:inline-flex">
            <a href={whatsappUrl} target="_blank" rel="noreferrer">
              <WhatsAppIcon className="h-4 w-4" />
              Fale com a Jade
            </a>
          </Button>
        </div>
      </header>

      <section className="relative pb-14 pt-12 md:pb-20 md:pt-20">
        <div className="mx-auto grid w-[min(1240px,calc(100%-32px))] items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div {...rise}>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/75 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-600 shadow-[0_12px_40px_rgba(43,33,24,0.06)]">
              <Sparkles className="h-3.5 w-3.5 text-[#e57a41]" />
              Automacao comercial com cara de marca
            </div>

            <h1 className="max-w-[11ch] font-serif text-5xl leading-[0.94] tracking-[-0.03em] text-stone-950 md:text-7xl">
              Um site que vende confianca antes de vender tecnologia.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-600 md:text-lg">
              Organizamos o monitoramento dos seus equipamentos medindo:
              temperaturas, gases, acionamentos e consumo de forma automatica,
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
                ['Reducao de custo', 'Operacao mais eficiente'],
                ['Mais clareza', 'Leitura simples para o cliente'],
                ['Crescimento modular', 'Comece pelo que mais doi'],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[26px] border border-black/6 bg-white/72 px-5 py-5 shadow-[0_18px_50px_rgba(43,33,24,0.07)] backdrop-blur-sm"
                >
                  <div className="text-[11px] uppercase tracking-[0.18em] text-stone-500">
                    {label}
                  </div>
                  <strong className="mt-2 block text-[17px] leading-6 text-stone-900">
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
            <div className="relative rounded-[36px] border border-[#f0d8c9] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(255,244,236,0.94))] p-4 shadow-[0_30px_120px_rgba(123,73,37,0.14)] md:p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#f7ede7] px-3 py-2 text-sm text-stone-600">
                  <Bot className="h-4 w-4 text-[#e57a41]" />
                  Jade como assistente comercial
                </div>
                <div className="rounded-full border border-black/6 bg-white/80 px-3 py-2 text-xs uppercase tracking-[0.18em] text-stone-500">
                  atendimento inicial
                </div>
              </div>

              <HeroIllustration />

              <div className="mt-5 rounded-[28px] border border-[#efd8cb] bg-[#fffaf6] p-6">
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b86438]">
                  Primeira conversa
                </div>
                <h2 className="font-serif text-3xl text-stone-950">
                  Como posso ajudar?
                </h2>
                <p className="mt-3 text-sm leading-7 text-stone-600">
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
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {capabilities.map((item, index) => (
              <motion.article
                key={item.title}
                {...rise}
                transition={{ ...rise.transition, delay: index * 0.05 }}
                className="group relative min-h-[290px] overflow-hidden rounded-[30px] border border-black/6"
                style={{
                  backgroundImage: `${item.image}, linear-gradient(180deg,#4b2d1a,#2f1e12)`,
                }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(38,24,14,0.08),rgba(38,24,14,0.72))] transition duration-300 group-hover:bg-[linear-gradient(180deg,rgba(38,24,14,0.02),rgba(38,24,14,0.68))]" />
                <div className="absolute inset-0 bg-cover bg-center opacity-0" />
                <div className="relative flex h-full flex-col justify-end p-6 text-white">
                  <div className="mb-3 inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] backdrop-blur-sm">
                    Monitoramento
                  </div>
                  <h3 className="font-serif text-3xl">{item.title}</h3>
                  <p className="mt-3 max-w-[24ch] text-sm leading-7 text-white/84">
                    {item.text}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="mx-auto w-[min(1240px,calc(100%-32px))]">
          <motion.div
            {...rise}
            className="mb-7 flex items-end justify-between gap-6"
          >
            <div>
              <div className="text-sm uppercase tracking-[0.22em] text-stone-500">
                Modulos comerciais
              </div>
              <h2 className="mt-3 max-w-[14ch] font-serif text-4xl leading-tight text-stone-950 md:text-5xl">
                Uma oferta modular para vender melhor sem assustar o cliente.
              </h2>
            </div>
            <p className="hidden max-w-md text-sm leading-7 text-stone-600 lg:block">
              A entrada comercial pode ser simples. O crescimento vem em
              camadas, com mais clareza, mais valor percebido e uma proposta
              facil de explicar.
            </p>
          </motion.div>

          <div className="grid gap-4 lg:grid-cols-3">
            {modules.map((module, index) => {
              const Icon = module.icon;

              return (
                <motion.div
                  key={module.title}
                  {...rise}
                  transition={{ ...rise.transition, delay: index * 0.06 }}
                >
                  <Card
                    className={
                      module.featured
                        ? 'border-[#e9cbb8] bg-[linear-gradient(180deg,#fffaf6,#fff3ea)] shadow-[0_24px_70px_rgba(190,115,61,0.14)]'
                        : ''
                    }
                  >
                    <CardContent>
                      <div className="mb-5 flex items-center justify-between gap-3">
                        <div className="inline-flex rounded-[20px] bg-[#fff1e7] p-3 text-[#e57a41]">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-[11px] uppercase tracking-[0.18em] text-stone-500">
                          {module.subtitle}
                        </span>
                      </div>
                      <h3 className="font-serif text-3xl text-stone-950">
                        {module.title}
                      </h3>
                      <p className="mt-4 text-sm leading-7 text-stone-600">
                        {module.text}
                      </p>
                      <ul className="mt-5 grid gap-3 text-sm text-stone-800">
                        {module.bullets.map((bullet) => (
                          <li key={bullet} className="flex items-start gap-3">
                            <ChevronRight className="mt-0.5 h-4 w-4 flex-none text-[#1f845a]" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                      <Link
                        href="/solucoes"
                        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#b86438]"
                      >
                        Ver modulo
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="mx-auto grid w-[min(1240px,calc(100%-32px))] gap-4 lg:grid-cols-[1.02fr_0.98fr]">
          <motion.div {...rise}>
            <Card className="bg-[linear-gradient(180deg,#fffdfb,#fff6ef)]">
              <CardContent>
                <div className="mb-3 inline-flex items-center gap-2 text-sm uppercase tracking-[0.22em] text-stone-500">
                  <Building2 className="h-4 w-4 text-[#1f845a]" />
                  Segmentos
                </div>
                <h2 className="max-w-[13ch] font-serif text-4xl leading-tight text-stone-950 md:text-5xl">
                  Onde a Virtuagil ganha aderencia real.
                </h2>
                <ul className="mt-6 grid gap-3 text-sm leading-7 text-stone-700">
                  {segments.map((segment) => (
                    <li key={segment} className="flex items-start gap-3">
                      <Zap className="mt-1 h-4 w-4 flex-none text-[#e57a41]" />
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
            <div className="text-sm uppercase tracking-[0.22em] text-stone-500">
              Planos e pacotes
            </div>
            <h2 className="mt-3 max-w-[15ch] font-serif text-4xl leading-tight text-stone-950 md:text-5xl">
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
                      ? 'border-[#ead0bc] bg-[linear-gradient(180deg,#fffaf6,#fff1e8)] shadow-[0_24px_70px_rgba(190,115,61,0.14)]'
                      : 'bg-white/82'
                  }
                >
                  <CardContent>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-stone-500">
                      Pacote comercial
                    </div>
                    <h3 className="mt-3 font-serif text-3xl text-stone-950">
                      {plan.name}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-stone-600">
                      {plan.text}
                    </p>
                    <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#f7ede7] px-3 py-2 text-sm font-semibold text-[#b86438]">
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
            <Card className="overflow-hidden border-[#eed5c6] bg-[linear-gradient(135deg,#fff8f1,#fff1e6)] shadow-[0_32px_110px_rgba(161,94,41,0.14)]">
              <CardContent className="grid gap-6 lg:grid-cols-[1.1fr_auto] lg:items-center">
                <div>
                  <div className="text-sm uppercase tracking-[0.22em] text-stone-500">
                    Contato comercial
                  </div>
                  <h2 className="mt-3 max-w-[14ch] font-serif text-4xl leading-tight text-stone-950 md:text-5xl">
                    Vamos transformar isso em proposta comercial.
                  </h2>
                  <p className="mt-5 max-w-2xl text-sm leading-8 text-stone-600 md:text-base">
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
