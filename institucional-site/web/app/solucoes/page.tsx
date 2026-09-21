import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Bot, Cpu, Workflow } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { products } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Soluções de Automação',
  description:
    'Conheça as soluções da Virtuagil em inteligência artificial, automação de processos e IoT para atendimento, integrações, monitoramento e controle.',
  alternates: { canonical: '/solucoes' },
  openGraph: {
    title: 'Soluções de Automação | Virtuagil',
    description:
      'Assistente de IA, automação de processos e soluções IoT para empresas que querem reduzir trabalho manual e operar melhor.',
    url: 'https://www.virtuagil.com.br/solucoes',
  },
};

const pillars = [
  {
    icon: Bot,
    title: 'Automação com IA',
    text: 'Assistente de IA no WhatsApp para responder, qualificar, fazer follow-up e encaminhar oportunidades.',
  },
  {
    icon: Workflow,
    title: 'Automação de Processos',
    text: 'Integrações e fluxos sob medida para reduzir tarefas manuais e conectar sua operação.',
  },
  {
    icon: Cpu,
    title: 'Automação IoT',
    text: 'Monitoramento e controle de equipamentos, ambientes e utilidades com dados em tempo real.',
  },
];

export default function SolucoesPage() {
  return (
    <main className="pb-20">
      <section className="pt-12 md:pt-18">
        <div className="mx-auto w-[min(1240px,calc(100%-32px))]">
          <div className="inline-flex rounded-full border border-white/10 bg-white/6 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-300">
            Soluções Virtuagil
          </div>
          <h1 className="mt-5 max-w-[13ch] font-serif text-5xl leading-[0.96] tracking-[-0.03em] text-white md:text-7xl">
            Automação para atender, integrar, monitorar e crescer.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-stone-300 md:text-lg">
            Unimos Inteligência Artificial, integrações de processos e IoT para resolver problemas reais da operação. Você pode começar por uma solução pronta ou por um projeto sob medida.
          </p>
        </div>
      </section>

      <section className="pt-10">
        <div className="mx-auto grid w-[min(1240px,calc(100%-32px))] gap-4 md:grid-cols-3">
          {pillars.map(({ icon: Icon, title, text }) => (
            <Card key={title} className="border-white/10 bg-[linear-gradient(180deg,#171d26,#10151c)] text-white">
              <CardContent>
                <Icon className="h-6 w-6 text-[#d68642]" />
                <h2 className="mt-4 text-2xl font-bold">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-stone-300">{text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="pt-10 md:pt-14">
        <div className="mx-auto grid w-[min(1240px,calc(100%-32px))] gap-5 lg:grid-cols-2">
          {products.map((product) => (
            <article
              key={product.slug}
              className="group relative min-h-[420px] overflow-hidden rounded-[32px] border border-white/10 bg-[#10171f]"
              style={{
                backgroundImage: `url(${product.image}), linear-gradient(180deg,#202632,#0e1319)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,14,20,0.12),rgba(10,14,20,0.9))]" />
              <div className="relative flex h-full flex-col justify-end p-7 text-white">
                <div className="mb-3 inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] backdrop-blur-sm">
                  {product.category}
                </div>
                <h2 className="font-serif text-4xl">{product.title}</h2>
                <p className="mt-3 max-w-[34ch] text-sm leading-7 text-white/80">{product.summary}</p>
                <ul className="mt-5 grid gap-2 text-sm text-white/78">
                  {product.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#d9a25f]" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Link
                    href={`/solucoes/${product.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/14"
                  >
                    Conheça a solução
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
