import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ArrowRight,
  Bot,
  Check,
  Cpu,
  CreditCard,
  Sparkles,
  Workflow,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const whatsappUrl =
  process.env.NEXT_PUBLIC_WHATSAPP_URL ?? 'https://wa.me/553171029727';

const founderMessage = encodeURIComponent(
  'Olá! Quero uma das vagas do Plano Fundador do Atendente IA por R$ 249/mês.',
);
const founderWhatsappUrl = `${whatsappUrl}?text=${founderMessage}`;

export const metadata: Metadata = {
  title: 'Planos e Contratacao',
  description:
    'Contrate o Atendente IA da Virtuagil com preco de lancamento. Automacao de processos e IoT seguem com proposta conforme escopo.',
  alternates: { canonical: '/planos' },
  openGraph: {
    title: 'Planos e Contratacao | Virtuagil',
    description:
      'Atendente IA com preco fundador para os primeiros clientes, alem de automacoes sob medida e projetos IoT.',
    url: 'https://www.virtuagil.com.br/planos',
  },
};

const offers = [
  {
    icon: Bot,
    name: 'Atendente IA',
    subtitle: 'Produto principal',
    text: 'Atendimento inteligente no WhatsApp para responder, qualificar, acompanhar interessados e transferir para uma pessoa quando necessario.',
    bullets: [
      'IA configurada com as informacoes da sua empresa',
      'Qualificacao e follow-up automatico',
      'Transferencia para atendimento humano',
      'Dashboard de contatos, uso e resultados',
    ],
    featured: true,
    href: '/solucoes/atendente-ia',
  },
  {
    icon: Workflow,
    name: 'Automacao de Processos',
    subtitle: 'Projeto sob medida',
    text: 'Para integrar sistemas, APIs e rotinas e reduzir tarefas manuais que consomem tempo da equipe.',
    bullets: [
      'Mapeamento do processo',
      'Integracoes entre sistemas e APIs',
      'Rotinas, gatilhos e notificacoes automaticas',
      'Escopo definido conforme a necessidade real',
    ],
    href: '/solucoes/automacao-processos',
  },
  {
    icon: Cpu,
    name: 'Automacao IoT',
    subtitle: 'Sob consulta',
    text: 'Projetos para monitorar temperatura, gases, consumo, equipamentos e outras variaveis da operacao.',
    bullets: [
      'Preco conforme hardware e quantidade de pontos',
      'Monitoramento, alertas e historico',
      'Acionamentos e controle quando aplicavel',
      'Projeto dimensionado para cada operacao',
    ],
    href: '/solucoes',
  },
];

export default function PlanosPage() {
  return (
    <main className="pb-20">
      <section className="pt-12 md:pt-18">
        <div className="mx-auto grid w-[min(1240px,calc(100%-32px))] gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-300">
              <Sparkles className="h-3.5 w-3.5 text-[#d68642]" />
              Planos e contratacao
            </div>
            <h1 className="mt-5 max-w-[12ch] font-serif text-5xl leading-[0.96] tracking-[-0.03em] text-white md:text-7xl">
              Comece pequeno. Automatize o atendimento que mais toma seu tempo.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-300 md:text-lg">
              O Atendente IA tem uma oferta de entrada simples para pequenos negocios e profissionais. Projetos de IoT continuam sendo dimensionados conforme hardware, instalacao e escopo.
            </p>
          </div>

          <Card className="border-[#6a4a31] bg-[linear-gradient(135deg,#211a17,#10151c)] shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
            <CardContent>
              <div className="text-sm uppercase tracking-[0.22em] text-[#d68642]">Preco fundador</div>
              <h2 className="mt-3 max-w-[15ch] font-serif text-4xl leading-tight text-white">
                10 vagas para validar a operacao junto com a Virtuagil.
              </h2>
              <p className="mt-5 text-sm leading-8 text-stone-300">
                Uma condicao de lancamento para os primeiros clientes do Atendente IA, com implantacao gratuita e limite de uso claro.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-semibold text-stone-300">
                <CreditCard className="h-4 w-4 text-[#d68642]" />
                Pagamento seguro via Mercado Pago
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="pt-10 md:pt-14">
        <div className="mx-auto w-[min(1240px,calc(100%-32px))]">
          <Card className="overflow-hidden border-[#6a4a31] bg-[linear-gradient(135deg,#241a15,#121821)] shadow-[0_32px_110px_rgba(0,0,0,0.28)]">
            <CardContent className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <div className="inline-flex rounded-full bg-[#d68642]/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#e5a266]">
                  Apenas 10 clientes no lancamento
                </div>
                <h2 className="mt-5 font-serif text-4xl leading-tight text-white md:text-5xl">
                  Atendente IA — Plano Fundador
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-300 md:text-base">
                  Para autonomos e pequenos negocios que querem responder mais rapido, acompanhar interessados e ter atendimento humano quando necessario.
                </p>

                <ul className="mt-7 grid gap-3 text-sm text-stone-200 sm:grid-cols-2">
                  {[
                    'Ate 500 atendimentos por mes',
                    '1 numero de WhatsApp',
                    'IA personalizada para o negocio',
                    'Follow-up automatico',
                    'Transferencia para atendimento humano',
                    'Dashboard de contatos e resultados',
                    'Configuracao inicial inclusa',
                    'Suporte da Virtuagil',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 flex-none text-[#4c9a78]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-6 md:p-8">
                <div className="text-sm text-stone-400">Preco de lancamento</div>
                <div className="mt-2 flex items-end gap-2">
                  <span className="font-serif text-6xl leading-none text-white">R$ 249</span>
                  <span className="pb-1 text-sm text-stone-400">/mes</span>
                </div>
                <div className="mt-3 text-sm font-semibold text-[#7fc6a4]">Implantacao gratuita para as 10 primeiras vagas</div>
                <p className="mt-5 text-xs leading-6 text-stone-400">
                  Condicao especial de validacao inicial. Acima de 500 atendimentos mensais, a Virtuagil avalia o plano adequado para o volume da operacao.
                </p>

                <div className="mt-7 grid gap-3">
                  <Button asChild size="lg" className="w-full">
                    <a href={founderWhatsappUrl} target="_blank" rel="noreferrer">
                      Quero uma das 10 vagas
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button asChild size="lg" variant="secondary" className="w-full">
                    <Link href="/pagamento">Ja tenho meu codigo de cliente</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="pt-10 md:pt-14">
        <div className="mx-auto grid w-[min(1240px,calc(100%-32px))] gap-4 lg:grid-cols-3">
          {offers.map((offer) => {
            const Icon = offer.icon;
            return (
              <Card
                key={offer.name}
                className={
                  offer.featured
                    ? 'border-[#6a4a31] bg-[linear-gradient(180deg,#211a17,#121821)] shadow-[0_24px_70px_rgba(0,0,0,0.24)]'
                    : 'border-white/10 bg-[linear-gradient(180deg,#171d26,#10151c)]'
                }
              >
                <CardContent className="flex h-full flex-col">
                  <div className="flex items-center justify-between gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/6 p-3">
                      <Icon className="h-5 w-5 text-[#d68642]" />
                    </div>
                    <div className="rounded-full bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-300">
                      {offer.subtitle}
                    </div>
                  </div>
                  <h2 className="mt-5 font-serif text-4xl text-white">{offer.name}</h2>
                  <p className="mt-4 text-sm leading-7 text-stone-300">{offer.text}</p>
                  <ul className="mt-6 grid gap-3 text-sm text-stone-300">
                    {offer.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-3">
                        <Check className="mt-0.5 h-4 w-4 flex-none text-[#4c9a78]" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-7">
                    <Button asChild variant={offer.featured ? 'primary' : 'secondary'}>
                      <Link href={offer.href}>
                        Ver detalhes
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="pt-10 md:pt-14">
        <div className="mx-auto w-[min(1240px,calc(100%-32px))]">
          <Card className="overflow-hidden border-white/10 bg-[linear-gradient(135deg,#171d26,#10151c)] shadow-[0_32px_110px_rgba(0,0,0,0.24)]">
            <CardContent className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="text-sm uppercase tracking-[0.22em] text-stone-400">Quer conhecer melhor?</div>
                <h2 className="mt-3 max-w-[15ch] font-serif text-4xl leading-tight text-white md:text-5xl">
                  Fale com a Virtuagil sobre o Atendente IA.
                </h2>
                <p className="mt-5 max-w-2xl text-sm leading-8 text-stone-300 md:text-base">
                  Nosso atendimento apresenta a solucao, responde suas duvidas e identifica se o Plano Fundador atende ao seu volume.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <a href={whatsappUrl} target="_blank" rel="noreferrer">
                    Falar com a Virtuagil
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
