import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const whatsappUrl =
  process.env.NEXT_PUBLIC_WHATSAPP_URL ?? 'https://wa.me/5531999990000';

const plans = [
  {
    name: 'Essencial',
    subtitle: 'Comeco rapido',
    text: 'Para operacoes que precisam resolver logo a dor principal e validar ganho operacional sem complexidade.',
    bullets: [
      'Monitoramento inicial com leitura simples',
      'Entrada comercial mais acessivel',
      'Ideal para validar resultado com rapidez',
    ],
  },
  {
    name: 'Operacao Local',
    subtitle: 'Mais controle no dia a dia',
    text: 'Para quem ja precisa de mais regra, mais resposta operacional e uma rotina mais previsivel.',
    bullets: [
      'Monitoramento com mais camadas',
      'Acionamento e resposta operacional',
      'Melhor equilibrio entre valor e profundidade',
    ],
    featured: true,
  },
  {
    name: 'Gestao Completa',
    subtitle: 'Entrega premium',
    text: 'Para operacoes que querem unir monitoramento, automacao e leitura eletrica em uma proposta mais completa.',
    bullets: [
      'Mais visibilidade para gestao',
      'Mais valor percebido na entrega',
      'Mais base para expansao futura',
    ],
  },
  {
    name: 'Projeto Personalizado',
    subtitle: 'Quando a demanda pede desenho sob medida',
    text: 'Para cenarios em que a combinacao de modulos, a instalacao e a jornada comercial precisam de um desenho proprio.',
    bullets: [
      'Escopo consultivo',
      'Montagem conforme a necessidade',
      'Proposta ajustada ao contexto real',
    ],
  },
];

export default function PlanosPage() {
  return (
    <main className="pb-20">
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
            <Link href="/planos" className="text-stone-950">
              Planos
            </Link>
            <Link href="/contato" className="transition hover:text-stone-950">
              Contato
            </Link>
          </nav>

          <Button asChild className="hidden md:inline-flex">
            <a href={whatsappUrl} target="_blank" rel="noreferrer">
              Falar com a Jade
            </a>
          </Button>
        </div>
      </header>

      <section className="pt-12 md:pt-18">
        <div className="mx-auto grid w-[min(1240px,calc(100%-32px))] gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/72 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-600">
              <Sparkles className="h-3.5 w-3.5 text-[#e57a41]" />
              Planos comerciais
            </div>
            <h1 className="mt-5 max-w-[11ch] font-serif text-5xl leading-[0.96] tracking-[-0.03em] text-stone-950 md:text-7xl">
              Pacotes claros para facilitar a decisao.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-600 md:text-lg">
              Em vez de complicar a proposta logo na largada, organizamos a
              oferta em pacotes que ajudam o cliente a entender o ganho,
              comparar cenarios e escolher o proximo passo com mais seguranca.
            </p>
          </div>

          <Card className="bg-[linear-gradient(135deg,#fff8f1,#fff2e9)]">
            <CardContent>
              <div className="text-sm uppercase tracking-[0.22em] text-stone-500">
                Jeito Virtuagil
              </div>
              <h2 className="mt-3 max-w-[14ch] font-serif text-4xl leading-tight text-stone-950">
                Menos proposta confusa. Mais leitura comercial.
              </h2>
              <p className="mt-5 text-sm leading-8 text-stone-600">
                Cada pacote foi pensado para tornar a conversa mais simples,
                mostrar valor com mais rapidez e abrir espaco para crescer por
                modulos no tempo certo.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="pt-10 md:pt-14">
        <div className="mx-auto grid w-[min(1240px,calc(100%-32px))] gap-4 lg:grid-cols-2">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.featured
                  ? 'border-[#ead0bc] bg-[linear-gradient(180deg,#fffaf6,#fff1e8)] shadow-[0_24px_70px_rgba(190,115,61,0.14)]'
                  : 'bg-[linear-gradient(180deg,#fffdfb,#fff6ef)]'
              }
            >
              <CardContent>
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-stone-500">
                    {plan.subtitle}
                  </div>
                  <div className="rounded-full bg-[#f7ede7] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#b86438]">
                    Sob consulta
                  </div>
                </div>
                <h2 className="mt-4 font-serif text-4xl text-stone-950">
                  {plan.name}
                </h2>
                <p className="mt-4 text-sm leading-7 text-stone-600">
                  {plan.text}
                </p>
                <ul className="mt-6 grid gap-3 text-sm text-stone-800">
                  {plan.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 flex-none text-[#1f845a]" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="pt-10 md:pt-14">
        <div className="mx-auto w-[min(1240px,calc(100%-32px))]">
          <Card className="overflow-hidden border-[#eed5c6] bg-[linear-gradient(135deg,#fff8f1,#fff1e6)] shadow-[0_32px_110px_rgba(161,94,41,0.12)]">
            <CardContent className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="text-sm uppercase tracking-[0.22em] text-stone-500">
                  Conversa comercial
                </div>
                <h2 className="mt-3 max-w-[14ch] font-serif text-4xl leading-tight text-stone-950 md:text-5xl">
                  Ajudamos voce a escolher o pacote certo para o momento atual.
                </h2>
                <p className="mt-5 max-w-2xl text-sm leading-8 text-stone-600 md:text-base">
                  Nao precisa decidir tudo sozinho. Podemos entender sua
                  operacao, o nivel de urgencia e o resultado esperado antes de
                  desenhar a proposta.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <a href={whatsappUrl} target="_blank" rel="noreferrer">
                    Falar com a Jade
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/contato">Solicitar proposta</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
