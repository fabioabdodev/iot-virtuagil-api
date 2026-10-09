import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, MessageCircleMore } from 'lucide-react';
import { segments } from '@/lib/segments';
import { jadeWhatsappUrl } from '@/lib/jade-contact';

const base = 'https://www.virtuagil.com.br';
export const metadata: Metadata = {
  title: 'Assistente de IA por Segmento: Negócios e Agenda',
  description: 'Conheça aplicações da Jade para clínicas de estética, odontologia, salões, lojas, profissionais liberais e prestadores de serviços. Atendimento e vendas no WhatsApp.',
  alternates: { canonical: '/segmentos' },
  openGraph: {
    title: 'Assistente IA por segmento | Virtuagil',
    description: 'IA para WhatsApp, atendimento, agendamento e qualificação de interessados em diferentes negócios.',
    url: base + '/segmentos',
    images: [{ url: '/brand/logomarca.png', alt: 'Virtuagil - Jade por segmento' }],
  },
};
export default function SegmentsPage() {
  const schema = {
    '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': base + '/segmentos#webpage',
    name: 'Segmentos atendidos pela Jade Virtuagil', url: base + '/segmentos',
    inLanguage: 'pt-BR',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: segments.map((s, i) => ({
        '@type': 'ListItem', position: i + 1, name: s.name, url: base + '/segmentos/' + s.slug,
      })),
    },
  };
  return (
    <main className="pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="section-shell pt-14 md:pt-20">
        <p className="eyebrow">Jade para diferentes negócios</p>
        <h1 className="mt-5 max-w-4xl font-display text-4xl font-semibold tracking-tight text-white md:text-6xl">
          Assistente de IA no WhatsApp adaptado ao seu segmento
        </h1>
        <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300">
          Sua empresa precisa responder mais rápido, captar interessados, agendar horários ou organizar pedidos de orçamento?
          O mesmo núcleo da Jade pode ser configurado com os serviços, regras e informações de cada negócio, com acompanhamento humano sempre que necessário.
        </p>
        <div className="mt-9 rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.045] p-5 text-sm leading-7 text-slate-200">
          <strong>Como funciona a personalização:</strong> começamos pelas perguntas recorrentes, definimos informações autorizadas,
          ativamos módulos como Agenda quando necessários e testamos os encaminhamentos. Disponibilidade, preços, estoque e integrações externas
          só são confirmados quando existem dados atualizados e conexões homologadas.
        </div>
        <section aria-label="Setores e casos de uso" className="mt-10 grid gap-5 md:grid-cols-2">
          {segments.map(s => (
            <article key={s.slug} className="rounded-[26px] border border-white/10 bg-white/[0.03] p-6 md:p-7">
              <h2 className="font-display text-2xl font-semibold text-white">
                <Link href={'/segmentos/' + s.slug} className="hover:text-emerald-300">{s.name}</Link>
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{s.intro}</p>
              <Link href={'/segmentos/' + s.slug} className="mt-5 inline-flex items-center gap-2 font-semibold text-emerald-300">
                Como a Jade pode ajudar <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </section>
        <section className="mt-12 rounded-[28px] border border-white/10 bg-white/[0.04] p-7 md:p-9">
          <h2 className="font-display text-2xl font-semibold text-white">Seu segmento não apareceu na lista?</h2>
          <p className="mt-3 max-w-3xl text-slate-300 leading-7">A Virtuagil também avalia operações de hospedagem, alimentação, atendimento comercial e outros serviços. Conte à Jade como você atende hoje; podemos avaliar uma adaptação sem prometer recursos antes de verificar o escopo.</p>
          <div className="mt-6 flex flex-wrap gap-6">
            <a href={jadeWhatsappUrl()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold text-emerald-300">
              <MessageCircleMore className="h-5 w-5" /> Falar com a Jade
            </a>
            <Link href="/planos" className="font-semibold text-white hover:text-emerald-300">Ver planos e preços</Link>
            <Link href="/guias" className="font-semibold text-white hover:text-emerald-300">Ler guias gratuitos</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
