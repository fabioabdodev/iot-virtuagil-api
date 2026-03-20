'use client';

import {
  Boxes,
  CircleCheckBig,
  ClipboardList,
  RadioTower,
  Siren,
  ToggleRight,
  Wrench,
} from 'lucide-react';
import { useActuators } from '@/hooks/use-actuators';
import { useAlertRules } from '@/hooks/use-alert-rules';
import { Badge } from '@/components/ui/badge';
import { Feedback } from '@/components/ui/feedback';
import { Panel } from '@/components/ui/panel';
import { AuthUser } from '@/types/auth';
import { ClientSummary } from '@/types/client';
import { ClientModule } from '@/types/client-module';
import { DeviceSummary } from '@/types/device';
import { formatRelativeDateTime } from '@/lib/date';

interface CommercialReadinessPanelProps {
  clientId?: string;
  authToken?: string;
  currentUser?: AuthUser | null;
  client?: ClientSummary;
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

function determineJourneyStage(options: {
  devicesCount: number;
  alertRulesCount: number;
  offlineDevices: number;
  ambientalEnabled: boolean;
}) {
  if (!options.ambientalEnabled) {
    return {
      title: 'Contratacao e escopo',
      description:
        'Esta conta ainda precisa habilitar o modulo ambiental antes de seguir para onboarding e simulacao.',
      checklist: [
        'Definir escopo inicial por equipamento critico',
        'Confirmar recurso contratado e responsaveis',
        'Liberar a conta para setup operacional',
      ],
    };
  }

  if (options.devicesCount === 0) {
    return {
      title: 'Preparacao da plataforma',
      description:
        'A conta ja pode ser preparada sem hardware. O foco agora e estruturar o cliente, o primeiro equipamento e os dados operacionais basicos.',
      checklist: [
        'Cadastrar o equipamento principal no cliente',
        'Revisar nome, local e responsavel da conta',
        'Deixar o cliente pronto para demonstracao guiada',
      ],
    };
  }

  if (options.alertRulesCount === 0) {
    return {
      title: 'Simulacao e alinhamento operacional',
      description:
        'A estrutura principal ja existe. O proximo passo e criar a regra de alerta e simular eventos para alinhar a resposta do cliente.',
      checklist: [
        'Configurar a primeira regra ambiental',
        'Simular leitura normal e fora da faixa',
        'Validar quem recebe alerta e como reage',
      ],
    };
  }

  if (options.offlineDevices > 0) {
    return {
      title: 'Estabilizacao pre-demo',
      description:
        'A conta ja demonstra valor, mas ainda precisa regularizar equipamentos offline antes de ser usada como referencia comercial ou operacional.',
      checklist: [
        'Regularizar equipamentos offline',
        'Refazer a simulacao de online/offline',
        'Confirmar que o painel voltou a refletir operacao estavel',
      ],
    };
  }

  return {
    title: 'Instalacao tecnica e aceite',
    description:
      'A conta ja tem base suficiente para demonstracao. Quando o hardware chegar, o foco passa a ser instalacao, teste controlado e aceite do cliente.',
    checklist: [
      'Conectar o hardware e validar leituras reais',
      'Executar alerta controlado em ambiente assistido',
      'Treinar o responsavel e fechar aceite operacional',
    ],
  };
}

function moduleReadinessGate(items: Array<boolean>) {
  const done = items.filter(Boolean).length;
  const total = items.length;
  return {
    done,
    total,
    percent: Math.round((done / total) * 100),
    complete: done === total,
  };
}

export function CommercialReadinessPanel({
  clientId,
  authToken,
  currentUser,
  client,
  devices,
  clientModules,
}: CommercialReadinessPanelProps) {
  const ambientalEnabled =
    clientId == null
      ? true
      : clientModules.find((module) => module.moduleKey === 'ambiental')?.enabled ?? false;
  const acionamentoEnabled =
    clientId == null
      ? true
      : clientModules.find((module) => module.moduleKey === 'acionamento')?.enabled ?? false;

  const { data: alertRulesData } = useAlertRules(
    ambientalEnabled ? clientId : undefined,
    authToken,
  );
  const { data: actuatorsData } = useActuators(
    acionamentoEnabled ? clientId : undefined,
    authToken,
    acionamentoEnabled,
  );

  if (!clientId) {
    return (
      <Panel className="p-4 sm:p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">
          Prontidao comercial
        </p>
        <h2 className="mt-1 text-xl font-semibold">Conta e recursos</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Escolha um cliente para transformar o painel em narrativa comercial:
          status da conta, recursos contratados e nivel de implantacao.
        </p>
      </Panel>
    );
  }

  const alertRules = alertRulesData ?? [];
  const actuators = actuatorsData ?? [];
  const offlineDevices = devices.filter((device) => device.isOffline).length;
  const enabledModules = clientModules.filter((module) => module.enabled).length;
  const journeyStage = determineJourneyStage({
    devicesCount: devices.length,
    alertRulesCount: alertRules.length,
    offlineDevices,
    ambientalEnabled,
  });

  const readinessScore = Math.max(
    0,
    Math.min(
      100,
      [
        enabledModules > 0 ? 20 : 0,
        devices.length > 0 ? 25 : 0,
        ambientalEnabled && alertRules.length > 0 ? 20 : 0,
        acionamentoEnabled && actuators.length > 0 ? 20 : 0,
        offlineDevices === 0 && devices.length > 0 ? 15 : 0,
      ].reduce((sum, value) => sum + value, 0),
    ),
  );

  const nextSteps = [
    !ambientalEnabled && 'Habilitar o modulo ambiental para abrir a oferta principal de monitoramento.',
    ambientalEnabled && devices.length === 0 && 'Cadastrar o primeiro equipamento para liberar historico, online/offline e leitura atual.',
    ambientalEnabled && devices.length > 0 && alertRules.length === 0 && 'Criar ao menos uma regra de alerta para demonstrar valor operacional logo no onboarding.',
    acionamentoEnabled && actuators.length === 0 && 'Cadastrar o primeiro ponto de acionamento para provar o fluxo de comando e historico do recurso de acionamento.',
    offlineDevices > 0 && 'Regularizar equipamentos offline antes de usar esta conta como demonstracao comercial.',
  ].filter(Boolean) as string[];

  const ambientalGate = moduleReadinessGate([
    ambientalEnabled,
    devices.length > 0,
    alertRules.length > 0,
    devices.length > 0 && offlineDevices === 0,
  ]);
  const acionamentoGate = moduleReadinessGate([
    acionamentoEnabled,
    devices.length > 0,
    actuators.length > 0,
    acionamentoEnabled ? ambientalGate.complete : true,
  ]);

  return (
    <Panel variant="strong" className="mt-6 overflow-hidden p-4 sm:p-5">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">
            Prontidao comercial
          </p>
          <h2 className="mt-1 text-xl font-semibold">
            {client?.name ? `${client.name} pronta para demonstracao` : 'Conta pronta para demonstracao'}
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-muted">
            Este bloco traduz o estado da conta em narrativa comercial:
            contratacao, prontidao e o que ainda falta para vender ou implantar com seguranca.
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
              {enabledModules} recurso(s) habilitado(s), {devices.length} equipamento(s),
              {' '}
              {alertRules.length} regra(s) e {actuators.length} ponto(s) de acionamento.
            </p>
          </div>

          <div className="rounded-[24px] border border-line/70 bg-bg/30 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">
                Conta em foco
              </p>
              <ClipboardList className="h-4 w-4 text-[hsl(var(--accent-2))]" />
            </div>
            <p className="mt-3 text-base font-semibold text-ink">
              {client?.name ?? clientId}
            </p>
            <p className="mt-2 text-sm text-muted">
              {client?.adminName
                ? `${client.adminName} responde por esta conta nesta fase de implantacao.`
                : null}
              {client?.adminName && client?.updatedAt ? ' ' : null}
              {client?.updatedAt
                ? `Cadastro revisado ${formatRelativeDateTime(client.updatedAt)}.`
                : 'Use este bloco para consolidar o estado comercial da conta.'}
            </p>
            <p className="mt-2 text-xs text-muted">
              {currentUser?.name
                ? `Painel aberto por ${currentUser.name}.`
                : 'Sem sessao ativa no momento.'}
            </p>
          </div>

          <div className="rounded-[24px] border border-line/70 bg-bg/30 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">
                Modulo ambiental
              </p>
              <Siren className="h-4 w-4 text-ok" />
            </div>
            <p className="mt-3 text-base font-semibold text-ink">
              {ambientalEnabled ? 'Disponivel' : 'Nao contratado'}
            </p>
            <p className="mt-2 text-sm text-muted">
              {ambientalEnabled
                ? `${devices.length} equipamento(s) e ${alertRules.length} regra(s) configurada(s).`
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
              {acionamentoEnabled ? 'Disponivel' : 'Nao contratado'}
            </p>
            <p className="mt-2 text-sm text-muted">
              {acionamentoEnabled
                ? `${actuators.length} ponto(s) de acionamento pronto(s) para comando e historico.`
                : 'Habilite para vender controle manual assistido pela plataforma.'}
            </p>
          </div>
        </div>

        <div className="rounded-[28px] border border-line/70 bg-[radial-gradient(circle_at_top,rgba(255,208,77,0.12),transparent_40%),linear-gradient(180deg,rgba(10,16,27,0.88),rgba(10,16,27,0.72))] p-5">
          <div className="mb-4 flex items-center gap-2">
            <RadioTower className="h-4 w-4 text-accent" />
            <p className="text-sm font-semibold text-ink">Proximos passos sugeridos</p>
          </div>

          <div className="mb-4 rounded-2xl border border-line/70 bg-bg/25 p-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-[hsl(var(--accent-2))]" />
              <p className="text-sm font-semibold text-ink">{journeyStage.title}</p>
            </div>
            <p className="mt-2 text-sm text-muted">{journeyStage.description}</p>
            <div className="mt-3 space-y-2">
              {journeyStage.checklist.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-line/70 bg-card/20 p-3 text-sm text-muted"
                >
                  {item}
                </div>
              ))}
            </div>
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

          {client?.notes ? (
            <div className="mt-4 rounded-2xl border border-line/70 bg-bg/25 p-3 text-sm text-muted">
              Contexto registrado para a conta: <strong className="text-ink">{client.notes}</strong>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-line/70 bg-bg/30 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-ink">Gate de venda - Ambiental</p>
            <Badge variant={ambientalGate.complete ? 'success' : 'neutral'}>
              {ambientalGate.done}/{ambientalGate.total}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-muted">
            {ambientalGate.complete
              ? 'Modulo pronto para proposta comercial com demonstracao em producao.'
              : 'Feche os itens abaixo para vender monitoramento ambiental com seguranca.'}
          </p>
          <div className="mt-3 space-y-2 text-xs text-muted">
            <p>{ambientalEnabled ? 'OK' : 'Pendente'} - modulo ambiental contratado</p>
            <p>{devices.length > 0 ? 'OK' : 'Pendente'} - ao menos 1 equipamento cadastrado</p>
            <p>{alertRules.length > 0 ? 'OK' : 'Pendente'} - ao menos 1 regra de alerta ativa</p>
            <p>{devices.length > 0 && offlineDevices === 0 ? 'OK' : 'Pendente'} - equipamentos sem alerta offline no momento</p>
          </div>
        </div>

        <div className="rounded-2xl border border-line/70 bg-bg/30 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-ink">Gate de venda - Acionamento</p>
            <Badge variant={acionamentoGate.complete ? 'success' : 'neutral'}>
              {acionamentoGate.done}/{acionamentoGate.total}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-muted">
            {acionamentoGate.complete
              ? 'Modulo pronto para oferta comercial de comando assistido e historico.'
              : 'Finalize os itens para vender o modulo de acionamento com confianca.'}
          </p>
          <div className="mt-3 space-y-2 text-xs text-muted">
            <p>{acionamentoEnabled ? 'OK' : 'Pendente'} - modulo acionamento contratado</p>
            <p>{devices.length > 0 ? 'OK' : 'Pendente'} - cliente com equipamento associado</p>
            <p>{actuators.length > 0 ? 'OK' : 'Pendente'} - ao menos 1 ponto de acionamento cadastrado</p>
            <p>{acionamentoEnabled ? (ambientalGate.complete ? 'OK' : 'Pendente') : 'Nao aplicavel'} - base ambiental estabilizada para narrativa integrada</p>
          </div>
        </div>
      </div>
    </Panel>
  );
}


