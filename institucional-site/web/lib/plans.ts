export type CommercialPlanCode =
  | 'jade_500_semestral'
  | 'jade_500_agenda_semestral';

export type CommercialPlan = {
  code: CommercialPlanCode;
  name: string;
  publicName: string;
  badge: string;
  total: number;
  installments: number;
  installmentValue: number;
  contactsPerMonth: number;
  includesAgenda: boolean;
  description: string;
  features: string[];
};

export const commercialPlans: Record<CommercialPlanCode, CommercialPlan> = {
  jade_500_semestral: {
    code: 'jade_500_semestral',
    name: 'Plano 500',
    publicName: 'Assistente de IA Virtuagil — Plano 500',
    badge: 'Assistente de IA',
    total: 1794,
    installments: 6,
    installmentValue: 299,
    contactsPerMonth: 500,
    includesAgenda: false,
    description:
      'Atendimento inteligente no WhatsApp com follow-up, transferência humana e Painel Administrativo.',
    features: [
      'Até 500 contatos únicos por mês',
      'Atendimento com IA no WhatsApp',
      'Qualificação de oportunidades',
      'Follow-up automático',
      'Transferência para atendimento humano',
      'Painel Administrativo do cliente',
      'Implantação inicial assistida',
    ],
  },
  jade_500_agenda_semestral: {
    code: 'jade_500_agenda_semestral',
    name: 'Plano 500 + Agenda',
    publicName: 'Assistente de IA Virtuagil — Plano 500 + Agenda',
    badge: 'Assistente de IA + Agenda',
    total: 2388,
    installments: 6,
    installmentValue: 398,
    contactsPerMonth: 500,
    includesAgenda: true,
    description:
      'Tudo do Plano 500 com Agenda integrada para disponibilidade, agendamento, reagendamento, cancelamento e confirmação.',
    features: [
      'Tudo do Plano 500',
      'Até 500 contatos únicos por mês',
      'Agenda integrada ao atendimento',
      'Disponibilidade real por serviço e profissional',
      'Agendamento após confirmação do cliente',
      'Reagendamento, cancelamento e confirmação',
      'Gestão da Agenda no Painel Administrativo',
    ],
  },
};

export const commercialPlanCodes = Object.keys(
  commercialPlans,
) as CommercialPlanCode[];

export const defaultCommercialPlanCode: CommercialPlanCode =
  'jade_500_semestral';

export function isCommercialPlanCode(
  value: unknown,
): value is CommercialPlanCode {
  return (
    typeof value === 'string' &&
    Object.prototype.hasOwnProperty.call(commercialPlans, value)
  );
}

export function formatBrl(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);
}
