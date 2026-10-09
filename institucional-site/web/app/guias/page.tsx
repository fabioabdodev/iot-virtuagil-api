import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, MessageCircleMore } from 'lucide-react';
import { guides } from '@/lib/guides';
import { jadeWhatsappUrl } from '@/lib/jade-contact';

export const metadata: Metadata = {
  title: 'Guias de IA no WhatsApp, Agenda, Hospedagem e IoT',
  description: 'Guias gratuitos da Virtuagil sobre atendimento com IA, agendamento por WhatsApp, reservas para pousadas e sensores IoT. Conheça soluções e cuidados.',
  alternates: { canonical: '/guias' },
  openGraph: {
    title: 'Guias práticos de automação e IA | Virtuagil',
    description: 'Conteúdo para entender atendimento no WhatsApp, Agenda, Hospedagem e monitoramento IoT.',
    url: 'https://www.virtuagil.com.br/guias',
    images: [{ url: '/brand/logomarca.png', alt: 'Virtuagil — IA e automação' }],
  },
};

export default function GuidesPage() {
  const base = 'https://www.virtuagil.com.br';
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': base + '/guias#webpage',
    url: base + '/guias',
    name: 'Guias práticos de IA e automação | Virtuagil',
    inLanguage: 'pt-BR',
    isPartOf: { '@id': base + '/#website' },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: guides.map((guide, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: guide.title,
        url: base + '/guias/' + guide.slug,
      })),
    },
  };
  return (
    <main className="pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="section-shell pt-14 md:pt-20">
        <div className="eyebrow">Conteúdos gratuitos • Virtuagil</div>
        <h1 className="mt-5 max-w-4xl font-display text-4xl font-semibold tracking-tight text-white md:text-6xl">
          Guias práticos de IA, WhatsApp e automação para empresas
        </h1>
        <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300">
          Saiba como organizar o atendimento, implantar uma agenda sem conflitos, receber pedidos de hospedagem e monitorar equipamentos com sensores. Sem promessas exageradas e com cuidados que fazem diferença na operação.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {guides.map((guide) => (
            <article key={guide.slug} className="rounded-[28px] border border-white/10 bg-white/[0.035] p-6 md:p-8">
              <BookOpen className="h-7 w-7 text-emerald-300" aria-hidden="true" />
              <h2 className="mt-5 font-display text-2xl font-semibold text-white">
                <Link href={`/guias/${guide.slug}`} className="hover:text-emerald-300">{guide.title}</Link>
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">{guide.summary}</p>
              <Link href={`/guias/${guide.slug}`} className="mt-6 inline-flex items-center gap-2 font-semibold text-emerald-300 hover:text-emerald-200">
                Ler guia <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
        <div className="mt-12 rounded-[28px] border border-emerald-300/20 bg-emerald-300/[0.05] p-7">
          <h2 className="text-2xl font-semibold text-white">Quer entender o que faz sentido para sua empresa?</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">A Jade pode explicar os planos e mostrar os próximos passos para uma implantação responsável.</p>
          <a href={jadeWhatsappUrl()} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 font-semibold text-emerald-300">
            <MessageCircleMore className="h-5 w-5" aria-hidden="true" /> Falar com a Jade
          </a>
        </div>
      </div>
    </main>
  );
}
