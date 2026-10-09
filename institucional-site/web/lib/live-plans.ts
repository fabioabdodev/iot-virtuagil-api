import {
  commercialPlans,
  isCommercialPlanCode,
  type CommercialPlan,
  type CommercialPlanCode,
} from '@/lib/plans';

export type LiveCommercialPlans = Partial<Record<CommercialPlanCode, CommercialPlan>>;

type RemotePlan = {
  codigo?: unknown;
  valor_total?: unknown;
  parcelas_maximas?: unknown;
  limite_atendimentos?: unknown;
  moeda?: unknown;
};

const CATALOG_URL = 'https://atendente.virtuagil.com.br/api/publico/planos';

/**
 * ÚNICA fonte para preços que vão à tela e checkout: Supabase, via Dashboard.
 * Em caso de indisponibilidade, a aplicação NÃO usa um preço antigo.
 */
export async function loadCommercialPlans(): Promise<LiveCommercialPlans | null> {
  try {
    const response = await fetch(CATALOG_URL, {
      method: 'GET',
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(8000),
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    const json: unknown = await response.json();
    if (!json || typeof json !== 'object' || !('ok' in json) ||
        json.ok !== true || !('planos' in json) || !Array.isArray(json.planos)) {
      return null;
    }
    const output: LiveCommercialPlans = {};
    for (const item of json.planos as RemotePlan[]) {
      if (!isCommercialPlanCode(item.codigo) || item.moeda !== 'BRL') continue;
      const total = Number(item.valor_total);
      const installments = Number(item.parcelas_maximas);
      const contacts = Number(item.limite_atendimentos);
      if (!Number.isFinite(total) || total <= 0 ||
          !Number.isInteger(installments) || installments < 1 || installments > 12 ||
          !Number.isInteger(contacts) || contacts <= 0) {
        return null;
      }
      output[item.codigo] = {
        ...commercialPlans[item.codigo], // textos comerciais, SEM preço fixo
        total,
        installments,
        installmentValue: Math.round((total / installments) * 100) / 100,
        contactsPerMonth: contacts,
      };
    }
    return Object.keys(output).length ? output : null;
  } catch {
    return null;
  }
}
