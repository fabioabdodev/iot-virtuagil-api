'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Bot,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Cpu,
  CreditCard,
  Headphones,
  LayoutDashboard,
  MessageCircleMore,
  Mic,
  Paperclip,
  Phone,
  Search,
  Smile,
  Video,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { products } from '@/lib/products';

const rise = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.5, ease: 'easeOut' as const },
};


function WhatsAppDemo() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const delays = [850, 2450, 3900, 6000, 7300, 9300, 10800, 13200];
    const timers = delays.map((delay, index) => window.setTimeout(() => setStep(index + 1), delay));
    const reset = window.setTimeout(() => setStep(0), 16800);
    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(reset);
    };
  }, [step === 0]);

  const typing = step === 2 || step === 5 || step === 7;

  const bubbleMotion = {
    initial: { opacity: 0, y: 10, scale: 0.985 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -4 },
    transition: { duration: 0.28, ease: 'easeOut' as const },
  };

  const TypingBubble = () => (
    <motion.div
      {...bubbleMotion}
      className="ml-auto flex w-fit items-center gap-1 rounded-[8px] rounded-tr-[2px] bg-[#005c4b] px-3 py-2.5 shadow-[0_1px_1px_rgba(0,0,0,.2)]"
    >
      {[0, 1, 2].map((dot) => (
        <motion.span
          key={dot}
          className="h-1.5 w-1.5 rounded-full bg-[#d9fdd3]/80"
          animate={{ y: [0, -3, 0], opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 0.85, repeat: Infinity, delay: dot * 0.14 }}
        />
      ))}
    </motion.div>
  );

  return (
    <div className="surface-strong relative overflow-hidden rounded-[34px] p-3 sm:p-5">
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent" />

      <div className="overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#0b141a] shadow-[0_20px_60px_rgba(0,0,0,.35)]">
        <div className="flex items-center justify-between bg-[#202c33] px-3 py-2.5 sm:px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="grid h-9 w-9 flex-none place-items-center rounded-full bg-[#00a884] text-white">
              <Bot className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-[12px] font-semibold text-[#e9edef]">Assistente Virtuagil</div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={typing ? 'typing' : 'online'}
                  initial={{ opacity: 0, y: 2 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -2 }}
                  className="text-[10px] text-[#8696a0]"
                >
                  {typing ? 'digitando...' : 'online'}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[#aebac1]">
            <Video className="h-3.5 w-3.5" />
            <Phone className="h-3.5 w-3.5" />
            <Search className="hidden h-3.5 w-3.5 sm:block" />
            <span className="text-base leading-none">⋮</span>
          </div>
        </div>

        <div
          className="relative min-h-[300px] overflow-hidden px-3 py-4 sm:min-h-[320px] sm:px-4"
          style={{
            backgroundColor: '#0b141a',
            backgroundImage:
              'radial-gradient(circle at 18px 18px, rgba(255,255,255,.035) 1.2px, transparent 1.3px), radial-gradient(circle at 8px 28px, rgba(255,255,255,.02) 1px, transparent 1.1px)',
            backgroundSize: '34px 34px',
          }}
        >
          <div className="mb-3 text-center">
            <span className="rounded-md bg-[#182229] px-2.5 py-1 text-[9px] font-medium text-[#8696a0] shadow">HOJE</span>
          </div>

          <div className="grid gap-2.5">
            <AnimatePresence>
              {step >= 1 && (
                <motion.div {...bubbleMotion} className="max-w-[84%] rounded-[8px] rounded-tl-[2px] bg-[#202c33] px-2.5 py-1.5 text-[12px] leading-[18px] text-[#e9edef] shadow-[0_1px_1px_rgba(0,0,0,.2)]">
                  Quero marcar um horário para quinta à tarde. Tem disponibilidade?
                  <div className="ml-3 inline whitespace-nowrap text-[9px] text-[#8696a0]">10:42</div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>{step === 2 && <TypingBubble />}</AnimatePresence>

            <AnimatePresence>
              {step >= 3 && (
                <motion.div {...bubbleMotion} className="ml-auto max-w-[88%] rounded-[8px] rounded-tr-[2px] bg-[#005c4b] px-2.5 py-1.5 text-[12px] leading-[18px] text-[#e9edef] shadow-[0_1px_1px_rgba(0,0,0,.2)]">
                  Claro! Consultei a agenda e tenho <strong>14h e 16h</strong> disponíveis. Qual horário você prefere?
                  <span className="ml-2 inline whitespace-nowrap text-[9px] text-[#a7c5bd]">10:42 <span className="text-[#53bdeb]">✓✓</span></span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {step >= 4 && (
                <motion.div {...bubbleMotion} className="max-w-[58%] rounded-[8px] rounded-tl-[2px] bg-[#202c33] px-2.5 py-1.5 text-[12px] leading-[18px] text-[#e9edef] shadow-[0_1px_1px_rgba(0,0,0,.2)]">
                  Pode ser às 16h.
                  <span className="ml-2 inline whitespace-nowrap text-[9px] text-[#8696a0]">10:43</span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>{step === 5 && <TypingBubble />}</AnimatePresence>

            <AnimatePresence>
              {step >= 6 && (
                <motion.div {...bubbleMotion} className="ml-auto max-w-[88%] rounded-[8px] rounded-tr-[2px] bg-[#005c4b] px-2.5 py-1.5 text-[12px] leading-[18px] text-[#e9edef] shadow-[0_1px_1px_rgba(0,0,0,.2)]">
                  Perfeito! Seu horário ficou reservado para <strong>quinta-feira às 16h</strong>. ✅
                  <span className="ml-2 inline whitespace-nowrap text-[9px] text-[#a7c5bd]">10:43 <span className="text-[#53bdeb]">✓✓</span></span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {step >= 7 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mx-auto mt-1 rounded-full border border-[#00a884]/25 bg-[#111b21]/95 px-3 py-1.5 text-[9px] font-medium text-[#00a884] shadow"
                >
                  ✓ Agendamento confirmado
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#0b141a] px-2.5 pb-2.5">
          <div className="flex flex-1 items-center gap-2.5 rounded-full bg-[#202c33] px-3 py-2.5 text-[#8696a0]">
            <Smile className="h-4 w-4 flex-none" />
            <span className="flex-1 text-[10px]">Mensagem</span>
            <Paperclip className="h-4 w-4 flex-none" />
          </div>
          <motion.div
            className="grid h-9 w-9 place-items-center rounded-full bg-[#00a884] text-white"
            animate={step === 1 || step === 4 ? { scale: [1, 1.08, 1] } : { scale: 1 }}
            transition={{ duration: 0.35 }}
          >
            <Mic className="h-4 w-4" />
          </motion.div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.045] px-4 py-3">
        <div className="text-[11px] font-semibold text-slate-300">
          Enquanto a conversa acontece, a Virtuagil trabalha nos bastidores.
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-slate-400">
          {['Interesse identificado', 'Agenda consultada', 'Humano quando precisar'].map((item, index) => (
            <motion.span
              key={item}
              className="rounded-full border border-white/[0.08] bg-black/20 px-2.5 py-1"
              animate={step >= [3, 3, 6][index] ? { borderColor: 'rgba(52,211,153,.35)', color: 'rgb(167 243 208)' } : {}}
              transition={{ duration: 0.35 }}
            >
              {item}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
}

type HomePageProps = {
  whatsappUrl: string;
  contactEmail: string;
};

const benefits = [
  {
    icon: Clock3,
    title: 'Atendimento 24 horas',
    text: 'O Assistente responde dúvidas e oportunidades mesmo fora do horário comercial.',
  },
  {
    icon: Users,
    title: 'Interesse organizado',
    text: 'A IA identifica intenção comercial e registra o contato para a equipe acompanhar.',
  },
  {
    icon: RefreshCw,
    title: 'Follow-up automático',
    text: 'Conversas que esfriaram podem ser retomadas seguindo as regras definidas para a operação.',
  },
  {
    icon: CalendarDays,
    title: 'Agenda integrada',
    text: 'Como módulo opcional, o Assistente pode consultar disponibilidade, agendar, reagendar, cancelar e confirmar horários.',
  },
  {
    icon: Headphones,
    title: 'Humano quando precisa',
    text: 'Quando o cliente pedir ou a situação exigir, a conversa é encaminhada para uma pessoa com contexto.',
  },
  {
    icon: LayoutDashboard,
    title: 'Painel Administrativo',
    text: 'Acompanhe contatos, interesse, follow-up, uso do plano e, quando ativada, a agenda da operação.',
  },
];

const steps = [
  {
    number: '01',
    title: 'O cliente chama no WhatsApp',
    text: 'A conversa começa no canal que sua empresa já usa. O Assistente interpreta a intenção e responde com base nas informações cadastradas.',
  },
  {
    number: '02',
    title: 'A IA resolve o que é repetitivo',
    text: 'Dúvidas, qualificação, interesse comercial e follow-up seguem regras específicas do seu negócio.',
  },
  {
    number: '03',
    title: 'A operação avança para o próximo passo',
    text: 'Quando a Agenda estiver ativada, o Assistente consulta horários reais e pode conduzir agendamentos sem conflito.',
  },
  {
    number: '04',
    title: 'Sua equipe assume quando faz sentido',
    text: 'O atendimento humano entra quando necessário, mantendo continuidade e contexto da conversa.',
  },
];

const agendaFeatures = [
  'Horários reais por profissional e serviço',
  'Duração configurada por tipo de atendimento',
  'Bloqueios, intervalos e indisponibilidades',
  'Prevenção de conflito de horários',
  'Agendamento somente após confirmação do cliente',
  'Consulta, reagendamento, cancelamento e confirmação',
  'Histórico preservado com concluído, cancelado e faltou',
];

const faqs = [
  {
    q: 'O Assistente substitui minha equipe?',
    a: 'Não. A proposta é automatizar o trabalho repetitivo e deixar sua equipe entrar nas conversas que precisam de decisão, negociação ou cuidado humano.',
  },
  {
    q: 'A Agenda está incluída no plano de R$ 1.794?',
    a: 'O plano divulgado no site é do Assistente de IA. A Agenda é um módulo opcional, configurado conforme a operação e a condição comercial definida para o projeto.',
  },
  {
    q: 'O cliente pode falar com uma pessoa?',
    a: 'Sim. Quando o atendimento humano for solicitado ou necessário, a conversa pode ser transferida para a equipe da empresa.',
  },
  {
    q: 'O que significa até 500 atendimentos por mês?',
    a: 'Para o plano atual, o uso mensal considera contatos únicos atendidos pelo Assistente dentro do mês.',
  },
  {
    q: 'Vocês integram com outros sistemas?',
    a: 'Integrações com ERP, agenda externa, CRM, APIs ou sistemas proprietários são avaliadas tecnicamente antes de entrarem no escopo.',
  },
];

export function HomePage({ whatsappUrl, contactEmail: _contactEmail }: HomePageProps) {
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

            <h1 className="mt-6 max-w-[14ch] font-display text-5xl font-semibold leading-[0.96] tracking-[-0.045em] text-white sm:text-6xl lg:text-[72px]">
              Alguém te chama no WhatsApp. Sua IA responde.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
              O Assistente de IA da Virtuagil atende seus contatos, responde dúvidas, agenda e
              identifica oportunidades automaticamente.
            </p>

            <div className="mt-8">
              <Button asChild size="lg">
                <Link href="/contratar-assistente-ia">
                  Contratar Assistente de IA
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400">
              {[
                'Atendimento 24h',
                'Respostas rápidas',
                'Mais oportunidades',
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
            <WhatsAppDemo />
          </motion.div>
        </div>
      </section>


      <section className="pb-10 pt-4 md:pb-16 md:pt-8">
        <div className="section-shell">
          <motion.div {...rise} className="overflow-hidden rounded-[28px] border border-emerald-300/30 bg-[#031612] shadow-[0_28px_100px_rgba(0,0,0,.34)]">
            <div className="px-6 pt-6 text-center">
              <div className="text-[10px] font-black uppercase tracking-[.2em] text-emerald-300">Pronto para começar?</div>
              <h2 className="mt-1 font-display text-3xl font-semibold text-white md:text-4xl">Contrate seu Assistente de IA</h2>
              <p className="mt-1 text-xs text-slate-400">Atendimento inteligente no WhatsApp, 24 horas por dia.</p>
            </div>
            <div className="grid gap-4 p-5 md:p-6 lg:grid-cols-[.95fr_1.05fr]">
              <div className="rounded-[22px] border border-emerald-300/25 bg-black/20 p-5">
                <div className="inline-flex rounded-full border border-emerald-300/25 px-3 py-1 text-[10px] font-bold uppercase tracking-[.16em] text-emerald-300">Assistente de IA</div>
                <div className="mt-4 font-display text-4xl font-semibold text-white">6 MESES</div>
                <div className="text-sm uppercase tracking-[.08em] text-slate-300">de atendimento inteligente</div>
                <div className="mt-5 grid gap-2.5 text-sm text-slate-200">
                  {['Até 500 contatos únicos/mês','Implantação inicial assistida','Follow-up automático','Painel Administrativo do cliente','Agenda e integrações conforme o escopo'].map(item => <span key={item} className="flex gap-2"><CheckCircle2 className="h-4 w-4 flex-none text-emerald-300"/>{item}</span>)}
                </div>
                <div className="mt-5 border-t border-white/10 pt-4 text-xs text-slate-400">Atendimento no WhatsApp • 24 horas por dia • Mais oportunidades</div>
              </div>
              <div className="relative flex flex-col justify-center rounded-[22px] border border-emerald-300/25 bg-[linear-gradient(135deg,#07342b,#06161a)] p-5 md:p-6">
                <div className="absolute right-0 top-0 rounded-bl-xl bg-emerald-300 px-4 py-2 text-[10px] font-black text-[#02110d]">SEM JUROS</div>
                <div className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Por apenas</div>
                <div className="mt-1 flex items-end gap-3"><span className="pb-2 text-3xl font-black text-white">6x de</span><span className="font-display text-5xl font-semibold tracking-[-.05em] text-emerald-300 md:text-6xl">R$ 299</span></div>
                <div className="text-center text-xs text-slate-300">sem juros no cartão</div>
                <div className="mt-4 border-t border-white/10 pt-4 text-xs text-slate-400">▣ Ou R$ 1.794,00 à vista no Pix ou cartão</div>
                <Button asChild size="lg" className="mt-4 w-full"><Link href="/contratar-assistente-ia"><CreditCard className="h-4 w-4"/>Quero meu Assistente de IA<ArrowRight className="h-4 w-4"/></Link></Button>
                <div className="mt-3 text-center text-[11px] text-slate-500">🛡 Pagamento seguro via Mercado Pago</div>

                <div className="mt-4 border-t border-white/10 pt-3">
                  <div className="text-center text-[9px] font-bold uppercase tracking-[.16em] text-slate-500">Cartões e Pix</div>
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                    <span className="grid h-7 min-w-12 place-items-center rounded-md bg-white px-2 text-[10px] font-black italic tracking-tight text-[#1a1f71]">VISA</span>
                    <span className="flex h-7 min-w-12 items-center justify-center rounded-md bg-white px-2" aria-label="Mastercard">
                      <span className="h-4 w-4 rounded-full bg-[#eb001b]" />
                      <span className="-ml-1.5 h-4 w-4 rounded-full bg-[#f79e1b] opacity-90" />
                    </span>
                    <span className="grid h-7 min-w-12 place-items-center rounded-md bg-[#111] px-2 text-[10px] font-black lowercase text-white">elo</span>
                    <span className="grid h-7 min-w-12 place-items-center rounded-md bg-[#2e77bb] px-2 text-[9px] font-black text-white">AMEX</span>
                    <span className="grid h-7 min-w-14 place-items-center rounded-md bg-[#b3131b] px-2 text-[8px] font-black text-white">HIPERCARD</span>
                    <span className="flex h-7 min-w-12 items-center justify-center gap-1.5 rounded-md border border-emerald-300/25 bg-emerald-300/10 px-2 text-[10px] font-bold text-emerald-200">
                      <span className="h-2.5 w-2.5 rotate-45 rounded-[2px] border border-emerald-300" />
                      Pix
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid border-t border-white/[.07] bg-black/20 sm:grid-cols-3">
              {['Compra 100% segura • Seus dados protegidos','Pagamento processado pelo Mercado Pago','Suporte na implantação e durante todo o plano'].map(x => <div key={x} className="px-5 py-4 text-center text-xs text-slate-400">{x}</div>)}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-10 md:py-16">
        <div className="section-shell">
          <motion.div {...rise} className="mb-7 max-w-3xl">
            <div className="eyebrow">Internet das Coisas • IoT</div>
            <h2 className="mt-4 max-w-[20ch] font-display text-4xl font-semibold leading-[.98] tracking-[-.04em] text-white md:text-5xl">Monitoramento inteligente para ambientes, equipamentos e operações.</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400">Sensores conectados transformam dados do ambiente em informação para acompanhar sua operação, identificar alterações e apoiar decisões em tempo real. A Virtuagil desenvolve soluções IoT conforme a necessidade de cada projeto.</p>
          </motion.div>
          <div className="grid gap-4 md:grid-cols-2">
            {products
              .filter((product) => product.category === 'IoT')
              .sort(
                (a, b) =>
                  ['temperatura', 'gases', 'consumo', 'acionamento'].indexOf(a.slug) -
                  ['temperatura', 'gases', 'consumo', 'acionamento'].indexOf(b.slug),
              )
              .map((product, index) => {
                const tones = ['border-sky-400/45','border-emerald-300/45','border-amber-400/45','border-violet-400/45'];
                const dots = ['bg-sky-300','bg-emerald-300','bg-amber-300','bg-violet-300'];
                const displayTitle = product.slug === 'consumo' ? 'Energia e Consumo' : product.title;
                const displaySummary = product.slug === 'consumo'
                  ? 'Acompanhe consumo elétrico, corrente e tensão para identificar desperdícios, anomalias e apoiar decisões com mais clareza.'
                  : product.summary;
                return (
                  <motion.article key={product.slug} {...rise} transition={{ ...rise.transition, delay: (index % 2) * 0.04 }} className={`group relative min-h-[315px] overflow-hidden rounded-[26px] border bg-[#071018] shadow-[0_22px_70px_rgba(0,0,0,.34)] transition duration-300 hover:-translate-y-1 ${tones[index]}`}>
                    <div className="absolute inset-y-0 right-0 w-[56%] bg-cover bg-center transition duration-500 group-hover:scale-[1.035]" style={{ backgroundImage: `url(${product.image})` }} />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,9,13,1)_0%,rgba(3,9,13,.99)_42%,rgba(3,9,13,.82)_59%,rgba(3,9,13,.34)_78%,rgba(3,9,13,.10)_100%)]" />
                    <div className="relative flex min-h-[315px] max-w-[68%] flex-col justify-center p-6 md:max-w-[62%]">
                      <div className="w-fit rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[9px] font-black uppercase tracking-[.16em] text-white/80">IoT</div>
                      <h3 className="mt-3 font-display text-3xl font-semibold leading-none text-white">{displayTitle}</h3>
                      <p className="mt-3 text-sm leading-6 text-slate-200">{displaySummary}</p>
                      <ul className="mt-4 grid gap-2 text-xs leading-5 text-slate-200">{product.bullets.map((bullet) => <li key={bullet} className="flex items-start gap-2"><span className={`mt-1.5 h-1.5 w-1.5 flex-none rounded-full ${dots[index]}`} /><span>{bullet}</span></li>)}</ul>
                      <Link href={`/solucoes/${product.slug}`} className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-white">Conhecer solução <ArrowRight className="h-3.5 w-3.5" /></Link>
                    </div>
                  </motion.article>
                );
              })}
          </div>

          <motion.div {...rise} className="mt-4 flex flex-col gap-4 rounded-[24px] border border-emerald-300/15 bg-emerald-300/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[.14em] text-emerald-300">Projeto IoT sob medida</div>
              <p className="mt-1 text-sm text-slate-300">Precisa medir, monitorar ou controlar outra variável? Conte sua necessidade para a Virtuagil.</p>
            </div>
            <Button asChild variant="secondary" className="shrink-0">
              <Link href="/contato">Falar sobre meu projeto <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="section-shell">
          <motion.div {...rise} className="max-w-3xl">
            <div className="eyebrow">Assistente de IA</div>
            <h2 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-[-0.035em] text-white md:text-5xl">
              Menos conversa perdida. Mais continuidade do primeiro contato ao próximo passo.
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-400">
              O objetivo não é substituir sua equipe. É automatizar o que é repetitivo, organizar
              oportunidades e entregar a conversa para uma pessoa quando realmente fizer sentido.
            </p>
          </motion.div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map(({ icon: Icon, title, text }, index) => (
              <motion.div key={title} {...rise} transition={{ ...rise.transition, delay: index * 0.04 }}>
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
              Um fluxo contínuo, sem jogar o cliente de ferramenta em ferramenta.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400 md:text-base">
              Atendimento, regras de negócio, follow-up, agenda opcional e suporte humano trabalham
              dentro da mesma jornada.
            </p>
          </motion.div>

          <div className="grid gap-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                {...rise}
                transition={{ ...rise.transition, delay: index * 0.04 }}
                className="surface-glass grid gap-5 rounded-[28px] p-6 sm:grid-cols-[84px_1fr] sm:items-start"
              >
                <div className="font-display text-3xl font-semibold text-emerald-300/80">{step.number}</div>
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
          <motion.div {...rise} className="surface-strong relative overflow-hidden rounded-[34px] p-7 md:p-10">
            <div className="absolute right-[-100px] top-[-120px] h-[320px] w-[320px] rounded-full bg-sky-400/10 blur-3xl" />
            <div className="relative grid gap-9 lg:grid-cols-[1fr_0.9fr] lg:items-center">
              <div>
                <div className="eyebrow">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Módulo Agenda
                </div>
                <h2 className="mt-5 max-w-[16ch] font-display text-4xl font-semibold leading-tight tracking-[-0.035em] text-white md:text-5xl">
                  Para quem trabalha com horário marcado, a conversa pode terminar com o agendamento feito.
                </h2>
                <p className="mt-5 max-w-2xl text-sm leading-8 text-slate-300 md:text-base">
                  Clínicas, consultórios, odontologia, estética, salões e outros serviços podem ativar
                  o módulo de Agenda para o Assistente consultar disponibilidade real e operar os
                  agendamentos pelo WhatsApp.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {agendaFeatures.map((item) => (
                    <div key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-300">
                      <CheckCircle2 className="mt-1 h-4 w-4 flex-none text-emerald-300" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-xs leading-6 text-slate-500">
                  A Agenda é um módulo opcional. Integrações com agendas externas, ERP ou sistemas
                  proprietários dependem de avaliação técnica.
                </p>
              </div>

              <div className="rounded-[28px] border border-white/[0.08] bg-black/20 p-5">
                <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
                  <div>
                    <div className="text-sm font-bold text-white">Agenda de hoje</div>
                    <div className="mt-1 text-xs text-slate-500">Exemplo de visualização administrativa</div>
                  </div>
                  <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-300">
                    módulo ativo
                  </span>
                </div>
                <div className="mt-4 grid gap-3">
                  {[
                    ['09:30', 'Consulta', 'Confirmado', 'text-emerald-300'],
                    ['11:00', 'Avaliação', 'Agendado', 'text-sky-300'],
                    ['14:30', 'Retorno', 'Concluído', 'text-violet-300'],
                  ].map(([time, service, status, tone]) => (
                    <div key={time} className="grid grid-cols-[64px_1fr_auto] items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3">
                      <div className="font-display text-lg font-semibold text-white">{time}</div>
                      <div className="text-sm text-slate-300">{service}</div>
                      <div className={`text-xs font-semibold ${tone}`}>{status}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-2xl border border-sky-300/10 bg-sky-300/[0.05] p-4 text-xs leading-6 text-slate-400">
                  A equipe acompanha a agenda no Painel Administrativo e pode registrar confirmação,
                  conclusão, falta ou cancelamento.
                </div>
              </div>
            </div>
          </motion.div>
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
                text: 'Atendimento, qualificação, follow-up, agenda opcional e transferência humana no WhatsApp.',
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
          <motion.div {...rise} className="mx-auto max-w-4xl">
            <div className="text-center">
              <div className="eyebrow">Dúvidas frequentes</div>
              <h2 className="mt-5 font-display text-4xl font-semibold tracking-[-0.035em] text-white md:text-5xl">
                Antes de contratar, deixe o escopo claro.
              </h2>
            </div>
            <div className="mt-8 grid gap-3">
              {faqs.map((item) => (
                <details key={item.q} className="group rounded-[24px] border border-white/[0.08] bg-white/[0.025] p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-white">
                    <span>{item.q}</span>
                    <span className="text-xl text-emerald-300 transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400">{item.a}</p>
                </details>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="pb-8 pt-8 md:pb-12 md:pt-14">
        <div className="section-shell text-center">
          <motion.div {...rise}>
            <h2 className="mx-auto max-w-3xl font-display text-3xl font-semibold tracking-[-0.03em] text-white md:text-4xl">
              Quer entender como isso ficaria na sua empresa?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400">
              Fale com a Virtuagil sobre atendimento, Agenda, automação de processos ou IoT. O
              escopo é definido de acordo com a operação real.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild variant="secondary">
                <Link href="/contato">Falar com a equipe</Link>
              </Button>
              <Button asChild>
                <Link href="/solucoes">Conhecer soluções</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
