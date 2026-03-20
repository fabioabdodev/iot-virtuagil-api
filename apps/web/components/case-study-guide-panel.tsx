'use client';

import { CheckCircle2, ClipboardList, FlaskConical, MapPinned, Snowflake, UserRound, Workflow } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Panel } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';
import type { AlertRule } from '@/types/alert-rule';
import type { ClientSummary } from '@/types/client';
import type { ClientModule } from '@/types/client-module';
import type { DeviceSummary } from '@/types/device';

type CaseStudyGuidePanelProps = {
  clientId?: string;
  client?: ClientSummary;
  devices: DeviceSummary[];
  alertRules: AlertRule[];
  clientModules: ClientModule[];
  actuationEnabled: boolean;
  actuatorsCount: number;
  onCreateDevice?: () => void;
};

const restaurantCase = {
  clientName: 'Restaurante Sabor da Serra',
  clientId: 'sabor-serra-restaurante',
  adminEmail: 'gerencia@saborserra.com.br',
  environmentalDevices: ['freezer_cozinha_01', 'camara_fria_01'],
  actuatorId: 'rele_luzes_salao_01',
  sensorType: 'temperature',
};

export function CaseStudyGuidePanel({
  clientId,
  client,
  devices,
  alertRules,
  clientModules,
  actuationEnabled,
  actuatorsCount,
  onCreateDevice,
}: CaseStudyGuidePanelProps) {
  const ambientalModule = clientModules.find((module) => module.moduleKey === 'ambiental');
  const acionamentoModule = clientModules.find((module) => module.moduleKey === 'acionamento');
  const enabledAmbientalItems = new Set(
    (ambientalModule?.items ?? [])
      .filter((item) => item.enabled)
      .map((item) => item.itemKey),
  );
  const enabledAcionamentoItems = new Set(
    (acionamentoModule?.items ?? [])
      .filter((item) => item.enabled)
      .map((item) => item.itemKey),
  );

  const hasExpectedClient = clientId === restaurantCase.clientId;
  const hasAmbientalBase =
    Boolean(ambientalModule?.enabled) && enabledAmbientalItems.has('temperatura');
  const hasAcionamentoBase =
    Boolean(acionamentoModule?.enabled) &&
    enabledAcionamentoItems.has('rele') &&
    enabledAcionamentoItems.has('status_abertura') &&
    enabledAcionamentoItems.has('tempo_aberto');
  const hasCoreDevices = restaurantCase.environmentalDevices.every((expectedDeviceId) =>
    devices.some((device) => device.id === expectedDeviceId),
  );
  const hasAnyCoreDeviceOnline = restaurantCase.environmentalDevices.some((expectedDeviceId) =>
    devices.some((device) => device.id === expectedDeviceId && !device.isOffline),
  );
  const hasRule = alertRules.some(
    (rule) =>
      (rule.sensorType === restaurantCase.sensorType || rule.sensorType === 'temperatura') &&
      (restaurantCase.environmentalDevices.includes(rule.deviceId ?? '') || rule.deviceId == null),
  );
  const hasActuator = actuatorsCount > 0;

  const steps = [
    {
      title: '1. Criar a conta do cliente',
      description: `Cadastre o cliente com \`${restaurantCase.clientName}\` e codigo interno \`${restaurantCase.clientId}\`.`,
      done: hasExpectedClient,
    },
    {
      title: '2. Fechar contratacao ambiental',
      description: 'Habilite a categoria `ambiental` com item `temperatura` para liberar monitoramento e alertas.',
      done: hasExpectedClient && hasAmbientalBase,
    },
    {
      title: '3. Estruturar equipamentos do caso',
      description: 'Cadastrar `freezer_cozinha_01` e `camara_fria_01` como base do modulo ambiental.',
      done: hasExpectedClient && hasCoreDevices,
    },
    {
      title: '4. Criar regras operacionais',
      description: 'Definir limites de temperatura para os equipamentos do caso e deixar pelo menos 1 regra ativa.',
      done: hasExpectedClient && hasCoreDevices && hasRule,
    },
    {
      title: '5. Ensaiar a visita no laboratorio',
      description: 'Rodar `normal`, `alerta`, `critico` e `offline` para demonstrar ambiental ponta a ponta.',
      done: hasExpectedClient && hasCoreDevices && hasRule && hasAnyCoreDeviceOnline,
    },
    {
      title: '6. Preparar trilha de alerta no n8n',
      description: 'Validar webhook, execucao no n8n e entrega final no WhatsApp antes de fechar demonstracao.',
      done: hasExpectedClient && hasCoreDevices && hasRule,
    },
    {
      title: '7. Fechar acionamento para venda',
      description: 'Habilite `acionamento` com itens `rele`, `status_abertura`, `tempo_aberto` e cadastre ponto de comando.',
      done:
        hasExpectedClient &&
        hasCoreDevices &&
        hasRule &&
        hasAcionamentoBase &&
        actuationEnabled &&
        hasActuator,
    },
  ];

  return (
    <Panel className="mt-6 p-4 sm:p-5">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">
            Estudo de caso
          </p>
          <h2 className="mt-1 text-xl font-semibold">
            Roteiro pratico para chegada de cliente real
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-muted">
            Use este bloco como se o Restaurante Sabor da Serra tivesse chegado agora. Ele mostra a ordem de onboarding para fechar ambiental e acionamento com narrativa comercial.
          </p>
        </div>
        <Badge>
          <ClipboardList className="h-3.5 w-3.5 text-accent" />
          caso Restaurante
        </Badge>
      </div>

      <div className="mb-4 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-3">
          {steps.map((step) => (
            <div
              key={step.title}
              className={`rounded-2xl border p-3 ${step.done ? 'border-ok/30 bg-ok/10' : 'border-line/70 bg-bg/30'}`}
            >
              <div className="flex items-start gap-3">
                <div className="pt-0.5">
                  {step.done ? (
                    <CheckCircle2 className="h-4 w-4 text-ok" />
                  ) : (
                    <ClipboardList className="h-4 w-4 text-accent" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{step.title}</p>
                  <p className="mt-1 text-xs leading-6 text-muted">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-3">
          <div className="rounded-2xl border border-line/70 bg-bg/30 p-3">
            <div className="flex items-center gap-2">
              <MapPinned className="h-4 w-4 text-accent" />
              <p className="text-sm font-medium text-ink">Dados para cadastrar</p>
            </div>
            <div className="mt-3 space-y-2 text-xs text-muted">
              <p><strong className="text-ink">Cliente:</strong> {restaurantCase.clientName}</p>
              <p><strong className="text-ink">Codigo interno:</strong> {restaurantCase.clientId}</p>
              <p><strong className="text-ink">Admin inicial:</strong> {restaurantCase.adminEmail}</p>
              <p><strong className="text-ink">Categorias:</strong> ambiental + acionamento</p>
            </div>
          </div>

          <div className="rounded-2xl border border-line/70 bg-bg/30 p-3">
            <div className="flex items-center gap-2">
              <Snowflake className="h-4 w-4 text-[hsl(var(--accent-2))]" />
              <p className="text-sm font-medium text-ink">Equipamentos base</p>
            </div>
            <div className="mt-3 space-y-2 text-xs text-muted">
              <p><strong className="text-ink">deviceId 1:</strong> freezer_cozinha_01</p>
              <p><strong className="text-ink">deviceId 2:</strong> camara_fria_01</p>
              <p><strong className="text-ink">atuador:</strong> {restaurantCase.actuatorId}</p>
              <p><strong className="text-ink">Uso:</strong> freezer, camara fria e luzes do salao</p>
            </div>
          </div>

          <div className="rounded-2xl border border-line/70 bg-bg/30 p-3">
            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-accent" />
              <p className="text-sm font-medium text-ink">O que confirmar com o cliente</p>
            </div>
            <div className="mt-3 space-y-2 text-xs text-muted">
              <p>Faixa de temperatura exigida pela operacao.</p>
              <p>Quem recebe alertas no horario comercial e fora dele.</p>
              <p>Tempo maximo de porta aberta antes de alerta critico.</p>
              <p>Janela de ligar/desligar luzes com acionamento assistido.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-line/70 bg-bg/30 p-3">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-[hsl(var(--accent-2))]" />
              <p className="text-sm font-medium text-ink">Como demonstrar sem hardware</p>
            </div>
            <div className="mt-3 space-y-2 text-xs text-muted">
              <p>1. Mostrar a conta pronta no painel.</p>
              <p>2. Simular normal/alerta/critico/offline no ambiental.</p>
              <p>3. Disparar comando ON/OFF no rele de luzes.</p>
              <p>4. Fechar com evidencias de n8n + WhatsApp e historico de comando.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-line/70 bg-bg/30 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Workflow className="h-4 w-4 text-accent" />
          <p className="text-sm font-medium text-ink">
            Fluxo n8n para fechar o estudo de caso
          </p>
        </div>
        <div className="space-y-2 text-xs leading-6 text-muted">
          <p>
            1. Conferir URLs de webhook no ambiente atual com <code>npm run alerts:check:n8n</code>.
          </p>
          <p>
            2. Validar ping real em modo estrito com <code>npm run alerts:check:n8n -- --ping --strict --timeout-ms=15000</code>.
          </p>
          <p>
            3. Disparar um cenario de alerta no laboratorio e confirmar execucao no n8n.
          </p>
          <p>
            4. Confirmar entrega final no WhatsApp (nao considerar apenas status PENDING).
          </p>
          <p>
            Criterio de aceite: dashboard mostra evento, n8n processa, Evolution entrega e o responsavel recebe a mensagem.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {!hasExpectedClient ? (
          <Badge>Primeiro passo: abrir a conta {restaurantCase.clientId}</Badge>
        ) : null}
        {hasExpectedClient && !hasCoreDevices && onCreateDevice ? (
          <Button variant="primary" onClick={onCreateDevice}>
            Cadastrar equipamentos do restaurante
          </Button>
        ) : null}
        {client && hasExpectedClient ? (
          <Badge variant="success">Conta atual alinhada ao estudo de caso</Badge>
        ) : null}
        {hasExpectedClient && hasAmbientalBase && hasCoreDevices && hasRule && hasAnyCoreDeviceOnline ? (
          <Badge variant="success">Ambiental pronto para venda assistida</Badge>
        ) : null}
        {hasExpectedClient && hasAcionamentoBase && actuationEnabled && hasActuator ? (
          <Badge variant="success">Acionamento pronto para demonstracao comercial</Badge>
        ) : null}
      </div>
    </Panel>
  );
}


