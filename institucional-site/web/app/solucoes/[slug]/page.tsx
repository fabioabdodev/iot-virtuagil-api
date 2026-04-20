import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ShieldCheck } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getProductBySlug, products } from '@/lib/products';

const whatsappUrl =
  process.env.NEXT_PUBLIC_WHATSAPP_URL ?? 'https://wa.me/5531999990000';

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {};
  }

  return {
    title: `Virtuagil | ${product.title}`,
    description: product.summary,
    alternates: {
      canonical: `/solucoes/${product.slug}`,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="pb-20">
      <section className="pt-12 md:pt-18">
        <div className="mx-auto grid w-[min(1240px,calc(100%-32px))] gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <Link
              href="/solucoes"
              className="inline-flex items-center gap-2 text-sm font-medium text-stone-400 transition hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar para solucoes
            </Link>

            <div className="mt-6 inline-flex rounded-full border border-white/10 bg-white/6 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-300">
              {product.category}
            </div>
            <h1 className="mt-5 max-w-[11ch] font-serif text-5xl leading-[0.96] tracking-[-0.03em] text-white md:text-7xl">
              {product.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-300 md:text-lg">
              {product.subtitle}
            </p>
          </div>

          <article
            className="relative min-h-[380px] overflow-hidden rounded-[32px] border border-white/10 bg-[#10171f]"
            style={{
              backgroundImage: `${product.image}, linear-gradient(180deg,#202632,#0e1319)`,
            }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,14,20,0.06),rgba(10,14,20,0.82))]" />
            <div className="relative flex h-full flex-col justify-end p-7 text-white">
              <div className="inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/86 backdrop-blur-sm">
                {product.shortLabel}
              </div>
              <p className="mt-4 max-w-[30ch] text-sm leading-7 text-white/80">
                {product.cardDescription}
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="pt-10 md:pt-14">
        <div className="mx-auto grid w-[min(1240px,calc(100%-32px))] gap-5 lg:grid-cols-[1.02fr_0.98fr]">
          <Card className="border-white/10 bg-[linear-gradient(180deg,#161c24,#0f141b)] text-white">
            <CardContent>
              <div className="text-sm uppercase tracking-[0.22em] text-stone-400">
                Visao geral
              </div>
              <h2 className="mt-3 font-serif text-4xl leading-tight">
                O que esse modulo resolve
              </h2>
              <p className="mt-5 text-sm leading-8 text-stone-300">
                {product.detailIntro}
              </p>
              <p className="mt-5 text-sm leading-8 text-stone-300">
                {product.summary}
              </p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[linear-gradient(180deg,#141a22,#10151c)] text-white">
            <CardContent>
              <div className="text-sm uppercase tracking-[0.22em] text-stone-400">
                Entregas
              </div>
              <h2 className="mt-3 font-serif text-4xl leading-tight">
                O que entra na proposta
              </h2>
              <ul className="mt-6 grid gap-3 text-sm leading-7 text-stone-300">
                {product.deliverables.map((item) => (
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
        <div className="mx-auto grid w-[min(1240px,calc(100%-32px))] gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="border-white/10 bg-[linear-gradient(180deg,#161c24,#0f141b)] text-white">
            <CardContent>
              <div className="text-sm uppercase tracking-[0.22em] text-stone-400">
                Segmentos com mais aderencia
              </div>
              <h2 className="mt-3 font-serif text-4xl leading-tight">
                Onde esse modulo tende a gerar mais valor
              </h2>
              <ul className="mt-6 grid gap-3 text-sm leading-7 text-stone-300">
                {product.segments.map((segment) => (
                  <li key={segment} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#d9a25f]" />
                    <span>{segment}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-[#3a2c24] bg-[linear-gradient(135deg,#2a1f1b,#161c24)] text-white shadow-[0_30px_90px_rgba(0,0,0,0.22)]">
            <CardContent>
              <div className="text-sm uppercase tracking-[0.22em] text-stone-400">
                Proximo passo
              </div>
              <h2 className="mt-3 max-w-[14ch] font-serif text-4xl leading-tight">
                Vamos entender se {product.title.toLowerCase()} faz sentido para
                a sua operacao.
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-8 text-stone-300 md:text-base">
                Podemos conversar sobre contexto, urgencia, estrutura atual e o
                melhor formato para comecar com clareza comercial e ganho
                operacional perceptivel.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
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
