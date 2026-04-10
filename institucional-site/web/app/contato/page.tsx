import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Mail,
  MapPin,
  MessageCircleMore,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const whatsappUrl =
  process.env.NEXT_PUBLIC_WHATSAPP_URL ?? 'https://wa.me/5531999990000';
const contactEmail =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'contato@virtuagil.com.br';

export default function ContatoPage() {
  return (
    <main className="pb-20">
      <header className="sticky top-0 z-40 border-b border-black/5 bg-[rgba(255,248,241,0.82)] backdrop-blur-xl">
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
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-500 md:text-[11px]">
              Tecnologia em automacao
            </span>
          </Link>

          <nav className="hidden justify-center gap-7 text-sm font-medium text-stone-600 md:flex">
            <Link href="/solucoes" className="transition hover:text-stone-950">
              Solucoes
            </Link>
            <Link href="/planos" className="transition hover:text-stone-950">
              Planos
            </Link>
            <Link href="/contato" className="text-stone-950">
              Contato
            </Link>
          </nav>

          <Button asChild className="hidden md:inline-flex">
            <a href={whatsappUrl} target="_blank" rel="noreferrer">
              Falar com a Jade
            </a>
          </Button>
        </div>
      </header>

      <section className="pt-12 md:pt-18">
        <div className="mx-auto grid w-[min(1240px,calc(100%-32px))] gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <div className="inline-flex rounded-full border border-black/8 bg-white/72 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-600">
              Contato comercial
            </div>
            <h1 className="mt-5 max-w-[10ch] font-serif text-5xl leading-[0.96] tracking-[-0.03em] text-stone-950 md:text-7xl">
              Vamos entender sua operacao e montar o proximo passo.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-600 md:text-lg">
              Se voce quer reduzir custo operacional, melhorar visibilidade ou
              avaliar por onde comecar, a Jade pode abrir a conversa e orientar
              a melhor entrada comercial para o seu caso.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href={whatsappUrl} target="_blank" rel="noreferrer">
                  Falar com a Jade
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <a href={`mailto:${contactEmail}`}>Enviar e-mail</a>
              </Button>
            </div>
          </div>

          <Card className="bg-[linear-gradient(135deg,#fff8f1,#fff1e6)] shadow-[0_24px_80px_rgba(161,94,41,0.12)]">
            <CardContent className="grid gap-4">
              <div className="rounded-[24px] border border-black/6 bg-white/76 p-5">
                <div className="mb-3 inline-flex rounded-full bg-[#fff1e7] p-3 text-[#e57a41]">
                  <MessageCircleMore className="h-5 w-5" />
                </div>
                <h2 className="font-serif text-3xl text-stone-950">
                  Atendimento inicial com linguagem simples
                </h2>
                <p className="mt-3 text-sm leading-7 text-stone-600">
                  A conversa comeca leve, humana e objetiva. Primeiro entendemos
                  sua operacao. Depois, sugerimos o melhor caminho.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {[
                  {
                    icon: Phone,
                    label: 'WhatsApp',
                    value: 'Atendimento rapido',
                  },
                  {
                    icon: Mail,
                    label: 'E-mail',
                    value: contactEmail,
                  },
                  {
                    icon: MapPin,
                    label: 'Atuacao',
                    value: 'Projetos locais e regionais',
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="rounded-[22px] border border-black/6 bg-white/72 p-4"
                    >
                      <Icon className="h-4 w-4 text-[#1f845a]" />
                      <div className="mt-3 text-[11px] uppercase tracking-[0.18em] text-stone-500">
                        {item.label}
                      </div>
                      <div className="mt-2 text-sm font-semibold text-stone-900">
                        {item.value}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="pt-10 md:pt-14">
        <div className="mx-auto w-[min(1240px,calc(100%-32px))]">
          <Card className="bg-[linear-gradient(135deg,#284336,#1f352b)] text-white shadow-[0_28px_90px_rgba(31,52,43,0.24)]">
            <CardContent className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="text-sm uppercase tracking-[0.22em] text-white/70">
                  Antes da proposta
                </div>
                <h2 className="mt-3 max-w-[14ch] font-serif text-4xl leading-tight md:text-5xl">
                  Entendemos sua necessidade antes de empurrar uma solucao.
                </h2>
                <p className="mt-5 max-w-2xl text-sm leading-8 text-white/78 md:text-base">
                  Podemos conversar sobre temperatura, gases, acionamentos,
                  consumo ou um desenho sob medida. O foco e montar algo que
                  faca sentido para sua operacao de verdade.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  variant="ghost"
                  className="bg-white text-[#1f352b] hover:bg-white/92"
                >
                  <a href={whatsappUrl} target="_blank" rel="noreferrer">
                    Falar com a Jade
                  </a>
                </Button>
                <Button
                  asChild
                  variant="secondary"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/14"
                >
                  <Link href="/solucoes">Ver solucoes</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
