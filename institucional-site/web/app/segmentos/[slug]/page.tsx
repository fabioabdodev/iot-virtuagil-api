import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, MessageCircleMore } from 'lucide-react';
import { segments, getSegment } from '@/lib/segments';
import { jadeWhatsappUrl } from '@/lib/jade-contact';

const base = 'https://www.virtuagil.com.br';
type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return segments.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = getSegment(slug);
  if (!s) return { robots: { index: false, follow: false } };
  const url = base + '/segmentos/' + slug;
  return {
    title: s.seoTitle,
    description: s.description,
    alternates: { canonical: '/segmentos/' + slug },
    openGraph: {
      title: s.seoTitle + ' | Virtuagil', description: s.description,
      url, type: 'website', locale: 'pt_BR',
      images: [{ url: '/brand/logomarca.png', alt: 'Jade Virtuagil - Atendimento com IA' }],
    },
  };
}

export default async function SegmentDetailPage({ params }: Props) {
  const { slug } = await params;
  const s = getSegment(slug);
  if (!s) notFound();
  const url = base + '/segmentos/' + s.slug;
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage', '@id': url + '#webpage', name: s.headline,
        url, description: s.description, inLanguage: 'pt-BR',
        isPartOf: { '@id': base + '/#website' },
        about: { '@id': base + '/solucoes/atendente-ia' },
      },
      {
        '@type': 'Service',
        '@id': url + '#service',
        name: s.seoTitle,
        description: s.description,
        provider: { '@id': base + '/#organization' },
        serviceType: 'Configuração de assistente de IA para atendimento WhatsApp',
        areaServed: { '@type': 'Country', name: 'Brasil' },
        url,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: base + '/' },
          { '@type': 'ListItem', position: 2, name: 'Segmentos', item: base + '/segmentos' },
          { '@type': 'ListItem', position: 3, name: s.name, item: url },
        ],
      },
    ],
  };
  return (
    <main className="pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      <article className="section-shell max-w-5xl pt-12 md:pt-20">
        <nav aria-label="Trilha de navegação" className="text-sm text-slate-400">
          <Link href="/" className="hover:text-white">Início</Link>
          <span aria-hidden="true"> / </span>
          <Link href="/segmentos" className="hover:text-white">Segmentos</Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">{s.name}</span>
        </nav>
        <p className="mt-9 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Jade • Atendimento com IA no WhatsApp</p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-white md:text-5xl">{s.headline}</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">{s.intro}</p>
        <section className="mt-12">
          <h2 className="font-display text-3xl font-semibold text-white">O desafio no dia a dia</h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">{s.problem}</p>
        </section>
        <section className="mt-12">
          <h2 className="font-display text-3xl font-semibold text-white">Onde a Jade pode ajudar</h2>
          <ul className="mt-6 grid gap-3 md:grid-cols-2">
            {s.examples.map(item => (
              <li key={item} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-sm leading-7 text-slate-200">{item}</li>
            ))}
          </ul>
        </section>
        <section className="mt-14">
          <h2 className="font-display text-3xl font-semibold text-white">Exemplo de atendimento</h2>
          <ol className="mt-7 grid gap-5 md:grid-cols-2">
            {s.flow.map((step, i) => (
              <li key={step.title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                <span className="text-sm font-bold text-emerald-300">Passo {i + 1}</span>
                <h3 className="mt-2 text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{step.detail}</p>
              </li>
            ))}
          </ol>
        </section>
        <section className="mt-14">
          <h2 className="font-display text-3xl font-semibold text-white">Personalização sem começar do zero</h2>
          {s.details.map(p => <p key={p} className="mt-4 max-w-3xl text-base leading-8 text-slate-300">{p}</p>)}
          <div className="mt-7 rounded-2xl border border-amber-300/20 bg-amber-300/[0.045] p-6">
            <h3 className="text-lg font-semibold text-white">Cuidados e limites importantes</h3>
            <p className="mt-3 leading-7 text-slate-300">{s.precautions}</p>
          </div>
        </section>
        <section className="mt-14">
          <h2 className="font-display text-3xl font-semibold text-white">Perguntas frequentes</h2>
          <div className="mt-6 space-y-4">
            {s.questions.map(item => (
              <div key={item.question} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                <h3 className="text-lg font-semibold text-white">{item.question}</h3>
                <p className="mt-3 leading-7 text-slate-300">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>
        <aside className="mt-14 rounded-[28px] border border-emerald-300/20 bg-emerald-300/[0.05] p-7 md:p-9">
          <h2 className="font-display text-2xl font-semibold text-white">Como ficaria no seu negócio?</h2>
          <p className="mt-3 max-w-2xl text-slate-300 leading-7">A Jade pode explicar o Plano 500 e os módulos opcionais. Conte seu tipo de atendimento e confirme com a Virtuagil o que precisa ser configurado antes da implantação.</p>
          <div className="mt-6 flex flex-wrap gap-6">
            <a href={jadeWhatsappUrl()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold text-emerald-300">
              <MessageCircleMore className="h-5 w-5" /> Falar com a Jade
            </a>
            <Link href="/planos" className="inline-flex items-center gap-2 font-semibold text-white">
              Ver planos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </aside>
        <p className="mt-8 text-sm text-slate-400">
          <Link href="/segmentos" className="hover:text-white">Outros segmentos</Link> ·{' '}
          <Link href={s.relatedGuide} className="hover:text-white">Leia nosso guia relacionado</Link> ·{' '}
          <Link href="/solucoes/atendente-ia" className="hover:text-white">Conheça a Jade</Link>
        </p>
      </article>
    </main>
  );
}
