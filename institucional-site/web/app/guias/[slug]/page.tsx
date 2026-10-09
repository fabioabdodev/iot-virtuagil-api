import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, MessageCircleMore } from 'lucide-react';
import { guides, getGuide } from '@/lib/guides';
import { jadeWhatsappUrl } from '@/lib/jade-contact';

const base = 'https://www.virtuagil.com.br';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return guides.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return { robots: { index: false } };
  const canonical = '/guias/' + guide.slug;
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical },
    openGraph: {
      title: guide.title + ' | Virtuagil',
      description: guide.description,
      url: base + canonical,
      type: 'article',
      locale: 'pt_BR',
      images: [{ url: '/brand/logomarca.png', alt: 'Virtuagil — guias de automação e IA' }],
    },
  };
}

export default async function GuideDetailPage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();
  const url = base + '/guias/' + guide.slug;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': url + '#article',
        headline: guide.title,
        description: guide.description,
        inLanguage: 'pt-BR',
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        author: { '@id': base + '/#organization' },
        publisher: { '@id': base + '/#organization' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: base + '/' },
          { '@type': 'ListItem', position: 2, name: 'Guias', item: base + '/guias' },
          { '@type': 'ListItem', position: 3, name: guide.title, item: url },
        ],
      },
    ],
  };
  return (
    <main className="pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <article className="section-shell max-w-5xl pt-12 md:pt-20">
        <nav aria-label="Trilha de navegação" className="text-sm text-slate-400">
          <Link href="/" className="hover:text-white">Início</Link>
          <span aria-hidden="true"> / </span>
          <Link href="/guias" className="hover:text-white">Guias</Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">Artigo</span>
        </nav>
        <p className="mt-10 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Guia gratuito • Virtuagil</p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-white md:text-5xl">{guide.title}</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">{guide.summary}</p>
        <div className="mt-12 space-y-11 border-t border-white/10 pt-10">
          {guide.sections.map((section) => (
            <section key={section.title} aria-label={section.title}>
              <h2 className="font-display text-2xl font-semibold text-white md:text-3xl">{section.title}</h2>
              {section.paragraphs.map((p) => (
                <p key={p} className="mt-4 max-w-3xl text-base leading-8 text-slate-300">{p}</p>
              ))}
              {section.bullets && (
                <ul className="mt-5 list-disc space-y-3 pl-6 text-base leading-8 text-slate-300">
                  {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                </ul>
              )}
            </section>
          ))}
        </div>
        <section className="mt-14 border-t border-white/10 pt-10">
          <h2 className="font-display text-3xl font-semibold text-white">Perguntas frequentes</h2>
          <div className="mt-6 space-y-5">
            {guide.questions.map((item) => (
              <div key={item.question} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <h3 className="text-lg font-semibold text-white">{item.question}</h3>
                <p className="mt-3 leading-7 text-slate-300">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>
        <aside className="mt-14 rounded-[28px] border border-emerald-300/20 bg-emerald-300/[0.05] p-7">
          <h2 className="text-2xl font-semibold text-white">Conheça a solução Virtuagil</h2>
          <p className="mt-3 max-w-2xl text-slate-300">Entenda o que está disponível no produto e tire dúvidas antes de contratar.</p>
          <div className="mt-5 flex flex-wrap gap-6">
            <Link href={guide.related} className="inline-flex items-center gap-2 font-semibold text-emerald-300">
              Ver solução <ArrowRight className="h-4 w-4" />
            </Link>
            <a href={jadeWhatsappUrl()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold text-emerald-300">
              <MessageCircleMore className="h-4 w-4" /> Falar com a Jade
            </a>
          </div>
        </aside>
        <p className="mt-8 text-sm text-slate-400">
          <Link href="/guias" className="hover:text-emerald-300">Ver todos os guias</Link> · <Link href="/planos" className="hover:text-emerald-300">Planos da Jade</Link>
        </p>
      </article>
    </main>
  );
}
