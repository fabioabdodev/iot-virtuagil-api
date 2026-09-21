import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronLeft,
  MessageCircleMore,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getProductBySlug, products } from '@/lib/products';

const whatsappUrl =
  process.env.NEXT_PUBLIC_WHATSAPP_URL ?? 'https://wa.me/553171029727';

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
  if (!product) return {};

  const canonical = `/solucoes/${product.slug}`;

  return {
    title: product.title,
    description: product.summary,
    alternates: { canonical },
    openGraph: {
      title: `${product.title} | Virtuagil`,
      description: product.summary,
      url: `https://www.virtuagil.com.br${canonical}`,
      type: 'website',
    },
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const isAssistenteIa = product.slug === 'atendente-ia';
  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: product.title,
    description: product.summary,
    provider: {
      '@type': 'Organization',
      name: 'Virtuagil',
      url: 'https://www.virtuagil.com.br',
    },
    url: `https://www.virtuagil.com.br/solucoes/${product.slug}`,
  };

  return (
    <main className="pb-16 md:pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />

      <section className="relative py-14 md:py-20">
        <div className="glow-orb right-[-120px] top-[10px] h-[320px] w-[320px] bg-emerald-400/10" />
        <div className="section-shell grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <Link
              href="/solucoes"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar para soluções
            </Link>

            <div className="mt-6 eyebrow">{product.category}</div>

            <h1 className="mt-5 max-w-[12ch] font-display text-5xl font-semibold leading-[0.96] tracking-[-0.04em] text-white md:text-6xl">
              {product.title}
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
              {product.subtitle}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {isAssistenteIa ? (
                <>
                  <Button asChild size="lg">
                    <Link href="/contratar-assistente-ia">
                      Contratar Assistente de IA
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="secondary">
                    <a href={whatsappUrl} target="_blank" rel="noreferrer">
                      <MessageCircleMore className="h-4 w-4" />
                      Falar no WhatsApp
                    </a>
                  </Button>
                </>
              ) : (
                <Button asChild size="lg">
                  <a href={whatsappUrl} target="_blank" rel="noreferrer">
                    Falar com a Virtuagil
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>

          <article
            className="relative min-h-[390px] overflow-hidden rounded-[32px] border border-white/[0.08] bg-[#0b1219] shadow-[0_30px_100px_rgba(0,0,0,0.3)]"
            style={{
              backgroundImage: `url(${product.image}), linear-gradient(180deg,#15202c,#081017)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,12,0.1),rgba(4,8,12,0.9))]" />
            <div className="relative flex min-h-[390px] flex-col justify-end p-7">
              <div className="inline-flex w-fit rounded-full border border-white/15 bg-black/30 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/85 backdrop-blur-md">
                {product.shortLabel}
              </div>
              <p className="mt-4 max-w-[36ch] text-sm leading-7 text-white/80">
                {product.cardDescription}
              </p>
            </div>
          </article>
        </div>
      </section>

      {isAssistenteIa && (
        <section className="py-8 md:py-12">
          <div className="section-shell">
            <div className="mb-7 max-w-3xl">
              <div className="eyebrow">Como funciona</div>
              <h2 className="mt-5 font-display text-4xl font-semibold tracking-[-0.035em] text-white md:text-5xl">
                Da primeira mensagem ao atendimento humano quando necessário.
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: MessageCircleMore,
                  title: 'Responde e orienta',
                  text: 'Atende no WhatsApp com base nas informações, produtos, serviços e regras da sua empresa.',
                },
                {
                  icon: UserCheck,
                  title: 'Identifica oportunidades',
                  text: 'Reconhece interesse, registra o contato e conduz follow-up quando fizer sentido.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Chama uma pessoa',
                  text: 'Quando o cliente pedir atendimento humano ou a situação exigir, a conversa é transferida.',
                },
              ].map(({ icon: Icon, title, text }) => (
                <Card key={title} className="h-full">
                  <CardContent className="h-full">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.07]">
                      <Icon className="h-5 w-5 text-emerald-300" />
                    </div>
                    <h3 className="mt-5 text-xl font-bold text-white">{title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-400">{text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-10 md:py-14">
        <div className="section-shell grid gap-5 lg:grid-cols-2">
          <Card>
            <CardContent>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Visão geral
              </div>
              <h2 className="mt-3 font-display text-3xl font-semibold text-white">
                O que essa solução resolve
              </h2>
              <p className="mt-5 text-sm leading-8 text-slate-400">
                {product.detailIntro}
              </p>
              <p className="mt-4 text-sm leading-8 text-slate-400">{product.summary}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Entregas
              </div>
              <h2 className="mt-3 font-display text-3xl font-semibold text-white">
                O que entra na solução
              </h2>
              <ul className="mt-6 grid gap-3 text-sm leading-7 text-slate-300">
                {product.deliverables.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 h-4 w-4 flex-none text-emerald-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="section-shell grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardContent>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Mais aderência
              </div>
              <h2 className="mt-3 font-display text-3xl font-semibold text-white">
                Onde essa solução tende a gerar mais valor
              </h2>
              <ul className="mt-6 grid gap-3 text-sm leading-7 text-slate-300">
                {product.segments.map((segment) => (
                  <li key={segment} className="flex items-start gap-3">
                    <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    <span>{segment}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="relative overflow-hidden rounded-[30px] border border-emerald-300/15 bg-[linear-gradient(135deg,rgba(12,53,42,0.95),rgba(7,19,28,0.98))] p-7 shadow-[0_30px_90px_rgba(0,0,0,0.28)]">
            <div className="absolute right-[-80px] top-[-80px] h-[240px] w-[240px] rounded-full bg-emerald-300/10 blur-3xl" />
            <div className="relative">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-100/60">
                Próximo passo
              </div>

              <h2 className="mt-3 max-w-[16ch] font-display text-4xl font-semibold leading-tight text-white">
                {isAssistenteIa
                  ? 'Pronto para colocar o Assistente de IA na sua operação?'
                  : `Vamos entender se ${product.title.toLowerCase()} faz sentido para sua operação.`}
              </h2>

              <p className="mt-5 max-w-2xl text-sm leading-8 text-slate-300">
                {isAssistenteIa
                  ? 'O plano atual é semestral, inclui até 500 atendimentos por mês e pode ser contratado diretamente pelo site. Se preferir, fale conosco pelo WhatsApp antes de contratar.'
                  : 'Conte o contexto da sua empresa e a Virtuagil avalia escopo, prioridade e o melhor formato para começar.'}
              </p>

              {isAssistenteIa && (
                <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="flex items-center gap-3">
                    <Bot className="h-5 w-5 text-emerald-300" />
                    <div>
                      <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                        Plano semestral
                      </div>
                      <div className="mt-1 text-2xl font-bold text-white">R$ 1.794</div>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-slate-400">
                    Até 500 atendimentos/mês • Pix ou cartão • até 6x no checkout.
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                {isAssistenteIa ? (
                  <>
                    <Button asChild size="lg">
                      <Link href="/contratar-assistente-ia">
                        Contratar Assistente de IA
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="secondary">
                      <a href={whatsappUrl} target="_blank" rel="noreferrer">
                        Falar no WhatsApp
                      </a>
                    </Button>
                  </>
                ) : (
                  <Button asChild size="lg">
                    <a href={whatsappUrl} target="_blank" rel="noreferrer">
                      Falar com a equipe
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
