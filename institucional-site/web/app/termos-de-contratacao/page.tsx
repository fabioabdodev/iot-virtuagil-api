import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FileText, ShieldCheck } from 'lucide-react';
import { commercialPlans, formatBrl } from '@/lib/plans';
import { CONTRACT_FORUM_CLAUSE, CONTRACT_VERSION } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Termos de Contratação do Assistente de IA',
  description:
    'Termos de contratação dos planos do Assistente de IA Virtuagil, incluindo Plano 500 e Plano 500 + Agenda.',
  alternates: { canonical: '/termos-de-contratacao' },
};

const sections = [
  {
    title: '1. Objeto',
    paragraphs: [
      'Estes Termos disciplinam a contratação empresarial do Assistente de IA Virtuagil para atendimento automatizado por WhatsApp e dos módulos expressamente incluídos no plano escolhido.',
      'A configuração final depende das informações, acessos e regras operacionais fornecidos pelo CONTRATANTE durante a implantação.',
    ],
  },
  {
    title: '2. Planos, prazo e limite de uso',
    paragraphs: [
      'A contratação é semestral. O Plano 500 custa R$ 1.794,00 e pode ser apresentado comercialmente em até 6 parcelas de R$ 299,00 sem juros. O Plano 500 + Agenda custa R$ 2.388,00 e pode ser apresentado comercialmente em até 6 parcelas de R$ 398,00 sem juros.',
      'Ambos incluem até 500 contatos únicos por mês. Cada número de telefone é contabilizado uma única vez no mês, independentemente da quantidade de mensagens ou conversas, e a contagem reinicia mensalmente.',
      'Condições de pagamento, parcelamento e meios disponíveis são confirmados no checkout do Mercado Pago.',
    ],
  },
  {
    title: '3. Escopo do Plano 500',
    paragraphs: [
      'Inclui atendimento com IA no WhatsApp, qualificação de oportunidades, follow-up automático, transferência para atendimento humano, Painel Administrativo e implantação inicial assistida, dentro das configurações e integrações padronizadas da Virtuagil.',
    ],
  },
  {
    title: '4. Escopo do Plano 500 + Agenda',
    paragraphs: [
      'Inclui todos os recursos do Plano 500 e o módulo Agenda, com disponibilidade por serviço e profissional, agendamento após confirmação do cliente, consulta, reagendamento, cancelamento, confirmação e gestão administrativa da Agenda.',
      'Integrações com Google Calendar, ERP, agenda externa ou sistema proprietário não integram automaticamente o plano padrão e podem exigir avaliação técnica e proposta específica.',
    ],
  },
  {
    title: '5. Implantação e obrigações do CONTRATANTE',
    paragraphs: [
      'O CONTRATANTE deverá fornecer informações corretas sobre sua empresa, produtos, serviços, preços, políticas, horários, profissionais, regras de atendimento e demais conteúdos necessários à configuração.',
      'Também deverá disponibilizar, quando aplicável, número de WhatsApp, acessos, credenciais, e-mails dos atendentes e autorizações necessárias para integrações. Atrasos ou impossibilidades decorrentes da ausência desses elementos não serão considerados falha da Virtuagil.',
      'O CONTRATANTE é responsável pela legalidade, atualização e veracidade do conteúdo e das instruções comerciais fornecidas para utilização pelo Assistente.',
    ],
  },
  {
    title: '6. Inteligência artificial e atendimento humano',
    paragraphs: [
      'O Assistente utiliza inteligência artificial e automações. Embora configurado para seguir a base de conhecimento e as regras do CONTRATANTE, respostas automatizadas podem apresentar limitações inerentes à tecnologia.',
      'Situações que exijam decisão humana, exceção comercial, análise profissional ou atendimento sensível podem ser encaminhadas para atendimento humano conforme a configuração contratada.',
      'A Virtuagil poderá realizar ajustes técnicos destinados à segurança, estabilidade, qualidade e evolução do serviço, preservado o escopo essencial contratado.',
    ],
  },
  {
    title: '7. Serviços e plataformas de terceiros',
    paragraphs: [
      'A solução pode depender de serviços de terceiros, como WhatsApp, provedores de inteligência artificial, Mercado Pago, Chatwoot, hospedagem, bancos de dados e APIs. Indisponibilidades, bloqueios, alterações de política ou limitações originadas exclusivamente nesses terceiros podem afetar temporariamente funcionalidades.',
      'O CONTRATANTE deverá observar as políticas das plataformas que utilizar e manter seus próprios cadastros e contas em situação regular quando isso for necessário à operação.',
    ],
  },
  {
    title: '8. Proteção de dados e confidencialidade',
    paragraphs: [
      'As partes comprometem-se a observar a legislação aplicável à proteção de dados pessoais, inclusive a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018), de acordo com os papéis e responsabilidades efetivamente exercidos em cada operação de tratamento.',
      'Quando tratar dados pessoais em nome e segundo instruções do CONTRATANTE na prestação do serviço, a Virtuagil atuará nos limites necessários à execução contratual, adotando medidas técnicas e administrativas compatíveis com a natureza da operação.',
      'O CONTRATANTE é responsável por possuir base legal e fornecer avisos adequados aos titulares para os tratamentos que determinar em sua operação. Dados poderão ser tratados por fornecedores necessários à execução técnica do serviço, observadas as obrigações aplicáveis.',
      'Informações confidenciais obtidas em razão da implantação e operação não deverão ser divulgadas fora das hipóteses necessárias à prestação do serviço, cumprimento legal ou exercício regular de direitos.',
    ],
  },
  {
    title: '9. Disponibilidade, suporte e segurança',
    paragraphs: [
      'A Virtuagil empregará esforços técnicos razoáveis para manter o serviço disponível e seguro, podendo ocorrer manutenções, atualizações, falhas de infraestrutura ou indisponibilidades de terceiros.',
      'O suporte cobre o funcionamento do serviço contratado. Novos fluxos, integrações, funcionalidades ou mudanças substanciais de escopo poderão ser objeto de avaliação e contratação adicional.',
    ],
  },
  {
    title: '10. Propriedade intelectual',
    paragraphs: [
      'A plataforma, fluxos, software, componentes, modelos de automação, identidade técnica, documentação e demais ativos desenvolvidos ou licenciados pela Virtuagil permanecem de titularidade de seus respectivos proprietários.',
      'Os dados, marcas, documentos e conteúdos fornecidos pelo CONTRATANTE permanecem sob sua responsabilidade e titularidade, sem transferência de propriedade à Virtuagil.',
    ],
  },
  {
    title: '11. Pagamento, vigência e suspensão',
    paragraphs: [
      'O plano possui vigência de 6 meses conforme a contratação confirmada pelo pagamento. A ativação e o provisionamento ocorrem após a confirmação do pagamento e a conclusão das etapas técnicas necessárias.',
      'Fraude, uso ilícito, violação de segurança, descumprimento material destes Termos ou situação que coloque a infraestrutura ou terceiros em risco poderá justificar suspensão preventiva, sem prejuízo da análise do caso e das medidas cabíveis.',
    ],
  },
  {
    title: '12. Cancelamento e encerramento',
    paragraphs: [
      'Solicitações de cancelamento ou não continuidade deverão ser encaminhadas pelos canais oficiais da Virtuagil. Valores, estornos e obrigações eventualmente aplicáveis observarão a modalidade de pagamento, o estágio de execução do serviço e a legislação aplicável.',
      'No encerramento, acessos poderão ser desativados e dados poderão ser mantidos pelo período necessário ao cumprimento de obrigações legais, regulatórias, segurança, prevenção a fraudes e exercício regular de direitos, sendo posteriormente eliminados ou anonimizados quando aplicável.',
    ],
  },
  {
    title: '13. Alterações e versão contratual',
    paragraphs: [
      'A versão aceita no momento da contratação permanece registrada como referência daquela contratação. Alterações materiais aplicáveis a nova contratação serão publicadas em nova versão dos Termos.',
    ],
  },
  {
    title: '14. Foro e legislação aplicável',
    paragraphs: [CONTRACT_FORUM_CLAUSE],
  },
];

export default function TermosDeContratacaoPage() {
  return (
    <main className="pb-20">
      <section className="py-12 md:py-16">
        <div className="section-shell max-w-4xl">
          <Link href="/contratar-assistente-ia" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Voltar para contratação
          </Link>
          <div className="mt-8 rounded-[32px] border border-white/[0.08] bg-white/[0.025] p-6 md:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/[0.06] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-emerald-200">
              <FileText className="h-4 w-4" />
              Versão {CONTRACT_VERSION}
            </div>
            <h1 className="mt-5 font-display text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
              Termos de Contratação do Assistente de IA Virtuagil
            </h1>
            <p className="mt-5 text-sm leading-7 text-slate-400">
              Instrumento eletrônico aplicável à contratação do Plano 500 e do Plano 500 + Agenda.
              Ao marcar o aceite no checkout, o contratante declara que leu e concorda com estes Termos.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {Object.values(commercialPlans).map((plan) => (
                <div key={plan.code} className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                  <div className="font-bold text-white">{plan.name}</div>
                  <div className="mt-1 text-sm text-slate-300">{formatBrl(plan.total)} / 6 meses</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {plan.installments}x de {formatBrl(plan.installmentValue)} sem juros • até 500 contatos únicos/mês
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 grid gap-9">
              {sections.map((section) => (
                <section key={section.title}>
                  <h2 className="text-xl font-bold text-white">{section.title}</h2>
                  <div className="mt-3 grid gap-3">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph} className="text-sm leading-7 text-slate-300">{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-10 flex items-start gap-3 rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.05] p-5 text-sm leading-7 text-slate-300">
              <ShieldCheck className="mt-1 h-5 w-5 flex-none text-emerald-300" />
              <span>
                Estes Termos integram a contratação eletrônica realizada no site da Virtuagil. A versão, o plano e a data/hora do aceite são enviados com a solicitação de checkout para registro da contratação.
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
