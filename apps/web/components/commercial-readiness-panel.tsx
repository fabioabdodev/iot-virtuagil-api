'use client';

import { Boxes, CircleCheckBig, ClipboardList, RadioTower, Siren, ToggleRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useActuators } from '@/hooks/use-actuators';
import { useAlertRules } from '@/hooks/use-alert-rules';
import { useClient } from '@/hooks/use-client';
import { Badge } from '@/components/ui/badge';
import { Feedback } from '@/components/ui/feedback';
import { Panel } from '@/components/ui/panel';
import { AuthUser } from '@/types/auth';
import { ClientModule } from '@/types/client-module';
import { DeviceSummary } from '@/types/device';

interface CommercialReadinessPanelProps {
  clientId?: string;
  authToken?: string;
  currentUser?: AuthUser | null;
  devices: DeviceSummary[];
  clientModules: ClientModule[];
}

function scoreLabel(score: number) {
  if (score >= 85) return 'Pronto para operar';
  if (score >= 60) return 'Quase pronto';
  if (score >= 35) return 'Em implantacao';
  return 'Inicio de setup';
}

function scoreBadgeVariant(score: number) {
  if (score >= 85) return 'success' as const;
  if (score < 35) return 'danger' as const;
  return 'neutral' as const;
}

export function CommercialReadinessPanel({
  clientId,
  authToken,
  currentUser,
  devices,
  clientModules,
}: CommercialReadinessPanelProps) {
  const { data: client } = useClient(clientId, authToken, Boolean(clientId));

  const temperatureEnabled =
    clientId == null
      ? true
      : clientModules.find((module) => module.moduleKey === 'temperature')?.enabled ?? false;
  const actuationEnabled =
    clientId == null
      ? true
      : clientModules.find((module) => module.moduleKey === 'actuation')?.enabled ?? false;

  const { data: alertRulesData } = useAlertRules(
    temperatureEnabled ? clientId : undefined,
    authToken,
  );
  const { data: actuatorsData } = useActuators(
    actuationEnabled ? clientId : undefined,
    authToken,
    actuationEnabled,
  );

  if (!clientId) {
    return (
      <Panel className="p-4 sm:p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">
          Prontidao comercial
        </p>
        <h2 className="mt-1 text-xl font-semibold">Conta e modulos</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Defina um `clientId` para transformar o dashboard em narrativa comercial:
          status da conta, modulos contratados e nivel de implantacao.
        </p>
      </Panel>
    );
  }

  const alertRules = alertRulesData ?? [];
  const actuators = actuatorsData ?? [];
  const offlineDevices = devices.filter((device) => device.isOffline).length;
  const enabledModules = clientModules.filter((module) => module.enabled).length;

  const readinessScore = Math.max(
    0,
    Math.min(
      100,
      [
        enabledModules > 0 ? 20 : 0,
        devices.length > 0 ? 25 : 0,
        temperatureEnabled && alertRules.length > 0 ? 20 : 0,
        actuationEnabled && actuators.length > 0 ? 20 : 0,
        offlineDevices === 0 && devices.length > 0 ? 15 : 0,
      ].reduce((sum, value) => sum + value, 0),
    ),
  );

  const nextSteps = [
    !temperatureEnabled && 'Habilitar o modulo temperatura para abrir a oferta principal de monitoramento.',
    temperatureEnabled && devices.length === 0 && 'Cadastrar o primeiro device para liberar historico, online/offline e leitura atual.',
    temperatureEnabled && devices.length > 0 && alertRules.length === 0 && 'Criar ao menos uma regra de alerta para demonstrar valor operacional logo no onboarding.',
    actuationEnabled && actuators.length === 0 && 'Cadastrar o primeiro atuador para provar o fluxo de comando e historico do modulo de acionamento.',
    offlineDevices > 0 && 'Regularizar devices offline antes de usar esta conta como demonstracao comercial.',
  ].filter(Boolean) as string[];

  return (
    <Panel variant="strong" className="mt-6 overflow-hidden p-4 sm:p-5">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">
            Prontidao comercial
          </p>
          <h2 className="mt-1 text-xl font-semibold">Conta pronta para demonstracao</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted">
            Este bloco traduz o estado tecnico da conta em narrativa comercial:
            contratacao, readiness e o que ainda falta para vender ou implantar com seguranca.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={scoreBadgeVariant(readinessScore)}>
            <CircleCheckBig className="h-3.5 w-3.5" />
            {scoreLabel(readinessScore)}
          </Badge>
          {client?.status ? (
            <Badge variant={client.status === 'delinquent' ? 'danger' : client.status === 'active' ? 'success' : 'neutral'}>
              {client.status === 'active'
                ? 'Conta ativa'
                : client.status === 'inactive'
                  ? 'Conta inativa'
                  : 'Conta pendente'}
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] border border-line/70 bg-bg/30 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">
                Score da conta
              </p>
              <Boxes className="h-4 w-4 text-accent" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-ink">{readinessScore}%</p>
            <p className="mt-2 text-sm text-muted">
              {enabledModules} modulo(s) habilitado(s), {devices.length} device(s),
              {' '}
              {alertRules.length} regra(s) e {actuators.length} atuador(es).
            </p>
          </div>

          <div className="rounded-[24px] border border-line/70 bg-bg/30 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">
                Responsavel atual
              </p>
              <ClipboardList className="h-4 w-4 text-[hsl(var(--accent-2))]" />
            </div>
            <p className="mt-3 text-base font-semibold text-ink">
              {currentUser?.name ?? 'Sem sessao ativa'}
            </p>
            <p className="mt-2 text-sm text-muted">
              {client?.updatedAt
                ? `Cadastro revisado ${formatDistanceToNow(new Date(client.updatedAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}.`
                : 'Use este painel para consolidar o estado comercial da conta.'}
            </p>
          </div>

          <div className="rounded-[24px] border border-line/70 bg-bg/30 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">
                Modulo temperatura
              </p>
              <Siren className="h-4 w-4 text-ok" />
            </div>
            <p className="mt-3 text-base font-semibold text-ink">
              {temperatureEnabled ? 'Disponivel' : 'Nao contratado'}
            </p>
            <p className="mt-2 text-sm text-muted">
              {temperatureEnabled
                ? `${devices.length} device(s) e ${alertRules.length} regra(s) configurada(s).`
                : 'Habilite para oferecer monitoramento, historico e alertas.'}
            </p>
          </div>

          <div className="rounded-[24px] border border-line/70 bg-bg/30 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">
                Modulo acionamento
              </p>
              <ToggleRight className="h-4 w-4 text-[hsl(var(--accent-2))]" />
            </div>
            <p className="mt-3 text-base font-semibold text-ink">
              {actuationEnabled ? 'Disponivel' : 'Nao contratado'}
            </p>
            <p className="mt-2 text-sm text-muted">
              {actuationEnabled
                ? `${actuators.length} atuador(es) pronto(s) para comando e historico.`
                : 'Habilite para vender controle manual assistido pela plataforma.'}
            </p>
          </div>
        </div>

        <div className="rounded-[28px] border border-line/70 bg-[radial-gradient(circle_at_top,rgba(255,208,77,0.12),transparent_40%),linear-gradient(180deg,rgba(10,16,27,0.88),rgba(10,16,27,0.72))] p-5">
          <div className="mb-4 flex items-center gap-2">
            <RadioTower className="h-4 w-4 text-accent" />
            <p className="text-sm font-semibold text-ink">Proximos passos sugeridos</p>
          </div>

          {nextSteps.length > 0 ? (
            <div className="space-y-3">
              {nextSteps.map((step) => (
                <div
                  key={step}
                  className="rounded-2xl border border-line/70 bg-bg/25 p-3 text-sm text-muted"
                >
                  {step}
                </div>
              ))}
            </div>
          ) : (
            <Feedback>
              Esta conta ja tem base suficiente para uma boa demonstracao comercial de
              monitoramento e acionamento.
            </Feedback>
          )}

          {client?.billingEmail ? (
            <div className="mt-4 rounded-2xl border border-line/70 bg-bg/25 p-3 text-sm text-muted">
              Contato financeiro atual: <strong className="text-ink">{client.billingEmail}</strong>
            </div>
          ) : null}
        </div>
      </div>
    </Panel>
  );
}
