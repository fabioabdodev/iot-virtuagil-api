'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock3,
  Cpu,
  CreditCard,
  Headphones,
  LayoutDashboard,
  MessageCircleMore,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const rise = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.5, ease: 'easeOut' as const },
};

type HomePageProps = {
  whatsappUrl: string;
  contactEmail: string;
};

const benefits = [
  {
    icon: Clock3,
    title: 'Atendimento 24 horas',
    text: 'Sua empresa continua respondendo dúvidas e oportunidades mesmo fora do horário comercial.',
  },
  {
    icon: Users,
    title: 'Qualificação automática',
    text: 'A IA identifica interesse, organiza o contato e conduz a conversa até o próximo passo.',
  },
  {
    icon: Headphones,
    title: 'Humano quando precisa',
    text: 'Quando o cliente pedir ou a situação exigir, a conversa é encaminhada para uma pessoa.',
  },
  {
    icon: LayoutDashboard,
    title: 'Visão no Painel Administrativo',
    text: 'Acompanhe contatos, uso, interesse comercial e resultados em um painel dedicado.',
  },
];

const steps = [
  {
    number: '01',
    title: 'A IA recebe a mensagem',
    text: 'O cliente fala pelo WhatsApp normalmente. O Assistente de IA interpreta a intenção e responde com contexto do seu negócio.',
  },
  {
    number: '02',
    title: 'A conversa vira processo',
    text: 'Perguntas, interesse, follow-up e transferência humana seguem regras definidas para a sua operação.',
  },
  {
    number: '03',
    title: 'Sua equipe entra no momento certo',
    text: 'O atendimento humano assume quando realmente agrega valor, sem perder o histórico da conversa.',
  },
];

export function HomePage({ whatsappUrl, contactEmail }: HomePageProps) {
  return (
    <main className="relative overflow-hidden">
      <div className="glow-orb left-[-120px] top-[80px] h-[360px] w-[360px] bg-emerald-400/20" />
      <div className="glow-orb right-[-160px] top-[220px] h-[420px] w-[420px] bg-sky-400/15" />

      <section className="relative py-14 md:py-24">
        <div className="section-shell grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr]">
          <motion.div {...rise}>
            <div className="eyebrow">
              <Sparkles className="h-3.5 w-3.5" />
              Automação com inteligência aplicada
            </div>

            <h1 className="mt-6 max-w-[13ch] font-display text-5xl font-semibold leading-[0.96] tracking-[-0.045em] text-white sm:text-6xl lg:text-[74px]">
              Atendimento que trabalha enquanto sua empresa cresce.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
              A Virtuagil combina Assistente de IA no WhatsApp, automação de
              processos e IoT para reduzir tarefas manuais, acelerar respostas e
              transformar operação em fluxo.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/contratar-assistente-ia">
                  Contratar Assistente de IA
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <a href={whatsappUrl} target="_blank" rel="noreferrer">
                  <MessageCircleMore className="h-4 w-4" />
                  Falar com a Jade
                </a>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400">
              {[
                'Implantação assistida',
                'Até 500 atendimentos/mês',
                'Pagamento seguro via Mercado Pago',
              ].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  {item}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            {...rise}
            transition={{ ...rise.transition, delay: 0.08 }}
            className="relative"
          >
            <div className="surface-strong relative overflow-hidden rounded-[34px] p-4 sm:p-6">
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent" />
              <div className="rounded-[26px] border border-white/[0.07] bg-[#071019] p-4 sm:p-5">
                <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Assistente de IA</div>
                      <div className="text-xs text-slate-500">Atendimento ativo • WhatsApp</div>
                    </div>
                  </div>
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-300">
                    online
                  </span>
                </div>

                <div className="grid gap-4 py-5">
                  <div className="max-w-[84%] rounded-2xl rounded-tl-md bg-white/[0.06] p-4 text-sm leading-6 text-slate-300">
                    Olá! Quero entender como o Assistente de IA pode atender meus clientes.
                  </div>

                  <div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-md border border-emerald-400/10 bg-emerald-400/[0.08] p-4 text-sm leading-6 text-slate-200">
                    Posso te mostrar. Ele responde dúvidas, identifica interesse, faz follow-up e chama sua equipe quando necessário. Qual é o tipo de atendimento da sua empresa?
                  </div>

                  <div className="grid gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 sm:grid-cols-3">
                    {[
                      ['Interesse', 'Identificado'],
                      ['Follow-up', 'Automático'],
                      ['Humano', 'Disponível'],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl bg-black/20 p-3">
                        <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                          {label}
                        </div>
                        <div className="mt-1 text-sm font-semibold text-white">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-sky-400/10 bg-sky-400/[0.05] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <LayoutDashboard className="h-4 w-4 text-sky-300" />
                    <span className="text-xs text-slate-300">Painel Administrativo atualizado em tempo real</span>
                  </div>
                  <Zap className="h-4 w-4 text-emerald-300" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="pb-10 md:pb-16">
        <div className="section-shell grid gap-3 md:grid-cols-3">
          {[
            ['24h', 'de disponibilidade para o primeiro atendimento'],
            ['500', 'atendimentos por mês no plano atual'],
            ['6x', 'opções de parcelamento no checkout'],
          ].map(([value, label]) => (
            <div
              key={value}
              className="rounded-[24px] border border-white/[0.07] bg-white/[0.025] px-6 py-5"
            >
              <div className="font-display text-3xl font-semibold text-white">{value}</div>
              <div className="mt-1 text-sm leading-6 text-slate-400">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="section-shell">
          <motion.div {...rise} className="max-w-3xl">
            <div className="eyebrow">Assistente de IA</div>
            <h2 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-[-0.035em] text-white md:text-5xl">
              Menos mensagens esquecidas. Mais conversas conduzidas até o próximo passo.
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-400">
              O objetivo não é substituir sua equipe. É tirar da frente o trabalho repetitivo e
              deixar as pessoas entrarem quando a conversa realmente precisa delas.
            </p>
          </motion.div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map(({ icon: Icon, title, text }, index) => (
              <motion.div
                key={title}
                {...rise}
                transition={{ ...rise.transition, delay: index * 0.05 }}
              >
                <Card className="h-full">
                  <CardContent className="h-full">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.07]">
                      <Icon className="h-5 w-5 text-emerald-300" />
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-white">{title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-400">{text}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="section-shell grid gap-6 lg:grid-cols-[0.86fr_1.14fr]">
          <motion.div {...rise} className="lg:sticky lg:top-28 lg:self-start">
            <div className="eyebrow">Como funciona</div>
            <h2 className="mt-5 max-w-[13ch] font-display text-4xl font-semibold leading-tight tracking-[-0.035em] text-white md:text-5xl">
              Automação que acompanha a conversa do início ao humano.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400 md:text-base">
              Regras de negócio, base de conhecimento, follow-up e suporte humano trabalhando no
              mesmo fluxo.
            </p>
          </motion.div>

          <div className="grid gap-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                {...rise}
                transition={{ ...rise.transition, delay: index * 0.05 }}
                className="surface-glass grid gap-5 rounded-[28px] p-6 sm:grid-cols-[84px_1fr] sm:items-start"
              >
                <div className="font-display text-3xl font-semibold text-emerald-300/80">
                  {step.number}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-400">{step.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="section-shell">
          <motion.div {...rise} className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="eyebrow">Além do atendimento</div>
              <h2 className="mt-5 max-w-[16ch] font-display text-4xl font-semibold leading-tight tracking-[-0.035em] text-white md:text-5xl">
                Uma empresa de automação, não só um chatbot.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-400 md:text-base">
              A mesma base tecnológica pode conectar processos digitais e operações físicas
              conforme a sua empresa evolui.
            </p>
          </motion.div>

          <div className="grid gap-4 lg:grid-cols-3">
            {[
              {
                icon: Bot,
                title: 'Assistente de IA',
                text: 'Atendimento, qualificação, follow-up e transferência humana no WhatsApp.',
                href: '/solucoes/atendente-ia',
              },
              {
                icon: Workflow,
                title: 'Automação de Processos',
                text: 'Integrações entre sistemas, APIs, rotinas e notificações para reduzir trabalho manual.',
                href: '/solucoes/automacao-processos',
              },
              {
                icon: Cpu,
                title: 'IoT e operação conectada',
                text: 'Monitoramento e controle de equipamentos, ambientes e utilidades com dados em tempo real.',
                href: '/solucoes',
              },
            ].map(({ icon: Icon, title, text, href }) => (
              <Link
                key={title}
                href={href}
                className="group surface-glass rounded-[28px] p-6 transition duration-300 hover:-translate-y-1 hover:border-emerald-300/20"
              >
                <Icon className="h-6 w-6 text-emerald-300" />
                <h3 className="mt-5 text-xl font-bold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">{text}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 transition group-hover:gap-3">
                  Conhecer solução
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="section-shell">
          <motion.div
            {...rise}
            className="relative overflow-hidden rounded-[34px] border border-emerald-300/15 bg-[linear-gradient(135deg,rgba(14,55,44,0.92),rgba(8,21,29,0.98)_58%,rgba(8,25,38,0.98))] p-7 shadow-[0_34px_110px_rgba(0,0,0,0.32)] md:p-10"
          >
            <div className="absolute right-[-80px] top-[-100px] h-[280px] w-[280px] rounded-full bg-emerald-300/10 blur-3xl" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
              <div>
                <div className="eyebrow border-white/10 bg-white/[0.05] text-emerald-100">
                  Plano atual
                </div>
                <h2 className="mt-5 max-w-[14ch] font-display text-4xl font-semibold leading-tight tracking-[-0.035em] text-white md:text-5xl">
                  Comece com o Assistente de IA pronto para operar.
                </h2>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                  Plano semestral com até 500 atendimentos por mês, implantação inicial e acesso
                  ao Painel Administrativo. O checkout aceita Pix e cartão, com até 6 parcelas.
                </p>
              </div>

              <div className="rounded-[26px] border border-white/10 bg-black/20 p-6">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200/70">
                  Assistente de IA • 6 meses
                </div>
                <div className="mt-3 font-display text-5xl font-semibold tracking-[-0.04em] text-white">
                  R$ 1.794
                </div>
                <div className="mt-2 text-sm text-slate-400">Pagamento único ou até 6x no checkout.</div>
                <div className="mt-6 grid gap-3">
                  <Button asChild size="lg" className="w-full">
                    <Link href="/contratar-assistente-ia">
                      <CreditCard className="h-4 w-4" />
                      Contratar Assistente de IA
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="secondary" className="w-full">
                    <a href={whatsappUrl} target="_blank" rel="noreferrer">
                      Tirar dúvidas com a Jade
                    </a>
                  </Button>
                </div>
                <div className="mt-4 flex items-start gap-2 text-xs leading-6 text-slate-400">
                  <ShieldCheck className="mt-1 h-4 w-4 flex-none text-emerald-300" />
                  Pagamento processado no ambiente seguro do Mercado Pago.
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="pb-8 pt-8 md:pb-12 md:pt-14">
        <div className="section-shell text-center">
          <motion.div {...rise}>
            <h2 className="mx-auto max-w-3xl font-display text-3xl font-semibold tracking-[-0.03em] text-white md:text-4xl">
              Tem uma operação diferente ou precisa integrar outros sistemas?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400">
              Fale com a Virtuagil. Projetos de automação de processos e IoT continuam sob
              avaliação de escopo.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild variant="secondary">
                <Link href="/contato">Falar com a equipe</Link>
              </Button>
              <Button asChild variant="ghost">
                <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
