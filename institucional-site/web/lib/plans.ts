export type CommercialPlanCode =
  | 'jade_500_semestral'
  | 'jade_500_agenda_semestral'
  | 'jade_500_hospedagem_semestral';

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
  includesHospedagem: boolean;
  description: string;
  features: string[];
};

// Apenas textos e características. Preços, parcelas e limite vêm exclusivamente do Supabase.
export type CommercialPlanTemplate = Omit<CommercialPlan, 'total' | 'installments' | 'installmentValue' | 'contactsPerMonth'>;

export const commercialPlans: Record<CommercialPlanCode, CommercialPlanTemplate> = {
  jade_500_semestral: {
    code: 'jade_500_semestral',
    name: 'Plano 500',
    publicName: 'Assistente de IA Virtuagil — Plano 500',
    badge: 'Assistente de IA',
    includesAgenda: false,
    includesHospedagem: false,
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
    includesAgenda: true,
    includesHospedagem: false,
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
  jade_500_hospedagem_semestral: {
    code: 'jade_500_hospedagem_semestral',
    name: 'Plano 500 + Hospedagem',
    publicName: 'Assistente de IA Virtuagil — Plano 500 + Hospedagem',
    badge: 'Assistente de IA + Hospedagem',
    includesAgenda: false,
    includesHospedagem: true,
    description:
      'Tudo do Plano 500 com módulo especializado para pousadas e hospedagens, com consulta de disponibilidade, acomodações, tarifas e apoio ao atendimento de reservas.',
    features: [
      'Tudo do Plano 500',
      'Até 500 contatos únicos por mês',
      'Módulo especializado em hospedagem',
      'Consulta de disponibilidade por período',
      'Acomodações e tarifas da operação',
      'Apoio ao atendimento de reservas',
      'Gestão da Hospedagem no Painel Administrativo',
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
