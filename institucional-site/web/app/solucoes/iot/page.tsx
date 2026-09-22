import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, ArrowRight, Cpu, Gauge, ShieldCheck, Settings, Snowflake, Zap, Wind } from 'lucide-react';
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
      <section className="relative overflow-hidden border-b border-white/[0.07] py-12 md:py-16">
        <div className="glow-orb right-[-80px] top-[-80px] h-[420px] w-[420px] bg-emerald-400/10" />
        <div className="section-shell">
          <Link href="/solucoes" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"><ArrowLeft className="h-4 w-4" />Todas as soluções</Link>
          <div className="mt-7 grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-300/[0.06] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-emerald-200"><Cpu className="h-4 w-4" />Automação IoT</div>
              <h1 className="mt-5 max-w-[13ch] font-display text-5xl font-semibold leading-[.96] tracking-[-.045em] text-white md:text-6xl">Monitore, controle e automatize <span className="text-emerald-300">sua operação.</span></h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300">Soluções para conectar equipamentos, ambientes e utilidades, transformando leituras e eventos físicos em informação, alertas e ações operacionais.</p>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {[['Mais eficiência no dia a dia',Gauge],['Operação mais segura e previsível',ShieldCheck],['Integração simples com sua rotina',Settings]].map(([text,Icon]) => <div key={text as string} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.035] p-4 text-xs font-semibold text-slate-200"><Icon className="h-5 w-5 flex-none text-emerald-300"/><span>{text as string}</span></div>)}
              </div>
            </div>
            <div className="relative min-h-[360px] overflow-hidden rounded-[30px] border border-emerald-300/20 bg-[radial-gradient(circle_at_70%_35%,rgba(16,185,129,.18),transparent_35%),linear-gradient(135deg,#07151c,#041016)] p-7 shadow-[0_30px_90px_rgba(0,0,0,.35)]">
              <div className="absolute right-8 top-8 h-56 w-72 rounded-[24px] border border-sky-300/20 bg-[#0b1b27] p-5 shadow-2xl">
                <div className="text-xs font-bold text-slate-400">Ambiente monitorado</div><div className="mt-6 text-5xl font-semibold text-white">25,3°<span className="text-xl text-slate-500">C</span></div><div className="mt-6 h-16 rounded-xl bg-[linear-gradient(135deg,rgba(56,189,248,.05),rgba(16,185,129,.16))] p-3 text-xs text-emerald-300">● Normal · leitura em tempo real</div>
              </div>
              <div className="absolute bottom-7 left-7 w-48 rounded-[24px] border border-emerald-300/25 bg-[#e8f0ef] p-5 text-[#06231d] shadow-2xl"><Wind className="h-12 w-12 text-emerald-600"/><div className="mt-10 text-sm font-black">Sensor conectado</div><div className="text-xs opacity-60">Alertas e histórico</div></div>
              <div className="absolute bottom-7 right-7 w-44 rounded-[24px] border border-sky-300/20 bg-[#07151f] p-5 shadow-2xl"><Zap className="h-8 w-8 text-sky-300"/><div className="mt-6 text-sm font-bold text-white">Acionamentos</div><div className="mt-2 text-xs leading-6 text-slate-400">Luz ON<br/>Ar-condicionado ON<br/>Bomba d’água ON</div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="section-shell">
          <div className="mb-8 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end"><div className="max-w-3xl">
            <div className="eyebrow">Portfólio IoT</div>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.035em] text-white md:text-5xl">Soluções prontas para começar e módulos para expandir.</h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">Escolha a frente que resolve o ponto crítico da sua operação e expanda conforme a necessidade.</p></div><div className="rounded-full border border-emerald-300/25 bg-emerald-300/[.05] px-5 py-3 text-sm font-semibold text-emerald-100">Do monitoramento à ação, tudo em um só ecossistema.</div></div>
          <div className="grid gap-4 md:grid-cols-2">
            {iotProducts.map((product, index) => {
              const accents = ['border-sky-400/50','border-violet-400/50','border-red-400/50','border-emerald-400/50'];
              const dots = ['bg-sky-300','bg-violet-300','bg-red-300','bg-emerald-300'];
              return (
                <article key={product.slug} className={`group relative min-h-[300px] overflow-hidden rounded-[24px] border bg-[#071018] shadow-[0_22px_70px_rgba(0,0,0,.3)] transition hover:-translate-y-1 ${accents[index % accents.length]}`}>
                  <div className="absolute inset-y-0 right-0 w-[48%] bg-cover bg-center opacity-90 transition duration-500 group-hover:scale-[1.035]" style={{backgroundImage:`url(${product.image})`}} />
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,10,14,1)_0%,rgba(3,10,14,1)_48%,rgba(3,10,14,.92)_60%,rgba(3,10,14,.25)_100%)]" />
                  <div className="relative flex min-h-[330px] max-w-[58%] flex-col justify-center p-6">
                    <div className="flex items-center gap-2"><div className="w-fit rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[10px] font-black uppercase tracking-[.15em] text-white/80">IoT</div>{index === 0 ? <Snowflake className="h-5 w-5 text-sky-300"/> : index === 1 ? <Zap className="h-5 w-5 text-violet-300"/> : index === 2 ? <Gauge className="h-5 w-5 text-red-300"/> : <Wind className="h-5 w-5 text-emerald-300"/>}</div>
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
                <h2 className="mt-3 font-display text-3xl font-semibold text-white">Conte o desafio da sua operação. A gente indica o melhor caminho.</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">Fale com um especialista e receba uma sugestão personalizada para monitoramento, acionamento ou integração.</p>
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
