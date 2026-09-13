'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Bot, Cpu, Sparkles, Workflow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OfferCarousel, type Offer } from '@/components/ui/offer-carousel';
import { products } from '@/lib/products';

function WhatsAppIcon({ className }: { className?: string }) { return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}><path d="M19.05 4.91A9.82 9.82 0 0 0 12.03 2C6.62 2 2.22 6.4 2.22 11.82c0 1.73.45 3.42 1.31 4.92L2 22l5.4-1.47a9.78 9.78 0 0 0 4.63 1.18h.01c5.41 0 9.81-4.4 9.82-9.82a9.75 9.75 0 0 0-2.81-6.98Zm-7.01 15.14h-.01a8.16 8.16 0 0 1-4.16-1.14l-.3-.18-3.2.87.86-3.12-.2-.32a8.18 8.18 0 0 1-1.25-4.34c0-4.51 3.68-8.19 8.2-8.19 2.19 0 4.25.85 5.8 2.4a8.14 8.14 0 0 1 2.39 5.79c0 4.52-3.68 8.2-8.18 8.2Z" /></svg>; }

const rise = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.55, ease: 'easeOut' as const } };

type HomePageProps = { whatsappUrl: string; contactEmail: string };

export function HomePage({ whatsappUrl, contactEmail }: HomePageProps) {
  const productOffers: Offer[] = products.map((item) => ({ id: item.slug, imageSrc: item.image, imageAlt: item.title, tag: item.shortLabel, title: item.title, description: item.summary, brandLogoSrc: '/brand/favicon-192x192.png', brandName: 'Virtuagil', promoCode: item.category, href: `/solucoes/${item.slug}` }));

  return <main className="relative overflow-hidden">
    <div className="pointer-events-none absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(circle_at_top_left,rgba(214,134,66,0.14),transparent_34%),radial-gradient(circle_at_top_right,rgba(76,154,120,0.1),transparent_30%),linear-gradient(180deg,rgba(6,8,12,0.98),rgba(6,8,12,0))]" />
    <section className="relative pb-14 pt-12 md:pb-20 md:pt-20"><div className="mx-auto grid w-[min(1240px,calc(100%-32px))] items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
      <motion.div {...rise}><div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-300"><Sparkles className="h-3.5 w-3.5 text-[#d68642]" />Tecnologia em automacao</div>
        <h1 className="max-w-[12ch] text-5xl font-bold leading-[0.94] tracking-[-0.03em] text-white md:text-7xl">Automacao inteligente para empresas que querem fazer mais.</h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-stone-300 md:text-lg">Criamos solucoes com Inteligencia Artificial, automacao de processos e IoT para reduzir tarefas manuais, melhorar o atendimento e dar mais controle a sua operacao.</p>
        <div className="mt-8 flex flex-wrap gap-3"><Button asChild size="lg"><a href={whatsappUrl} target="_blank" rel="noreferrer"><WhatsAppIcon className="h-4 w-4" />Falar com a Jade</a></Button><Button asChild variant="secondary" size="lg"><Link href="/solucoes">Conhecer solucoes<ArrowRight className="h-4 w-4" /></Link></Button></div>
        <div className="mt-10 grid gap-3 md:grid-cols-3">{[
          [Bot, 'Atendente IA', 'Atendimento, qualificacao e follow-up no WhatsApp.'],
          [Workflow, 'Automacao de processos', 'Integramos sistemas e eliminamos tarefas repetitivas.'],
          [Cpu, 'Automacao IoT', 'Monitoramento e controle de equipamentos e ambientes.'],
        ].map(([Icon,title,desc]) => { const I = Icon as typeof Bot; return <div key={String(title)} className="rounded-[26px] border border-slate-500/40 bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(15,23,42,0.62))] px-5 py-5"><I className="mb-3 h-5 w-5 text-[#d68642]"/><h3 className="text-xl font-bold text-white">{String(title)}</h3><p className="mt-2 text-sm leading-7 text-stone-300">{String(desc)}</p></div>})}</div>
      </motion.div>
      <motion.div {...rise} transition={{...rise.transition,delay:.08}}><div className="relative rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,22,29,0.94),rgba(10,13,18,0.98))] p-4 shadow-[0_30px_120px_rgba(0,0,0,0.28)] md:p-6"><div className="overflow-hidden rounded-[24px] border border-white/10"><Image src="/solucoes/atendente-ia.svg" alt="Atendente IA da Virtuagil" width={1200} height={800} className="h-auto w-full object-cover" priority /></div><div className="mt-5 rounded-[28px] border border-white/10 bg-white/6 p-6"><div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d68642]">Conheca a Jade</div><h2 className="font-serif text-3xl text-white">Nossa IA tambem e nossa vendedora.</h2><p className="mt-3 text-sm leading-7 text-stone-300">Converse com a Jade e veja na pratica como o Atendente IA pode responder duvidas, identificar oportunidades e apoiar o atendimento da sua empresa.</p></div></div></motion.div>
    </div></section>

    <section className="py-10 md:py-16"><div className="mx-auto w-[min(1240px,calc(100%-32px))]"><motion.div {...rise}><div className="mb-7"><div className="text-sm uppercase tracking-[0.22em] text-stone-400">Solucoes Virtuagil</div><h2 className="mt-3 font-serif text-4xl text-white md:text-5xl">Automacao do atendimento ao mundo fisico.</h2><p className="mt-4 max-w-3xl text-sm leading-8 text-stone-300 md:text-base">Comece por um produto pronto, como o Atendente IA, ou fale conosco sobre uma automacao personalizada para o seu processo.</p></div><OfferCarousel offers={productOffers}/></motion.div></div></section>

    <section className="py-10 md:py-14"><div className="mx-auto w-[min(1240px,calc(100%-32px))]"><motion.div {...rise}><Card className="border-[#3a2c24] bg-[linear-gradient(135deg,#2a1f1b,#161c24)] text-white"><CardContent className="grid gap-6 lg:grid-cols-[1.1fr_auto] lg:items-center"><div><div className="text-sm uppercase tracking-[0.22em] text-stone-400">Atendente IA</div><h2 className="mt-3 max-w-[16ch] font-serif text-4xl leading-tight md:text-5xl">Seu WhatsApp atendendo mesmo quando voce nao esta disponivel.</h2><p className="mt-5 max-w-2xl text-sm leading-8 text-stone-300 md:text-base">A IA aprende as informacoes do seu negocio, responde clientes, identifica interessados, faz follow-up e chama uma pessoa quando o atendimento humano realmente e necessario.</p></div><Button asChild size="lg"><Link href="/solucoes/atendente-ia">Conhecer o Atendente IA<ArrowRight className="h-4 w-4"/></Link></Button></CardContent></Card></motion.div></div></section>

    <section className="pb-24 pt-10 md:pt-14"><div className="mx-auto w-[min(1240px,calc(100%-32px))]"><motion.div {...rise}><Card className="border-white/10 bg-[linear-gradient(135deg,#171d26,#10151c)]"><CardContent className="grid gap-6 lg:grid-cols-[1.1fr_auto] lg:items-center"><div><div className="text-sm uppercase tracking-[0.22em] text-stone-400">Vamos conversar</div><h2 className="mt-3 max-w-[15ch] font-serif text-4xl leading-tight text-white md:text-5xl">Qual parte do seu negocio ainda depende de trabalho manual demais?</h2><p className="mt-5 max-w-2xl text-sm leading-8 text-stone-300 md:text-base">A Jade pode mostrar como funciona o Atendente IA. Para outros projetos, nossa equipe avalia o processo e desenha uma automacao adequada a sua operacao.</p></div><div className="flex flex-wrap gap-3"><Button asChild size="lg"><a href={whatsappUrl} target="_blank" rel="noreferrer"><WhatsAppIcon className="h-4 w-4"/>Falar com a Jade</a></Button><Button asChild size="lg" variant="secondary"><a href={`mailto:${contactEmail}`}>{contactEmail}</a></Button></div></CardContent></Card></motion.div></div></section>
  </main>;
}
