import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ChevronRight,
  Gauge,
  Power,
  ShieldCheck,
  Thermometer,
  Waves,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const whatsappUrl =
  process.env.NEXT_PUBLIC_WHATSAPP_URL ?? 'https://wa.me/5531999990000';

const modules = [
  {
    title: 'Temperatura',
    icon: Thermometer,
    subtitle: 'A entrada mais rapida para reduzir risco operacional',
    text: 'Monitoramento continuo para equipamentos, camaras frias, ambientes sensiveis e processos que nao podem sair da faixa ideal.',
    bullets: [
      'Alertas objetivos no momento certo',
      'Historico claro por equipamento',
      'Mais seguranca para operacao e equipe',
    ],
  },
  {
    title: 'Acionamento',
    icon: Power,
    subtitle: 'Rotina padronizada e resposta mais rapida',
    text: 'Controle de ligamento, desligamento e execucao de rotinas com mais previsibilidade e menos improviso no dia a dia.',
    bullets: [
      'Acionamentos com rastreabilidade',
      'Mais rapidez para agir',
      'Operacao menos dependente de memoria',
    ],
  },
  {
    title: 'Consumo',
    icon: Gauge,
    subtitle: 'Dados para enxergar desperdicio e oportunidade',
    text: 'Leitura de corrente, tensao e consumo para apoiar manutencao, reduzir desperdicio e elevar o nivel da gestao.',
    bullets: [
      'Leitura eletrica organizada',
      'Mais base para decisao',
      'Camada premium de proposta comercial',
    ],
  },
  {
    title: 'Gases',
    icon: Waves,
    subtitle: 'Mais previsibilidade para ambientes e utilidades',
    text: 'Acompanhamento de variacoes importantes para ambientes, utilidades e operacoes que exigem mais atencao com seguranca.',
    bullets: [
      'Mais visibilidade operacional',
      'Sinais de risco mais cedo',
      'Monitoramento de ambiente com leitura simples',
    ],
  },
];

export default function SolucoesPage() {
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
            <Link href="/solucoes" className="text-stone-950">
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
              Falar com a Jade
            </a>
          </Button>
        </div>
      </header>

      <section className="pt-12 md:pt-18">
        <div className="mx-auto grid w-[min(1240px,calc(100%-32px))] gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <div className="inline-flex rounded-full border border-black/8 bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-600">
              Solucoes modulares
            </div>
            <h1 className="mt-5 max-w-[11ch] font-serif text-5xl leading-[0.96] tracking-[-0.03em] text-stone-950 md:text-7xl">
              Produtos que fazem sentido para a operacao real.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-600 md:text-lg">
              A Virtuagil organiza a proposta por modulos para voce comecar pelo
              problema mais urgente e evoluir no seu ritmo, sem vender um
              projeto confuso ou grande demais logo na primeira conversa.
            </p>
          </div>

          <Card className="bg-[linear-gradient(135deg,#284336,#1f352b)] text-white shadow-[0_28px_90px_rgba(31,52,43,0.22)]">
            <CardContent>
              <div className="text-sm uppercase tracking-[0.22em] text-white/70">
                Como vendemos melhor
              </div>
              <h2 className="mt-3 max-w-[14ch] font-serif text-4xl leading-tight">
                Clareza comercial antes da complexidade tecnica.
              </h2>
              <ul className="mt-6 grid gap-3 text-sm leading-7 text-white/82">
                {[
                  'Entramos pela dor principal da operacao',
                  'Mostramos ganho operacional de forma simples',
                  'Expandimos por modulos conforme a necessidade real',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <ShieldCheck className="mt-1 h-4 w-4 flex-none text-[#d9a25f]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="pt-10 md:pt-14">
        <div className="mx-auto w-[min(1240px,calc(100%-32px))]">
          <div className="grid gap-4 lg:grid-cols-2">
            {modules.map((module) => {
              const Icon = module.icon;

              return (
                <Card
                  key={module.title}
                  className="bg-[linear-gradient(180deg,#fffdfb,#fff5ee)]"
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
                    <h2 className="font-serif text-4xl text-stone-950">
                      {module.title}
                    </h2>
                    <p className="mt-4 text-sm leading-7 text-stone-600">
                      {module.text}
                    </p>
                    <ul className="mt-6 grid gap-3 text-sm text-stone-800">
                      {module.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-3">
                          <ChevronRight className="mt-0.5 h-4 w-4 flex-none text-[#1f845a]" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="pt-10 md:pt-14">
        <div className="mx-auto w-[min(1240px,calc(100%-32px))]">
          <Card className="overflow-hidden border-[#eed5c6] bg-[linear-gradient(135deg,#fff8f1,#fff1e6)] shadow-[0_32px_110px_rgba(161,94,41,0.12)]">
            <CardContent className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="text-sm uppercase tracking-[0.22em] text-stone-500">
                  Proximo passo
                </div>
                <h2 className="mt-3 max-w-[14ch] font-serif text-4xl leading-tight text-stone-950 md:text-5xl">
                  Descobrimos juntos qual modulo faz mais sentido para voce.
                </h2>
                <p className="mt-5 max-w-2xl text-sm leading-8 text-stone-600 md:text-base">
                  Se fizer sentido, a Jade abre a conversa e ajuda a identificar
                  a melhor entrada para sua operacao, sem pressa e sem linguagem
                  tecnica desnecessaria.
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
                  <Link href="/planos">Ver planos</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
