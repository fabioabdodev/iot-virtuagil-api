import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const whatsappUrl =
  process.env.NEXT_PUBLIC_WHATSAPP_URL ?? 'https://wa.me/5531999990000';

export const metadata: Metadata = {
  title: 'Planos | Virtuagil',
  description:
    'Pacotes comerciais da Virtuagil para entrada rapida, operacao local ou gestao completa com proposta sob medida.',
  alternates: {
    canonical: '/planos',
  },
  openGraph: {
    title: 'Planos | Virtuagil',
    description:
      'Conheca os pacotes Essencial, Operacao Local, Gestao Completa e Projeto Personalizado.',
    url: 'https://www.virtuagil.com.br/planos',
  },
};

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
      <section className="pt-12 md:pt-18">
        <div className="mx-auto grid w-[min(1240px,calc(100%-32px))] gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-300">
              <Sparkles className="h-3.5 w-3.5 text-[#d68642]" />
              Planos comerciais
            </div>
            <h1 className="mt-5 max-w-[11ch] font-serif text-5xl leading-[0.96] tracking-[-0.03em] text-white md:text-7xl">
              Pacotes claros para facilitar a decisao.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-300 md:text-lg">
              Em vez de complicar a proposta logo na largada, organizamos a
              oferta em pacotes que ajudam o cliente a entender o ganho,
              comparar cenarios e escolher o proximo passo com mais seguranca.
            </p>
          </div>

          <Card className="border-white/10 bg-[linear-gradient(135deg,#171d26,#10151c)]">
            <CardContent>
              <div className="text-sm uppercase tracking-[0.22em] text-stone-400">
                Jeito Virtuagil
              </div>
              <h2 className="mt-3 max-w-[14ch] font-serif text-4xl leading-tight text-white">
                Menos proposta confusa. Mais leitura comercial.
              </h2>
              <p className="mt-5 text-sm leading-8 text-stone-300">
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
                  ? 'border-[#3f2f24] bg-[linear-gradient(180deg,#1a212b,#121821)] shadow-[0_24px_70px_rgba(0,0,0,0.24)]'
                  : 'border-white/10 bg-[linear-gradient(180deg,#171d26,#10151c)]'
              }
            >
              <CardContent>
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-stone-400">
                    {plan.subtitle}
                  </div>
                  <div className="rounded-full bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#d68642]">
                    Sob consulta
                  </div>
                </div>
                <h2 className="mt-4 font-serif text-4xl text-white">
                  {plan.name}
                </h2>
                <p className="mt-4 text-sm leading-7 text-stone-300">
                  {plan.text}
                </p>
                <ul className="mt-6 grid gap-3 text-sm text-stone-300">
                  {plan.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 flex-none text-[#4c9a78]" />
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
          <Card className="overflow-hidden border-white/10 bg-[linear-gradient(135deg,#171d26,#10151c)] shadow-[0_32px_110px_rgba(0,0,0,0.24)]">
            <CardContent className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="text-sm uppercase tracking-[0.22em] text-stone-400">
                  Conversa comercial
                </div>
                <h2 className="mt-3 max-w-[14ch] font-serif text-4xl leading-tight text-white md:text-5xl">
                  Ajudamos voce a escolher o pacote certo para o momento atual.
                </h2>
                <p className="mt-5 max-w-2xl text-sm leading-8 text-stone-300 md:text-base">
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
