import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { products } from '@/lib/products';

const whatsappUrl =
  process.env.NEXT_PUBLIC_WHATSAPP_URL ?? 'https://wa.me/5531999990000';
const monitorUrl =
  process.env.NEXT_PUBLIC_MONITOR_URL ?? 'https://monitor.virtuagil.com.br';

export default function SolucoesPage() {
  return (
    <main className="pb-20">
      <header className="relative z-40 border-b border-white/10 bg-[rgba(7,11,16,0.78)] backdrop-blur-xl">
        <div className="mx-auto grid min-h-[88px] w-[min(1240px,calc(100%-32px))] grid-cols-[auto_1fr_auto] items-center gap-4">
          <Link
            href="/"
            aria-label="Virtuagil"
            className="inline-flex flex-col items-start"
          >
            <Image
              src="/brand/logomarca.png"
              alt="Virtuagil"
              width={176}
              height={48}
              className="h-auto w-[158px] md:w-[176px]"
            />
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-400 md:text-[11px]">
              Tecnologia em automacao
            </span>
          </Link>

          <nav className="hidden justify-center gap-7 text-sm font-medium text-stone-400 md:flex">
            <Link href="/solucoes" className="text-white">
              Solucoes
            </Link>
            <Link href="/planos" className="transition hover:text-white">
              Planos
            </Link>
            <Link href="/contato" className="transition hover:text-white">
              Contato
            </Link>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Button asChild variant="secondary">
              <a href={monitorUrl} target="_blank" rel="noreferrer">
                Area do cliente
              </a>
            </Button>
            <Button asChild>
              <a href={whatsappUrl} target="_blank" rel="noreferrer">
                Falar com a Jade
              </a>
            </Button>
          </div>
        </div>
      </header>

      <section className="pt-12 md:pt-18">
        <div className="mx-auto grid w-[min(1240px,calc(100%-32px))] gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <div className="inline-flex rounded-full border border-white/10 bg-white/6 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-300">
              Solucoes modulares
            </div>
            <h1 className="mt-5 max-w-[11ch] font-serif text-5xl leading-[0.96] tracking-[-0.03em] text-white md:text-7xl">
              Produtos com contexto, clareza e profundidade comercial.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-300 md:text-lg">
              Cada modulo foi pensado para resolver um problema real da operacao
              e abrir espaco para crescimento sem obrigar o cliente a contratar
              tudo de uma vez.
            </p>
          </div>

          <Card className="border-white/10 bg-[linear-gradient(135deg,#171d26,#0f141b)] text-white">
            <CardContent>
              <div className="text-sm uppercase tracking-[0.22em] text-stone-400">
                Como vender melhor
              </div>
              <h2 className="mt-3 max-w-[14ch] font-serif text-4xl leading-tight">
                Uma explicacao simples para uma operacao mais inteligente.
              </h2>
              <ul className="mt-6 grid gap-3 text-sm leading-7 text-stone-300">
                {[
                  'Entramos pela dor principal da operacao',
                  'Transformamos tecnologia em ganho operacional perceptivel',
                  'Expandimos por modulos conforme a necessidade real',
                ].map((item) => (
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
        <div className="mx-auto grid w-[min(1240px,calc(100%-32px))] gap-5 lg:grid-cols-2">
          {products.map((product) => (
            <article
              key={product.slug}
              className="group relative min-h-[420px] overflow-hidden rounded-[32px] border border-white/10 bg-[#10171f]"
              style={{
                backgroundImage: `${product.image}, linear-gradient(180deg,#202632,#0e1319)`,
              }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,14,20,0.08),rgba(10,14,20,0.88))] transition duration-300 group-hover:bg-[linear-gradient(180deg,rgba(10,14,20,0.04),rgba(10,14,20,0.84))]" />
              <div className="relative flex h-full flex-col justify-end p-7 text-white">
                <div className="mb-3 inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/86 backdrop-blur-sm">
                  {product.category}
                </div>
                <h2 className="font-serif text-4xl">{product.title}</h2>
                <p className="mt-3 max-w-[28ch] text-sm leading-7 text-white/80">
                  {product.summary}
                </p>
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
                    Conheca o produto
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
