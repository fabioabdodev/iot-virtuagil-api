import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, ArrowRight, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { products } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Soluções de Automação IoT',
  description:
    'Conheça as soluções IoT da Virtuagil para temperatura, acionamento, consumo e monitoramento de gases.',
  alternates: { canonical: '/solucoes/iot' },
};

const iotProducts = products.filter((product) => product.category === 'IoT');

export default function IotPage() {
  return (
    <main className="pb-20">
      <section className="relative py-14 md:py-20">
        <div className="glow-orb right-[-120px] top-[20px] h-[320px] w-[320px] bg-sky-400/10" />
        <div className="section-shell">
          <Link href="/solucoes" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Todas as soluções
          </Link>
          <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-sky-300/15 bg-sky-300/[0.06] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-sky-200">
            <Cpu className="h-4 w-4" />
            Automação IoT
          </div>
          <h1 className="mt-5 max-w-[15ch] font-display text-5xl font-semibold leading-[0.96] tracking-[-0.04em] text-white md:text-6xl">
            Monitore, controle e automatize sua operação.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 md:text-lg">
            Soluções para conectar equipamentos, ambientes e utilidades, transformando leituras e eventos
            físicos em informação, alertas e ações operacionais.
          </p>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="section-shell">
          <div className="mb-7 max-w-3xl">
            <div className="eyebrow">Portfólio IoT</div>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.035em] text-white md:text-5xl">Soluções prontas para começar e módulos para expandir.</h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">Escolha a frente que resolve o ponto crítico da sua operação e expanda conforme a necessidade.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {iotProducts.map((product, index) => {
              const accents = ['border-sky-400/50','border-violet-400/50','border-red-400/50','border-emerald-400/50'];
              const dots = ['bg-sky-300','bg-violet-300','bg-red-300','bg-emerald-300'];
              return (
                <article key={product.slug} className={`group relative min-h-[300px] overflow-hidden rounded-[24px] border bg-[#071018] shadow-[0_22px_70px_rgba(0,0,0,.3)] transition hover:-translate-y-1 ${accents[index % accents.length]}`}>
                  <div className="absolute inset-y-0 right-0 w-[54%] bg-cover bg-center transition duration-500 group-hover:scale-[1.035]" style={{backgroundImage:`url(${product.image})`}} />
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,10,14,1)_0%,rgba(3,10,14,.99)_43%,rgba(3,10,14,.76)_63%,rgba(3,10,14,.18)_100%)]" />
                  <div className="relative flex min-h-[300px] max-w-[65%] flex-col justify-center p-6">
                    <div className="w-fit rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[10px] font-black uppercase tracking-[.15em] text-white/80">IoT</div>
                    <h3 className="mt-3 font-display text-3xl font-semibold text-white">{product.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-200">{product.summary}</p>
                    <ul className="mt-4 grid gap-2 text-xs text-slate-200">
                      {product.bullets.map(b => <li key={b} className="flex gap-2"><span className={`mt-1.5 h-1.5 w-1.5 flex-none rounded-full ${dots[index % dots.length]}`}/>{b}</li>)}
                    </ul>
                    <Link href={`/solucoes/${product.slug}`} className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-white">Conhecer solução <ArrowRight className="h-3.5 w-3.5"/></Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="section-shell">
          <div className="rounded-[30px] border border-sky-300/15 bg-[linear-gradient(135deg,rgba(8,48,73,0.75),rgba(7,19,28,0.98))] p-7 md:p-9">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-sky-100/60">Projeto IoT</div>
                <h2 className="mt-3 font-display text-3xl font-semibold text-white">Tem um equipamento ou ambiente que precisa monitorar?</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">Conte o cenário e avaliamos sensores, conectividade, alertas e automações adequadas.</p>
              </div>
              <Button asChild size="lg" variant="secondary">
                <Link href="/contato">Falar com a Virtuagil<ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
