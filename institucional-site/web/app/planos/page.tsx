import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Bot, Check, Cpu, CreditCard, Sparkles, Workflow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const whatsappUrl =
  process.env.NEXT_PUBLIC_WHATSAPP_URL ?? 'https://wa.me/553171029727';
const mercadoPagoUrl = process.env.NEXT_PUBLIC_MERCADO_PAGO_PAYMENT_URL;

export const metadata: Metadata = {
  title: 'Planos e Contratacao',
  description:
    'Conheca as formas de contratacao da Virtuagil para Atendente IA, automacao de processos e projetos IoT.',
  alternates: { canonical: '/planos' },
  openGraph: {
    title: 'Planos e Contratacao | Virtuagil',
    description:
      'Atendente IA, automacoes sob medida e IoT com contratacao orientada ao seu contexto.',
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
    subtitle: 'Monitoramento e controle',
    text: 'Projetos para monitorar temperatura, gases, consumo, equipamentos e outras variaveis da operacao.',
    bullets: [
      'Monitoramento continuo',
      'Alertas e historico',
      'Acionamentos e controle quando aplicavel',
      'Combinacao de modulos conforme o projeto',
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
              Comece pela automacao que resolve a dor mais urgente.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-300 md:text-lg">
              O Atendente IA e nossa solucao pronta para implantacao. Automacoes de processos e projetos IoT sao dimensionados conforme o escopo da operacao.
            </p>
          </div>

          <Card className="border-white/10 bg-[linear-gradient(135deg,#171d26,#10151c)]">
            <CardContent>
              <div className="text-sm uppercase tracking-[0.22em] text-stone-400">Sem surpresa comercial</div>
              <h2 className="mt-3 max-w-[14ch] font-serif text-4xl leading-tight text-white">
                Primeiro entendemos. Depois formalizamos a contratacao.
              </h2>
              <p className="mt-5 text-sm leading-8 text-stone-300">
                Os valores sao apresentados de acordo com volume, configuracao e escopo. Depois da aprovacao, o pagamento pode ser realizado com seguranca pelo Mercado Pago.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-semibold text-stone-300">
                <CreditCard className="h-4 w-4 text-[#d68642]" />
                Pagamento via Mercado Pago
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
                    <Button asChild variant={offer.featured ? 'default' : 'secondary'}>
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
                <div className="text-sm uppercase tracking-[0.22em] text-stone-400">Proximo passo</div>
                <h2 className="mt-3 max-w-[15ch] font-serif text-4xl leading-tight text-white md:text-5xl">
                  Converse com a Jade e veja o Atendente IA funcionando na pratica.
                </h2>
                <p className="mt-5 max-w-2xl text-sm leading-8 text-stone-300 md:text-base">
                  Para o Atendente IA, a propria Jade apresenta a solucao e identifica seu interesse. Para automacoes de processos e IoT, nossa equipe continua a conversa e prepara a proposta.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <a href={whatsappUrl} target="_blank" rel="noreferrer">
                    Falar com a Jade
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                {mercadoPagoUrl ? (
                  <Button asChild size="lg" variant="secondary">
                    <a href={mercadoPagoUrl} target="_blank" rel="noreferrer">Pagar com Mercado Pago</a>
                  </Button>
                ) : (
                  <Button asChild size="lg" variant="secondary">
                    <Link href="/contato">Solicitar proposta</Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
