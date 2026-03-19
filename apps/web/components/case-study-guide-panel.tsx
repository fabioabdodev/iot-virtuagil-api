'use client';

import { CheckCircle2, ClipboardList, FlaskConical, MapPinned, Snowflake, UserRound } from 'lucide-react';
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

const cuidareCase = {
  clientName: 'Cuidare',
  clientId: 'cuidare-vacinas',
  adminEmail: 'admin@cuidare.com.br',
  deviceId: 'freezer_vacinas_01',
  deviceName: 'Freezer Vacinas 01',
  location: 'Sala de armazenamento',
  sensorType: 'temperature',
  expectedModule: 'ambiental',
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
  const temperatureEnabled =
    clientId == null
      ? false
      : clientModules.find((module) => module.moduleKey === 'ambiental')?.enabled ?? false;

  const hasExpectedClient = clientId === cuidareCase.clientId;
  const hasDevice = devices.some((device) => device.id === cuidareCase.deviceId);
  const hasRule = alertRules.some(
    (rule) =>
      rule.sensorType === cuidareCase.sensorType &&
      (rule.deviceId === cuidareCase.deviceId || rule.deviceId == null),
  );
  const hasOnlineDevice = devices.some(
    (device) => device.id === cuidareCase.deviceId && !device.isOffline,
  );

  const steps = [
    {
      title: '1. Criar a conta do cliente',
      description: `Cadastre o cliente com \`${cuidareCase.clientName}\` e codigo interno \`${cuidareCase.clientId}\`.`,
      done: hasExpectedClient,
    },
    {
      title: '2. Confirmar o recurso contratado',
      description: `Habilite o modulo \`${cuidareCase.expectedModule}\` para abrir monitoramento, historico e alertas.`,
      done: hasExpectedClient && temperatureEnabled,
    },
    {
      title: '3. Estruturar o equipamento principal',
      description: `Cadastre \`${cuidareCase.deviceId}\` com nome \`${cuidareCase.deviceName}\` em \`${cuidareCase.location}\`.`,
      done: hasExpectedClient && hasDevice,
    },
    {
      title: '4. Criar a primeira regra operacional',
      description: 'Configure uma regra conservadora para comecar a demonstracao com leitura normal, desvio e resposta operacional.',
      done: hasExpectedClient && hasRule,
    },
    {
      title: '5. Ensaiar a visita no laboratorio',
      description: 'Depois da estrutura pronta, simule operacao normal, alerta e offline para mostrar o valor antes do hardware.',
      done: hasExpectedClient && hasDevice && hasRule && hasOnlineDevice,
    },
    {
      title: '6. Preparar oferta de acionamento',
      description: 'Depois da temperatura estavel, habilite acionamento e cadastre ao menos um ponto para vender comando assistido.',
      done:
        hasExpectedClient &&
        hasDevice &&
        hasRule &&
        actuationEnabled &&
        actuatorsCount > 0,
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
            Use este bloco como se a Cuidare tivesse chegado agora. Ele te mostra o que fazer na plataforma, em qual ordem e com quais valores de referencia.
          </p>
        </div>
        <Badge>
          <ClipboardList className="h-3.5 w-3.5 text-accent" />
          caso Cuidare
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
              <p><strong className="text-ink">Cliente:</strong> {cuidareCase.clientName}</p>
              <p><strong className="text-ink">Codigo interno:</strong> {cuidareCase.clientId}</p>
              <p><strong className="text-ink">Admin inicial:</strong> {cuidareCase.adminEmail}</p>
              <p><strong className="text-ink">Modulo inicial:</strong> ambiental</p>
            </div>
          </div>

          <div className="rounded-2xl border border-line/70 bg-bg/30 p-3">
            <div className="flex items-center gap-2">
              <Snowflake className="h-4 w-4 text-[hsl(var(--accent-2))]" />
              <p className="text-sm font-medium text-ink">Primeiro equipamento</p>
            </div>
            <div className="mt-3 space-y-2 text-xs text-muted">
              <p><strong className="text-ink">deviceId:</strong> {cuidareCase.deviceId}</p>
              <p><strong className="text-ink">Nome:</strong> {cuidareCase.deviceName}</p>
              <p><strong className="text-ink">Local:</strong> {cuidareCase.location}</p>
              <p><strong className="text-ink">Uso:</strong> freezer critico para vacinas</p>
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
              <p>Tempo maximo de resposta e contingencia local.</p>
              <p>Internet e energia disponiveis no ponto do freezer.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-line/70 bg-bg/30 p-3">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-[hsl(var(--accent-2))]" />
              <p className="text-sm font-medium text-ink">Como demonstrar sem hardware</p>
            </div>
            <div className="mt-3 space-y-2 text-xs text-muted">
              <p>1. Mostrar a conta pronta no painel.</p>
              <p>2. Simular leitura normal para passar seguranca.</p>
              <p>3. Simular alerta de temperatura e offline.</p>
              <p>4. Fechar explicando o que ja esta pronto e o que depende da instalacao fisica.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {!hasExpectedClient ? (
          <Badge>Primeiro passo: criar a conta {cuidareCase.clientId}</Badge>
        ) : null}
        {hasExpectedClient && !hasDevice && onCreateDevice ? (
          <Button variant="primary" onClick={onCreateDevice}>
            Cadastrar o freezer da Cuidare
          </Button>
        ) : null}
        {client && hasExpectedClient ? (
          <Badge variant="success">Conta atual alinhada ao estudo de caso</Badge>
        ) : null}
        {hasExpectedClient && hasDevice && hasRule && hasOnlineDevice ? (
          <Badge variant="success">Temperatura pronta para venda assistida</Badge>
        ) : null}
        {hasExpectedClient && actuationEnabled && actuatorsCount > 0 ? (
          <Badge variant="success">Acionamento pronto para demonstracao comercial</Badge>
        ) : null}
      </div>
    </Panel>
  );
}


